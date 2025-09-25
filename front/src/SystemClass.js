import { toast } from "react-toastify";
// import { createBrowserHistory } from "history"; // تغییر ۱: این خط به طور کامل حذف شد
import WebService from "./WebService";
import SystemClass_Core from "./SystemClass_Core";
import DBUtils from "./DBUtils";
import UiSetting from "./UiSetting";
import React from "react";
import moment from "moment-jalaali";
import { navigationService } from "./NavigationService";

let currentPemKey = null;

class SystemClass extends SystemClass_Core {
  //------------------------------------------------
  //region menu
  //------------------------------------------------
  static MenuComponent;

  static menuUpdate = () => {
    SystemClass.MenuComponent.update();
  };

  //------------------------------------------------
  //endregion menu
  //------------------------------------------------

  //------------------------------------------------
  //region userInfo
  //------------------------------------------------

  static menuItem_Array;
  static MainMenuData;
  static lastLoginName = "";

  static checkFirstTimeLogin() {
    let lastLogin;
    let lastLoginExpire;

    const userInfo = WebService.getUserInfo();
    if (userInfo.login) return new Promise((resolve) => resolve(true));

    try {
      lastLogin = JSON.parse(window.localStorage._lastLogin);
      lastLoginExpire = window.localStorage._lastLoginExpire;
    } catch (e) { }

    //isBlock
    if (
      lastLogin &&
      lastLoginExpire &&
      moment().diff(moment(lastLoginExpire, "jYYYY/jMM/jDD HH:mm:ss")) <= 0
    ) {
      return new WebService(
        WebService.URL.webService_Login,
        {},
        {},
        lastLogin
      ).then((json) => {
        if (json.successMsg) {
          return true;
        }
      });
    }

    return new Promise((resolve) => resolve());
  }

  static logOut() {
    window.sessionStorage._userInfo = "";
    window.sessionStorage._userInfoExpire = "";

    window.localStorage._lastLogin = "";
    window.localStorage._lastLoginExpire = "";
    SystemClass.clearPemKey();
  }

  static setLastOtp(loginName, otp) {
    return (window.localStorage["_otp_" + loginName] = otp);
  }


  static async getLastUserImage(loginName) {
    if (!loginName) {
      const userInfo = WebService.getUserInfo();
      loginName = userInfo.login && userInfo.login.loginName;
    }
    if (!loginName) return null;

    const imageBlob = await DBUtils.get(`_userImage_${loginName}`);
    if (imageBlob) {
      return URL.createObjectURL(imageBlob);
    }
    return null;
  }

  static async setLastUserImage(loginName, imageBlob) {
    await DBUtils.set(`_userImage_${loginName}`, imageBlob);

    if (SystemClass.MenuComponent && typeof SystemClass.MenuComponent.updateImage === 'function') {
      SystemClass.MenuComponent.updateImage();
    }
  }

  static setLastPemKey(loginName, pemKey) {
    return (window.localStorage["_pemKey_" + loginName] = pemKey);
  }

  static setLastLogin(loginName, loginUserInfo) {
    return (window.localStorage["_login_" + loginName] = loginUserInfo);
  }

  static setLastUserCanChangePassword(loginName, userCanChangePassword) {
    return (window.localStorage[
      "_userCanChangePassword_" + loginName
    ] = userCanChangePassword);
  }

  static getLastLogin(loginName) {
    return window.localStorage["_login_" + loginName];
  }

  static getLastOtp(loginName) {
    return window.localStorage["_otp_" + loginName];
  }

  static getLastPemKey(loginName) {
    return window.localStorage["_pemKey_" + loginName];
  }

  static getUserCanChangePassword(loginName) {
    return window.localStorage["_userCanChangePassword_" + loginName];
  }

  //------------------------------------------------
  //endregion
  //------------------------------------------------

  //------------------------------------------------
  //region Pem Key
  //------------------------------------------------
  static setPemKey(key) {
    currentPemKey = key;
  }

