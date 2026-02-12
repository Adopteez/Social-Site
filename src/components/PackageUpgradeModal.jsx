import { useState, useEffect } from 'react';
import { ArrowUp, X, Loader2, Package, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function PackageUpgradeModal({ member, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [currentAccess, setCurrentAccess] = useState(null);
  const [upgradeOption, setUpgradeOption] = useState(null);

  const packagePrices = {
    country_basic: { name: 'Country Membership Basic', yearly: 328 },
    country_plus: { name: 'Country Membership Plus', yearly: 496 },
    worldwide_basic: { name: 'World Wide Membership Basic', yearly: 412 },
    worldwide_plus: { name: 'World Wide Membership Plus', yearly: 580 },
  };

  const upgradeMap = {
    country_basic: 'country_plus',
    country_plus: 'worldwide_plus',
    worldwide_basic: 'worldwide_plus',
    worldwide_plus: null,
  };

  useEffect(() => {
    fetchCurrentAccess();
  }, [member]);

  useEffect(() => {
    if (currentAccess) {
      const nextPackageCode = upgradeMap[currentAccess.product.code];
      if (nextPackageCode) {
        const currentPrice = packagePrices[currentAccess.product.code].yearly;
        const nextPrice = packagePrices[nextPackageCode].yearly;
        const difference = nextPrice - currentPrice;

        setUpgradeOption({
          code: nextPackageCode,
          name: packagePrices[nextPackageCode].name,
          price: nextPrice,
          difference: difference,
          currentCode: currentAccess.product.code
        });
      }
    }
  }, [currentAccess]);

  const fetchCurrentAccess = async () => {
    try {
      const { data: accessData, error: accessError } = await supabase
        .from('user_access')
        .select('*')
        .eq('user_id', member.id)
        .eq('is_active', true)
        .maybeSingle();

      if (accessError) throw accessError;

      if (accessData) {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', accessData.product_id)
          .single();

        if (productError) throw productError;

        setCurrentAccess({
          ...accessData,
          product: productData
        });
      }
    } catch (error) {
      console.error('Error fetching current access:', error);
    }
  };

  const handleUpgrade = async () => {
    if (!upgradeOption) return;

    setLoading(true);

    try {
      const { data: newProduct, error: productError } = await supabase
        .from('products')
        .select('id, stripe_product_id')
        .eq('code', upgradeOption.code)
        .single();

      if (productError) throw productError;

      if (!newProduct.stripe_product_id) {
        throw new Error('Dette produkt er ikke konfigureret til Stripe betalinger');
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            type: 'upgrade',
            product_code: upgradeOption.code,
            current_product_code: currentAccess.product.code,
            subscription_id: currentAccess.subscription_id,
          }),
        }
      );

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      window.location.href = url;
    } catch (error) {
      console.error('Error creating upgrade request:', error);
      alert(`Fejl: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!currentAccess) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6">
          <div className="text-center">
            <Loader2 className="animate-spin mx-auto mb-4 text-blue-600" size={32} />
            <p className="text-gray-600">Henter nuværende pakke...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!upgradeOption) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-lg w-full p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900">Opgradering</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="text-green-600" size={40} />
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-2">Du har allerede den højeste pakke!</h4>
            <p className="text-gray-600">
              {currentAccess.product.name} er den mest omfattende pakke vi tilbyder.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Luk
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <ArrowUp className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Opgrader Medlemskab</h3>
              <p className="text-sm text-gray-600">{member.full_name || member.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Package size={18} className="text-gray-600" />
            <span className="font-semibold text-gray-700">Nuværende Pakke</span>
          </div>
          <p className="text-gray-900 font-medium">{currentAccess.product.name}</p>
          <p className="text-sm text-gray-600 mt-1">{packagePrices[currentAccess.product.code].yearly} DKK/år</p>
          {currentAccess.expires_at && (
            <p className="text-sm text-gray-500 mt-1">
              Udløber: {new Date(currentAccess.expires_at).toLocaleDateString('da-DK')}
            </p>
          )}
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-6 mb-6 border-2 border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <ArrowUp size={20} className="text-blue-600" />
            <span className="font-semibold text-gray-900">Opgrader til</span>
          </div>
          <h4 className="text-xl font-bold text-gray-900 mb-2">{upgradeOption.name}</h4>
          <p className="text-2xl font-bold text-blue-600 mb-4">{upgradeOption.price} DKK/år</p>

          <div className="bg-white rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-gray-600 mb-1">Pris for opgradering</p>
            <p className="text-3xl font-bold text-green-600">{upgradeOption.difference} DKK</p>
            <p className="text-xs text-gray-500 mt-2">
              Du betaler kun differencen mellem din nuværende pakke og den nye pakke
            </p>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Sådan fungerer det:</h4>
          <ul className="text-sm text-gray-700 space-y-2">
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">1.</span>
              <span>Klik på "Opgrader Nu" for at sende din anmodning</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">2.</span>
              <span>Du modtager en email med betalingsinformation</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">3.</span>
              <span>Efter betaling aktiveres din nye pakke automatisk</span>
            </li>
            <li className="flex items-start">
              <span className="text-blue-600 mr-2">4.</span>
              <span>Du får øjeblikkelig adgang til alle nye funktioner</span>
            </li>
          </ul>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
          >
            Annuller
          </button>
          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-semibold shadow-lg"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin mr-2" size={18} />
                Sender...
              </>
            ) : (
              <>
                <ArrowUp className="mr-2" size={18} />
                Opgrader Nu
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
