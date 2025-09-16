import Logger from "./Logger";
import SystemClass from "./SystemClass";
import axios from "axios";
import Utils from "./Utils";
import moment from "moment-jalaali";
import UiSetting from "./UiSetting";

//for restAPI
class WebService {
  static URL = {
    // Comment out below address for Esfahan:
    // webService_baseAddress: "http://10.85.65.195:1001/",

    // webService_baseAddress: 'http://213.233.161.190:1359/',
    // Main One
    mapsunSite_Address: UiSetting.GetSetting("mapsunSite_Address"),
    webService_baseAddress: UiSetting.GetSetting("webService_baseAddress"), // "http://mapsun-futech.ir:1001/",
    webService_GetForm_Name: "api/Forms/getForm",
    webService_Login_Name: "api/Authenticate/Login",
    webService_Menu: "api/Forms/getMainMenu",
    webService_Update: "api/Forms/Update_Forms",
    webService_Logout: "api/Forms/logout",

    webService_GetForgetPasswordPage: "api/Forms/getForgetPasswordPage",
    webService_GetLoginPage: "api/Forms/getLoginPage",
    webService_ChangePassword_Automatic: "api/Forms/changePassword_Automatic",
    webService_GetOneTimePassword: "api/Forms/getOneTimePassword",
    webService_GetOneTimePasswordForVoip: "api/Forms/getOneTimePasswordForVoip",
    webService_GetCaptcha: "api/Forms/getCaptcha",
    webService_Login: "api/Forms/login",
    webService_ChangePassword: "api/Forms/changePassword",
  };

  static logs = [];

  constructor(name, params, option, userInfo) {
    this.option = option || {};
    this.name = name.replace(
      "Forms/Update_Forms",
      WebService.URL.webService_Update
    );
    this.params = params || {};

    this.userInfo = userInfo || {};

    this.initialize();

    return this._fetch();
  }

  initialize = () => {
    this.formData = new FormData();

    Object.keys(this.params).forEach((key) => {
      if (typeof this.params[key] === "object") {
        this.formData.append(key, JSON.stringify(this.params[key]));
      } else {
        this.formData.append(key, this.params[key]);
      }
    });

    Object.keys(this.option.uploadFiles || {}).forEach((fileKey) => {
      this.formData.append(fileKey, this.option.uploadFiles[fileKey]);
    });

    //this.formData.append("Authorization", WebService.getToken())
    const userInfo = WebService.getUserInfo(this.userInfo);
    userInfo.login = userInfo.login || {};
    userInfo.login.userAgent = Logger.getSystemInfo();
    userInfo.login.userAgent_ScreenDimension = Logger.getScreenDimension();

    this.formData.append("userInfo", JSON.stringify(userInfo));

    this._url = this._getUrl();
    this._controller = new AbortController();
  };

  _setLog = () => {
    if (this._getUrl().includes(WebService.URL.webService_Update)) {
      WebService.logs.push({
        name: this._getUrl(),
        params: this.params,
        datetime: Utils.getCurrentDataTime(),
      });
    }
  };

  abort = () => {
    this._controller.abort();
  };

  //for api get file
  static getFileUrl = (url) => {
    if (!url) return "";

    if (url.startsWith("/media")) return url;

    if (url.startsWith("/files")) {
      const userInfo = WebService.getUserInfo();
      userInfo.login = userInfo.login || {};
      userInfo.login.userAgent = Logger.getSystemInfo();

      return (
        WebService.URL.webService_baseAddress +
        "api" +
        url +
        "?userInfo=" +
        encodeURIComponent(JSON.stringify(userInfo))
      );
    }

    if (url[0] == "/") url = url.substr(1);

    return WebService.URL.webService_baseAddress + url;
  };

  _getUrl() {
    // return this.name
    const name = this.name[0] == "/" ? this.name.substring(1) : this.name;
    return WebService.URL.webService_baseAddress + name;
  }

