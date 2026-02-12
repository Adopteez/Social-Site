import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function Events() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data: memberGroups } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('profile_id', user.id);

      const groupIds = memberGroups?.map((gm) => gm.group_id) || [];

      if (groupIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('events')
        .select(`
          *,
          group:groups(id, name),
          organizer:profiles!events_organizer_id_fkey(id, full_name),
          event_attendees(id, profile_id, status)
        `)
        .in('group_id', groupIds)
        .gte('start_date', new Date().toISOString())
        .order('start_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      const { error } = await supabase
        .from('event_attendees')
        .insert([{ event_id: eventId, profile_id: user.id, status: 'registered' }]);

      if (error) throw error;
      fetchEvents();
    } catch (error) {
      console.error('Error registering for event:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">{t('nav.events')}</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          {t('events.createEvent')}
        </button>
      </div>

      <div className="space-y-4">
        {events.map((event) => {
          const isRegistered = event.event_attendees.some(
            (attendee) => attendee.profile_id === user.id
          );
          const attendeeCount = event.event_attendees.length;

          return (
            <div key={event.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                  <div className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">{event.group?.name}</span>
                  </div>
                </div>
                {!isRegistered ? (
                  <button
                    onClick={() => handleRegister(event.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    {t('events.register')}
                  </button>
                ) : (
                  <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium">
                    {t('events.registered')}
                  </span>
                )}
              </div>

              {event.description && (
                <p className="text-gray-700 mb-4">{event.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar size={18} className="mr-2 text-blue-600" />
                  <span>
                    {format(new Date(event.start_date), 'PPP')} at{' '}
                    {format(new Date(event.start_date), 'p')}
                  </span>
                </div>
                {event.location && (
                  <div className="flex items-center">
                    <MapPin size={18} className="mr-2 text-green-600" />
                    <span>{event.location}</span>
                  </div>
                )}
                {event.is_paid && event.price && (
                  <div className="flex items-center">
                    <DollarSign size={18} className="mr-2 text-yellow-600" />
                    <span>
                      {event.price} {event.currency || 'USD'}
                    </span>
                  </div>
                )}
                <div className="flex items-center">
                  <Users size={18} className="mr-2 text-purple-600" />
                  <span>
                    {attendeeCount} {t('events.attendees')}
                    {event.max_attendees && ` / ${event.max_attendees}`}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {events.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('eventsPage.noUpcomingEvents')}</h3>
          <p className="text-gray-600">{t('eventsPage.checkBackLater')}</p>
        </div>
      )}
    </div>
  );
}
