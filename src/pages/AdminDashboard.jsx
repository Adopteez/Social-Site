import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, MessageSquare, Calendar, AlertTriangle, UserCheck, UserX, Shield, MessageCircle, Package, Check, X as XIcon, CreditCard } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PACKAGES, FEATURE_CATEGORIES } from '../utils/pricingData';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    bannedUsers: 0,
    totalGroups: 0,
    totalEvents: 0,
    totalMessages: 0,
    pendingReports: 0,
    pendingFeedback: 0,
    recentReports: []
  });
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPackages, setShowPackages] = useState(false);

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
      fetchStats();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const fetchStats = async () => {
    try {
      const [
        usersResult,
        bannedResult,
        groupsResult,
        eventsResult,
        messagesResult,
        memberReportsResult,
        postReportsResult,
        feedbackResult
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_banned', true),
        supabase.from('groups').select('*', { count: 'exact', head: true }),
        supabase.from('events').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('member_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('post_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('feedback_tickets').select('*', { count: 'exact', head: true }).eq('status', 'open')
      ]);

      const { data: recentReports } = await supabase
        .from('member_reports')
        .select(`
          *,
          reporter:profiles!member_reports_reporter_id_fkey(id, full_name, avatar_url),
          reported_user:profiles!member_reports_reported_user_id_fkey(id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setStats({
        totalUsers: usersResult.count || 0,
        activeUsers: (usersResult.count || 0) - (bannedResult.count || 0),
        bannedUsers: bannedResult.count || 0,
        totalGroups: groupsResult.count || 0,
        totalEvents: eventsResult.count || 0,
        totalMessages: messagesResult.count || 0,
        pendingReports: (memberReportsResult.count || 0) + (postReportsResult.count || 0),
        pendingFeedback: feedbackResult.count || 0,
        recentReports: recentReports || []
      });

      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adopteez-primary"></div>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Medlemmer', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Aktive Medlemmer', value: stats.activeUsers, icon: UserCheck, color: 'bg-green-500' },
    { label: 'Bandlyste Medlemmer', value: stats.bannedUsers, icon: UserX, color: 'bg-red-500' },
    { label: 'Grupper', value: stats.totalGroups, icon: Shield, color: 'bg-purple-500' },
    { label: 'Events', value: stats.totalEvents, icon: Calendar, color: 'bg-yellow-500' },
    { label: 'Beskeder', value: stats.totalMessages, icon: MessageSquare, color: 'bg-indigo-500' },
    { label: 'Afventende Rapporter', value: stats.pendingReports, icon: AlertTriangle, color: 'bg-orange-500' },
    { label: 'Åben Feedback', value: stats.pendingFeedback, icon: MessageCircle, color: 'bg-teal-500' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Administration</h1>
        <p className="text-gray-600">Oversigt over platform aktivitet og medlemmer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Seneste Rapporter</h2>
          {stats.recentReports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Ingen rapporter</p>
          ) : (
            <div className="space-y-4">
              {stats.recentReports.map((report) => (
                <div key={report.id} className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
                  <AlertTriangle className="text-orange-500 flex-shrink-0" size={20} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {report.reporter?.full_name} rapporterede {report.reported_user?.full_name}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{report.reason}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(report.created_at).toLocaleDateString('da-DK')}
                    </p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {report.status === 'pending' ? 'Afventer' : report.status === 'resolved' ? 'Løst' : 'Afvist'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Hurtige Handlinger</h2>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/admin/members')}
              className="w-full flex items-center space-x-3 p-4 bg-adopteez-light hover:bg-adopteez-primary hover:text-white rounded-lg transition-colors text-left"
            >
              <Users size={20} />
              <span className="font-semibold">Administrer Medlemmer</span>
            </button>
            <button
              onClick={() => navigate('/admin/reports')}
              className="w-full flex items-center space-x-3 p-4 bg-adopteez-light hover:bg-adopteez-primary hover:text-white rounded-lg transition-colors text-left"
            >
              <AlertTriangle size={20} />
              <span className="font-semibold">Håndter Rapporter</span>
            </button>
            <button
              onClick={() => navigate('/admin/groups')}
              className="w-full flex items-center space-x-3 p-4 bg-adopteez-light hover:bg-adopteez-primary hover:text-white rounded-lg transition-colors text-left"
            >
              <Shield size={20} />
              <span className="font-semibold">Administrer Grupper</span>
            </button>
            <button
              onClick={() => navigate('/admin/exclusions')}
              className="w-full flex items-center space-x-3 p-4 bg-adopteez-light hover:bg-adopteez-primary hover:text-white rounded-lg transition-colors text-left"
            >
              <UserX size={20} />
              <span className="font-semibold">Eksklusionsanbefalinger</span>
            </button>
            <button
              onClick={() => navigate('/admin/feedback')}
              className="w-full flex items-center space-x-3 p-4 bg-adopteez-light hover:bg-adopteez-primary hover:text-white rounded-lg transition-colors text-left"
            >
              <MessageCircle size={20} />
              <span className="font-semibold">Feedback & Fejlrapporter</span>
            </button>
            <button
              onClick={() => navigate('/admin/payments')}
              className="w-full flex items-center space-x-3 p-4 bg-adopteez-light hover:bg-adopteez-primary hover:text-white rounded-lg transition-colors text-left"
            >
              <CreditCard size={20} />
              <span className="font-semibold">Betalinger & Medlemskaber</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-[#FF6F00]" />
            <h2 className="text-xl font-bold text-gray-900">Pakke Oversigt</h2>
          </div>
          <button
            onClick={() => setShowPackages(!showPackages)}
            className="px-4 py-2 bg-[#FF6F00] text-white rounded-lg hover:bg-[#FFA040] transition-colors text-sm font-medium"
          >
            {showPackages ? 'Skjul' : 'Vis Pakker'}
          </button>
        </div>

        {showPackages && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {PACKAGES.map((pkg) => (
                <div key={pkg.type} className={`border-2 rounded-xl p-4 ${pkg.popular ? 'border-[#FF6F00] bg-orange-50' : 'border-gray-200'}`}>
                  <div className="text-center mb-4">
                    {pkg.popular && (
                      <span className="inline-block px-3 py-1 bg-[#FF6F00] text-white text-xs font-bold rounded-full mb-2">
                        POPULÆR
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{pkg.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">{pkg.description}</p>
                    <div className="flex items-baseline justify-center gap-2">
                      <span className="text-3xl font-bold text-[#FF6F00]">{pkg.monthlyPrice} kr</span>
                      <span className="text-sm text-gray-500">/md</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">eller {pkg.yearlyPrice} kr/år</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900 sticky left-0 bg-white z-10">Funktioner</th>
                    {PACKAGES.map((pkg) => (
                      <th key={pkg.type} className="text-center py-3 px-4 font-semibold text-gray-900 min-w-[140px]">
                        {pkg.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {FEATURE_CATEGORIES.map((category) => (
                    <>
                      <tr key={category.name} className="bg-gray-100">
                        <td colSpan={PACKAGES.length + 1} className="py-2 px-4 font-bold text-gray-800">
                          {category.name}
                        </td>
                      </tr>
                      {category.features.map((featureName) => (
                        <tr key={featureName} className="border-b border-gray-200 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-700 sticky left-0 bg-white">
                            {featureName}
                          </td>
                          {PACKAGES.map((pkg) => {
                            const featureValue = pkg.features[featureName];
                            return (
                              <td key={pkg.type} className="py-3 px-4 text-center">
                                {typeof featureValue === 'boolean' ? (
                                  featureValue ? (
                                    <Check className="h-5 w-5 text-green-600 mx-auto" />
                                  ) : (
                                    <XIcon className="h-5 w-5 text-red-400 mx-auto" />
                                  )
                                ) : (
                                  <span className="text-sm text-gray-700">{featureValue}</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Forklaring:</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li><Check className="h-4 w-4 inline text-green-600 mr-1" /> = Funktion inkluderet</li>
                <li><XIcon className="h-4 w-4 inline text-red-400 mr-1" /> = Funktion ikke inkluderet</li>
                <li>Tekstværdier = Delvis adgang eller specifikke begrænsninger</li>
              </ul>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
