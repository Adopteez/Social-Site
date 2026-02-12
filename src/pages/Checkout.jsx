import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Check, Gift, Loader2, CreditCard, Calendar } from 'lucide-react';

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const packageType = searchParams.get('package') || searchParams.get('upgrade');
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [giftCode, setGiftCode] = useState('');
  const [giftCodeApplied, setGiftCodeApplied] = useState(null);
  const [giftCodeError, setGiftCodeError] = useState('');
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [product, setProduct] = useState(null);
  const [email, setEmail] = useState(user?.email || '');
  const [fullName, setFullName] = useState('');
  const [relationType, setRelationType] = useState('adoptee');

  useEffect(() => {
    loadProduct();
  }, [packageType]);

  const loadProduct = async () => {
    if (!packageType) return;

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('code', packageType)
      .maybeSingle();

    if (data) {
      setProduct(data);
    }
  };

  const packages = {
    country_basic: { name: 'Country Membership Basic', priceMonthly: 39, priceYearly: 328 },
    country_plus: { name: 'Country Membership Plus', priceMonthly: 59, priceYearly: 496 },
    worldwide_basic: { name: 'World Wide Membership Basic', priceMonthly: 49, priceYearly: 412 },
    worldwide_plus: { name: 'World Wide Membership Plus', priceMonthly: 69, priceYearly: 580 },
  };

  const selectedPackage = packages[packageType];

  if (!selectedPackage) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ingen pakke valgt</h2>
          <p className="text-gray-600 mb-6">Vælg venligst en pakke først</p>
          <button
            onClick={() => navigate('/pricing')}
            className="px-6 py-3 bg-[#FF6F00] text-white rounded-xl font-semibold hover:bg-[#E66300]"
          >
            Tilbage til priser
          </button>
        </div>
      </div>
    );
  }

  const basePrice = billingCycle === 'yearly' ? selectedPackage.priceYearly : selectedPackage.priceMonthly;
  let finalPrice = basePrice;
  let discount = 0;

  if (giftCodeApplied) {
    if (giftCodeApplied.type === 'percentage') {
      discount = (basePrice * giftCodeApplied.discount_percentage) / 100;
    } else if (giftCodeApplied.type === 'fixed_amount') {
      discount = Math.min(giftCodeApplied.discount_amount, basePrice);
    } else if (giftCodeApplied.type === 'free_access') {
      discount = basePrice;
    }
    finalPrice = Math.max(0, basePrice - discount);
  }

  const handleApplyGiftCode = async () => {
    setGiftCodeError('');
    setGiftCodeApplied(null);

    if (!giftCode.trim()) {
      setGiftCodeError('Indtast venligst en gavekode');
      return;
    }

    const { data, error } = await supabase
      .from('gift_codes')
      .select('*')
      .eq('code', giftCode.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) {
      setGiftCodeError('Ugyldig gavekode');
      return;
    }

    const now = new Date();
    const validFrom = new Date(data.valid_from);
    const validTo = data.valid_to ? new Date(data.valid_to) : null;

    if (now < validFrom) {
      setGiftCodeError('Denne gavekode er endnu ikke gyldig');
      return;
    }

    if (validTo && now > validTo) {
      setGiftCodeError('Denne gavekode er udløbet');
      return;
    }

    if (data.used_count >= data.usage_limit) {
      setGiftCodeError('Denne gavekode er brugt op');
      return;
    }

    if (data.type === 'free_access' && data.product_code !== packageType) {
      setGiftCodeError(`Denne gavekode er kun gyldig for ${data.product_code}`);
      return;
    }

    setGiftCodeApplied(data);
  };

  const handleCheckout = async () => {
    if (!user && !email) {
      alert('Indtast venligst din email');
      return;
    }

    if (!user && !fullName) {
      alert('Indtast venligst dit navn');
      return;
    }

    setLoading(true);

    try {
      const metadata = {
        product_code: packageType,
        subscription_type: billingCycle,
        gift_code_id: giftCodeApplied?.id || null,
        original_amount: basePrice.toString(),
        discount_amount: discount.toString(),
        customer_name: user ? user.user_metadata?.full_name : fullName,
        relation_to_adoption: relationType,
      };

      const checkoutData = {
        package_type: packageType,
        billing_cycle: billingCycle,
        email: user?.email || email,
        gift_code_id: giftCodeApplied?.id || null,
        metadata: metadata,
      };

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(checkoutData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunne ikke oprette checkout session');
      }

      const { url } = await response.json();

      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Ingen checkout URL modtaget');
      }

    } catch (error) {
      console.error('Checkout error:', error);
      alert(error.message || 'Der opstod en fejl. Prøv venligst igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#1A237E] to-[#283593] text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Gennemfør dit køb</h1>
            <p className="text-blue-100">Du er ved at købe {selectedPackage.name}</p>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Betalingsdetaljer</h2>

                {!user && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent"
                        placeholder="din@email.dk"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fulde navn
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent"
                        placeholder="Dit navn"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Din relation til adoption
                      </label>
                      <select
                        value={relationType}
                        onChange={(e) => setRelationType(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent"
                      >
                        <option value="adoptee">Adopteret</option>
                        <option value="adoptive_parent">Adoptivforælder</option>
                        <option value="unknown">Andet</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Calendar className="inline mr-2" size={18} />
                    Betalingsinterval
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={`p-4 border-2 rounded-xl transition-all ${
                        billingCycle === 'monthly'
                          ? 'border-[#FF6F00] bg-[#FF6F00]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900">Månedlig</div>
                      <div className="text-2xl font-bold text-[#1A237E] mt-1">
                        {selectedPackage.priceMonthly} DKK
                      </div>
                      <div className="text-xs text-gray-500 mt-1">per måned</div>
                    </button>

                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={`p-4 border-2 rounded-xl transition-all relative ${
                        billingCycle === 'yearly'
                          ? 'border-[#FF6F00] bg-[#FF6F00]/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                        Spar 30%
                      </div>
                      <div className="font-bold text-gray-900">Årlig</div>
                      <div className="text-2xl font-bold text-[#1A237E] mt-1">
                        {selectedPackage.priceYearly} DKK
                      </div>
                      <div className="text-xs text-gray-500 mt-1">per år</div>
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Gift className="inline mr-2" size={18} />
                    Gavekode / Rabatkode
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={giftCode}
                      onChange={(e) => {
                        setGiftCode(e.target.value.toUpperCase());
                        setGiftCodeError('');
                        setGiftCodeApplied(null);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent uppercase"
                      placeholder="RABATKODE"
                    />
                    <button
                      onClick={handleApplyGiftCode}
                      className="px-6 py-2 bg-[#1A237E] text-white rounded-lg font-semibold hover:bg-[#283593] transition-colors"
                    >
                      Anvend
                    </button>
                  </div>
                  {giftCodeError && (
                    <p className="text-red-600 text-sm mt-2">{giftCodeError}</p>
                  )}
                  {giftCodeApplied && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700 font-semibold">
                        <Check size={18} />
                        Gavekode anvendt!
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        {giftCodeApplied.type === 'percentage' && `${giftCodeApplied.discount_percentage}% rabat`}
                        {giftCodeApplied.type === 'fixed_amount' && `${giftCodeApplied.discount_amount} DKK rabat`}
                        {giftCodeApplied.type === 'free_access' && `${giftCodeApplied.free_months} måneder gratis adgang`}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Ordreoversigt</h2>
                <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Pakke</div>
                    <div className="font-semibold text-gray-900">{selectedPackage.name}</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-600">Interval</div>
                    <div className="font-semibold text-gray-900">
                      {billingCycle === 'yearly' ? 'Årlig' : 'Månedlig'}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Pris</span>
                      <span className="font-semibold">{basePrice} DKK</span>
                    </div>

                    {discount > 0 && (
                      <div className="flex justify-between mb-2 text-green-600">
                        <span>Rabat</span>
                        <span className="font-semibold">-{discount} DKK</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between">
                      <span className="text-lg font-bold text-gray-900">I alt</span>
                      <span className="text-2xl font-bold text-[#1A237E]">{finalPrice} DKK</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-[#FF6F00] to-[#FFA040] text-white rounded-xl font-bold text-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={24} className="animate-spin" />
                        Behandler...
                      </>
                    ) : (
                      <>
                        <CreditCard size={24} />
                        Gå til betaling
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 text-center">
                    Sikker betaling via Stripe. Dine kortoplysninger er krypterede.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Hvad inkluderer denne pakke?</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-2">
              <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Øjeblikkelig adgang efter betaling</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Adgang til dit adoptionsfællesskab</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Kan opsiges når som helst</span>
            </div>
            <div className="flex items-start gap-2">
              <Check size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">Fuld support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