  static getPemKey() {
    return currentPemKey;
  }

  static clearPemKey() {
    currentPemKey = null;
  }

  static async ensurePemKey() {
    if (currentPemKey) {
      return true;
    }

    const userInfo = WebService.getUserInfo();
    if (userInfo && userInfo.login) {
      console.log("pemKey not found, fetching from server for current session...");
      try {
        const json = await new WebService(WebService.URL.webService_GetSessionPemKey, {});
        if (json && json.pemKey) {
          SystemClass.setPemKey(json.pemKey);
          return true;
        } else {
          SystemClass.showErrorMsg("خطا در دریافت کلید امنیتی جلسه.");
          return false;
        }
      } catch (error) {
        SystemClass.showErrorMsg("خطا در ارتباط برای دریافت کلید امنیتی.");
        return false;
      }
    }
    return false;
  }

  //------------------------------------------------
  //region loading
  //------------------------------------------------
  static showCustomLoading = (show) => {
    if (SystemClass.AppComponent) {
      SystemClass.AppComponent.setShowCustomLoading(show);
    }
  };


  static loading;
  static loadingQueue = [];
  static setLoading = (loading) => {
    let resolve = () => { };
    const promise = new Promise((r) => (resolve = r));

    if (SystemClass.loading && loading) {
      SystemClass.loadingQueue.push({
        promise,
        resolve,
      });
      return promise;
    }

    if (SystemClass.loading == loading) return;

    const lastPromise = SystemClass.loadingQueue.shift();
    if (!loading && lastPromise) {
      lastPromise.resolve();
      return lastPromise.promise;
    }

    SystemClass.loading = loading;
    const progress = document.getElementById("MainMenuProgress");
    const mask = document.getElementById("maskDisable");
    const DialogContainer = document.getElementById("DialogContainer");
    const Form__container = document.querySelector(".Form__container");
    const anyDialogOpen = SystemClass.anyDialogOpen();

    requestAnimationFrame(() => {
      const func = loading ? "add" : "remove";
      loading && mask && mask.focus();
      progress && progress.classList[func]("MainMenu__Progress--show");
      mask && mask.classList[func]("maskDisable--show");
      mask &&
        mask.classList[anyDialogOpen ? "add" : "remove"]("maskDisable--full");

      DialogContainer && DialogContainer.classList[func]("dialog--loading");

      // Form__containers.forEach(node => node.classList[func]('Form__container--disable'))
      Form__container &&
        Form__container.classList[func]("Form__container--disable");

      if (loading === false) {
        SystemClass.showCustomLoading(false);
      }
    });

    resolve();
    return promise;
  };
  //------------------------------------------------
  //endregion loading
  //------------------------------------------------

  //------------------------------------------------
  //region Message
  //------------------------------------------------

