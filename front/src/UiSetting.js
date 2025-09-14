class UiSetting {
  static serverName = "Mapsun";

  static Setting = {
    Mapsun: {
      mapsunSite_Address: "https://mapsunapp.ir/",
      webService_baseAddress: "https://api.mapsunapp.ir/",
      title: "مدیریت پروژه مپسان",
      logo: "Mapsun",
      language: "fa",
      DefaultPageDirection: "rtl",
      textAlign: "right",
      sendPusheNothification:true,
    },
    MapsunTCI: {
      mapsunSite_Address: "https://mapsun.tci.ir/",
      webService_baseAddress: "https://mapsun-api.tci.ir/",
      title: "مدیریت پروژه مپسان",
      logo: "Mapsun",
      language: "fa",
      DefaultPageDirection: "rtl",
      textAlign: "right",
      sendPusheNothification:false,
    },
    NezaratTCI: {
      mapsunSite_Address: "http://nezarat.tci.ir/",
      webService_baseAddress: "http://nezarat-api.tci.ir/",
      title: "سامانه نظارت قراردادها",
      logo: "Mapsun",
      language: "fa",
      DefaultPageDirection: "rtl",
      textAlign: "right",
      sendPusheNothification:false,
    },
    Hirad: {
      mapsunSite_Address: "https://hiradpmo.ir/",
      webService_baseAddress: "https://api.hiradpmo.ir/",
      title: "مدیریت پروژه مپسان",
      logo: "Mapsun",
      language: "fa",
      DefaultPageDirection: "rtl",
      textAlign: "right",
      sendPusheNothification:false,
    },
    Hamgoon: {
      mapsunSite_Address: "http://hamgoonpmo.ir/",
      webService_baseAddress: "http://api.hamgoonpmo.ir/",
      title: "مدیریت پروژه مپسان",
      logo: "Mapsun",
      language: "fa",
      DefaultPageDirection: "rtl",
      textAlign: "right",
      sendPusheNothification:false,
    },
    fintrac: {
      mapsunSite_Address: "https://amstrategiesgroup.ca/",
      webService_baseAddress: "https://api.amstrategiesgroup.ca/",
      title: "AM Strategies Group",
      logo: "fintrac",
      language: "en",
      DefaultPageDirection: "ltr",
      textAlign: "left",
      sendPusheNothification:false,
    },
  };

  static GetSetting(settingName) {
    return this.Setting[this.serverName][settingName];
  }
}

export default UiSetting;
