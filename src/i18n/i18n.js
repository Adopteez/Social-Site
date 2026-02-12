import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importér alle dine sprog-filer
import da from './da.json';
import en from './en.json';
import sv from './sv.json';
import no from './no.json';
import de from './de.json';
import nl from './nl.json';
import fr from './fr.json';
import it from './it.json';
import es from './es.json';

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
    lng: 'da', // eller 'en' som fallback
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
