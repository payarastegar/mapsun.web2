import { toast } from "react-toastify";
// import { createBrowserHistory } from "history"; // تغییر ۱: این خط به طور کامل حذف شد
import WebService from "./WebService";
import SystemClass_Core from "./SystemClass_Core";
import UiSetting from "./UiSetting";
import React from "react";
import moment from "moment-jalaali";

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
  }

  static setLastOtp(loginName, otp) {
    return (window.localStorage["_otp_" + loginName] = otp);
  }

  static getLastUserImage(loginName) {
    if (!loginName) {
      loginName = WebService.getUserInfo();
      loginName = loginName.login && loginName.login.loginName;
    }
    return window.localStorage["_userImage_" + loginName];
  }

  static setLastUserImage(loginName, documentCid_UserImage) {
    SystemClass.MenuComponent && SystemClass.MenuComponent.updateImage();

    return (window.localStorage[
      "_userImage_" + loginName
    ] = documentCid_UserImage);
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
    // این متد باید در کامپوننت‌ها با استفاده از هوک useNavigate جایگزین شود
    // اما برای حفظ سازگاری موقت، می‌توان از window.location استفاده کرد
    // یا یک راه حل مبتنی بر event emitter پیاده‌سازی کرد.
    // فعلاً ساده‌ترین راه برای جلوگیری از خطا، تغییر مسیر مستقیم است.
    window.location.href = link;
    console.error("SystemClass.pushLink is deprecated. Use useNavigate hook in components.");

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
    SystemClass.DialogComponent.openDialog(
      formId,
      formParams,
      formFieldInfo,
      closeDialogCallback
    );
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

  static openDialog(formId, formParams, formFieldInfo, closeDialogCallback) {
    SystemClass.DialogComponent.openDialog(
      formId,
      formParams,
      formFieldInfo,
      closeDialogCallback
    );
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
