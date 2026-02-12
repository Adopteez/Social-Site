import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Users, MapPin, MessageSquare, Calendar, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getTranslatedGroupName } from '../utils/groupNameTranslation';

const ADOPTION_COUNTRIES = [
  'Colombia', 'Madagascar', 'South Africa', 'Philippines', 'India', 'South Korea',
  'Taiwan', 'Thailand', 'Hungary', 'Czech Republic', 'Peru', 'Burkina Faso',
  'Ivory Coast', 'Morocco', 'Haiti', 'Romania', 'Niger', 'Guinea', 'Bulgaria',
  'Ethiopia', 'Kenya', 'Togo', 'China', 'Vietnam', 'Burundi', 'Costa Rica',
  'Dominican Republic', 'Ecuador', 'Ghana', 'Russia', 'Serbia'
];

const RESIDENCE_COUNTRIES = [
  'Denmark', 'Sweden', 'Norway', 'UK', 'Austria', 'Belgium', 'Finland',
  'Germany', 'Iceland', 'Italy', 'Luxembourg', 'Netherlands', 'Canada', 'US'
];

export default function Groups() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all-groups');
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [countryGroups, setCountryGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterMemberType, setFilterMemberType] = useState('all');
  const [filterAdoptionCountry, setFilterAdoptionCountry] = useState('all');

  useEffect(() => {
    fetchGroups();
    fetchAllGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          group:groups(*)
        `)
        .eq('profile_id', user.id);

      if (error) throw error;
      setGroups(data?.map((gm) => gm.group) || []);
    } catch (error) {
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllGroups = async () => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('country')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      const userCountry = profileData?.country;

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const filteredGroups = data?.filter(group => {
        if (group.group_type !== 'partner') {
          return true;
        }

        if (group.visibility_scope === 'worldwide') {
          return true;
        }

        if (group.visibility_scope === 'local' && userCountry) {
          return group.visibility_country === userCountry;
        }

        return group.visibility_scope === 'worldwide';
      }) || [];

      setAllGroups(filteredGroups);
    } catch (error) {
      console.error('Error fetching all groups:', error);
    }
  };

  const fetchCountryGroups = async (country) => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('country')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;
      const userCountry = profileData?.country;

      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('adoption_country', country)
        .order('residence_country', { ascending: true });

      if (error) throw error;

      const filteredGroups = data?.filter(group => {
        if (group.group_type !== 'partner') {
          return true;
        }

        if (group.visibility_scope === 'worldwide') {
          return true;
        }

        if (group.visibility_scope === 'local' && userCountry) {
          return group.visibility_country === userCountry;
        }

        return group.visibility_scope === 'worldwide';
      }) || [];

      setCountryGroups(filteredGroups);
    } catch (error) {
      console.error('Error fetching country groups:', error);
    }
  };

  const handleCountryClick = (country) => {
    setSelectedCountry(country);
    fetchCountryGroups(country);
  };

  const handleJoinGroup = (adoptionCountry, residenceCountry, memberType) => {
    const groupParams = new URLSearchParams({
      adoption_country: adoptionCountry,
      residence_country: residenceCountry || 'worldwide',
      member_type: memberType,
      user_email: user.email,
      user_id: user.id
    });

    window.location.href = `https://adopteez.com/membership?${groupParams.toString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('groups.findYourGroup')}</h1>
        </div>

        <div className="h-12"></div>
      </div>

      {activeTab === 'all-groups' && (
        <>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <input
                type="text"
                placeholder={t('groups.searchGroup')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-adopteez-primary"
              />
              <select
                value={filterMemberType}
                onChange={(e) => setFilterMemberType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-adopteez-primary"
              >
                <option value="all">{t('groups.whatAreYou')}</option>
                <option value="adoptive_parents">{t('groups.adoptiveParents')}</option>
                <option value="adopted">{t('groups.adopted')}</option>
              </select>
              <select
                value={filterAdoptionCountry}
                onChange={(e) => setFilterAdoptionCountry(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-adopteez-primary"
              >
                <option value="all">{t('groups.adoptionCountry')}</option>
                {ADOPTION_COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {allGroups
              .filter(group => {
                const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()));
                const matchesMemberType = filterMemberType === 'all' || group.member_type === filterMemberType;
                const matchesAdoptionCountry = filterAdoptionCountry === 'all' || group.adoption_country === filterAdoptionCountry;
                return matchesSearch && matchesMemberType && matchesAdoptionCountry;
              })
              .map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}/membership`}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
              >
                {group.banner_url ? (
                  <div className="h-32 relative overflow-hidden">
                    <img
                      src={group.banner_url}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-adopteez-secondary via-adopteez-primary to-adopteez-accent relative">
                    <div className="absolute inset-0 bg-black/5"></div>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start space-x-3 -mt-16 mb-4">
                    {group.avatar_url ? (
                      group.avatar_url.includes(',') ? (
                        <div className="relative w-24 h-24 bg-white rounded-2xl shadow-xl border-4 border-white overflow-hidden">
                          <div className="flex h-full">
                            <img
                              src={group.avatar_url.split(',')[0]}
                              alt="Flag 1"
                              className="w-1/2 h-full object-cover"
                            />
                            <img
                              src={group.avatar_url.split(',')[1]}
                              alt="Flag 2"
                              className="w-1/2 h-full object-cover"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-xl border-4 border-white overflow-hidden">
                          <img
                            src={group.avatar_url}
                            alt={group.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    ) : (
                      <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl font-bold text-adopteez-primary border-4 border-white">
                        {group.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-adopteez-primary transition-colors">{getTranslatedGroupName(group, t)}</h3>
                  </div>
                  {group.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{group.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {group.adoption_country && (
                      <span className="flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
                        <Globe size={14} className="mr-1.5" />
                        {t(`countries.${group.adoption_country}`, group.adoption_country)}
                      </span>
                    )}
                    {group.residence_country && (
                      <span className="flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
                        <MapPin size={14} className="mr-1.5" />
                        {t(`countries.${group.residence_country}`, group.residence_country)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {allGroups.filter(group => {
            const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()));
            const matchesType = filterType === 'all' || group.group_type === filterType;
            return matchesSearch && matchesType;
          }).length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-20 text-center">
              <p className="text-gray-600 text-lg">{t('groups.noGroupsFound')}</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'my-groups' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {groups.map((group) => (
              <Link
                key={group.id}
                to={`/groups/${group.id}/membership`}
                className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
              >
                {group.banner_url ? (
                  <div className="h-32 relative overflow-hidden">
                    <img
                      src={group.banner_url}
                      alt={group.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                ) : (
                  <div className="h-32 bg-gradient-to-br from-adopteez-secondary via-adopteez-primary to-adopteez-accent relative">
                    <div className="absolute inset-0 bg-black/5"></div>
                  </div>
                )}
                <div className="p-5">
                  <div className="flex items-start space-x-3 -mt-16 mb-4">
                    {group.avatar_url ? (
                      group.avatar_url.includes(',') ? (
                        <div className="relative w-24 h-24 bg-white rounded-2xl shadow-xl border-4 border-white overflow-hidden">
                          <div className="flex h-full">
                            <img
                              src={group.avatar_url.split(',')[0]}
                              alt="Flag 1"
                              className="w-1/2 h-full object-cover"
                            />
                            <img
                              src={group.avatar_url.split(',')[1]}
                              alt="Flag 2"
                              className="w-1/2 h-full object-cover"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-24 h-24 bg-white rounded-2xl shadow-xl border-4 border-white overflow-hidden">
                          <img
                            src={group.avatar_url}
                            alt={group.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )
                    ) : (
                      <div className="w-24 h-24 bg-white rounded-2xl shadow-xl flex items-center justify-center text-3xl font-bold text-adopteez-primary border-4 border-white">
                        {group.name[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-adopteez-primary transition-colors">{getTranslatedGroupName(group, t)}</h3>
                  </div>
                  {group.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">{group.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 text-xs">
                    {group.adoption_country && (
                      <span className="flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
                        <Globe size={14} className="mr-1.5" />
                        {t(`countries.${group.adoption_country}`, group.adoption_country)}
                      </span>
                    )}
                    {group.residence_country && (
                      <span className="flex items-center bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium">
                        <MapPin size={14} className="mr-1.5" />
                        {t(`countries.${group.residence_country}`, group.residence_country)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {groups.length === 0 && (
            <div className="bg-white rounded-2xl shadow-sm p-20 text-center">
              <div className="w-24 h-24 bg-adopteez-light/50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users size={48} className="text-adopteez-primary" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-3">{t('groups.noGroupsYet')}</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                {t('groups.joinOrCreate')}
              </p>
              <button className="px-8 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all font-semibold shadow-sm">
                + {t('groups.createGroup')}
              </button>
            </div>
          )}
        </>
      )}

      {activeTab === 'by-country' && !selectedCountry && (
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Adoption Country Groups</h2>
            <p className="text-gray-600">Connect with families who have adopted from the same countries</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ADOPTION_COUNTRIES.sort().map((country) => (
              <button
                key={country}
                onClick={() => handleCountryClick(country)}
                className="flex items-center justify-between p-4 border-2 border-adopteez-light/50 rounded-xl hover:border-adopteez-primary/50 hover:shadow-md transition-all group text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-adopteez-light/50 rounded-xl flex items-center justify-center group-hover:bg-adopteez-light transition-colors">
                    <Globe size={24} className="text-adopteez-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-adopteez-primary transition-colors">{country}</h3>
                    <p className="text-sm text-gray-500">View groups</p>
                  </div>
                </div>
                <div className="text-adopteez-primary opacity-0 group-hover:opacity-100 transition-opacity">→</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'by-country' && selectedCountry && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <button
              onClick={() => setSelectedCountry(null)}
              className="text-adopteez-primary hover:text-adopteez-dark font-semibold mb-4 flex items-center"
            >
              ← Back to countries
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedCountry} Groups</h2>
            <p className="text-gray-600">Choose between local groups or worldwide groups</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Worldwide Groups</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="border-2 border-adopteez-primary/30 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-adopteez-light/50 rounded-xl flex items-center justify-center">
                    <Users size={32} className="text-adopteez-primary" />
                  </div>
                  <span className="bg-adopteez-accent/20 text-adopteez-dark px-3 py-1 rounded-lg text-sm font-semibold">{t('groups.adoptees')}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedCountry} → {t('groups.worldwide')}</h4>
                <p className="text-gray-600 mb-4">{t('groups.connectAdoptees', { country: selectedCountry })}</p>
                <button
                  onClick={() => handleJoinGroup(selectedCountry, null, 'adoptee')}
                  className="w-full px-6 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all font-semibold"
                >
                  {t('groups.subscribeNow')}
                </button>
              </div>

              <div className="border-2 border-adopteez-secondary/30 rounded-xl p-6 hover:shadow-lg transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-adopteez-light/50 rounded-xl flex items-center justify-center">
                    <Users size={32} className="text-adopteez-secondary" />
                  </div>
                  <span className="bg-adopteez-secondary/20 text-adopteez-dark px-3 py-1 rounded-lg text-sm font-semibold">{t('groups.parents')}</span>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-2">{selectedCountry} → {t('groups.worldwide')}</h4>
                <p className="text-gray-600 mb-4">{t('groups.connectParents', { country: selectedCountry })}</p>
                <button
                  onClick={() => handleJoinGroup(selectedCountry, null, 'adoptive_parent')}
                  className="w-full px-6 py-3 bg-adopteez-secondary text-white rounded-xl hover:bg-adopteez-dark transition-all font-semibold"
                >
                  {t('groups.subscribeNow')}
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-6">{t('groups.localGroups')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {RESIDENCE_COUNTRIES.sort().map((residenceCountry) => (
                <div key={residenceCountry} className="border-2 border-adopteez-light/50 rounded-xl p-5 hover:border-adopteez-primary/30 hover:shadow-md transition-all">
                  <div className="flex items-center space-x-3 mb-4">
                    <MapPin size={20} className="text-adopteez-primary" />
                    <h4 className="text-lg font-bold text-gray-900">{selectedCountry} → {residenceCountry}</h4>
                  </div>
                  <div className="space-y-2">
                    <button
                      onClick={() => handleJoinGroup(selectedCountry, residenceCountry, 'adoptee')}
                      className="w-full px-4 py-2.5 bg-adopteez-light/40 text-adopteez-dark rounded-lg hover:bg-adopteez-light transition-all font-medium text-left flex items-center justify-between"
                    >
                      <span>Adoptees Group</span>
                      <span className="text-sm">Subscribe →</span>
                    </button>
                    <button
                      onClick={() => handleJoinGroup(selectedCountry, residenceCountry, 'adoptive_parent')}
                      className="w-full px-4 py-2.5 bg-adopteez-light/40 text-adopteez-dark rounded-lg hover:bg-adopteez-light transition-all font-medium text-left flex items-center justify-between"
                    >
                      <span>Adoptive Parents Group</span>
                      <span className="text-sm">Subscribe →</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
