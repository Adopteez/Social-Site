import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Home, Users, MessageCircle, Calendar, User, Mail, Search, ChevronDown, Shield, LogOut, Settings } from 'lucide-react';
import ChatManager from './ChatManager';
import LanguageSelector from './LanguageSelector';

export default function Layout({ children }) {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const chatManagerRef = useRef();
  const dropdownRef = useRef();

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      const adminCheck = ['admin', 'moderator', 'super_admin', 'group_admin'].includes(data?.role);
      setProfile(data);
      setIsAdmin(adminCheck);
    } catch (error) {
      // Silent fail
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/landing');
    } catch (error) {}
  };

  const navItems = [
    { path: '/home', icon: Home, label: t('nav.home') },
    { path: '/groups', icon: Users, label: t('nav.groups') },
    { path: '/messages', icon: MessageCircle, label: t('nav.messages') },
    { path: '/events', icon: Calendar, label: t('nav.events') },
    { path: '/profile', icon: User, label: t('nav.profile') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo + tekst */}
            <Link to="/home" className="flex items-center gap-3">
              <img
                src="/Adopteez uB-Photoroom.png"
                alt="Adopteez Logo"
                className="h-12 w-auto object-contain"
              />
              <span className="font-extrabold text-2xl text-[#2563eb] tracking-tight font-sans">
                Adopteez
              </span>
            </Link>
            <div className="flex items-center space-x-[56px]">
              <LanguageSelector />
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-[5px] px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-adopteez-primary to-adopteez-accent rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{profile?.full_name || 'User'}</span>
                  <ChevronDown size={16} className="text-gray-500" />
                </button>
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                    >
                      <User size={18} className="text-gray-600" />
                      <span className="text-gray-900">{t('profile.myProfile')}</span>
                    </Link>
                    {isAdmin && (
                      <>
                        <div className="border-t border-gray-200 my-2"></div>
                        <Link
                          to="/admin"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <Shield size={18} className="text-blue-600" />
                          <div className="flex flex-col">
                            <span className="text-gray-900 font-medium">{t('nav.admin')}</span>
                            {profile?.role && (
                              <span className="text-xs text-gray-500">
                                {profile.role === 'super_admin' ? 'Super Admin' :
                                 profile.role === 'group_admin' ? 'Gruppe Admin' :
                                 profile.role === 'admin' ? 'Admin' : 'Moderator'}
                              </span>
                            )}
                          </div>
                        </Link>
                      </>
                    )}
                    <div className="border-t border-gray-200 my-2"></div>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        handleLogout();
                      }}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left"
                    >
                      <LogOut size={18} className="text-red-600" />
                      <span className="text-gray-900">{t('auth.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-6 py-6">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full ${
                  isActive ? 'text-blue-600' : 'text-gray-600'
                }`}
              >
                <Icon size={24} />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <ChatManager ref={chatManagerRef} />
    </div>
  );
}
