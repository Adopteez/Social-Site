import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check } from 'lucide-react';

const languages = [
  { code: 'da', name: 'Dansk', countryCode: 'DK' },
  { code: 'sv', name: 'Svenska', countryCode: 'SE' },
  { code: 'no', name: 'Norsk', countryCode: 'NO' },
  { code: 'en', name: 'English', countryCode: 'GB' },
  { code: 'de', name: 'Deutsch', countryCode: 'DE' },
  { code: 'nl', name: 'Nederlands', countryCode: 'NL' },
  { code: 'fr', name: 'Français', countryCode: 'FR' },
  { code: 'it', name: 'Italiano', countryCode: 'IT' },
  { code: 'es', name: 'Español', countryCode: 'ES' }
];

const FlagIcon = ({ countryCode }) => {
  const flagUrl = `https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`;
  return (
    <img
      src={flagUrl}
      alt={countryCode}
      className="w-6 h-4 object-cover rounded shadow-sm"
      loading="lazy"
    />
  );
};

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getCurrentLanguage = () => {
    const currentCode = i18n.language.split('-')[0];
    return languages.find(lang => lang.code === currentCode) || languages[3];
  };

  const currentLanguage = getCurrentLanguage();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = async (languageCode) => {
    try {
      await i18n.changeLanguage(languageCode);
      localStorage.setItem('i18nextLng', languageCode);
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error changing language:', error);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Select language"
      >
        <FlagIcon countryCode={currentLanguage.countryCode} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-[100]">
          {languages.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className="w-full flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center space-x-3">
                <FlagIcon countryCode={language.countryCode} />
                <span className="text-sm font-medium text-gray-700">{language.name}</span>
              </div>
              {(i18n.language === language.code || i18n.language.startsWith(language.code)) && (
                <Check size={16} className="text-adopteez-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
