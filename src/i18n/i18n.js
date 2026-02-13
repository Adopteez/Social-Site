import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importér alle dine sprog-filer fra /locales/
import da from './locales/da.json';
import en from './locales/en.json';
import sv from './locales/sv.json';
import no from './locales/no.json';
import de from './locales/de.json';
import nl from './locales/nl.json';
import fr from './locales/fr.json';
import it from './locales/it.json';
import es from './locales/es.json';

const resources = {
  da: { translation: da },
  en: { translation: en },
  sv: { translation: sv },
  no: { translation: no },
  de: { translation: de },
  nl: { translation: nl },
  fr: { translation: fr },
  it: { translation: it },
  es: { translation: es }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'da', // standardsprog, fx 'da' for dansk
    fallbackLng: 'en', // fallback hvis nøgle mangler
    interpolation: {
      escapeValue: false // react håndterer allerede XSS
    }
  });

export default i18n;
