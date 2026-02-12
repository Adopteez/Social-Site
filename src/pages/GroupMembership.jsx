import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Check, X } from 'lucide-react';
import { PACKAGES, FEATURE_CATEGORIES } from '../utils/pricingData';

export default function GroupMembership() {
  const { groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showUpsell, setShowUpsell] = useState(false);
  const [billingCycle, setBillingCycle] = useState('yearly');

  useEffect(() => {
    fetchGroupAndProducts();
  }, [groupId]);

  const fetchGroupAndProducts = async () => {
    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .maybeSingle();

      if (groupError) throw groupError;
      setGroup(groupData);

      if (groupData) {
        if (groupData.residence_country && groupData.residence_country !== 'Worldwide') {
          setShowUpsell(true);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handlePurchase = () => {
    if (!selectedPackage) return;

    const price = billingCycle === 'yearly' ? selectedPackage.yearlyPrice : selectedPackage.monthlyPrice;
    const purchaseParams = new URLSearchParams({
      package_type: selectedPackage.type,
      adoption_country: group.adoption_country,
      billing_cycle: billingCycle,
      price: price,
      user_email: user.email,
      user_id: user.id
    });

    window.location.href = `https://adopteez.com/checkout?${purchaseParams.toString()}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Indlæser...</div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Gruppe ikke fundet</h2>
          <button
            onClick={() => navigate('/groups')}
            className="px-6 py-3 bg-adopteez-primary text-white rounded-xl hover:bg-adopteez-dark transition-all"
          >
            Tilbage til grupper
          </button>
        </div>
      </div>
    );
  }

  const isWorldwideGroup = !group.residence_country || group.residence_country === 'Worldwide';
  const basicPackages = PACKAGES.filter(p => p.type.includes('basic'));
  const plusPackages = PACKAGES.filter(p => p.type.includes('plus'));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bliv medlem af {group.name}</h1>
        <p className="text-gray-600">{group.description}</p>
      </div>

      {showUpsell && !isWorldwideGroup && (
        <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-adopteez-secondary rounded-2xl p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Anbefalet: Få adgang til både lokal og worldwide grupper!</h2>
          <p className="text-gray-700 mb-4">
            Når du køber adgang til <strong>{group.adoption_country}</strong>, kan du også få adgang til den worldwide gruppe for adopterede fra {group.adoption_country}.
            Del historier og oplevelser med familier fra hele verden!
          </p>
          <div className="flex items-center space-x-2 text-adopteez-dark font-semibold">
            <Check className="w-5 h-5" />
            <span>Adgang til lokale grupper i {group.residence_country}</span>
          </div>
          <div className="flex items-center space-x-2 text-adopteez-dark font-semibold">
            <Check className="w-5 h-5" />
            <span>Adgang til worldwide grupper for {group.adoption_country}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {isWorldwideGroup ? 'Vælg din pakke' : 'Vælg dit medlemskab'}
        </h2>

        <div className="flex justify-center mb-6">
          <div className="bg-gray-100 rounded-xl p-1 inline-flex">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Månedligt
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                billingCycle === 'yearly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Årligt
              <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">Spar 30%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {isWorldwideGroup ? (
            <>
              <PackageCard
                title="World Wide Membership Basic"
                package={basicPackages.find(p => p.type === 'worldwide_basic')}
                selected={selectedPackage?.type === 'worldwide_basic'}
                onSelect={handlePackageSelect}
                billingCycle={billingCycle}
              />
              <PackageCard
                title="World Wide Membership Plus"
                package={plusPackages.find(p => p.type === 'worldwide_plus')}
                selected={selectedPackage?.type === 'worldwide_plus'}
                onSelect={handlePackageSelect}
                recommended={true}
                billingCycle={billingCycle}
              />
            </>
          ) : (
            <>
              <PackageCard
                title="Country Membership Basic"
                package={basicPackages.find(p => p.type === 'country_basic')}
                selected={selectedPackage?.type === 'country_basic'}
                onSelect={handlePackageSelect}
                billingCycle={billingCycle}
              />
              <PackageCard
                title="Country Membership Plus"
                package={plusPackages.find(p => p.type === 'country_plus')}
                selected={selectedPackage?.type === 'country_plus'}
                onSelect={handlePackageSelect}
                recommended={true}
                billingCycle={billingCycle}
              />
            </>
          )}
        </div>

        {selectedPackage && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={handlePurchase}
              className="px-8 py-4 bg-adopteez-secondary text-white rounded-xl hover:bg-orange-600 transition-all font-bold text-lg shadow-lg"
            >
              Fortsæt til betaling - {billingCycle === 'yearly' ? selectedPackage.yearlyPrice : selectedPackage.monthlyPrice} kr/{billingCycle === 'yearly' ? 'år' : 'måned'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function PackageCard({ package: pkg, selected, onSelect, recommended, billingCycle }) {
  if (!pkg) return null;

  const price = billingCycle === 'yearly' ? pkg.yearlyPrice : pkg.monthlyPrice;
  const periodLabel = billingCycle === 'yearly' ? '/år' : '/måned';

  const renderFeatureValue = (value) => {
    if (value === true) {
      return <Check className="w-4 h-4 text-green-600" />;
    } else if (value === false) {
      return <X className="w-4 h-4 text-gray-300" />;
    } else {
      return <span className="text-xs text-gray-600">{value}</span>;
    }
  };

  return (
    <div
      onClick={() => onSelect(pkg)}
      className={`relative border-2 rounded-2xl p-6 cursor-pointer transition-all ${
        selected
          ? 'border-adopteez-secondary bg-orange-50 shadow-lg'
          : 'border-gray-200 hover:border-adopteez-primary hover:shadow-md'
      } ${recommended ? 'ring-2 ring-adopteez-secondary' : ''}`}
    >
      {recommended && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-adopteez-secondary text-white px-4 py-1 rounded-full text-sm font-bold">
            ANBEFALET
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">{pkg.name}</h3>
        {selected && (
          <div className="w-6 h-6 bg-adopteez-secondary rounded-full flex items-center justify-center">
            <Check className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900">
          {price} kr <span className="text-lg text-gray-600">{periodLabel}</span>
        </div>
        <p className="text-sm text-gray-600 mt-2">{pkg.description}</p>
        {billingCycle === 'yearly' && (
          <p className="text-xs text-green-600 font-semibold mt-1">Spar 30% med årligt abonnement</p>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto pr-2">
        <h4 className="font-bold text-gray-900 mb-3">Nøglefunktioner:</h4>
        <div className="space-y-4">
          {FEATURE_CATEGORIES.map((category, idx) => (
            <div key={idx}>
              <h5 className="text-xs font-bold text-gray-700 mb-2 uppercase">{category.name}</h5>
              <ul className="space-y-2">
                {category.features.map((feature, featureIdx) => (
                  <li key={featureIdx} className="flex items-start space-x-2">
                    {renderFeatureValue(pkg.features[feature])}
                    <span className="text-xs text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
