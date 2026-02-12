import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import MemberGrowthChart from '../components/MemberGrowthChart';
import LocalGroupsChart from '../components/LocalGroupsChart';
import WorldwideGroupsChart from '../components/WorldwideGroupsChart';

export default function AdminReports() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [memberReports, setMemberReports] = useState([]);
  const [postReports, setPostReports] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!['super_admin', 'admin', 'moderator', 'group_admin'].includes(data.role)) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
      fetchReports();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const fetchReports = async () => {
    try {
      const [memberReportsData, postReportsData] = await Promise.all([
        supabase
          .from('member_reports')
          .select(`
            *,
            reporter:profiles!member_reports_reporter_id_fkey(id, full_name, avatar_url),
            reported_user:profiles!member_reports_reported_user_id_fkey(id, full_name, avatar_url)
          `)
          .order('created_at', { ascending: false }),
        supabase
          .from('post_reports')
          .select(`
            *,
            reporter:profiles!post_reports_reporter_id_fkey(id, full_name, avatar_url),
            post:posts(id, content, author:profiles(id, full_name, avatar_url))
          `)
          .order('created_at', { ascending: false })
      ]);

      if (memberReportsData.data) setMemberReports(memberReportsData.data);
      if (postReportsData.data) setPostReports(postReportsData.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setLoading(false);
    }
  };

  const handleResolveReport = async (reportId, reportType, action) => {
    try {
      const table = reportType === 'member' ? 'member_reports' : 'post_reports';

      const { error } = await supabase
        .from(table)
        .update({
          status: action === 'resolve' ? 'resolved' : 'dismissed',
          resolved_at: new Date().toISOString(),
          resolved_by: user.id
        })
        .eq('id', reportId);

      if (error) throw error;

      setShowDetailModal(false);
      setSelectedReport(null);
      fetchReports();
    } catch (error) {
      console.error('Error resolving report:', error);
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adopteez-primary"></div>
      </div>
    );
  }

  const filteredMemberReports = memberReports.filter(r =>
    filterStatus === 'all' || r.status === filterStatus
  );

  const filteredPostReports = postReports.filter(r =>
    filterStatus === 'all' || r.status === filterStatus
  );

  const currentReports = activeTab === 'member' ? filteredMemberReports : filteredPostReports;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Rapportadministration</h1>
            <p className="text-gray-600">Håndter rapporter fra brugere</p>
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="px-4 py-2 bg-adopteez-primary text-white rounded-lg hover:bg-adopteez-accent transition-colors"
          >
            Tilbage til Dashboard
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex-1 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'text-adopteez-primary border-b-2 border-adopteez-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Medlemsvækst
          </button>
          <button
            onClick={() => setActiveTab('local-groups')}
            className={`flex-1 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'local-groups'
                ? 'text-adopteez-primary border-b-2 border-adopteez-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Lokale grupper
          </button>
          <button
            onClick={() => setActiveTab('worldwide-groups')}
            className={`flex-1 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'worldwide-groups'
                ? 'text-adopteez-primary border-b-2 border-adopteez-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Worldwide grupper
          </button>
          <button
            onClick={() => setActiveTab('member')}
            className={`flex-1 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'member'
                ? 'text-adopteez-primary border-b-2 border-adopteez-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Medlemsrapporter ({memberReports.filter(r => r.status === 'pending').length})
          </button>
          <button
            onClick={() => setActiveTab('post')}
            className={`flex-1 py-4 px-6 font-medium transition-colors whitespace-nowrap ${
              activeTab === 'post'
                ? 'text-adopteez-primary border-b-2 border-adopteez-primary'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Indlægsrapporter ({postReports.filter(r => r.status === 'pending').length})
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'analytics' ? (
            <MemberGrowthChart />
          ) : activeTab === 'local-groups' ? (
            <LocalGroupsChart />
          ) : activeTab === 'worldwide-groups' ? (
            <WorldwideGroupsChart />
          ) : (
          <>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-adopteez-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Alle
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-adopteez-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Afventende
            </button>
            <button
              onClick={() => setFilterStatus('resolved')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'resolved'
                  ? 'bg-adopteez-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Løste
            </button>
            <button
              onClick={() => setFilterStatus('dismissed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'dismissed'
                  ? 'bg-adopteez-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Afviste
            </button>
          </div>

          {currentReports.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">Ingen rapporter i denne kategori</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentReports.map((report) => (
                <div
                  key={report.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <AlertTriangle className="text-orange-500" size={20} />
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {report.status === 'pending' ? 'Afventer' :
                           report.status === 'resolved' ? 'Løst' : 'Afvist'}
                        </span>
                      </div>

                      {activeTab === 'member' ? (
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">
                            {report.reporter?.full_name} rapporterede {report.reported_user?.full_name}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">{report.reason}</p>
                          {report.description && (
                            <p className="text-sm text-gray-500 italic">{report.description}</p>
                          )}
                        </div>
                      ) : (
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">
                            {report.reporter?.full_name} rapporterede et indlæg af {report.post?.author?.full_name}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">{report.reason}</p>
                          {report.post?.content && (
                            <div className="bg-gray-50 p-3 rounded-lg mt-2">
                              <p className="text-sm text-gray-700 line-clamp-2">{report.post.content}</p>
                            </div>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(report.created_at).toLocaleDateString('da-DK')} kl. {new Date(report.created_at).toLocaleTimeString('da-DK')}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => {
                          setSelectedReport({ ...report, type: activeTab });
                          setShowDetailModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Se detaljer"
                      >
                        <Eye size={18} />
                      </button>

                      {report.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleResolveReport(report.id, activeTab, 'resolve')}
                            className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                            title="Løs rapport"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleResolveReport(report.id, activeTab, 'dismiss')}
                            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                            title="Afvis rapport"
                          >
                            <XCircle size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </>
          )}
        </div>
      </div>

      {showDetailModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Rapportdetaljer</h3>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedReport(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Rapportør</h4>
                <div className="flex items-center space-x-3">
                  {selectedReport.reporter?.avatar_url ? (
                    <img
                      src={selectedReport.reporter.avatar_url}
                      alt={selectedReport.reporter.full_name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                      {selectedReport.reporter?.full_name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <span className="font-medium">{selectedReport.reporter?.full_name}</span>
                </div>
              </div>

              {selectedReport.type === 'member' && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rapporteret medlem</h4>
                  <div className="flex items-center space-x-3">
                    {selectedReport.reported_user?.avatar_url ? (
                      <img
                        src={selectedReport.reported_user.avatar_url}
                        alt={selectedReport.reported_user.full_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                        {selectedReport.reported_user?.full_name?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <span className="font-medium">{selectedReport.reported_user?.full_name}</span>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Årsag</h4>
                <p className="text-gray-700">{selectedReport.reason}</p>
              </div>

              {selectedReport.description && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Beskrivelse</h4>
                  <p className="text-gray-700">{selectedReport.description}</p>
                </div>
              )}

              {selectedReport.type === 'post' && selectedReport.post && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Rapporteret indlæg</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedReport.post.content}</p>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Status</h4>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                  selectedReport.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  selectedReport.status === 'resolved' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {selectedReport.status === 'pending' ? 'Afventer' :
                   selectedReport.status === 'resolved' ? 'Løst' : 'Afvist'}
                </span>
              </div>

              {selectedReport.status === 'pending' && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => handleResolveReport(selectedReport.id, selectedReport.type, 'resolve')}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Løs rapport
                  </button>
                  <button
                    onClick={() => handleResolveReport(selectedReport.id, selectedReport.type, 'dismiss')}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Afvis rapport
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
