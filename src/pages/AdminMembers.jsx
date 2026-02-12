import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserX, UserCheck, Shield, AlertCircle, Ban, CheckCircle, AlertTriangle, ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, ArrowUpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import WarningModal from '../components/WarningModal';
import ExclusionModal from '../components/ExclusionModal';
import PackageUpgradeModal from '../components/PackageUpgradeModal';

export default function AdminMembers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [groups, setGroups] = useState([]);
  const [showGroupAdminModal, setShowGroupAdminModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showExclusionModal, setShowExclusionModal] = useState(false);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);
  const [managedGroupId, setManagedGroupId] = useState(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    filterMembers();
  }, [searchQuery, filterStatus, members, sortColumn, sortDirection]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, group_admin_for')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!['admin', 'moderator', 'super_admin', 'group_admin'].includes(data.role)) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
      setIsSuperAdmin(data.role === 'super_admin');
      setIsGroupAdmin(data.role === 'group_admin');
      setManagedGroupId(data.group_admin_for);
      fetchMembers();
      fetchGroups();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const fetchMembers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          group:groups!group_admin_for(id, name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched members:', data);
      setMembers(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching members:', error);
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name')
        .eq('is_adoption_country_group', true)
        .order('name');

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    if (searchQuery) {
      filtered = filtered.filter(m =>
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterStatus === 'active') {
      filtered = filtered.filter(m => !m.is_banned);
    } else if (filterStatus === 'banned') {
      filtered = filtered.filter(m => m.is_banned);
    } else if (filterStatus === 'admin') {
      filtered = filtered.filter(m => ['super_admin', 'admin', 'moderator', 'group_admin'].includes(m.role));
    }

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortColumn) {
          case 'name':
            aValue = a.full_name?.toLowerCase() || '';
            bValue = b.full_name?.toLowerCase() || '';
            break;
          case 'email':
            aValue = a.email?.toLowerCase() || '';
            bValue = b.email?.toLowerCase() || '';
            break;
          case 'role':
            const roleOrder = { user: 0, moderator: 1, group_admin: 2, admin: 3, super_admin: 4 };
            aValue = roleOrder[a.role] || 0;
            bValue = roleOrder[b.role] || 0;
            break;
          case 'status':
            aValue = a.is_banned ? 0 : 1;
            bValue = b.is_banned ? 0 : 1;
            break;
          case 'created':
            aValue = new Date(a.created_at).getTime();
            bValue = new Date(b.created_at).getTime();
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredMembers(filtered);
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column) => {
    if (sortColumn !== column) {
      return <ArrowUpDown size={14} className="text-gray-400" />;
    }
    return sortDirection === 'asc'
      ? <ArrowUp size={14} className="text-adopteez-primary" />
      : <ArrowDown size={14} className="text-adopteez-primary" />;
  };

  const handleBanMember = async () => {
    if (!selectedMember || !banReason.trim()) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: true,
          ban_reason: banReason,
          banned_at: new Date().toISOString(),
          banned_by: user.id
        })
        .eq('id', selectedMember.id);

      if (error) throw error;

      setShowBanModal(false);
      setSelectedMember(null);
      setBanReason('');
      fetchMembers();
    } catch (error) {
      console.error('Error banning member:', error);
    }
  };

  const handleUnbanMember = async (memberId) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          is_banned: false,
          ban_reason: null,
          banned_at: null,
          banned_by: null
        })
        .eq('id', memberId);

      if (error) throw error;
      fetchMembers();
    } catch (error) {
      console.error('Error unbanning member:', error);
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    if (!isSuperAdmin && newRole === 'super_admin') {
      alert('Kun super admins kan udnævne andre super admins');
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;
      fetchMembers();
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  const handleAssignGroupAdmin = async () => {
    if (!selectedMember || !selectedGroup) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          role: 'group_admin',
          group_admin_for: selectedGroup
        })
        .eq('id', selectedMember.id);

      if (error) throw error;

      setShowGroupAdminModal(false);
      setSelectedMember(null);
      setSelectedGroup('');
      fetchMembers();
    } catch (error) {
      console.error('Error assigning group admin:', error);
    }
  };

  if (!isAdmin || loading) {
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
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2 text-adopteez-primary hover:text-adopteez-dark mb-4 font-medium"
        >
          <ArrowLeft size={20} />
          <span>Tilbage til Dashboard</span>
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Medlemsadministration</h1>
            <p className="text-gray-600">Administrer platformens medlemmer</p>
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
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søg efter navn eller email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
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
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-adopteez-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Aktive
            </button>
            <button
              onClick={() => setFilterStatus('banned')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'banned'
                  ? 'bg-adopteez-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Bandlyste
            </button>
            <button
              onClick={() => setFilterStatus('admin')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'admin'
                  ? 'bg-adopteez-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Admins
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Medlem
                    {getSortIcon('name')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    Email
                    {getSortIcon('email')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('role')}
                >
                  <div className="flex items-center gap-2">
                    Rolle
                    {getSortIcon('role')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-2">
                    Status
                    {getSortIcon('status')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('created')}
                >
                  <div className="flex items-center gap-2">
                    Oprettet
                    {getSortIcon('created')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {member.avatar_url ? (
                        <img
                          src={member.avatar_url}
                          alt={member.full_name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold">
                          {member.full_name?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{member.full_name || 'Ikke angivet'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{member.email || 'Ikke tilgængelig'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <select
                        value={member.role || 'user'}
                        onChange={(e) => handleRoleChange(member.id, e.target.value)}
                        disabled={member.id === user.id}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-adopteez-primary focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="user">Bruger</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                        <option value="group_admin">Gruppe Admin</option>
                        {isSuperAdmin && <option value="super_admin">Super Admin</option>}
                      </select>
                      {member.role === 'group_admin' && member.group && (
                        <span className="text-xs text-gray-500 italic">
                          Admin for: {member.group.name}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.is_banned ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Bandlyst
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Aktiv
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(member.created_at).toLocaleDateString('da-DK')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {member.id !== user.id && (
                      <div className="flex space-x-2">
                        {!isGroupAdmin && (
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowUpgradeModal(true);
                            }}
                            className="text-purple-600 hover:text-purple-900"
                            title="Opgrader medlemskab"
                          >
                            <ArrowUpCircle size={18} />
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              setSelectedMember(member);
                              setShowGroupAdminModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900"
                            title="Tildel gruppe admin"
                          >
                            <Shield size={18} />
                          </button>
                        )}
                        {isGroupAdmin && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setShowWarningModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Giv advarsel"
                            >
                              <AlertTriangle size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setShowExclusionModal(true);
                              }}
                              className="text-orange-600 hover:text-orange-900"
                              title="Anbefal udelukkelse"
                            >
                              <UserX size={18} />
                            </button>
                          </>
                        )}
                        {!isGroupAdmin && (
                          <>
                            {member.is_banned ? (
                              <button
                                onClick={() => handleUnbanMember(member.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Ophæv bandlysning"
                              >
                                <UserCheck size={18} />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  setSelectedMember(member);
                                  setShowBanModal(true);
                                }}
                                className="text-red-600 hover:text-red-900"
                                title="Bandlys medlem"
                              >
                                <UserX size={18} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showBanModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Ban className="text-red-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Bandlys Medlem</h3>
                <p className="text-sm text-gray-600">{selectedMember?.full_name}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Årsag til bandlysning
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Beskriv hvorfor dette medlem bandlyses..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
                rows="4"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowBanModal(false);
                  setSelectedMember(null);
                  setBanReason('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuller
              </button>
              <button
                onClick={handleBanMember}
                disabled={!banReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bandlys
              </button>
            </div>
          </div>
        </div>
      )}

      {showGroupAdminModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Shield className="text-blue-600" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Tildel Gruppe Admin</h3>
                <p className="text-sm text-gray-600">{selectedMember?.full_name}</p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vælg adoptionslandsgruppe
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
              >
                <option value="">Vælg en gruppe...</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Medlemmet vil blive gruppe admin for den valgte adoptionslandsgruppe
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowGroupAdminModal(false);
                  setSelectedMember(null);
                  setSelectedGroup('');
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuller
              </button>
              <button
                onClick={handleAssignGroupAdmin}
                disabled={!selectedGroup}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tildel
              </button>
            </div>
          </div>
        </div>
      )}

      {showWarningModal && selectedMember && (
        <WarningModal
          member={selectedMember}
          groupId={managedGroupId}
          onClose={() => {
            setShowWarningModal(false);
            setSelectedMember(null);
          }}
          onSuccess={() => {
            fetchMembers();
          }}
        />
      )}

      {showExclusionModal && selectedMember && (
        <ExclusionModal
          member={selectedMember}
          groupId={managedGroupId}
          onClose={() => {
            setShowExclusionModal(false);
            setSelectedMember(null);
          }}
          onSuccess={() => {
            alert('Eksklusionsanbefaling sendt til super admin');
          }}
        />
      )}

      {showUpgradeModal && selectedMember && (
        <PackageUpgradeModal
          member={selectedMember}
          onClose={() => {
            setShowUpgradeModal(false);
            setSelectedMember(null);
          }}
          onSuccess={() => {
            fetchMembers();
          }}
        />
      )}

    </div>
  );
}
