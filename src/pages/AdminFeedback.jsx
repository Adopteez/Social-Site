import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bug, Lightbulb, Clock, CheckCircle, XCircle, MessageSquare, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { da } from 'date-fns/locale';

export default function AdminFeedback() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [filter, setFilter] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminAccess();
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      fetchTickets();
    }
  }, [isAdmin, filter]);

  const checkAdminAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (!['super_admin', 'admin', 'moderator'].includes(data.role)) {
        navigate('/');
        return;
      }

      setIsAdmin(true);
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const fetchTickets = async () => {
    try {
      let query = supabase
        .from('feedback_tickets')
        .select(`
          *,
          profile:profiles(id, full_name, email, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, newStatus) => {
    try {
      const updates = {
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'resolved' || newStatus === 'closed') {
        updates.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('feedback_tickets')
        .update(updates)
        .eq('id', ticketId);

      if (error) throw error;

      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, ...updates });
      }
    } catch (error) {
      console.error('Error updating ticket status:', error);
    }
  };

  const updateTicketPriority = async (ticketId, newPriority) => {
    try {
      const { error } = await supabase
        .from('feedback_tickets')
        .update({ priority: newPriority, updated_at: new Date().toISOString() })
        .eq('id', ticketId);

      if (error) throw error;

      fetchTickets();
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, priority: newPriority });
      }
    } catch (error) {
      console.error('Error updating ticket priority:', error);
    }
  };

  const saveAdminNotes = async () => {
    if (!selectedTicket) return;

    try {
      const { error } = await supabase
        .from('feedback_tickets')
        .update({
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedTicket.id);

      if (error) throw error;

      setSelectedTicket({ ...selectedTicket, admin_notes: adminNotes });
      alert('Noter gemt!');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Fejl ved gemning af noter');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800'
    };
    const labels = {
      open: 'Åben',
      in_progress: 'I gang',
      resolved: 'Løst',
      closed: 'Lukket'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{labels[status]}</span>;
  };

  const getPriorityBadge = (priority) => {
    const styles = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-orange-100 text-orange-800',
      high: 'bg-red-100 text-red-800'
    };
    const labels = {
      low: 'Lav',
      medium: 'Medium',
      high: 'Høj'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[priority]}`}>{labels[priority]}</span>;
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-adopteez-primary"></div>
      </div>
    );
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <button
          onClick={() => navigate('/admin')}
          className="flex items-center space-x-2 text-adopteez-primary hover:text-adopteez-dark mb-4 font-medium"
        >
          <ArrowLeft size={20} />
          <span>Tilbage til Dashboard</span>
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Feedback & Fejlrapporter</h1>
        <p className="text-gray-600">Administrer brugerhenvendelser og fejlrapporter</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <MessageSquare className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Åbne</p>
              <p className="text-2xl font-bold text-blue-600">{stats.open}</p>
            </div>
            <Clock className="text-blue-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">I gang</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.inProgress}</p>
            </div>
            <Clock className="text-yellow-500" size={32} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Løst</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </div>
            <CheckCircle className="text-green-500" size={32} />
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${filter === 'all' ? 'bg-adopteez-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Alle
        </button>
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${filter === 'open' ? 'bg-adopteez-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Åbne
        </button>
        <button
          onClick={() => setFilter('in_progress')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${filter === 'in_progress' ? 'bg-adopteez-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          I gang
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-lg font-medium text-sm ${filter === 'resolved' ? 'bg-adopteez-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
        >
          Løst
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">Tickets</h2>
          </div>
          <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => {
                  setSelectedTicket(ticket);
                  setAdminNotes(ticket.admin_notes || '');
                }}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${ticket.type === 'bug' ? 'bg-red-100' : 'bg-blue-100'}`}>
                    {ticket.type === 'bug' ? <Bug className="text-red-600" size={20} /> : <Lightbulb className="text-blue-600" size={20} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 text-sm">{ticket.title}</h3>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{ticket.description}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">
                        {ticket.profile?.full_name} • {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: da })}
                      </p>
                      {getPriorityBadge(ticket.priority)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {tickets.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                Ingen tickets fundet
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {selectedTicket ? (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-lg ${selectedTicket.type === 'bug' ? 'bg-red-100' : 'bg-blue-100'}`}>
                      {selectedTicket.type === 'bug' ? <Bug className="text-red-600" size={20} /> : <Lightbulb className="text-blue-600" size={20} />}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{selectedTicket.title}</h2>
                      <p className="text-sm text-gray-600">{selectedTicket.type === 'bug' ? 'Fejlrapport' : 'Funktionsønske'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Beskrivelse</h3>
                  <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedTicket.description}</p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Bruger</h3>
                  <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                    {selectedTicket.profile?.avatar_url ? (
                      <img src={selectedTicket.profile.avatar_url} alt="" className="w-10 h-10 rounded-full" />
                    ) : (
                      <div className="w-10 h-10 bg-adopteez-primary rounded-full flex items-center justify-center text-white font-bold">
                        {selectedTicket.profile?.full_name?.[0] || 'U'}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm text-gray-900">{selectedTicket.profile?.full_name}</p>
                      <p className="text-xs text-gray-600">{selectedTicket.profile?.email}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Status</h3>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => updateTicketStatus(selectedTicket.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary text-sm"
                  >
                    <option value="open">Åben</option>
                    <option value="in_progress">I gang</option>
                    <option value="resolved">Løst</option>
                    <option value="closed">Lukket</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Prioritet</h3>
                  <select
                    value={selectedTicket.priority}
                    onChange={(e) => updateTicketPriority(selectedTicket.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary text-sm"
                  >
                    <option value="low">Lav</option>
                    <option value="medium">Medium</option>
                    <option value="high">Høj</option>
                  </select>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Admin noter</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Tilføj interne noter..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-adopteez-primary resize-none text-sm"
                    rows="4"
                  />
                  <button
                    onClick={saveAdminNotes}
                    className="mt-2 px-4 py-2 bg-adopteez-primary text-white rounded-lg hover:bg-adopteez-dark transition-colors font-medium text-sm"
                  >
                    Gem noter
                  </button>
                </div>

                <div className="text-xs text-gray-500 pt-4 border-t border-gray-200">
                  <p>Oprettet: {new Date(selectedTicket.created_at).toLocaleString('da-DK')}</p>
                  <p>Opdateret: {new Date(selectedTicket.updated_at).toLocaleString('da-DK')}</p>
                  {selectedTicket.resolved_at && (
                    <p>Løst: {new Date(selectedTicket.resolved_at).toLocaleString('da-DK')}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8">
              <div className="text-center text-gray-500">
                <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                <p>Vælg en ticket for at se detaljer</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
