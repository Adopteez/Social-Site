import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader2, Home, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Success() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    verifyPayment();
  }, [sessionId]);

  const verifyPayment = async () => {
    if (!sessionId) {
      setError('Ingen session ID fundet');
      setLoading(false);
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (user) {
        const { data: access } = await supabase
          .from('user_product_access')
          .select(`
            *,
            product:products(*)
          `)
          .eq('profile_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (access) {
          setPaymentDetails({
            productName: access.product.name,
            packageType: access.package_type,
          });
        }
      }

      setLoading(false);
    } catch (err) {
      console.error('Error verifying payment:', err);
      setError('Kunne ikke verificere betaling');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <Loader2 size={48} className="animate-spin text-[#FF6F00] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Bekræfter betaling...</h2>
          <p className="text-gray-600">Dette tager kun et øjeblik</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Noget gik galt</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/pricing')}
            className="px-6 py-3 bg-[#FF6F00] text-white rounded-xl font-semibold hover:bg-[#E66300] transition-colors"
          >
            Tilbage til priser
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={48} className="text-green-500" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Betaling gennemført!</h1>
            <p className="text-green-100">Tillykke! Dit medlemskab er nu aktivt</p>
          </div>

          <div className="p-8">
            {paymentDetails && (
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                <h2 className="font-bold text-gray-900 mb-3">Dit medlemskab</h2>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pakke:</span>
                    <span className="font-semibold text-gray-900">{paymentDetails.productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-semibold text-green-600">Aktiv</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <h3 className="font-bold text-gray-900 text-lg">Næste skridt</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-[#1A237E] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Udfyld din profil</div>
                    <p className="text-sm text-gray-600">
                      Tilføj dine oplysninger og fortæl om dig selv
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-[#1A237E] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Udforsk grupper</div>
                    <p className="text-sm text-gray-600">
                      Find og tilmeld dig relevante adoptionsgrupper
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                  <div className="w-6 h-6 bg-[#1A237E] text-white rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Opret forbindelser</div>
                    <p className="text-sm text-gray-600">
                      Start samtaler og byg dit netværk
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex-1 py-4 bg-gradient-to-r from-[#FF6F00] to-[#FFA040] text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <User size={20} />
                Gå til profil
              </button>
              <button
                onClick={() => navigate('/')}
                className="flex-1 py-4 border-2 border-[#1A237E] text-[#1A237E] rounded-xl font-bold hover:bg-[#1A237E] hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Home size={20} />
                Gå til forside
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Kvittering sendt:</strong> En bekræftelse er sendt til din email.
                Hvis du har spørgsmål, er du velkommen til at kontakte vores support.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600 text-sm">
            Tak fordi du valgte Adopteez. Vi ser frem til at være en del af dit fællesskab!
          </p>
        </div>
      </div>
    </div>
  );
}
