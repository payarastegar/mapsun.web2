"use strict";

const isLogEnable = (() => {
  return;
  return (
    window.location.hostname != "localhost" &&
    window.location.hostname != "127.0.0.1"
  );
})();

let sendLog = () => {};
if (isLogEnable) {
  sendLog = (mode, content) => {
    const log = {};
    log.mode = mode;
    content && Object.assign(log, content);
    const send = () => {
      return fetch("https://api.aliens.ir/log/create", {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        credentials: "include", // include, *same-origin, omit
        headers: {
          "Content-Type": "application/json",
          // "Content-Type": "application/x-www-form-urlencoded",
        },
        redirect: "follow", // manual, *follow, error
        referrer: "no-referrer", // no-referrer, *client
        body: JSON.stringify(log), // body data type must match "Content-Type" header
      });
    };

    const getId = () => {
      try {
        window.localStorage.__logId__ =
          window.localStorage.__logId__ ||
          Math.random()
            .toString(16)
            .substr(2);
        log.id = "#" + window.localStorage.__logId__;
      } catch (e) {}
    };
    getId();

    const getGuid = () => {
      const generateGUID = () => {
        const hashCode = (txt) => {
          let hash = 0,
            i,
            chr;
          if (txt.length === 0) return hash;
          for (i = 0; i < txt.length; i++) {
            chr = txt.charCodeAt(i);
            hash = (hash << 5) - hash + chr;
            hash |= 0; // Convert to 32bit integer
          }
          return hash;
        };

        let guid = window.navigator.userAgent.replace(/\D+/g, "") || "";
        guid += window.screen.height || "";
        guid += window.screen.width || "";
        guid += window.screen.pixelDepth || "";
        guid += window.navigator.hardwareConcurrency || "";
        guid += window.navigator.deviceMemory || "";

        const hash = hashCode(guid)
          .toString(36)
          .replace(/-/g, "_");

        return hash;
      };

      try {
        log.guid = "#" + generateGUID();
      } catch (e) {}
    };
    getGuid();

    const getHref = () => {
      try {
        log.href = window.location.href;
      } catch (e) {}
    };
    getHref();

    const getLocation = () => {
      try {
        navigator.geolocation &&
          navigator.permissions &&
          navigator.permissions
            .query({ name: "geolocation" })
            .then(function(PermissionStatus) {
              if (PermissionStatus.state === "granted") {
                //allowed
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    log["location"] =
                      position.coords.latitude +
                      "-" +
                      position.coords.longitude;
                    log.mode = "location";
                    send();
                  },
                  () => {}
                );
              }
            });
      } catch (e) {}
    };
    getLocation();

    const getNetwork = () => {
      try {
        if (window.navigator.connection) {
          log.network = {
            downlink: window.navigator.connection.downlink.toFixed(2),
            effectiveType: window.navigator.connection.effectiveType,
            rtt: window.navigator.connection.rtt,
            saveData: window.navigator.connection.saveData,
            type: window.navigator.connection.type,
          };
        }
      } catch (e) {}
    };
    getNetwork();

    const getOthers = () => {
      try {
        log.others = {
          platform: window.navigator.platform,
          product: window.navigator.product,
          productSub: window.navigator.productSub,
          languages: window.navigator.languages,
          language: window.navigator.language,
          vendor: window.navigator.vendor,
          deviceMemory: window.navigator.deviceMemory,
          hardwareConcurrency: window.navigator.hardwareConcurrency,
        };
      } catch (e) {}
    };
    getOthers();

    return send();
  };
  sendLog("start");
  setInterval(() => sendLog("interval"), 60 * 60 * 5 * 1000);
  window.addEventListener("beforeunload", () => sendLog("beforeunload"));
  window.addEventListener("onunload", () => sendLog("onunload"));
}

class Logger {
  static isLogEnable = isLogEnable;

  /***
   * return component value as Float
   * @param mode{string}
   * @param content{Object}
   */
  static log(mode, content) {
    return sendLog(mode, content);
  }

