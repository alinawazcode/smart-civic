import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import ur from './ur.json';

const savedLang = (typeof window !== 'undefined' && localStorage.getItem('civiccare_lang')) || 'en';

export const syncHtmlDirection = (lng: string) => {
  if (typeof document === 'undefined') return;
  const isUrdu = lng === 'ur';
  document.documentElement.lang = isUrdu ? 'ur' : 'en';
  document.documentElement.dir = isUrdu ? 'rtl' : 'ltr';
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ur: { translation: ur }
    },
    lng: savedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  });

// Apply document direction immediately
syncHtmlDirection(savedLang);

i18n.on('languageChanged', (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('civiccare_lang', lng);
  }
  syncHtmlDirection(lng);
});

export default i18n;