  static _getMessage(msg) {
    msg = msg || "";
    return msg.replace(/!@#/g, "\n").replace(/\(\(.*?\)\)/g, "");
  }

  /***
   *
   * @param {String} msg massage to show
   */
  static showMsg(msg, closeTime) {
    const message = SystemClass._getMessage(msg);
    toast(message, {
      toastId: "_globalToastId",
      autoClose: closeTime || 3500,
    });
  }

  static showWarningMsg(msg) {
    const message = SystemClass._getMessage(msg);

    toast.warn(message, {
      toastId: "_globalWarningToastId",
      className: "toast__warning",
    });
  }

  /***
   *
   * @param {String} msg massage to show
   */
  static showErrorMsg(msg) {
    let message = SystemClass._getMessage(msg);

    message = <span>{message}</span>;

    toast.error(message, {
      toastId: "_globalErrorToastId",
    });
  }

  //------------------------------------------------
  //endregion Message
  //------------------------------------------------

  //------------------------------------------------
  //region web routing
  //------------------------------------------------

  // static browserHistory = createBrowserHistory(); 
  // static getBrowserHistory = () => {
  //   return SystemClass.browserHistory;
  // };

  static pushLink = (link, state) => {
    if (navigationService.navigate) {
      navigationService.navigate(link, { state });
    } else {
      console.error("Navigation service has not been initialized yet.");
      window.location.href = link;
    }
  };

  static setFormParam = (formName, params) => {
    window.localStorage.setItem("Form__" + formName, JSON.stringify(params));
  };

  static getFormParam = (formName) => {
    return JSON.parse(window.localStorage.getItem("Form__" + formName) || "{}");
  };

  static openForm = (formName, params) => {
    SystemClass.setFormParam(formName, params);
    SystemClass.pushLink("/form/" + formName);
  };

  static openFrame = (frameUrl) => {
    SystemClass.pushLink("/frame/" + frameUrl);
  };

  static handleUnauthorizeError(error) {
    if (SystemClass.anyDialogOpen())
      SystemClass.DialogComponent?.cancelAllDialogs();
    SystemClass.pushLink("/auth/login");
    SystemClass.showErrorMsg(
      UiSetting.GetSetting("language") === "fa"
        ? "ابتدا به سیستم وارد شوید"
        : "Please login to the system first..."
    );
  }

  //------------------------------------------------
  //endregion web routing
  //------------------------------------------------

  //------------------------------------------------
  //region ConnectionStatus component
  //------------------------------------------------
  static ConnectionStatusComponent;
  static ConnectionStatusSetOfflineMode = (mode) => {
    SystemClass.ConnectionStatusComponent.setOfflineMode(mode);
  };
  //------------------------------------------------
  //endregion ConnectionStatus component
  //------------------------------------------------

  //------------------------------------------------
  //region Dialog
  //------------------------------------------------
  static DialogComponent;

  static openDialog(formId, formParams, formFieldInfo, closeDialogCallback) {
    if (SystemClass.DialogComponent && typeof SystemClass.DialogComponent.openDialog === 'function') {
      SystemClass.DialogComponent.openDialog(
        formId,
        formParams,
        formFieldInfo,
        closeDialogCallback
      );
    }
    else {
      console.error("DialogComponent is not ready. Cannot open dialog.");
    }
  }

  static cancelDialog(formId, formParams) {
    SystemClass.DialogComponent.cancelDialog(formId, formParams);
  }

  static anyDialogOpen() {
    return (
      SystemClass.DialogComponent && SystemClass.DialogComponent.anyDialogOpen()
    );
  }

  //------------------------------------------------
  //endregion Dialog
  //------------------------------------------------

  //------------------------------------------------
  //region Dialog Report
  //------------------------------------------------
  static DialogReportComponent;

  //------------------------------------------------
  //endregion Dialog
  //------------------------------------------------

  //------------------------------------------------
  //region confirm Dialog
  //------------------------------------------------
  static confirmDialogComponent;

  static showConfirm(msg, canPostpone, fieldCid) {
    return SystemClass.confirmDialogComponent.openDialog(
      msg,
      canPostpone,
      fieldCid
    );
  }

  //------------------------------------------------
  //endregion confirm Dialog
  //------------------------------------------------

  //------------------------------------------------
  //region auth web services
  //------------------------------------------------

  //------------------------------------------------
  //endregion confirm Dialog
  //------------------------------------------------

  //------------------------------------------------
  //region auth web services
  //------------------------------------------------

  static DialogReportDesignerContainer;

  static showReportDesignerDialog(mrtFileUrl, formModel) {
    SystemClass.DialogReportDesignerContainer.showDialog(mrtFileUrl, formModel);
  }

  static DialogReportViewerContainer;

  static showReportViewerDialog(mrtFileUrl, formModel) {
    SystemClass.DialogReportViewerContainer.showDialog(mrtFileUrl, formModel);
  }

  //------------------------------------------------
  //endregion confirm Dialog
  //------------------------------------------------
}

export default SystemClass;
