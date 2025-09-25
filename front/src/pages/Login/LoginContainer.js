import React, { Fragment } from "react";
import FontAwesome from "react-fontawesome";
import { Button } from "reactstrap";
import BaseComponent from "../../components/BaseComponent";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import Logger from "../../Logger";
import "./LoginContainer.css";
import VanillaTilt from "vanilla-tilt";
import WebService from "../../WebService";
import UiSetting from "../../UiSetting";
import SystemClass from "../../SystemClass";
import CryptoUtils from "../../file/CryptoUtils";
import LoginLogo from "../../content/first-page-logo.jpg";
import LoginLogo2 from "../../content/ok logo.png";
import Utils from "../../Utils";
import moment from "moment-jalaali";
import { Link } from "react-router-dom";
import { Translation } from "react-i18next";

class LoginContainer extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      state: "username",
      hasError: false,
      loaded: false,
      username: "",
      password: "",
      needOtp: true,
      otp: "",
      otpSend: false,
      otpTimer: 0,
      userImage: null,
    };

    this.data = {
      loginTry: 0,
      error: {},
      isLocalIntranet: false,
      userCanChangePassword: true,
    };

    this.initialize();
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    // console.log(error)
    return { hasError: true };
  }

  initialize = () => {
    this.data.imageRef = React.createRef();

    this.props.onChangeLang(UiSetting.GetSetting("language"));
    window.sessionStorage._userInfo = "";
    window.sessionStorage._userInfoExpire = "";
  };

  componentDidMount() {
    VanillaTilt.init(this.data.imageRef.current, {
      scale: 1.1,
    });

    if (SystemClass.lastLoginName || this.isUsernameValid()) {
      this.state.username = SystemClass.lastLoginName || this.state.username;
      this._loadUserImage();
      this._handleLoginClick();
    }
  }

  componentWillUnmount() {
    clearInterval(this.data.otpIntervalId);
  }

  _handleReloadClick = (event) => {
    this.initialize();
  };

  componentDidCatch(error, errorInfo) {
    // console.log(error, errorInfo)
    Logger.log("error", {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });
  }

  async getLoginPage() {
    await SystemClass.setLoading(true);

    //first get Login page (for token and ...)

    const loginName = this.state.username;
    let userInfo = {
      login: {
        loginName: loginName,
        currentPage: "LoginPage",
      },
    };

    let lastLogin;
    try {
      lastLogin = JSON.parse(SystemClass.getLastLogin(loginName));
    } catch (e) { }

    const lastOtp = SystemClass.getLastOtp(loginName);
    const lastPemKey = SystemClass.getLastPemKey(loginName);

    if (lastLogin && lastOtp && lastPemKey) {
      this.state.otp = lastOtp;
      this.data.pemKey = lastPemKey;
      this.state.needOtp = false;

      userInfo = lastLogin;
    }

    window.sessionStorage._userInfo = "";
    window.sessionStorage._userInfoExpire = "";

    return new WebService(
      WebService.URL.webService_GetLoginPage,
      {},
      {},
      userInfo
    )
      .then((json) => {
        if (json.captcha) this.data.captchaBase64 = json.captcha;
        if (json.pemKey) {
          // SystemClass.setPemKey(json.pemKey);
          this.data.pemKey = json.pemKey;
        }

        //user can not change password in some databases
        if (json.userCanChangePassword !== undefined)
          this.data.userCanChangePassword = json.userCanChangePassword;

        if (
          json._userInfo &&
          json._userInfo.login &&
          !!json._userInfo.login.isLocalIntranet
        ) {
          this.data.isLocalIntranet = true;
        } else {
          this.data.isLocalIntranet = false;
        }
        json.errorMsg && SystemClass.showErrorMsg(json.errorMsg);
        json.successMsg && SystemClass.showMsg(json.successMsg);
      })
      .finally((i) => {
        SystemClass.setLoading(false);
        this.forceUpdate();
      });
  }

  _handleClearUsername = () => {
    this.data.lastUserName = this.state.username + "";
    this.state.username = "";
    this.state.state = "username";

    this.forceUpdate();
  };

  _handleRefreshPassword = async () => {
    if (this.state.otpTimer) {
      SystemClass.showErrorMsg(
        <Translation>{(t) => this.state.otpTimer + t("Message2")}</Translation>
      );
      return;
    }

    await SystemClass.setLoading(true);

    const login = {
      loginName: this.state.username,
      currentPage: "LoginPage",
    };

    //then get OnTimePassword for create password and send with sms
    return new WebService(
      WebService.URL.webService_GetOneTimePassword,
      {},
      {},
      { login }
    )
      .then((json) => {
        if (json.captcha) this.data.captchaBase64 = json.captcha;
        if (json.pemKey) this.data.pemKey = json.pemKey;

        if (json.errorMsg) {
          SystemClass.showErrorMsg(json.errorMsg);
        } else {
          this.state.otpTimer = 60;

          clearInterval(this.data.otpIntervalId);
          this.data.otpIntervalId = setInterval(() => {
            this.state.otpTimer--;
            this.forceUpdate();

            if (this.state.otpTimer == 0) {
              clearInterval(this.data.otpIntervalId);
            }
          }, 1000);

          json.successMsg && SystemClass.showMsg(json.successMsg);
        }
      })
      .finally((i) => {
        this.state.otpSend = true;
        SystemClass.setLoading(false);
        this.forceUpdate();
      });
  };

  _handleSendOTPByCall = async () => {
    if (this.state.otpTimer) {
      SystemClass.showErrorMsg(
        <Translation>{(t) => this.state.otpTimer + t("Message1")}</Translation>
      );
      return;
    }

    await SystemClass.setLoading(true);

    const login = {
      loginName: this.state.username,
      currentPage: "LoginPage",
    };

    //then get OnTimePassword for create password and send with sms
    return new WebService(
      WebService.URL.webService_GetOneTimePasswordForVoip,
      {},
      {},
      { login }
    )
      .then((json) => {
        if (json.captcha) this.data.captchaBase64 = json.captcha;
        if (json.pemKey) this.data.pemKey = json.pemKey;

        if (json.errorMsg) {
          SystemClass.showErrorMsg(json.errorMsg);
        } else {
          this.state.otpTimer = 60;

          clearInterval(this.data.otpIntervalId);
          this.data.otpIntervalId = setInterval(() => {
            this.state.otpTimer--;
            this.forceUpdate();

            if (this.state.otpTimer == 0) {
              clearInterval(this.data.otpIntervalId);
            }
          }, 1000);

          json.successMsg && SystemClass.showMsg(json.successMsg);
        }
      })
      .finally((i) => {
        this.state.otpSend = true;
        SystemClass.setLoading(false);
        this.forceUpdate();
      });
  };


  _setUserImage = (loginName, documentCid_UserImage) => {
    fetch(WebService.getFileUrl("/files/" + documentCid_UserImage))
      .then(res => res.blob())
      .then(blob => {
        if (blob) {
          SystemClass.setLastUserImage(loginName, blob);
        }
      });
  };

  _setLastLoginInfo = (newUserInfo, json) => {
    const userInfo = WebService.getUserInfo(newUserInfo);
    window.localStorage._lastLogin = JSON.stringify(userInfo);
    window.localStorage._lastLoginExpire = moment()
      .add("h", 24)
      .format("jYYYY/jMM/jDD HH:mm:ss"); //24 hours after now

    const loginName = newUserInfo.login.loginName;
    SystemClass.setLastOtp(loginName, this.state.otp);
    SystemClass.setLastPemKey(loginName, this.data.pemKey);
    SystemClass.setLastUserCanChangePassword(
      loginName,
      this.data.userCanChangePassword
    );
    json.documentCid_UserImage &&
      this._setUserImage(loginName, json.documentCid_UserImage);

    if (this.state.needOtp) {
      SystemClass.setLastLogin(loginName, JSON.stringify(userInfo));
    }

    window.sessionStorage.userDisplayName =
      (userInfo.login &&
        userInfo.login.result &&
        userInfo.login.result.userDisplayName) ||
      window.sessionStorage.userDisplayName;
  };

  _handleLoginClick = async (event) => {
    event && event.stopPropagation();
    event && event.preventDefault();

    if (this.state.state == "username") {
      if (!this.data.lastUserName) {
        this.data.lastUserName = this.state.username;
      }

      if (this.data.lastUserName !== this.state.username) {
        this.state.password = "";
        this.state.needOtp = true;
        this.state.otp = false;
        this.state.otpSend = false;
        this.state.otpTimer = 0;
        this.state.captcha = "";

        clearInterval(this.data.otpIntervalId);
      }

      this._loadUserImage();

      this.getLoginPage().then((i) => {
        SystemClass.lastLoginName = this.state.username;
        this.state.state = "password";

        this.forceUpdate();
      });

      return;
    }

    this.data.loginTry++;

    const login = {
      loginName: this.state.username,
      oneTimePassword: this.state.otp,
      captchaResult: this.state.captcha,
      currentPage: "LoginPage",
    };

    const oneTimePassword = this.isDemoUser() || this.data.isLocalIntranet ? "1234567" : login.oneTimePassword;

    if (!this.data.pemKey) {
      SystemClass.showErrorMsg(
        <Translation>{(t) => t("OtpErorr")}</Translation>
      );
      return;
    }

    const pemKey = CryptoUtils.AESDecrypt(
      this.data.pemKey,
      oneTimePassword
    );
    login.passwordText = CryptoUtils.RSAEncrypt(this.state.password, pemKey);

    await SystemClass.setLoading(true);
    return new WebService(WebService.URL.webService_Login, {}, {}, { login })
      .then((json) => {
        if (json.captcha) this.data.captchaBase64 = json.captcha;

        if (json.successMsg) {
          this._setLastLoginInfo({ login }, json);

          SystemClass.menuItem_Array = json.menuItem_Array;
          SystemClass.MainMenuData = json;
          SystemClass.showMsg(json.successMsg, json.successMsg_WaitTime * 1000);

          const firstPage = SystemClass.menuItem_Array.filter(
            (item) => item.menuItem_FormName === "report_Report"
          );

          SystemClass.pushLink("/form/" + firstPage[0].menuItem_FormCid);
        } else {
          SystemClass.showErrorMsg(json.errorMsg);

          if (
            json._userInfo &&
            json._userInfo.login &&
            json._userInfo.login.result
          ) {
            if (!json._userInfo.login.result.oneTimePassword_IsValid) {
              this.state.needOtp = true;
            }
          }
          this.forceUpdate();
        }
      })
      .finally((i) => SystemClass.setLoading(false));
  };

  _handleError = (name, show) => {
    if (this.data.error[name] == show) return;

    this.data.error[name] = show;
    this.forceUpdate();
  };

  _handleUsernameChange = (event) => {
    this.state.username = event.target.value;

    if (this.isUsernameValid()) {
      this._handleLoginClick();
    }

    this.forceUpdate();
  };

  _handlePasswordKeyPress = (event) => {
    const isCapsLockOn = Utils.isCapsLockOn(event);
    if (this.state.isCapsLockOn != isCapsLockOn) {
      this.state.isCapsLockOn = isCapsLockOn;
      this.forceUpdate();
    }
  };

  _handlePasswordChange = (event) => {
    let value = event.target.value;
    this.setState({ password: value });
  };

  _handleRefreshCaptcha = async () => {
    await SystemClass.setLoading(true);

    //then get OnTimePassword for create password and send with sms
    return new WebService(WebService.URL.webService_GetCaptcha)
      .then((json) => {
        if (json.captcha) this.data.captchaBase64 = json.captcha;

        if (json.errorMsg) {
          SystemClass.showErrorMsg(json.errorMsg);
        } else {
          json.successMsg && SystemClass.showMsg(json.successMsg);
        }
      })
      .finally((i) => {
        SystemClass.setLoading(false);
        this.forceUpdate();
      });
  };

  _handleCaptchaChange = (event) => {
    let value = event.target.value;
    this.setState({ captcha: value });
  };

  _handleOTPChange = (event) => {
    let value = event.target.value;
    this.setState({ otp: value });
  };

  isDemoUser = () => {
    const userName = this.state.username + "";
    return userName.toLocaleLowerCase() === "demo";
  };

  isUsernameValid = () => {
    return (
      Utils.isNationalCode(this.state.username) ||
      this.isDemoUser() ||
      Utils.isValidEmail(this.state.username)
    );
  };

  isPasswordValid = () => {
    return (
      !!this.state.password &&
      (!!this.state.otp || !!this.isDemoUser() || this.data.isLocalIntranet) &&
      !!this.state.captcha
    );
  };

  isValid = () => {
    if (this.state.state == "username") {
      return !!this.isUsernameValid() && !this.state.loading;
    }

    return (
      !!this.isUsernameValid() &&
      !!this.isPasswordValid() &&
      !this.state.loading
    );
  };
  
  _loadUserImage = async (loginName) => {
    loginName = loginName || this.state.username;
    if (!loginName) return;

    try {
      const imageUrl = await SystemClass.getLastUserImage(loginName);
      this.setState({ userImage: imageUrl });
    } catch (error) {
      console.error("Failed to load user image:", error);
    }
  };

  _getDefaultImage = () => {
    if (UiSetting.GetSetting("logo") === "fintrac") {
      return LoginLogo2;
    } else {
      return LoginLogo;
    }
  };

  // changeSiteLanguage = (lang) => {
  //   this.props.onChangeLang(lang);
  // }; comment by ali kamel

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="Form__container__error">
          <FontAwesome
            className="Form__container__error__icon"
            name="exclamation-triangle"
          />
          <span className="Form__container__error__text">
            <Translation>{(t) => t("Erorr")}</Translation>
          </span>
          <Button
            onClick={this._handleReloadClick}
            outline
            className="Form__container__error__button"
          >
            <FontAwesome
              className="Form__container__error__button__icon"
              name="sync-alt"
            />
            <Translation>{(t) => t("Reload")}</Translation>
          </Button>
        </div>
      );
    }

    const inputUserErrorClass =
      this.data.error.username &&
      (this.isUsernameValid() ? "" : "LoginContainer__alert");
    const inputPasswordErrorClass =
      this.data.loginTry == 0 || this.isPasswordValid()
        ? ""
        : "LoginContainer__alert";

    return (
      <div className="LoginContainer">
        <div className="LoginContainer__frame scroll__container">
          <div
            style={{ zIndex: 1 }}
            data-tilt
            data-tilt-scale="1.1"
            ref={this.data.imageRef}
          >
            <img
              className="LoginContainer__userImage LoginContainer__image"
              src={this.state.userImage || this._getDefaultImage()}
              alt=""
            />
          </div>

          <form className="LoginContainer__form">
            <Translation>
              {(t) => (
                <span className="LoginContainer__form__title">
                  {t("Login")}
                </span>
              )}
            </Translation>
            <Translation>
              {(t) => (
                <div
                  className={
                    "LoginContainer__inputContainer " + inputUserErrorClass
                  }
                  data-validate={t("UserIDErorr")}
                >
                  <input
                    className="LoginContainer__input"
                    type="tel"
                    name="nationalCode"
                    placeholder={t("UserID")}
                    autoComplete="nationalCode"
                    readOnly={this.state.state !== "username"}
                    disabled={this.state.state !== "username"}
                    value={this.state.username}
                    onChange={this._handleUsernameChange}
                    onBlur={() => this._handleError("username", true)}
                    onFocus={() => this._handleError("username", false)}
                  />
                  <span className="LoginContainer__inputFocus" />
                  <span className="LoginContainer__inputSymbol">
                    <i className="fa fa-user" aria-hidden="true" />
                  </span>

                  <div
                    className={"LoginContainer__refreshIcon"}
                    onClick={this._handleClearUsername}
                  >
                    <i className="fa fa-times" aria-hidden="true" />
                  </div>
                </div>
              )}
            </Translation>
            <Translation>
              {(t) => (
                <div
                  className={
                    "LoginContainer__inputContainer " + inputPasswordErrorClass
                  }
                  data-validate={t("InvalidLoginPassword")}
                  style={{
                    display: this.state.state == "username" ? "none" : "",
                  }}
                >
                  <input
                    className="LoginContainer__input"
                    type="password"
                    name="password"
                    placeholder={t("passwordText")}
                    autoComplete="password"
                    value={this.state.password}
                    onKeyPress={this._handlePasswordKeyPress}
                    onChange={this._handlePasswordChange}
                  />
                  <span className="LoginContainer__inputFocus" />
                  <span className="LoginContainer__inputSymbol">
                    <i className="fa fa-lock" aria-hidden="true" />
                  </span>
                </div>
              )}
            </Translation>

            {this.state.state != "username" && (
              <Fragment>
                {this.state.isCapsLockOn && (
                  <div className={"LoginContainer__warning"}>
                    <Translation>{(t) => t("CapsLock")}</Translation>
                  </div>
                )}

                {this.state.needOtp &&
                  !this.isDemoUser() &&
                  !this.data.isLocalIntranet && (
                    <Translation>
                      {(t) => (
                        <div
                          className={
                            "LoginContainer__inputContainer " +
                            inputPasswordErrorClass
                          }
                          data-validate={t("InvalidOneTimePassword")}
                        >
                          <input
                            className="LoginContainer__input"
                            type="tel"
                            name="otp"
                            placeholder={t("OtpPlaceholder")}
                            readOnly={!this.state.otpSend}
                            disabled={!this.state.otpSend}
                            onChange={this._handleOTPChange}
                          />
                          <span className="LoginContainer__inputFocus" />
                          <span className="LoginContainer__inputSymbol">
                            <i className="fa fa-lock" aria-hidden="true" />
                          </span>

                          <div
                            className={
                              "LoginContainer__refreshIcon " +
                              (!this.state.otpSend &&
                                "LoginContainer__refreshIcon--text")
                            }
                            onClick={this._handleRefreshPassword}
                          >
                            {this.state.otpSend ? (
                              !this.state.otpTimer ? (
                                <i className="fa fa-redo" aria-hidden="true" />
                              ) : (
                                this.state.otpTimer
                              )
                            ) : (
                              t("SendOtp")
                            )}
                          </div>

                          {this.state.otpSend && this.state.otpTimer <= 0 ? (
                            <div
                              className={"LoginContainer__refreshIcon"}
                              onClick={this._handleSendOTPByCall}
                              style={{ marginLeft: "35px" }}
                            >
                              <i
                                className="fa fa-volume-up"
                                aria-hidden="true"
                              />
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                      )}
                    </Translation>
                  )}

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: ".5rem",
                  }}
                >
                  <img
                    className="LoginContainer__image"
                    src={`data:image/jpeg;base64,${this.data.captchaBase64}`}
                    alt=""
                  />
                </div>
                <Translation>
                  {(t) => (
                    <div
                      className={
                        "LoginContainer__inputContainer " + inputUserErrorClass
                      }
                      data-validate={t("InvalidCaptcha")}
                    >
                      <input
                        className="LoginContainer__input"
                        type="text"
                        placeholder={t("Captcha")}
                        onChange={this._handleCaptchaChange}
                      />
                      <span className="LoginContainer__inputFocus" />
                      <span className="LoginContainer__inputSymbol">
                        <i className="fa fa-image" aria-hidden="true" />
                      </span>

                      <div
                        className={"LoginContainer__refreshIcon"}
                        onClick={this._handleRefreshCaptcha}
                      >
                        <i className="fa fa-redo" aria-hidden="true" />
                      </div>
                    </div>
                  )}
                </Translation>
              </Fragment>
            )}

            <div className="LoginContainer__buttonContainer">
              <button
                disabled={!this.isValid()}
                className="LoginContainer__button"
                onClick={this._handleLoginClick}
              >
                {this.state.state == "username" ? (
                  <Translation>{(t) => t("confirm")}</Translation>
                ) : (
                  <Translation>{(t) => t("loginText")}</Translation>
                )}
              </button>
            </div>

            {this.data.userCanChangePassword ? (
              <div className="LoginContainer__text">
                <Link className="" to="/auth/forgetpassword">
                  <Translation>{(t) => t("forgetpassword")}</Translation>
                </Link>
              </div>
            ) : null}

            <div className="LoginContainer__text">
              <a className="" href="#">
                {/*ساخت حساب کاربری*/}
                {/*<i className="fa fa-long-arrow-right m-l-5" aria-hidden="true"></i>*/}
              </a>
              {/* <LanguageSwitcher
                onChangeLang={(lang) => this.changeSiteLanguage(lang)}
              /> Comment by ali kamel */}
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default LoginContainer;
