
const serverName = "Mapsun";


const defaultSettings = {
  logo: "Mapsun",
  title: "مدیریت پروژه مپسان",
  language: "fa",
  DefaultPageDirection: "rtl",
  textAlign: "right",
  sendPusheNothification: false,
  isLocalInternet_Front: false, 
};


const settings = {
  Mapsun: {
    ...defaultSettings,
    mapsunSite_Address: "https://mapsunapp.ir/",
    webService_baseAddress: "https://api.mapsunapp.ir/",
    sendPusheNothification: true,
  },
  MapsunTCI: {
    ...defaultSettings,
    mapsunSite_Address: "https://mapsun.tci.ir/",
    webService_baseAddress: "https://mapsun-api.tci.ir/",
  },
  NezaratTCI: {
    ...defaultSettings,
    mapsunSite_Address: "http://nezarat.tci.ir/",
    webService_baseAddress: "http://nezarat-api.tci.ir/",
    title: "سامانه نظارت قراردادها",
    isLocalInternet_Front: true, 
  },
  Hirad: {
    ...defaultSettings,
    mapsunSite_Address: "https://hiradpmo.ir/",
    webService_baseAddress: "https://api.hiradpmo.ir/",
  },
  Hamgoon: {
    ...defaultSettings,
    mapsunSite_Address: "http://hamgoonpmo.ir/",
    webService_baseAddress: "http://api.hamgoonpmo.ir/",
    isLocalInternet_Front: true,
  },
  fintrac: {
    ...defaultSettings,
    mapsunSite_Address: "https://amstrategiesgroup.ca/",
    webService_baseAddress: "https://api.amstrategiesgroup.ca/",
    title: "AM Strategies Group",
    logo: "fintrac", 
    language: "en", 
    DefaultPageDirection: "ltr", 
    textAlign: "left", 
  },
};

export const GetSetting = (settingName) => {
  if (!settings[serverName]) {
    console.error(`UiSetting: Configuration for server "${serverName}" not found.`);
    return undefined;
  }
  return settings[serverName][settingName];
};

export const isLocalInternet_Front = settings[serverName]?.isLocalInternet_Front || false;

const UiSetting = {
  GetSetting,
  isLocalInternet_Front,
  serverName,
};

export default UiSetting;