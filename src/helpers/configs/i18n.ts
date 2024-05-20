import { initReactI18next } from "react-i18next";

import i18next from "i18next";

import eng from "../../i18n/en.json";

export const initI18n = () =>
  i18next.use(initReactI18next).init({
    resources: {
      en: {
        translation: eng,
      },
    },
    lng: "en",
    fallbackLng: "en",
  });
