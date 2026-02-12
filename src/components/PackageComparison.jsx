import { Check, X, Crown, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMembership } from '../hooks/useMembership';

export default function PackageComparison() {
  const { t } = useTranslation();
  const { membership, packageType } = useMembership();

  const packages = [
    {
      type: 'country_basic',
      name: 'Country Membership',
      tier: 'Basic',
      priceMonthly: 39,
      priceYearly: 328,
      popular: false,
      features: [
        { key: 'access_country_group', text: 'Adgang til Country Group', included: true },
        { key: 'access_worldwide_group', text: 'Adgang til World Wide Group', included: false },
        { key: 'view_members', text: 'Se gruppemedlemmer', value: 'Kun i landet' },
        { key: 'privacy', text: 'Privatlivsindstillinger', value: 'Visning/skjul af profil' },
        { key: 'family_stories', text: 'Familiehistorier', value: 'Opret og se i gruppen' },
        { key: 'feed', text: 'Feed og diskussioner', value: 'Country Group' },
        { key: 'forum', text: 'Forum', value: 'Country Group' },
        { key: 'events', text: 'Begivenheder', value: 'Se og deltag' },
        { key: 'create_events', text: 'Opret begivenheder', included: false },
        { key: 'friend_requests', text: 'Venskabsanmodninger', value: 'Country Groups' },
        { key: 'city_group', text: 'Lokal bygruppe', included: false },
        { key: 'mobile_app', text: 'Mobilapp (forår 2025)', included: true },
        { key: 'bio_search', text: 'Søg biologisk mor (efterår 2025)', value: 'Basisfunktioner' },
        { key: 'webinars', text: 'Webinarer', included: false },
        { key: 'partner_org', text: 'Organisationsmedlemskab', value: 'Anmod om adgang' }
      ]
    },
    {
      type: 'country_plus',
      name: 'Country Membership',
      tier: 'Plus',
      priceMonthly: 59,
      priceYearly: 496,
      popular: false,
      features: [
        { key: 'access_country_group', text: 'Adgang til Country Group', included: true },
        { key: 'access_worldwide_group', text: 'Adgang til World Wide Group', included: false },
        { key: 'view_members', text: 'Se gruppemedlemmer', value: 'I landet og platformsbredde' },
        { key: 'privacy', text: 'Privatlivsindstillinger', value: 'Fuld kontrol' },
        { key: 'family_stories', text: 'Familiehistorier', value: 'Opret og se på hele platformen' },
        { key: 'feed', text: 'Feed og diskussioner', value: 'Country og hele platformen' },
        { key: 'forum', text: 'Forum', value: 'Opret, se og deltag overalt' },
        { key: 'events', text: 'Begivenheder', value: 'Se og deltag overalt' },
        { key: 'create_events', text: 'Opret begivenheder', value: 'Country og hele platformen' },
        { key: 'friend_requests', text: 'Venskabsanmodninger', value: 'Overalt' },
        { key: 'city_group', text: 'Lokal bygruppe', value: 'Opret (større lande, sommer 2025)' },
        { key: 'mobile_app', text: 'Mobilapp (forår 2025)', included: true },
        { key: 'bio_search', text: 'Søg biologisk mor (efterår 2025)', value: 'Fuld adgang med notifikationer' },
        { key: 'webinars', text: 'Webinarer', value: 'Landespecifikke' },
        { key: 'partner_org', text: 'Organisationsmedlemskab', value: 'Fuld adgang' }
      ]
    },
    {
      type: 'worldwide_basic',
      name: 'World Wide Membership',
      tier: 'Basic',
      priceMonthly: 49,
      priceYearly: 412,
      popular: true,
      features: [
        { key: 'access_country_group', text: 'Adgang til Country Group', included: true },
        { key: 'access_worldwide_group', text: 'Adgang til World Wide Group', included: true },
        { key: 'view_members', text: 'Se gruppemedlemmer', value: 'Country og World Wide Groups' },
        { key: 'privacy', text: 'Privatlivsindstillinger', value: 'Visning/skjul af profil' },
        { key: 'family_stories', text: 'Familiehistorier', value: 'Opret og se i begge grupper' },
        { key: 'feed', text: 'Feed og diskussioner', value: 'Country og World Wide Groups' },
        { key: 'forum', text: 'Forum', value: 'Country og World Wide Groups' },
        { key: 'events', text: 'Begivenheder', value: 'Se og deltag' },
        { key: 'create_events', text: 'Opret begivenheder', included: false },
        { key: 'friend_requests', text: 'Venskabsanmodninger', value: 'Country og World Wide Groups' },
        { key: 'city_group', text: 'Lokal bygruppe', included: false },
        { key: 'mobile_app', text: 'Mobilapp (forår 2025)', included: true },
        { key: 'bio_search', text: 'Søg biologisk mor (efterår 2025)', value: 'Basisfunktioner' },
        { key: 'webinars', text: 'Webinarer', included: false },
        { key: 'partner_org', text: 'Organisationsmedlemskab', value: 'Anmod om adgang' }
      ]
    },
    {
      type: 'worldwide_plus',
      name: 'World Wide Membership',
      tier: 'Plus',
      priceMonthly: 69,
      priceYearly: 580,
      popular: false,
      features: [
        { key: 'access_country_group', text: 'Adgang til Country Group', included: true },
        { key: 'access_worldwide_group', text: 'Adgang til World Wide Group', included: true },
        { key: 'view_members', text: 'Se gruppemedlemmer', value: 'Overalt' },
        { key: 'privacy', text: 'Privatlivsindstillinger', value: 'Fuld kontrol' },
        { key: 'family_stories', text: 'Familiehistorier', value: 'Opret (to sprog) og se overalt' },
        { key: 'feed', text: 'Feed og diskussioner', value: 'Overalt' },
        { key: 'forum', text: 'Forum', value: 'Opret, se og deltag overalt' },
        { key: 'events', text: 'Begivenheder', value: 'Se og deltag overalt' },
        { key: 'create_events', text: 'Opret begivenheder', value: 'Overalt' },
        { key: 'friend_requests', text: 'Venskabsanmodninger', value: 'Overalt' },
        { key: 'city_group', text: 'Lokal bygruppe', value: 'Opret (større lande, sommer 2025)' },
        { key: 'mobile_app', text: 'Mobilapp (forår 2025)', included: true },
        { key: 'bio_search', text: 'Søg biologisk mor (efterår 2025)', value: 'Fuld adgang med notifikationer' },
        { key: 'webinars', text: 'Webinarer', value: 'Country, World Wide og hele platformen' },
        { key: 'partner_org', text: 'Organisationsmedlemskab', value: 'Fuld adgang' }
      ]
    }
  ];

  const handleUpgrade = (packageType) => {
    window.location.href = `/checkout?package=${packageType}`;
  };

  const isCurrentPackage = (pkgType) => {
    return packageType === pkgType;
  };

  const canUpgrade = (pkgType) => {
    if (!packageType) return true;

    if (packageType === 'country_basic' && pkgType === 'country_plus') return true;
    if (packageType === 'country_basic' && pkgType.includes('worldwide')) return true;
    if (packageType === 'country_plus' && pkgType.includes('worldwide')) return true;
    if (packageType === 'worldwide_basic' && pkgType === 'worldwide_plus') return true;

    return false;
  };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Vælg den pakke der passer til dig
        </h2>
        <p className="text-xl text-gray-600">
          Sammenlign funktioner og find den bedste løsning
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {packages.map((pkg) => (
          <div
            key={pkg.type}
            className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 transition-all ${
              pkg.popular
                ? 'border-[#FF6F00] transform scale-105'
                : isCurrentPackage(pkg.type)
                ? 'border-[#1A237E]'
                : 'border-gray-200'
            }`}
          >
            {pkg.popular && (
              <div className="bg-gradient-to-r from-[#FF6F00] to-[#FFA040] text-white text-sm font-semibold px-4 py-2 text-center">
                Mest populær
              </div>
            )}

            {isCurrentPackage(pkg.type) && (
              <div className="bg-[#1A237E] text-white text-sm font-semibold px-4 py-2 text-center">
                Din nuværende pakke
              </div>
            )}

            <div className="p-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {pkg.name}
                </h3>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FFA040] text-white rounded-full text-sm font-semibold">
                  {pkg.tier === 'Plus' && <Crown size={16} />}
                  {pkg.tier}
                </div>
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-[#1A237E] mb-2">
                  {pkg.priceYearly} DKK
                </div>
                <div className="text-sm text-gray-600">per år</div>
                <div className="text-xs text-gray-500 mt-1">
                  (eller {pkg.priceMonthly} DKK/måned)
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {pkg.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm">
                    {feature.included === false ? (
                      <X size={18} className="text-gray-300 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium text-gray-900">{feature.text}</div>
                      {feature.value && (
                        <div className="text-gray-600 text-xs">{feature.value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {isCurrentPackage(pkg.type) ? (
                <button
                  disabled
                  className="w-full py-3 bg-gray-200 text-gray-500 rounded-xl font-semibold cursor-not-allowed"
                >
                  Din nuværende pakke
                </button>
              ) : canUpgrade(pkg.type) ? (
                <button
                  onClick={() => handleUpgrade(pkg.type)}
                  className="w-full py-3 bg-gradient-to-r from-[#FF6F00] to-[#FFA040] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  Opgrader nu
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={() => handleUpgrade(pkg.type)}
                  className="w-full py-3 bg-[#1A237E] text-white rounded-xl font-semibold hover:bg-[#283593] transition-colors"
                >
                  Vælg pakke
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-[#F5F5F5] rounded-2xl p-8 text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Har du brug for hjælp til at vælge?
        </h3>
        <p className="text-gray-600 mb-6">
          Kontakt os, så hjælper vi dig med at finde den rigtige pakke til dine behov
        </p>
        <a
          href="/contact"
          className="inline-block px-8 py-3 bg-[#1A237E] text-white rounded-xl font-semibold hover:bg-[#283593] transition-colors"
        >
          Kontakt support
        </a>
      </div>
    </div>
  );
}
