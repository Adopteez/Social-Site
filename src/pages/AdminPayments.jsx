import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, CreditCard, CheckCircle, XCircle, Clock,
  DollarSign, Gift, Filter, Calendar, User, Package,
  TrendingUp, Users, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function AdminPayments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [giftCodes, setGiftCodes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalMembers: 0,
    activeMembers: 0,
    pendingPayments: 0,
  });
  const [showCreateGiftCodeModal, setShowCreateGiftCodeModal] = useState(false);
  const [newGiftCode, setNewGiftCode] = useState({
    code: '',
    type: 'percentage',
    discount_percentage: 0,
    discount_amount: 0,
    free_months: 0,
    product_code: '',
    usage_limit: 1,
    valid_to: '',
  });

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    filterPayments();
  }, [searchQuery, statusFilter, payments]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!['admin', 'super_admin'].includes(data.role)) {
        navigate('/');
        return;
      }

      fetchPayments();
      fetchGiftCodes();
      fetchStats();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const fetchPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          profile:profiles(id, full_name, email),
          product:products(name, code),
          gift_code:gift_codes(code, type, discount_percentage, discount_amount)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payments:', error);
      setLoading(false);
    }
  };

  const fetchGiftCodes = async () => {
    try {
      const { data, error } = await supabase
        .from('gift_codes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGiftCodes(data || []);
    } catch (error) {
      console.error('Error fetching gift codes:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: completedPayments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');

      const totalRevenue = completedPayments?.reduce((sum, p) => sum + parseFloat(p.amount), 0) || 0;

      const { count: totalMembers } = await supabase
        .from('user_product_access')
        .select('*', { count: 'exact', head: true });

      const { count: activeMembers } = await supabase
        .from('user_product_access')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: pendingPayments } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        totalRevenue: totalRevenue,
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        pendingPayments: pendingPayments || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.profile?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.stripe_payment_intent_id?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    setFilteredPayments(filtered);
  };

  const createGiftCode = async () => {
    try {
      const { error } = await supabase
        .from('gift_codes')
        .insert({
          ...newGiftCode,
          code: newGiftCode.code.toUpperCase(),
          created_by: user.id,
        });

      if (error) throw error;

      alert('Gavekode oprettet!');
      setShowCreateGiftCodeModal(false);
      setNewGiftCode({
        code: '',
        type: 'percentage',
        discount_percentage: 0,
        discount_amount: 0,
        free_months: 0,
        product_code: '',
        usage_limit: 1,
        valid_to: '',
      });
      fetchGiftCodes();
    } catch (error) {
      console.error('Error creating gift code:', error);
      alert('Fejl ved oprettelse af gavekode');
    }
  };

  const toggleGiftCodeStatus = async (codeId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('gift_codes')
        .update({ is_active: !currentStatus })
        .eq('id', codeId);

      if (error) throw error;
      fetchGiftCodes();
    } catch (error) {
      console.error('Error updating gift code:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="text-green-500" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={20} />;
      case 'failed':
        return <XCircle className="text-red-500" size={20} />;
      case 'refunded':
        return <XCircle className="text-gray-500" size={20} />;
      default:
        return null;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Gennemført';
      case 'pending': return 'Afventer';
      case 'failed': return 'Fejlet';
      case 'refunded': return 'Refunderet';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Indlæser...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Betalinger & Medlemskaber</h1>
            <p className="text-gray-600 mt-1">Oversigt over betalinger, medlemmer og gavekoder</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <DollarSign size={32} />
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalRevenue.toFixed(0)} DKK</div>
          <div className="text-green-100 text-sm">Total omsætning</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users size={32} />
            <Package size={24} className="opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.totalMembers}</div>
          <div className="text-blue-100 text-sm">Totalt medlemmer</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <CheckCircle size={32} />
            <Users size={24} className="opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.activeMembers}</div>
          <div className="text-purple-100 text-sm">Aktive medlemmer</div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock size={32} />
            <CreditCard size={24} className="opacity-80" />
          </div>
          <div className="text-3xl font-bold mb-1">{stats.pendingPayments}</div>
          <div className="text-orange-100 text-sm">Afventende betalinger</div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Betalinger</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Søg bruger eller ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F00] focus:border-transparent"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6F00]"
                >
                  <option value="all">Alle status</option>
                  <option value="completed">Gennemført</option>
                  <option value="pending">Afventer</option>
                  <option value="failed">Fejlet</option>
                  <option value="refunded">Refunderet</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Medlem</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Pakke</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Beløb</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Dato</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <div>
                            <div className="font-medium text-gray-900">{payment.profile?.full_name || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{payment.profile?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Package size={16} className="text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{payment.product?.name || 'N/A'}</div>
                            <div className="text-xs text-gray-500">{payment.subscription_type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-semibold text-gray-900">{payment.amount} {payment.currency}</div>
                          {payment.gift_code && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <Gift size={12} />
                              Rabat: {payment.discount_amount} {payment.currency}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(payment.status)}
                          <span className="text-sm">{getStatusText(payment.status)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString('da-DK')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPayments.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  Ingen betalinger fundet
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Gavekoder</h2>
              <button
                onClick={() => setShowCreateGiftCodeModal(true)}
                className="px-4 py-2 bg-[#FF6F00] text-white rounded-lg text-sm font-semibold hover:bg-[#E66300]"
              >
                Opret ny
              </button>
            </div>

            <div className="space-y-3">
              {giftCodes.map((code) => (
                <div key={code.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-bold text-lg text-[#1A237E]">{code.code}</div>
                    <button
                      onClick={() => toggleGiftCodeStatus(code.id, code.is_active)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        code.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {code.is_active ? 'Aktiv' : 'Inaktiv'}
                    </button>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      {code.type === 'percentage' && `${code.discount_percentage}% rabat`}
                      {code.type === 'fixed_amount' && `${code.discount_amount} DKK rabat`}
                      {code.type === 'free_access' && `${code.free_months} måneder gratis`}
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span>Brugt: {code.used_count}/{code.usage_limit}</span>
                    </div>
                    {code.valid_to && (
                      <div className="text-xs text-gray-500">
                        Udløber: {new Date(code.valid_to).toLocaleDateString('da-DK')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {giftCodes.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Ingen gavekoder oprettet endnu
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateGiftCodeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Opret gavekode</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kode</label>
                <input
                  type="text"
                  value={newGiftCode.code}
                  onChange={(e) => setNewGiftCode({ ...newGiftCode, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg uppercase"
                  placeholder="SUMMER2025"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={newGiftCode.type}
                  onChange={(e) => setNewGiftCode({ ...newGiftCode, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="percentage">Procent rabat</option>
                  <option value="fixed_amount">Fast beløb</option>
                  <option value="free_access">Gratis adgang</option>
                </select>
              </div>

              {newGiftCode.type === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rabat %</label>
                  <input
                    type="number"
                    value={newGiftCode.discount_percentage}
                    onChange={(e) => setNewGiftCode({ ...newGiftCode, discount_percentage: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                    max="100"
                  />
                </div>
              )}

              {newGiftCode.type === 'fixed_amount' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rabat beløb (DKK)</label>
                  <input
                    type="number"
                    value={newGiftCode.discount_amount}
                    onChange={(e) => setNewGiftCode({ ...newGiftCode, discount_amount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    min="0"
                  />
                </div>
              )}

              {newGiftCode.type === 'free_access' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Antal måneder gratis</label>
                    <input
                      type="number"
                      value={newGiftCode.free_months}
                      onChange={(e) => setNewGiftCode({ ...newGiftCode, free_months: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Produkt kode</label>
                    <select
                      value={newGiftCode.product_code}
                      onChange={(e) => setNewGiftCode({ ...newGiftCode, product_code: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">Vælg pakke</option>
                      <option value="country_basic">Country Basic</option>
                      <option value="country_plus">Country Plus</option>
                      <option value="worldwide_basic">Worldwide Basic</option>
                      <option value="worldwide_plus">Worldwide Plus</option>
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max antal anvendelser</label>
                <input
                  type="number"
                  value={newGiftCode.usage_limit}
                  onChange={(e) => setNewGiftCode({ ...newGiftCode, usage_limit: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Udløbsdato (valgfri)</label>
                <input
                  type="date"
                  value={newGiftCode.valid_to}
                  onChange={(e) => setNewGiftCode({ ...newGiftCode, valid_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateGiftCodeModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50"
              >
                Annuller
              </button>
              <button
                onClick={createGiftCode}
                className="flex-1 px-4 py-2 bg-[#FF6F00] text-white rounded-lg font-semibold hover:bg-[#E66300]"
              >
                Opret gavekode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
