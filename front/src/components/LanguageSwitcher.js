import React from "react";
import { useTranslation } from "react-i18next";

let newLang;

const LanguageSwitcher = ({ onChangeLang }) => {
  const { i18n } = useTranslation();

  const handleLanguageChange = (e) => {
    newLang = e.target.value;
    i18n.changeLanguage(newLang);
    onChangeLang(newLang);
  };

  return (
    <select value={i18n.language} onChange={handleLanguageChange}>
      <option value="en">English</option>
      <option value="fa">Persian</option>
    </select>
  );
};

export default LanguageSwitcher;
