import { useState, useEffect } from 'react';
import { Globe, Users, Flag } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function WorldwideGroupsChart() {
  const [groupsData, setGroupsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('members');
  const [stats, setStats] = useState({
    totalGroups: 0,
    totalMembers: 0,
    averageMembers: 0,
    countries: 0
  });

  useEffect(() => {
    fetchGroupsData();
  }, []);

  const fetchGroupsData = async () => {
    try {
      setLoading(true);

      const { data: groups, error: groupsError } = await supabase
        .from('groups')
        .select(`
          id,
          name,
          description,
          adoption_country,
          group_type,
          visibility_scope,
          created_at
        `)
        .eq('group_type', 'partner')
        .eq('visibility_scope', 'worldwide');

      if (groupsError) throw groupsError;

      const groupsWithMembers = await Promise.all(
        groups.map(async (group) => {
          const { count, error: countError } = await supabase
            .from('group_members')
            .select('*', { count: 'exact', head: true })
            .eq('group_id', group.id);

          if (countError) {
            console.error('Error counting members:', countError);
            return { ...group, memberCount: 0 };
          }

          return {
            ...group,
            memberCount: count || 0
          };
        })
      );

      const totalMembers = groupsWithMembers.reduce((sum, g) => sum + g.memberCount, 0);
      const avgMembers = groups.length > 0 ? Math.round(totalMembers / groups.length) : 0;
      const uniqueCountries = new Set(groupsWithMembers.map(g => g.adoption_country).filter(Boolean));

      setStats({
        totalGroups: groups.length,
        totalMembers: totalMembers,
        averageMembers: avgMembers,
        countries: uniqueCountries.size
      });

      setGroupsData(groupsWithMembers);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching worldwide groups data:', error);
      setLoading(false);
    }
  };

  const sortedGroups = [...groupsData].sort((a, b) => {
    if (sortBy === 'members') {
      return b.memberCount - a.memberCount;
    } else if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'da');
    } else if (sortBy === 'country') {
      return (a.adoption_country || '').localeCompare(b.adoption_country || '', 'da');
    }
    return 0;
  });

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adopteez-primary"></div>
        </div>
      </div>
    );
  }

  const maxMembers = Math.max(...groupsData.map(g => g.memberCount), 1);

  const groupsByCountry = groupsData.reduce((acc, group) => {
    const country = group.adoption_country || 'Andre';
    if (!acc[country]) {
      acc[country] = {
        country,
        groups: [],
        totalMembers: 0
      };
    }
    acc[country].groups.push(group);
    acc[country].totalMembers += group.memberCount;
    return acc;
  }, {});

  const countriesData = Object.values(groupsByCountry).sort((a, b) => b.totalMembers - a.totalMembers);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Globe className="text-adopteez-primary" size={28} />
            <h2 className="text-2xl font-bold text-gray-900">Worldwide Partner Grupper</h2>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sorter efter:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary focus:border-transparent"
            >
              <option value="members">Antal medlemmer</option>
              <option value="name">Gruppenavn</option>
              <option value="country">Adoptionsland</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-600 mb-1">Partner grupper</p>
            <p className="text-3xl font-bold text-blue-900">{stats.totalGroups}</p>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
            <p className="text-sm font-medium text-green-600 mb-1">Totalt medlemmer</p>
            <p className="text-3xl font-bold text-green-900">{stats.totalMembers}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <p className="text-sm font-medium text-purple-600 mb-1">Gennemsnit/gruppe</p>
            <p className="text-3xl font-bold text-purple-900">{stats.averageMembers}</p>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
            <p className="text-sm font-medium text-orange-600 mb-1">Adoptionslande</p>
            <p className="text-3xl font-bold text-orange-900">{stats.countries}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        {sortedGroups.length === 0 ? (
          <div className="text-center py-12">
            <Globe className="mx-auto text-gray-300 mb-4" size={48} />
            <p className="text-gray-500">Ingen worldwide grupper fundet</p>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Fordeling efter adoptionsland</h3>
              <div className="space-y-3">
                {countriesData.map((countryData, index) => {
                  const percentage = (countryData.totalMembers / stats.totalMembers) * 100;
                  return (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Flag size={18} className="text-adopteez-primary" />
                          <span className="font-semibold text-gray-900">{countryData.country}</span>
                          <span className="text-sm text-gray-500">
                            ({countryData.groups.length} {countryData.groups.length === 1 ? 'gruppe' : 'grupper'})
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-adopteez-primary">{countryData.totalMembers}</p>
                          <p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p>
                        </div>
                      </div>
                      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-orange-400 to-orange-600 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alle worldwide grupper</h3>
              <div className="space-y-3">
                {sortedGroups.map((group, index) => {
                  const percentage = (group.memberCount / maxMembers) * 100;

                  return (
                    <div
                      key={group.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-gray-400">#{index + 1}</span>
                            <div>
                              <h4 className="font-semibold text-gray-900">{group.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                              {group.adoption_country && (
                                <div className="flex items-center space-x-2 mt-2">
                                  <Flag size={14} className="text-gray-400" />
                                  <span className="text-sm text-gray-600">{group.adoption_country}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-2xl font-bold text-adopteez-primary">{group.memberCount}</p>
                            <p className="text-xs text-gray-500">medlemmer</p>
                          </div>
                        </div>
                      </div>

                      <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="absolute top-0 left-0 h-full bg-gradient-to-r from-adopteez-primary to-adopteez-accent transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
