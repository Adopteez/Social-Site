import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ArrowLeft, Users, Settings, Key, Hash, Lock, CheckCircle, XCircle, Clock, Mail } from 'lucide-react';

export default function PartnerGroupAdmin() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('settings');
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);

  const [accessSettings, setAccessSettings] = useState({
    access_type: 'open',
    access_code: '',
    requires_member_number: false,
    visibility_scope: 'worldwide',
    visibility_country: ''
  });

  useEffect(() => {
    if (groupId && user) {
      checkAdminAccess();
    }
  }, [groupId, user]);

  const checkAdminAccess = async () => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*, group_members!inner(*)')
        .eq('id', groupId)
        .eq('group_members.profile_id', user.id)
        .eq('group_members.role', 'admin')
        .maybeSingle();

      if (groupError) throw groupError;

      if (!groupData) {
        navigate(`/groups/${groupId}`);
        return;
      }

      setGroup(groupData);
      setIsGroupAdmin(true);
      setAccessSettings({
        access_type: groupData.access_type || 'open',
        access_code: groupData.access_code || '',
        requires_member_number: groupData.requires_member_number || false,
        visibility_scope: groupData.visibility_scope || 'worldwide',
        visibility_country: groupData.visibility_country || ''
      });

      await fetchMembers();
      await fetchPendingRequests();
      setLoading(false);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate(`/groups/${groupId}`);
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          profile:profiles(id, full_name, email, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: false });

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error('Error fetching members:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('group_join_requests')
        .select(`
          *,
          profile:profiles(id, full_name, email, avatar_url)
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleUpdateAccessSettings = async () => {
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          access_type: accessSettings.access_type,
          access_code: accessSettings.access_type === 'code' ? accessSettings.access_code : null,
          requires_member_number: accessSettings.access_type === 'member_number' ? accessSettings.requires_member_number : false,
          visibility_scope: accessSettings.visibility_scope,
          visibility_country: accessSettings.visibility_scope === 'local' ? accessSettings.visibility_country : null
        })
        .eq('id', groupId);

      if (error) throw error;
      alert('Adgangsindstillinger opdateret!');
    } catch (error) {
      console.error('Error updating access settings:', error);
      alert('Fejl ved opdatering af indstillinger');
    }
  };

  const handleApproveRequest = async (requestId, profileId) => {
    try {
      const { error: updateError } = await supabase
        .from('group_join_requests')
        .update({ status: 'approved' })
        .eq('id', requestId);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          profile_id: profileId,
          role: 'member'
        });

      if (insertError) throw insertError;

      await fetchPendingRequests();
      await fetchMembers();
      alert('Medlem godkendt!');
    } catch (error) {
      console.error('Error approving request:', error);
      alert('Fejl ved godkendelse');
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const { error } = await supabase
        .from('group_join_requests')
        .update({ status: 'rejected' })
        .eq('id', requestId);

      if (error) throw error;

      await fetchPendingRequests();
      alert('Anmodning afvist');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Fejl ved afvisning');
    }
  };

  const handleRemoveMember = async (memberId, profileId) => {
    if (!confirm('Er du sikker på at du vil fjerne dette medlem?')) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('id', memberId)
        .eq('group_id', groupId);

      if (error) throw error;

      await fetchMembers();
      alert('Medlem fjernet');
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Fejl ved fjernelse af medlem');
    }
  };

  if (loading || !isGroupAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adopteez-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate(`/groups/${groupId}`)}
          className="flex items-center gap-2 text-adopteez-primary hover:text-adopteez-accent mb-4"
        >
          <ArrowLeft size={20} />
          <span>Tilbage til gruppe</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gruppeadministration</h1>
        <p className="text-gray-600">{group?.name}</p>
      </div>

      <div className="flex gap-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('settings')}
          className={`pb-4 px-2 font-semibold transition-colors border-b-2 ${
            activeTab === 'settings'
              ? 'text-adopteez-primary border-adopteez-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <Settings size={18} className="inline mr-2" />
          Adgangsindstillinger
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-4 px-2 font-semibold transition-colors border-b-2 ${
            activeTab === 'requests'
              ? 'text-adopteez-primary border-adopteez-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <Clock size={18} className="inline mr-2" />
          Anmodninger ({pendingRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('members')}
          className={`pb-4 px-2 font-semibold transition-colors border-b-2 ${
            activeTab === 'members'
              ? 'text-adopteez-primary border-adopteez-primary'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
        >
          <Users size={18} className="inline mr-2" />
          Medlemmer ({members.length})
        </button>
      </div>

      {activeTab === 'settings' && (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Vælg adgangstype</h2>

          <div className="space-y-4 mb-6">
            <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="access_type"
                value="open"
                checked={accessSettings.access_type === 'open'}
                onChange={(e) => setAccessSettings({ ...accessSettings, access_type: e.target.value })}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Lock size={18} className="text-adopteez-primary" />
                  <span className="font-semibold text-gray-900">Åben adgang</span>
                </div>
                <p className="text-sm text-gray-600">Alle kan deltage i gruppen uden godkendelse</p>
              </div>
            </label>

            <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="access_type"
                value="code"
                checked={accessSettings.access_type === 'code'}
                onChange={(e) => setAccessSettings({ ...accessSettings, access_type: e.target.value })}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Key size={18} className="text-adopteez-primary" />
                  <span className="font-semibold text-gray-900">Adgangskode</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">Kræver en fast kode for at deltage</p>
                {accessSettings.access_type === 'code' && (
                  <input
                    type="text"
                    value={accessSettings.access_code}
                    onChange={(e) => setAccessSettings({ ...accessSettings, access_code: e.target.value })}
                    placeholder="Indtast adgangskode..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                  />
                )}
              </div>
            </label>

            <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="access_type"
                value="member_number"
                checked={accessSettings.access_type === 'member_number'}
                onChange={(e) => setAccessSettings({ ...accessSettings, access_type: e.target.value })}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Hash size={18} className="text-adopteez-primary" />
                  <span className="font-semibold text-gray-900">Medlemsnummer</span>
                </div>
                <p className="text-sm text-gray-600">Medlemmer skal indtaste deres medlemsnummer</p>
              </div>
            </label>

            <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="radio"
                name="access_type"
                value="approval"
                checked={accessSettings.access_type === 'approval'}
                onChange={(e) => setAccessSettings({ ...accessSettings, access_type: e.target.value })}
                className="mt-1 mr-3"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle size={18} className="text-adopteez-primary" />
                  <span className="font-semibold text-gray-900">Manuel godkendelse</span>
                </div>
                <p className="text-sm text-gray-600">Du godkender hver anmodning manuelt</p>
              </div>
            </label>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Synlighed</h3>
            <p className="text-sm text-gray-600 mb-4">Vælg hvor din gruppe skal være synlig</p>

            <div className="space-y-4 mb-6">
              <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="visibility_scope"
                  value="worldwide"
                  checked={accessSettings.visibility_scope === 'worldwide'}
                  onChange={(e) => setAccessSettings({ ...accessSettings, visibility_scope: e.target.value })}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">🌍 Worldwide</span>
                  </div>
                  <p className="text-sm text-gray-600">Gruppen vises for alle brugere globalt</p>
                </div>
              </label>

              <label className="flex items-start p-4 border-2 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="visibility_scope"
                  value="local"
                  checked={accessSettings.visibility_scope === 'local'}
                  onChange={(e) => setAccessSettings({ ...accessSettings, visibility_scope: e.target.value })}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">📍 Lokal (specifikt land)</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">Gruppen vises kun for brugere i et bestemt land</p>
                  {accessSettings.visibility_scope === 'local' && (
                    <select
                      value={accessSettings.visibility_country}
                      onChange={(e) => setAccessSettings({ ...accessSettings, visibility_country: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                    >
                      <option value="">Vælg land...</option>
                      <option value="Danmark">Danmark</option>
                      <option value="Norge">Norge</option>
                      <option value="Sverige">Sverige</option>
                      <option value="Finland">Finland</option>
                      <option value="Island">Island</option>
                      <option value="Tyskland">Tyskland</option>
                      <option value="Holland">Holland</option>
                      <option value="Belgien">Belgien</option>
                      <option value="Frankrig">Frankrig</option>
                      <option value="Spanien">Spanien</option>
                      <option value="Italien">Italien</option>
                      <option value="Storbritannien">Storbritannien</option>
                      <option value="USA">USA</option>
                      <option value="Canada">Canada</option>
                      <option value="Australien">Australien</option>
                    </select>
                  )}
                </div>
              </label>
            </div>
          </div>

          <button
            onClick={handleUpdateAccessSettings}
            className="w-full px-6 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-accent transition-colors font-semibold"
          >
            Gem indstillinger
          </button>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {pendingRequests.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {pendingRequests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                        {request.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{request.profile?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Mail size={14} />
                          {request.profile?.email}
                        </p>
                        {request.member_number && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <Hash size={14} />
                            Medlemsnummer: {request.member_number}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveRequest(request.id, request.profile_id)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Godkend
                      </button>
                      <button
                        onClick={() => handleRejectRequest(request.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                      >
                        <XCircle size={18} />
                        Afvis
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">Ingen ventende anmodninger</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {members.length > 0 ? (
            <div className="divide-y divide-gray-200">
              {members.map((member) => (
                <div key={member.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                        {member.profile?.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{member.profile?.full_name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">{member.profile?.email}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                            member.role === 'admin'
                              ? 'bg-adopteez-primary text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {member.role === 'admin' ? 'Admin' : 'Medlem'}
                          </span>
                          {member.member_number && (
                            <span className="text-xs text-gray-500">
                              #{member.member_number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {member.role !== 'admin' && (
                      <button
                        onClick={() => handleRemoveMember(member.id, member.profile_id)}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        Fjern
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">Ingen medlemmer endnu</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
