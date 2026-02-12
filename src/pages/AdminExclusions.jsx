import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserX, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AdminExclusions() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedRecommendation, setSelectedRecommendation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    checkSuperAdminAccess();
  }, [user]);

  const checkSuperAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data.role !== 'super_admin') {
        navigate('/admin');
        return;
      }

      setIsSuperAdmin(true);
      fetchRecommendations();
    } catch (error) {
      console.error('Error checking super admin access:', error);
      navigate('/');
    }
  };

  const fetchRecommendations = async () => {
    try {
      const { data, error } = await supabase
        .from('exclusion_recommendations')
        .select(`
          *,
          profile:profiles!exclusion_recommendations_profile_id_fkey(id, full_name, avatar_url, email),
          group:groups(id, name),
          recommended_by_profile:profiles!exclusion_recommendations_recommended_by_fkey(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRecommendations(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setLoading(false);
    }
  };

  const handleReview = async (recommendationId, status) => {
    try {
      const { error } = await supabase
        .from('exclusion_recommendations')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', recommendationId);

      if (error) throw error;

      if (status === 'approved') {
        const recommendation = recommendations.find(r => r.id === recommendationId);
        if (recommendation) {
          await supabase
            .from('profiles')
            .update({
              is_banned: true,
              ban_reason: `Udelukket fra ${recommendation.group.name}: ${recommendation.reason}`,
              banned_at: new Date().toISOString(),
              banned_by: user.id
            })
            .eq('id', recommendation.profile_id);
        }
      }

      setShowDetailModal(false);
      setSelectedRecommendation(null);
      fetchRecommendations();
    } catch (error) {
      console.error('Error reviewing recommendation:', error);
    }
  };

  if (!isSuperAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adopteez-primary"></div>
      </div>
    );
  }

  const filteredRecommendations = recommendations.filter(r =>
    filterStatus === 'all' || r.status === filterStatus
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Eksklusionsanbefalinger</h1>
            <p className="text-gray-600">Gennemgå anbefalinger fra gruppe admins</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-adopteez-primary text-white rounded-lg hover:bg-adopteez-accent transition-colors"
          >
            Tilbage til Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'all'
                ? 'bg-adopteez-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Alle ({recommendations.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'pending'
                ? 'bg-adopteez-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Afventer ({recommendations.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilterStatus('approved')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'approved'
                ? 'bg-adopteez-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Godkendte ({recommendations.filter(r => r.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilterStatus('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filterStatus === 'rejected'
                ? 'bg-adopteez-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Afviste ({recommendations.filter(r => r.status === 'rejected').length})
          </button>
        </div>
      </div>

      {filteredRecommendations.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-12 text-center border border-gray-200">
          <UserX className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">Ingen eksklusionsanbefalinger i denne kategori</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRecommendations.map((recommendation) => (
            <div
              key={recommendation.id}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                      {recommendation.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {recommendation.profile?.full_name}
                      </h3>
                      <p className="text-sm text-gray-600">{recommendation.profile?.email}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Gruppe</p>
                      <p className="font-medium text-gray-900">{recommendation.group?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Anbefalet af</p>
                      <p className="font-medium text-gray-900">{recommendation.recommended_by_profile?.full_name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Antal advarsler</p>
                      <p className="font-medium text-gray-900">{recommendation.warning_count}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Dato</p>
                      <p className="font-medium text-gray-900">
                        {new Date(recommendation.created_at).toLocaleDateString('da-DK')}
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Årsag</p>
                    <p className="text-gray-700">{recommendation.reason}</p>
                    {recommendation.description && (
                      <>
                        <p className="text-sm font-semibold text-gray-900 mt-3 mb-2">Beskrivelse</p>
                        <p className="text-gray-700">{recommendation.description}</p>
                      </>
                    )}
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                      recommendation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      recommendation.status === 'approved' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {recommendation.status === 'pending' ? 'Afventer' :
                       recommendation.status === 'approved' ? 'Godkendt' : 'Afvist'}
                    </span>
                  </div>
                </div>

                {recommendation.status === 'pending' && (
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleReview(recommendation.id, 'approved')}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle size={18} />
                      <span>Godkend</span>
                    </button>
                    <button
                      onClick={() => handleReview(recommendation.id, 'rejected')}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle size={18} />
                      <span>Afvis</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