  static getUserInfo(userEnteredUserInfo) {
    //TODO Try Catch

    userEnteredUserInfo = userEnteredUserInfo || {};

    let userInfo = window.sessionStorage._userInfo;
    const userInfoExpire = window.sessionStorage._userInfoExpire || "";
    let checkValidation =
      userInfo &&
      userInfoExpire &&
      moment().diff(moment(userInfoExpire, "jYYYY/jMM/jDD HH:mm:ss")) <= 0;

    try {
      userInfo = JSON.parse(userInfo);
    } catch (e) {
      checkValidation = false;
    }

    if (checkValidation) {
      return Utils.mergeObject(userInfo, userEnteredUserInfo);
    } else {
      window.sessionStorage._userInfo = "";
      window.sessionStorage._userInfoExpire = "";

      return userEnteredUserInfo;
    }
  }

  static isBlockIp = () => {
    const userBlock = window.sessionStorage._userBlock;
    const userBlockExpire = window.sessionStorage._userBlockExpire;

    //isBlock
    if (
      userBlock &&
      userBlockExpire &&
      moment().diff(moment(userBlockExpire, "jYYYY/jMM/jDD HH:mm:ss")) <= 0
    ) {
      return true;
    }

    return false;
  };

  static getToken() {
    return window.localStorage.token || "invalid";
  }

  _preFetch = () => {
    // TODO
    // this.option.needToken
    //const headers = {}

    return {
      params: this.params,
      headers: {
        // "Authorization": WebService.getToken(),
        // "Content-Type": "application/json",
      },
    };
  };

  static _lastErrorMsg;
  _fetch = async () => {
    if (WebService.isBlockIp()) {
      return new Promise((resolve, reject) => {
        return resolve({
          errorMsg: WebService._lastErrorMsg || "آی پی شما بلاک می باشد.",
        });
      });
    }

    this._setLog();

    if (
      SystemClass.SystemConfig.offlineMode &&
      window.localStorage[this.name + JSON.stringify(this.params)]
    ) {
      return new Promise((resolve, reject) => {
        return resolve(
          JSON.parse(
            window.localStorage[this.name + JSON.stringify(this.params)]
          )
        );
      });
    }

    const preFetch = {
      params: this.params,
      headers: {
        // "Authorization": WebService.getToken(),
        // "Content-Type": "application/json",
      },
    };

    if (!this.option.needProgressBar) {
      this._fetchPromise = fetch(this._getUrl(), {
        method: "POST", // *GET, POST, PUT, DELETE, etc.
        // mode: "cors", // no-cors, cors, *same-origin
        cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
        // credentials: "include", // include, *same-origin, omit
        headers: preFetch.headers,
        redirect: "follow", // manual, *follow, error
        // referrer: "no-referrer", // no-referrer, *client
        signal: this._controller.signal,
        body: this.formData, // body data type must match "Content-Type" header
        // body: JSON.stringify(preFetch.params), // body data type must match "Content-Type" header
      });
    } else {
      //set upload
      //this.params.fieldValues.documentCid
      const documentCid = this.params.fieldValues.documentCid;
      if (!Utils.isDefine(documentCid)) {
        SystemClass.showErrorMsg("آیدی فایل مورد نظر پیدا نشد!");
        return;
      }

      SystemClass.setUpload(documentCid, "upload", 0);

      this._fetchPromise = axios
        .request({
          method: "post",
          url: this._getUrl(),
          data: this.formData,
          onUploadProgress: (progressEvent) => {
            console.log(progressEvent);
            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            SystemClass.setUpload(
              documentCid,
              percent == 100 ? "done" : "upload",
              percent
            );
          },
        })
        .then((res) => {
          res.json = () => new Promise((resolve) => resolve(res.data));
          return res;
        });
    }

    const postFetch = this._postFetch();
    postFetch.abort = this.abort;
    return postFetch;
  };

  _handleResponse = (response) => {
    return;
    const newUserInfo = response.headers.get("_userInfo");

    if (newUserInfo) {
      try {
        this._setUserInfo(JSON.parse(newUserInfo));
      } catch (e) {
        //nothing
      }
    }
  };

