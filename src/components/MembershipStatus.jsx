import { Crown, ArrowUpRight, CheckCircle } from 'lucide-react';
import { useMembership } from '../hooks/useMembership';
import { Link } from 'react-router-dom';

export default function MembershipStatus() {
  const { membership, loading, packageType, isCountryBasic, isWorldwideBasic } = useMembership();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    );
  }

  if (!membership) {
    return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-[#FF6F00] rounded-2xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#FF6F00] rounded-full flex items-center justify-center flex-shrink-0">
            <Crown className="text-white" size={24} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Intet aktivt medlemskab
            </h3>
            <p className="text-gray-700 mb-4">
              Få adgang til alle funktioner ved at vælge en medlemspakke
            </p>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1A237E] to-[#283593] text-white font-semibold rounded-xl hover:shadow-lg transition-all"
            >
              Se medlemspakker
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const packageNames = {
    country_basic: { name: 'Country Membership', tier: 'Basic' },
    country_plus: { name: 'Country Membership', tier: 'Plus' },
    worldwide_basic: { name: 'World Wide Membership', tier: 'Basic' },
    worldwide_plus: { name: 'World Wide Membership', tier: 'Plus' },
  };

  const currentPackage = packageNames[packageType] || { name: 'Unknown', tier: '' };
  const canUpgrade = isCountryBasic || isWorldwideBasic;

  const getUpgradeTarget = () => {
    if (isCountryBasic) return 'country_plus';
    if (isWorldwideBasic) return 'worldwide_plus';
    return null;
  };

  return (
    <div className={`bg-gradient-to-br ${
      canUpgrade
        ? 'from-gray-50 to-gray-100 border-gray-300'
        : 'from-amber-50 to-orange-50 border-amber-300'
    } border-2 rounded-2xl shadow-lg p-6`}>
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 ${
          canUpgrade ? 'bg-gray-400' : 'bg-gradient-to-br from-amber-400 to-orange-500'
        } rounded-full flex items-center justify-center flex-shrink-0`}>
          {canUpgrade ? (
            <CheckCircle className="text-white" size={24} />
          ) : (
            <Crown className="text-white" size={24} />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-bold text-gray-900">
              {currentPackage.name}
            </h3>
            <span className={`px-3 py-1 ${
              currentPackage.tier === 'Plus'
                ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                : 'bg-gray-400'
            } text-white text-sm font-semibold rounded-full flex items-center gap-1`}>
              {currentPackage.tier === 'Plus' && <Crown size={14} />}
              {currentPackage.tier}
            </span>
          </div>

          {membership.expires_at ? (
            <p className="text-sm text-gray-600 mb-4">
              Aktivt til: {new Date(membership.expires_at).toLocaleDateString('da-DK', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          ) : (
            <p className="text-sm text-gray-600 mb-4">
              Aktivt medlemskab
            </p>
          )}

          {canUpgrade ? (
            <div className="bg-white rounded-xl p-4 mb-4 border-2 border-amber-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Crown className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">
                    Opgrader til Plus
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Få fuld adgang til at oprette indhold, events, og alle avancerede funktioner
                  </p>
                  <Link
                    to={`/pricing?upgrade=${getUpgradeTarget()}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6F00] to-[#FFA040] text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
                  >
                    Opgrader nu
                    <ArrowUpRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white/50 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-700 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                Du har fuld adgang til alle funktioner
              </p>
            </div>
          )}

          <Link
            to="/pricing"
            className="text-sm text-[#1A237E] hover:text-[#283593] font-medium inline-flex items-center gap-1"
          >
            Se alle pakker
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}
