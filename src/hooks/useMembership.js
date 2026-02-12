import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export function useMembership() {
  const { user } = useAuth();
  const [membership, setMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setMembership(null);
      setLoading(false);
      return;
    }

    loadMembership();
  }, [user]);

  async function loadMembership() {
    try {
      const { data, error } = await supabase
        .from('user_product_access')
        .select('*, products(*)')
        .eq('profile_id', user.id)
        .eq('is_active', true)
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('package_type', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading membership:', error);
        setMembership(null);
      } else {
        setMembership(data);
      }
    } catch (error) {
      console.error('Error loading membership:', error);
      setMembership(null);
    } finally {
      setLoading(false);
    }
  }

  async function hasFeature(featureKey) {
    if (!user || !membership) return false;

    try {
      const { data, error } = await supabase
        .from('package_features')
        .select('is_enabled')
        .eq('package_type', membership.package_type)
        .eq('feature_key', featureKey)
        .eq('is_enabled', true)
        .maybeSingle();

      return !!data;
    } catch (error) {
      console.error('Error checking feature:', error);
      return false;
    }
  }

  function getUpgradeUrl() {
    return '/pricing';
  }

  return {
    membership,
    loading,
    hasFeature,
    getUpgradeUrl,
    packageType: membership?.package_type || null,
    isCountryBasic: membership?.package_type === 'country_basic',
    isCountryPlus: membership?.package_type === 'country_plus',
    isWorldwideBasic: membership?.package_type === 'worldwide_basic',
    isWorldwidePlus: membership?.package_type === 'worldwide_plus',
  };
}