  _setUserInfo = (newUserInfo) => {
    window.sessionStorage._userInfo = JSON.stringify(newUserInfo);
    window.sessionStorage._userInfoExpire = moment()
      .add("h", 24)
      .format("jYYYY/jMM/jDD HH:mm:ss"); //24 hours after now

    const userInfo = newUserInfo;
    if (userInfo.blockIpAddress) {
      window.sessionStorage._userBlock = true;
      window.sessionStorage._userBlockExpire = moment()
        .add("m", userInfo.blockIpAddress_BlockTimeByMinutes)
        .format("jYYYY/jMM/jDD HH:mm:ss"); //blockIpAddress_BlockTimeByMinutes Minutes after now

      // window.sessionStorage._userBlockExpire = moment().add("m", userInfo.blockIpAddress_BlockTimeByMinutes).format('jYYYY/jMM/jDD HH:mm:ss') //blockIpAddress_BlockTimeByMinutes Minutes after now
    }

    if (
      userInfo.login &&
      userInfo.login.result &&
      userInfo.login.result.needLogin
    ) {
      if (!window.location.pathname.startsWith("/auth")) {
        SystemClass.handleUnauthorizeError();
      }
    }
  };

  _postFetch = () => {
    return this._fetchPromise
      .then((response) => {
        this._handleResponse(response);

        switch (response.status) {
          case 200:
            return response.json();

          case 401:
            SystemClass.handleUnauthorizeError();
            break;

          case 500:
          case 503:
            response.json().then((json) => {
              Logger.log("webservice error", {
                error: JSON.stringify(json),
                params: this.params,
                webServiceUrl: this._getUrl(),
              });

              SystemClass.showErrorMsg(json.error);
            });
            break;
        }

        return {};
      })
      .then((json) => {
        // if (
        //   (window.location.hostname == "localhost" ||
        //     window.location.hostname == "127.0.0.1") &&
        //   Object.keys(json).length !== 0
        // ) {
        //   window.localStorage[
        //     this.name + JSON.stringify(this.params)
        //   ] = JSON.stringify(json);
        // }

        if (json._userInfo) {
          this._setUserInfo(json._userInfo);
        }

        if (json.errorMsg) {
          WebService._lastErrorMsg = json.errorMsg;
        }

        if (json.error) {
          SystemClass.showErrorMsg(json.error);
          console.log(json.errorMsg);
        } else {
          return json;
        }
      })
      .catch((e) => {
        console.log("error: " + e);
        Logger.log("webservice error", {
          error: e.toString(),
          params: this.params,
          webServiceUrl: this._getUrl(),
        });
        SystemClass.showErrorMsg(" Check your internet connection  " + e);
        return {};
      });
  };

  // _postFetch = () => {
  //     return new Promise((resolve, reject) => {
  //         return this._fetchPromise
  //             .then((response) => {
  //                 if (response.status == 200) {
  //                     return response.json()
  //                 } else {
  //
  //                     if (response.status == 401) {
  //                         SystemClass.handleUnauthorizeError()
  //                     }
  //
  //                     if (response.status == 500) {
  //                         response.json().then(json => {
  //                             SystemClass.showErrorMsg(json.error)
  //                         })
  //                     }
  //
  //                     return {}
  //                 }
  //
  //             }).then(json => {
  //                 window.localStorage[this.name + JSON.stringify(this.params)] = JSON.stringify(json)
  //                 return resolve(json)
  //             })
  //             .catch(e => {
  //                 Logger.log("webservice error", {
  //                     error: e.toString(),
  //                     params: this.params,
  //                     webServiceUrl: this._getUrl(),
  //                 })
  //
  //                 SystemClass.showErrorMsg(e + ' خطایی رُخ داد!  ')
  //                 return reject(e)
  //             })
  //     }).catch(e => {
  //         return {}
  //     })
  // }
}

export default WebService;
