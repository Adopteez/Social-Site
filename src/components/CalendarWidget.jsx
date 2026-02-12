import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, Cake, Gift, Mail } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek, isToday, isFuture, compareAsc } from 'date-fns';
import { da } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function CalendarWidget() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [birthdays, setBirthdays] = useState([]);

  useEffect(() => {
    if (user) {
      fetchEventsAndBirthdays();
    }
  }, [user, currentDate]);

  const fetchEventsAndBirthdays = async () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);

    try {
      const { data: eventsData } = await supabase
        .from('events')
        .select('id, title, start_date, event_type')
        .gte('start_date', monthStart.toISOString())
        .lte('start_date', monthEnd.toISOString());

      setEvents(eventsData || []);

      const { data: friendsData } = await supabase
        .from('profiles')
        .select('id, full_name, birth_date, birth_date_visibility')
        .not('birth_date', 'is', null);

      const { data: childrenData } = await supabase
        .from('children')
        .select('id, name, birth_date, birth_date_visibility, profile_id')
        .not('birth_date', 'is', null);

      const allBirthdays = [];

      (friendsData || []).forEach(profile => {
        if (profile.birth_date && (!profile.birth_date_visibility || profile.birth_date_visibility === 'all' || profile.birth_date_visibility === 'friends' || profile.birth_date_visibility === 'groupMembers')) {
          const birthDate = new Date(profile.birth_date);
          if (birthDate.getMonth() === currentDate.getMonth()) {
            allBirthdays.push({
              id: profile.id,
              name: profile.full_name,
              date: profile.birth_date,
              type: 'profile',
              isChild: false
            });
          }
        }
      });

      (childrenData || []).forEach(child => {
        if (child.birth_date && (child.profile_id === user.id || !child.birth_date_visibility || child.birth_date_visibility === 'all' || child.birth_date_visibility === 'friends' || child.birth_date_visibility === 'groupMembers')) {
          const birthDate = new Date(child.birth_date);
          if (birthDate.getMonth() === currentDate.getMonth()) {
            allBirthdays.push({
              id: child.id,
              name: child.name,
              date: child.birth_date,
              type: 'child',
              isChild: true
            });
          }
        }
      });

      allBirthdays.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getDate() - dateB.getDate();
      });

      setBirthdays(allBirthdays);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const getEventsForDay = (day) => {
    const dayEvents = events.filter(event =>
      isSameDay(new Date(event.start_date), day)
    );
    const dayBirthdays = birthdays.filter(birthday => {
      const birthDate = new Date(birthday.date);
      return birthDate.getDate() === day.getDate() &&
             birthDate.getMonth() === day.getMonth();
    });
    return { events: dayEvents, birthdays: dayBirthdays };
  };

  const weekDays = ['M', 'T', 'O', 'T', 'F', 'L', 'S'];

  const todaysBirthdays = birthdays.filter(birthday => {
    const birthDate = new Date(birthday.date);
    const today = new Date();
    return birthDate.getDate() === today.getDate() &&
           birthDate.getMonth() === today.getMonth();
  });

  const upcomingBirthdays = birthdays.filter(birthday => {
    const birthDate = new Date(birthday.date);
    const today = new Date();
    const birthdayThisYear = new Date(today.getFullYear(), birthDate.getMonth(), birthDate.getDate());
    return birthdayThisYear > today;
  }).slice(0, 5);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-gray-900 flex items-center space-x-2">
          <CalendarIcon size={18} className="text-adopteez-primary" />
          <span>{t('home.calendar')}</span>
        </h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={previousMonth}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={18} className="text-gray-600" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={18} className="text-gray-600" />
          </button>
        </div>
      </div>

      <div className="text-center mb-3">
        <h4 className="font-semibold text-gray-900">
          {format(currentDate, 'MMMM yyyy', { locale: da })}
        </h4>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const { events: dayEvents, birthdays: dayBirthdays } = getEventsForDay(day);
          const hasEvents = dayEvents.length > 0 || dayBirthdays.length > 0;
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={index}
              className={`
                relative aspect-square flex items-center justify-center text-sm rounded-lg
                ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                ${isToday ? 'bg-adopteez-primary text-white font-bold' : ''}
                ${hasEvents && !isToday ? 'bg-adopteez-light/30' : ''}
                ${!hasEvents && !isToday ? 'hover:bg-gray-50' : ''}
                transition-colors cursor-pointer
              `}
              title={
                hasEvents
                  ? [...dayEvents.map(e => e.title), ...dayBirthdays.map(b => `${b.name}'s fødselsdag`)].join(', ')
                  : ''
              }
            >
              <span>{format(day, 'd')}</span>
              {hasEvents && (
                <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                  {dayBirthdays.length > 0 && (
                    <div className="w-1 h-1 bg-pink-500 rounded-full"></div>
                  )}
                  {dayEvents.length > 0 && (
                    <div className="w-1 h-1 bg-adopteez-accent rounded-full"></div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
          <span className="text-gray-600">{t('home.birthdays')}</span>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <div className="w-2 h-2 bg-adopteez-accent rounded-full"></div>
          <span className="text-gray-600">{t('nav.events')}</span>
        </div>
      </div>

      {todaysBirthdays.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Gift size={16} className="text-pink-500" />
            <h4 className="text-sm font-bold text-gray-900">{t('calendar.todaysBirthdays')}</h4>
          </div>
          <div className="space-y-4">
            {todaysBirthdays.map((birthday) => (
              <div key={birthday.id} className="bg-pink-50 border border-pink-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">{birthday.name}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {birthday.isChild ? t('calendar.child') : t('calendar.friend')} • {format(new Date(birthday.date), 'd. MMMM yyyy', { locale: da })}
                    </p>
                  </div>
                  <Cake size={20} className="text-pink-500 flex-shrink-0" />
                </div>
                <button className="mt-3 w-full flex items-center justify-center space-x-2 bg-pink-500 text-white px-3 py-2 rounded-lg hover:bg-pink-600 transition-colors text-xs font-medium">
                  <Mail size={14} />
                  <span>{t('calendar.wishCongrats')}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingBirthdays.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Cake size={16} className="text-adopteez-primary" />
            <h4 className="text-sm font-bold text-gray-900">{t('calendar.upcomingBirthdays')}</h4>
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {upcomingBirthdays.map((birthday) => (
              <div key={birthday.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Cake size={18} className="text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{birthday.name}</p>
                  <p className="text-xs text-gray-500">{format(new Date(birthday.date), 'd. MMMM', { locale: da })}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
