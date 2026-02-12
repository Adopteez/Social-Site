import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import GroupBannerUploadModal from '../components/GroupBannerUploadModal';

export default function AdminGroups() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [memberTypeFilter, setMemberTypeFilter] = useState('all');
  const [groupTypeFilter, setGroupTypeFilter] = useState('all');
  const [adoptionCountryFilter, setAdoptionCountryFilter] = useState('all');
  const [residenceCountryFilter, setResidenceCountryFilter] = useState('all');

  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');

  const [adoptionCountries, setAdoptionCountries] = useState([]);
  const [residenceCountries, setResidenceCountries] = useState([]);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showBannerModal, setShowBannerModal] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    filterGroups();
  }, [searchQuery, memberTypeFilter, groupTypeFilter, adoptionCountryFilter, residenceCountryFilter, groups, sortColumn, sortDirection]);

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
      fetchGroups();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_subscriptions(count)
        `)
        .order('group_type')
        .order('adoption_country')
        .order('residence_country')
        .order('member_type');

      if (error) throw error;

      setGroups(data || []);

      const uniqueAdoptionCountries = [...new Set(data.map(g => g.adoption_country))].sort();
      const uniqueResidenceCountries = [...new Set(data.map(g => g.residence_country))].sort();

      setAdoptionCountries(uniqueAdoptionCountries);
      setResidenceCountries(uniqueResidenceCountries);

      setLoading(false);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setLoading(false);
    }
  };

  const filterGroups = () => {
    let filtered = [...groups];

    if (searchQuery) {
      filtered = filtered.filter(g =>
        g.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.adoption_country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.residence_country?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (memberTypeFilter !== 'all') {
      filtered = filtered.filter(g => g.member_type === memberTypeFilter);
    }

    if (groupTypeFilter !== 'all') {
      filtered = filtered.filter(g => g.group_type === groupTypeFilter);
    }

    if (adoptionCountryFilter !== 'all') {
      filtered = filtered.filter(g => g.adoption_country === adoptionCountryFilter);
    }

    if (residenceCountryFilter !== 'all') {
      filtered = filtered.filter(g => g.residence_country === residenceCountryFilter);
    }

    if (sortColumn) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortColumn) {
          case 'name':
            aValue = a.name?.toLowerCase() || '';
            bValue = b.name?.toLowerCase() || '';
            break;
          case 'member_type':
            aValue = a.member_type || '';
            bValue = b.member_type || '';
            break;
          case 'adoption_country':
            aValue = a.adoption_country?.toLowerCase() || '';
            bValue = b.adoption_country?.toLowerCase() || '';
            break;
          case 'residence_country':
            aValue = a.residence_country?.toLowerCase() || '';
            bValue = b.residence_country?.toLowerCase() || '';
            break;
          case 'members':
            aValue = a.group_subscriptions?.[0]?.count || 0;
            bValue = b.group_subscriptions?.[0]?.count || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredGroups(filtered);
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

  const getMemberCount = (group) => {
    return group.group_subscriptions?.[0]?.count || 0;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gruppeadministration</h1>
            <p className="text-gray-600">Administrer adoptionslandsgrupper</p>
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
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-500" />
          <h2 className="text-lg font-semibold text-gray-900">Filtre</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Søg efter gruppe..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
            />
          </div>

          <select
            value={groupTypeFilter}
            onChange={(e) => setGroupTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
          >
            <option value="all">Alle kategorier</option>
            <option value="parents">Forældre</option>
            <option value="adopted">Adopterede</option>
            <option value="partner">Samarbejdspartnere</option>
          </select>

          <select
            value={memberTypeFilter}
            onChange={(e) => setMemberTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
          >
            <option value="all">Alle medlemstyper</option>
            <option value="adopted">Adopterede</option>
            <option value="adoptive_parents">Adoptivforældre</option>
          </select>

          <select
            value={adoptionCountryFilter}
            onChange={(e) => setAdoptionCountryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
          >
            <option value="all">Alle adoptionslande</option>
            {adoptionCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>

          <select
            value={residenceCountryFilter}
            onChange={(e) => setResidenceCountryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
          >
            <option value="all">Alle bopælslande</option>
            {residenceCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
          <span>Viser {filteredGroups.length} af {groups.length} grupper</span>
          {(groupTypeFilter !== 'all' || memberTypeFilter !== 'all' || adoptionCountryFilter !== 'all' || residenceCountryFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setGroupTypeFilter('all');
                setMemberTypeFilter('all');
                setAdoptionCountryFilter('all');
                setResidenceCountryFilter('all');
              }}
              className="text-adopteez-primary hover:underline"
            >
              Nulstil filtre
            </button>
          )}
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
                    Gruppenavn
                    {getSortIcon('name')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('member_type')}
                >
                  <div className="flex items-center gap-2">
                    Medlemstype
                    {getSortIcon('member_type')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('adoption_country')}
                >
                  <div className="flex items-center gap-2">
                    Adopteret fra
                    {getSortIcon('adoption_country')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('residence_country')}
                >
                  <div className="flex items-center gap-2">
                    Bosiddende i
                    {getSortIcon('residence_country')}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors select-none"
                  onClick={() => handleSort('members')}
                >
                  <div className="flex items-center gap-2">
                    Medlemmer
                    {getSortIcon('members')}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Handlinger
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredGroups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-lg flex items-center justify-center text-white font-bold">
                        <Shield size={20} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{group.name}</div>
                        {group.group_type === 'partner' && (
                          <span className="text-xs text-orange-600 font-medium">Partner organisation</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      group.member_type === 'adopted'
                        ? 'bg-blue-100 text-blue-800'
                        : group.member_type === 'adoptive_parents'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {group.member_type === 'adopted' ? 'Adopterede' :
                       group.member_type === 'adoptive_parents' ? 'Adoptivforældre' :
                       'Ikke angivet'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {group.adoption_country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {group.residence_country}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <Users size={16} className="mr-2 text-gray-500" />
                      {getMemberCount(group)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setSelectedGroup(group);
                          setShowBannerModal(true);
                        }}
                        className="text-gray-600 hover:text-adopteez-primary transition-colors"
                        title="Upload banner"
                      >
                        <ImageIcon size={18} />
                      </button>
                      <button
                        onClick={() => navigate(`/groups/${group.id}`)}
                        className="text-adopteez-primary hover:text-adopteez-accent"
                      >
                        Se detaljer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Ingen grupper matcher dine filtre</p>
          </div>
        )}
      </div>

      {showBannerModal && selectedGroup && (
        <GroupBannerUploadModal
          group={selectedGroup}
          onClose={() => {
            setShowBannerModal(false);
            setSelectedGroup(null);
          }}
          onSuccess={() => {
            fetchGroups();
          }}
        />
      )}

    </div>
  );
}
