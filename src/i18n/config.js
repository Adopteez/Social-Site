import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from './locales/en.json';
import daTranslations from './locales/da.json';
import svTranslations from './locales/sv.json';
import noTranslations from './locales/no.json';
import deTranslations from './locales/de.json';
import nlTranslations from './locales/nl.json';
import frTranslations from './locales/fr.json';
import itTranslations from './locales/it.json';
import esTranslations from './locales/es.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      da: { translation: daTranslations },
      sv: { translation: svTranslations },
      no: { translation: noTranslations },
      de: { translation: deTranslations },
      nl: { translation: nlTranslations },
      fr: { translation: frTranslations },
      it: { translation: itTranslations },
      es: { translation: esTranslations },
    },
    fallbackLng: 'en',
    lng: localStorage.getItem('i18nextLng') || 'da',
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