  static getSystemInfo() {
    let unknown = "-";

    const { screen, navigator, swfobject } = window;
    // screen
    let width;
    let height;
    let screenSize = "";
    if (screen.width) {
      width = screen.width ? screen.width : "";
      height = screen.height ? screen.height : "";
      screenSize += "" + width + " x " + height;
    }

    // browser
    let nVer = navigator.appVersion;
    let nAgt = navigator.userAgent;
    let browser = navigator.appName;
    let version = "" + parseFloat(navigator.appVersion);
    let majorVersion = parseInt(navigator.appVersion, 10);
    let nameOffset, verOffset, ix;

    // Opera
    if ((verOffset = nAgt.indexOf("Opera")) != -1) {
      browser = "Opera";
      version = nAgt.substring(verOffset + 6);
      if ((verOffset = nAgt.indexOf("Version")) != -1) {
        version = nAgt.substring(verOffset + 8);
      }
    }
    // Opera Next
    if ((verOffset = nAgt.indexOf("OPR")) != -1) {
      browser = "Opera";
      version = nAgt.substring(verOffset + 4);
    }
    // Edge
    else if ((verOffset = nAgt.indexOf("Edge")) != -1) {
      browser = "Microsoft Edge";
      version = nAgt.substring(verOffset + 5);
    }
    // MSIE
    else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
      browser = "Microsoft Internet Explorer";
      version = nAgt.substring(verOffset + 5);
    }
    // Chrome
    else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
      browser = "Chrome";
      version = nAgt.substring(verOffset + 7);
    }
    // Safari
    else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
      browser = "Safari";
      version = nAgt.substring(verOffset + 7);
      if ((verOffset = nAgt.indexOf("Version")) != -1) {
        version = nAgt.substring(verOffset + 8);
      }
    }
    // Firefox
    else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
      browser = "Firefox";
      version = nAgt.substring(verOffset + 8);
    }
    // MSIE 11+
    else if (nAgt.indexOf("Trident/") != -1) {
      browser = "Microsoft Internet Explorer";
      version = nAgt.substring(nAgt.indexOf("rv:") + 3);
    }
    // Other browsers
    else if (
      (nameOffset = nAgt.lastIndexOf(" ") + 1) <
      (verOffset = nAgt.lastIndexOf("/"))
    ) {
      browser = nAgt.substring(nameOffset, verOffset);
      version = nAgt.substring(verOffset + 1);
      if (browser.toLowerCase() == browser.toUpperCase()) {
        browser = navigator.appName;
      }
    }
    // trim the version string
    if ((ix = version.indexOf(";")) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(" ")) != -1) version = version.substring(0, ix);
    if ((ix = version.indexOf(")")) != -1) version = version.substring(0, ix);

    majorVersion = parseInt("" + version, 10);
    if (isNaN(majorVersion)) {
      version = "" + parseFloat(navigator.appVersion);
      majorVersion = parseInt(navigator.appVersion, 10);
    }

    // mobile version
    let mobile = /Mobile|mini|Fennec|Android|iP(ad|od|hone)/.test(nVer);

    // cookie
    let cookieEnabled = navigator.cookieEnabled ? true : false;

    if (typeof navigator.cookieEnabled == "undefined" && !cookieEnabled) {
      document.cookie = "testcookie";
      cookieEnabled =
        document.cookie.indexOf("testcookie") != -1 ? true : false;
    }

    // system
    let os = unknown;
    let clientStrings = [
      { s: "Windows 10", r: /(Windows 10.0|Windows NT 10.0)/ },
      { s: "Windows 8.1", r: /(Windows 8.1|Windows NT 6.3)/ },
      { s: "Windows 8", r: /(Windows 8|Windows NT 6.2)/ },
      { s: "Windows 7", r: /(Windows 7|Windows NT 6.1)/ },
      { s: "Windows Vista", r: /Windows NT 6.0/ },
      { s: "Windows Server 2003", r: /Windows NT 5.2/ },
      { s: "Windows XP", r: /(Windows NT 5.1|Windows XP)/ },
      { s: "Windows 2000", r: /(Windows NT 5.0|Windows 2000)/ },
      { s: "Windows ME", r: /(Win 9x 4.90|Windows ME)/ },
      { s: "Windows 98", r: /(Windows 98|Win98)/ },
      { s: "Windows 95", r: /(Windows 95|Win95|Windows_95)/ },
      { s: "Windows NT 4.0", r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/ },
      { s: "Windows CE", r: /Windows CE/ },
      { s: "Windows 3.11", r: /Win16/ },
      { s: "Android", r: /Android/ },
      { s: "Open BSD", r: /OpenBSD/ },
      { s: "Sun OS", r: /SunOS/ },
      { s: "Linux", r: /(Linux|X11)/ },
      { s: "iOS", r: /(iPhone|iPad|iPod)/ },
      { s: "Mac OS X", r: /Mac OS X/ },
      { s: "Mac OS", r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/ },
      { s: "QNX", r: /QNX/ },
      { s: "UNIX", r: /UNIX/ },
      { s: "BeOS", r: /BeOS/ },
      { s: "OS/2", r: /OS\/2/ },
      {
        s: "Search Bot",
        r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/,
      },
    ];
    for (let id in clientStrings) {
      let cs = clientStrings[id];
      if (cs.r.test(nAgt)) {
        os = cs.s;
        break;
      }
    }

    let osVersion = unknown;

    if (/Windows/.test(os)) {
      osVersion = /Windows (.*)/.exec(os)[1];
      os = "Windows";
    }

    switch (os) {
      case "Mac OS X":
        osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
        break;

      case "Android":
        osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
        break;

      case "iOS":
        osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
        osVersion =
          osVersion[1] + "." + osVersion[2] + "." + (osVersion[3] | 0);
        break;
    }

    // // flash (you'll need to include swfobject)
    // /* script src="//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js" */
    // let flashVersion = 'no check';
    // if (typeof swfobject != 'undefined') {
    //     let fv = swfobject.getFlashPlayerVersion();
    //     if (fv.major > 0) {
    //         flashVersion = fv.major + '.' + fv.minor + ' r' + fv.release;
    //     } else {
    //         flashVersion = unknown;
    //     }
    // }

    //{
    //    "screen": "1280 x 800",
    //    "browserName": "Chrome",
    //    "browserVersion": "77.0.3865.90",
    //    "browserMajorVersion": 77,
    //    "mobile": false,
    //    "os": "Windows",
    //    "osVersion": "10",
    //    "cookies": true,
    //    "flashVersion": "no check"
    //}
    const jscd = {
      // screenSize: screenSize,
      browserName: browser,
      browserVersion: version,
      //browserMajorVersion: majorVersion,
      //mobile: mobile,
      osName: os + " " + osVersion,
      value: nAgt,
      // osVersion: osVersion,
      // cookies: cookieEnabled,
      // flashVersion: flashVersion
    };

    return jscd;

    // console.log(JSON.stringify(jscd, '', 2))
  }

  static getScreenDimension() {
    // screen
    const { screen } = window;

    let width;
    let height;
    let screenSize = {};

    if (screen.width) {
      screenSize.width = screen.width ? screen.width : "";
      screenSize.height = screen.height ? screen.height : "";
    }

    return screenSize;
  }

  static getUserAgain() {
    let nVer = navigator.appVersion;
    let nAgt = navigator.userAgent;
    let browserName = navigator.appName;
    let fullVersion = "" + parseFloat(navigator.appVersion);
    let majorVersion = parseInt(navigator.appVersion, 10);
    let nameOffset, verOffset, ix;

    // In Opera, the true version is after "Opera" or after "Version"
    if ((verOffset = nAgt.indexOf("Opera")) != -1) {
      browserName = "Opera";
      fullVersion = nAgt.substring(verOffset + 6);
      if ((verOffset = nAgt.indexOf("Version")) != -1)
        fullVersion = nAgt.substring(verOffset + 8);
    }
    // In MSIE, the true version is after "MSIE" in userAgent
    else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
      browserName = "Microsoft Internet Explorer";
      fullVersion = nAgt.substring(verOffset + 5);
    }
    // In Chrome, the true version is after "Chrome"
    else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
      browserName = "Chrome";
      fullVersion = nAgt.substring(verOffset + 7);
    }
    // In Safari, the true version is after "Safari" or after "Version"
    else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
      browserName = "Safari";
      fullVersion = nAgt.substring(verOffset + 7);
      if ((verOffset = nAgt.indexOf("Version")) != -1)
        fullVersion = nAgt.substring(verOffset + 8);
    }
    // In Firefox, the true version is after "Firefox"
    else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
      browserName = "Firefox";
      fullVersion = nAgt.substring(verOffset + 8);
    }
    // In most other browsers, "name/version" is at the end of userAgent
    else if (
      (nameOffset = nAgt.lastIndexOf(" ") + 1) <
      (verOffset = nAgt.lastIndexOf("/"))
    ) {
      browserName = nAgt.substring(nameOffset, verOffset);
      fullVersion = nAgt.substring(verOffset + 1);
      if (browserName.toLowerCase() == browserName.toUpperCase()) {
        browserName = navigator.appName;
      }
    }
    // trim the fullVersion string at semicolon/space if present
    if ((ix = fullVersion.indexOf(";")) != -1)
      fullVersion = fullVersion.substring(0, ix);
    if ((ix = fullVersion.indexOf(" ")) != -1)
      fullVersion = fullVersion.substring(0, ix);

    majorVersion = parseInt("" + fullVersion, 10);
    if (isNaN(majorVersion)) {
      fullVersion = "" + parseFloat(navigator.appVersion);
      majorVersion = parseInt(navigator.appVersion, 10);
    }

    let OSName = "Unknown OS";
    if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
    if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
    if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
    if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";

    /* console.log(
      "" +
        "Browser name  = " +
        browserName +
        "\n" +
        "Full version  = " +
        fullVersion +
        "\n" +
        "Major version = " +
        majorVersion +
        "\n" +
        "navigator.appName = " +
        navigator.appName +
        "\n" +
        "navigator.userAgent = " +
        navigator.userAgent +
        "\n" +
        "OSName = " +
        OSName +
        "\n"
    );*/
  }
}

export default Logger;
