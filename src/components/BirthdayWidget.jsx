import { useState, useEffect } from 'react';
import { Cake, Mail, Gift } from 'lucide-react';
import { format, addDays, isSameDay } from 'date-fns';
import { da } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function BirthdayWidget() {
  const { user } = useAuth();
  const [birthdays, setBirthdays] = useState([]);
  const [greetingText, setGreetingText] = useState({});
  const [sendingGreeting, setSendingGreeting] = useState({});

  useEffect(() => {
    if (user) {
      fetchBirthdays();
    }
  }, [user]);

  const fetchBirthdays = async () => {
    try {
      const { data: friendsData } = await supabase
        .from('profiles')
        .select('id, full_name, birth_date, birth_date_visibility')
        .not('birth_date', 'is', null);

      const { data: childrenData } = await supabase
        .from('children')
        .select('id, name, birth_date, birth_date_visibility, profile_id')
        .not('birth_date', 'is', null);

      const today = new Date();
      const next3Days = [today, addDays(today, 1), addDays(today, 2), addDays(today, 3)];
      const allBirthdays = [];

      (friendsData || []).forEach(profile => {
        if (profile.birth_date && (!profile.birth_date_visibility || profile.birth_date_visibility === 'all' || profile.birth_date_visibility === 'friends' || profile.birth_date_visibility === 'groupMembers')) {
          const birthDate = new Date(profile.birth_date);
          next3Days.forEach((day, index) => {
            if (birthDate.getDate() === day.getDate() &&
                birthDate.getMonth() === day.getMonth()) {
              allBirthdays.push({
                id: profile.id,
                name: profile.full_name,
                date: profile.birth_date,
                displayDate: day,
                daysUntil: index,
                isChild: false
              });
            }
          });
        }
      });

      (childrenData || []).forEach(child => {
        if (child.birth_date && (child.profile_id === user.id || !child.birth_date_visibility || child.birth_date_visibility === 'all' || child.birth_date_visibility === 'friends' || child.birth_date_visibility === 'groupMembers')) {
          const birthDate = new Date(child.birth_date);
          next3Days.forEach((day, index) => {
            if (birthDate.getDate() === day.getDate() &&
                birthDate.getMonth() === day.getMonth()) {
              allBirthdays.push({
                id: child.id,
                name: child.name,
                date: child.birth_date,
                displayDate: day,
                daysUntil: index,
                isChild: true
              });
            }
          });
        }
      });

      allBirthdays.sort((a, b) => a.daysUntil - b.daysUntil);
      setBirthdays(allBirthdays);
    } catch (error) {
      console.error('Error fetching birthdays:', error);
    }
  };

  const todaysBirthdays = birthdays.filter(b => b.daysUntil === 0);
  const upcomingBirthdays = birthdays.filter(b => b.daysUntil > 0);

  const handleSendGreeting = async (birthdayId, profileId) => {
    const message = greetingText[birthdayId];
    if (!message || !message.trim()) return;

    setSendingGreeting({ ...sendingGreeting, [birthdayId]: true });
    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          recipient_id: profileId,
          content: message,
          is_read: false
        }]);

      if (error) throw error;

      setGreetingText({ ...greetingText, [birthdayId]: '' });
      alert('Tillykke sendt!');
    } catch (error) {
      console.error('Error sending greeting:', error);
      alert('Kunne ikke sende tillykke');
    } finally {
      setSendingGreeting({ ...sendingGreeting, [birthdayId]: false });
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center space-x-2 mb-5">
        <Cake size={20} className="text-pink-500" />
        <h3 className="font-bold text-gray-900 text-lg">Fødselsdage</h3>
      </div>

      {birthdays.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">Ingen har fødselsdag</p>
      ) : (
        <>
          {todaysBirthdays.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <Gift size={16} className="text-pink-500" />
            <h4 className="text-sm font-bold text-gray-900">I dag</h4>
          </div>
          <div className="space-y-4">
            {todaysBirthdays.map((birthday) => {
              const birthDate = new Date(birthday.date);
              const age = new Date().getFullYear() - birthDate.getFullYear();

              return (
                <div key={birthday.id} className="bg-gradient-to-r from-pink-50 to-pink-100 border-2 border-pink-300 rounded-xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-bold text-gray-900 text-base">{birthday.name}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {birthday.isChild ? 'Barn' : 'Ven'} • Fylder {age} år i dag
                      </p>
                    </div>
                    <div className="bg-white p-2 rounded-full">
                      <Cake size={20} className="text-pink-500" />
                    </div>
                  </div>
                  {!birthday.isChild && (
                    <>
                      <input
                        type="text"
                        placeholder="Skriv en fødselsdag hilsen..."
                        value={greetingText[birthday.id] || ''}
                        onChange={(e) => setGreetingText({ ...greetingText, [birthday.id]: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-2 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                      <button
                        onClick={() => handleSendGreeting(birthday.id, birthday.id)}
                        disabled={!greetingText[birthday.id]?.trim() || sendingGreeting[birthday.id]}
                        className="w-full flex items-center justify-center space-x-2 bg-pink-500 text-white px-4 py-2.5 rounded-lg hover:bg-pink-600 transition-colors font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mail size={16} />
                        <span>{sendingGreeting[birthday.id] ? 'Sender...' : 'Send tillykke'}</span>
                      </button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {upcomingBirthdays.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Cake size={16} className="text-adopteez-primary" />
            <h4 className="text-sm font-bold text-gray-900">
              De næste {upcomingBirthdays[0].daysUntil === 1 ? 'dag' : `${Math.max(...upcomingBirthdays.map(b => b.daysUntil))} dage`}
            </h4>
          </div>
          <div className="space-y-3">
            {upcomingBirthdays.map((birthday) => {
              const birthDate = new Date(birthday.date);
              const age = new Date().getFullYear() - birthDate.getFullYear();

              return (
                <div key={birthday.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-xl transition-colors border border-gray-100">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Cake size={20} className="text-pink-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{birthday.name}</p>
                    <p className="text-xs text-gray-500">
                      {birthday.daysUntil === 1 ? 'I morgen' : format(birthday.displayDate, 'd. MMMM', { locale: da })} •
                      Fylder {age} år
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
