import React, { Suspense } from "react";
// import "semantic-ui-css-rtl/semantic.rtl.css";
import { createRoot } from "react-dom/client"; 
import "./index.css";
import * as serviceWorker from "./serviceWorker";
import UiSetting from "./UiSetting";
import App from "./App";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18next from "i18next";
import translationEN from "./locales/en/translation.json";
import translationFA from "./locales/fa/translation.json";
import i18n from "i18next";

i18next.init({
  interpolation: { escapeValue: false }, // React already does escaping
});

const resources = {
  en: {
    translation: translationEN,
  },
  fa: {
    translation: translationFA,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: UiSetting.GetSetting("language"),
  fallbackLng: "fa",
  interpolation: {
    escapeValue: false,
  },
});

document.querySelector("title").innerText = UiSetting.GetSetting("title");


const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <Suspense>
    <I18nextProvider i18n={i18next}>
      <App />
    </I18nextProvider>
  </Suspense>
);

serviceWorker.register();