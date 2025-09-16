import React, { Component, Fragment, PureComponent } from 'react';
import FontAwesome from 'react-fontawesome'
import { Button } from "reactstrap";
import BaseComponent from "../../components/BaseComponent";
import Logger from "../../Logger";
import "./ForgetPassword.css";
import Logo from "../../content/logo_mapsun.svg";
import { ReactComponent as LogoMapsun } from '../../content/logo_mapsun.svg';
import LoginLogo from '../../content/login_logo.png';
import VanillaTilt from "vanilla-tilt";
import WebService from "../../WebService";
import SystemClass from "../../SystemClass";
import CryptoUtils from "../../file/CryptoUtils";
import Utils from "../../Utils";
import { Link } from "react-router-dom";
import moment from "moment-jalaali";
import { Translation } from "react-i18next";

class ForgetPassword extends BaseComponent {
    constructor(props) {
        super(props)
        this.state = {
            state: 'username',
            hasError: false,
            loaded: false,
            username: '',
            password: '',

            needOtp: true, //always true in forget password
            otp: '',
            otpSend: false,
            otpTimer: 0,
        }
        this.data = {
            loginTry: 0,
            error: {}
        }

        this.initialize()


    }

    initialize = () => {
        this.data.imageRef = React.createRef();

        window.sessionStorage._userInfo = ''
        window.sessionStorage._userInfoExpire = ''
    }

    componentDidMount() {
        VanillaTilt.init(this.data.imageRef.current, {
            scale: 1.1
        })

        //manual set username
        if (SystemClass.lastLoginName) {
            this.state.username = SystemClass.lastLoginName
            this._handleLoginClick()
        }
    }

    async getForgetPasswordPage() {
        await SystemClass.setLoading(true)

        //first get Login page (for token and ...)

        const loginName = this.state.username
        let userInfo = {
            login: {
                loginName: loginName
            },
        }

        let lastLogin
        try {
            lastLogin = JSON.parse(SystemClass.getLastLogin(loginName))
        } catch (e) {

        }

        const lastOtp = SystemClass.getLastOtp(loginName)
        const lastPemKey = SystemClass.getLastPemKey(loginName)

        if (lastLogin && lastOtp && lastPemKey) {
            this.state.otp = lastOtp
            this.data.pemKey = lastPemKey
            this.state.needOtp = true
            userInfo = lastLogin
        }

        window.sessionStorage._userInfo = ''
        window.sessionStorage._userInfoExpire = ''

        return new WebService(WebService.URL.webService_GetLoginPage, {}, {}, userInfo).then(json => {
            if (json.captcha) this.data.captchaBase64 = json.captcha
            json.errorMsg && SystemClass.showMsg(json.errorMsg)
            json.successMsg && SystemClass.showMsg(json.successMsg)

            //then get ForgetPasswordPage for captcha and ...
            return new WebService(WebService.URL.webService_GetForgetPasswordPage).then(json => {
                if (json.captcha) this.data.captchaBase64 = json.captcha

                json.errorMsg && SystemClass.showMsg(json.errorMsg)
                json.successMsg && SystemClass.showMsg(json.successMsg)
            })

        }).finally(i => {
            SystemClass.setLoading(false)
            this.forceUpdate()
        })


    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        console.log(error)
        return { hasError: true };
    }

    _handleReloadClick = (event) => {
        this.initialize()
    }

    componentDidCatch(error, errorInfo) {
        console.log(error, errorInfo)
        Logger.log("error", { error: error.toString(), componentStack: errorInfo.componentStack })
    }

    componentWillUnmount() {
        clearInterval(this.data.otpIntervalId)
    }

    _setLastLoginInfo = (newUserInfo) => {
        const userInfo = WebService.getUserInfo(newUserInfo)
        window.localStorage._lastLogin = JSON.stringify(userInfo)
        window.localStorage._lastLoginExpire = moment().add("h", 24).format('jYYYY/jMM/jDD HH:mm:ss') //24 hours after now

        const loginName = newUserInfo.login.loginName
        SystemClass.setLastOtp(loginName, this.state.otp)
        SystemClass.setLastPemKey(loginName, this.data.pemKey)

        if (this.state.needOtp) {
            SystemClass.setLastLogin(loginName, JSON.stringify(userInfo))
        }

        window.sessionStorage.userDisplayName = userInfo.login && userInfo.login.result && userInfo.login.result.userDisplayName || window.sessionStorage.userDisplayName
    }

    _handleLoginClick = async (event) => {
        event && event.stopPropagation()
        event && event.preventDefault()


        if (this.state.state == 'username') {

            if (!this.data.lastUserName) {
                this.data.lastUserName = this.state.username
            }

            if (this.data.lastUserName !== this.state.username) {

                this.state.password = ''
                this.state.needOtp = true
                this.state.otp = false
                this.state.otpSend = false
                this.state.otpTimer = 0
                this.state.captcha = ''
                this.state.repeatPassword = ''

                clearInterval(this.data.otpIntervalId)
            }

            this.getForgetPasswordPage().then(i => {
                //this._handleRefreshPassword().finally(i => {
                //    this.state.state = 'password'
                //    this.forceUpdate()

                //})

                SystemClass.lastLoginName = this.state.username
                this.state.state = 'password'

                this.forceUpdate()
            })

            return
        }

        this.data.loginTry++


        const login = {
            loginName: this.state.username,
            oneTimePassword: this.state.otp,
            captchaResult: this.state.captcha,
        }

        if (!this.data.pemKey) {
            SystemClass.showErrorMsg("خطا در مقدار OTP")
            return
        }

        const oneTimePassword = this.isDemoUser() || this.data.isLocalIntranet ? "1234567" : login.oneTimePassword;

        const pemKey = CryptoUtils.AESDecrypt(this.data.pemKey, oneTimePassword)
        login.passwordText_New = CryptoUtils.RSAEncrypt(this.state.newPassword, pemKey)

        await SystemClass.setLoading(true)
        return new WebService(WebService.URL.webService_ChangePassword_Automatic, {}, {}, { login }).then(json => {
            if (json.captcha) this.data.captchaBase64 = json.captcha

            if (json.successMsg) {
                this._setLastLoginInfo({ login })
                SystemClass.showMsg(json.successMsg)
                SystemClass.pushLink('/auth/login')
            } else {
                SystemClass.showErrorMsg(json.errorMsg)

                if (json._userInfo && json._userInfo.login && json._userInfo.login.result) {

                    if (!json._userInfo.login.result.oneTimePassword_IsValid) {
                        this.state.needOtp = true
                    }
                }

                this.forceUpdate()
            }

        }).finally(i => SystemClass.setLoading(false))

    }


    _handleError = (name, show) => {
        if (this.data.error[name] == show) return

        this.data.error[name] = show
        this.forceUpdate()
    }

    _handleClearUsername = () => {
        this.data.lastUserName = this.state.username + ''

        this.state.username = ''
        this.state.state = 'username'

        this.forceUpdate()
    }

    _handleCaptchaChange = (event) => {
        let value = event.target.value
        this.setState({ captcha: value })
    }

    _handleUsernameChange = (event) => {
        this.state.username = event.target.value

        if (this.isUsernameValid()) {
            this._handleLoginClick()
        }

        this.forceUpdate()
    }

    _handlePasswordChange = (event) => {
        let value = event.target.value
        this.setState({ otp: value })
    }

    _handleRepeatPasswordChange = (event) => {
        let value = event.target.value
        this.setState({ repeatPassword: value })
    }

    _handlePasswordKeyPress = (event) => {
        const isCapsLockOn = Utils.isCapsLockOn(event)
        if (this.state.isCapsLockOn != isCapsLockOn) {
            this.state.isCapsLockOn = isCapsLockOn
            this.forceUpdate()
        }
    }

    _handleNewPasswordChange = (event) => {
        let value = event.target.value
        this.setState({ newPassword: value })
    }

    _handleRefreshPassword = async () => {

        if (this.state.otpTimer) {
            SystemClass.showErrorMsg(this.state.otpTimer + ' ثانیه تا ارسال دوباره صبر نمایید.')
            return
        }


        await SystemClass.setLoading(true)

        const login = {
            loginName: this.state.username,
        }

        //then get OnTimePassword for create password and send with sms
        return new WebService(WebService.URL.webService_GetOneTimePassword, {}, {}, { login }).then(json => {
            if (json.captcha) this.data.captchaBase64 = json.captcha
            if (json.pemKey) this.data.pemKey = json.pemKey

            if (json.errorMsg) {
                SystemClass.showErrorMsg(json.errorMsg)
            } else {

                this.state.otpTimer = 60

                clearInterval(this.data.otpIntervalId)
                this.data.otpIntervalId = setInterval(() => {
                    this.state.otpTimer--
                    this.forceUpdate()

                    if (this.state.otpTimer == 0) {
                        clearInterval(this.data.otpIntervalId)
                    }
                }, 1000)

                json.successMsg && SystemClass.showMsg(json.successMsg)
            }
        }).finally(i => {

            this.state.otpSend = true

            SystemClass.setLoading(false)
            this.forceUpdate()
        })
    }

    _handleRefreshCaptcha = async () => {
        await SystemClass.setLoading(true)

        //then get OnTimePassword for create password and send with sms
        return new WebService(WebService.URL.webService_GetCaptcha).then(json => {
            if (json.captcha) this.data.captchaBase64 = json.captcha

            if (json.errorMsg) {
                SystemClass.showErrorMsg(json.errorMsg)
            } else {
                json.successMsg && SystemClass.showMsg(json.successMsg)
            }

        }).finally(i => {
            SystemClass.setLoading(false)
            this.forceUpdate()
        })
    }

    _handleSendOTPByCall = async () => {

        if (this.state.otpTimer) {
            SystemClass.showErrorMsg(this.state.otpTimer + ' ثانیه تا تماس دوباره صبر نمایید.')
            return
        }

        await SystemClass.setLoading(true)

        const login = {
            loginName: this.state.username,
        }

        //then get OnTimePassword for create password and send with sms
        return new WebService(WebService.URL.webService_GetOneTimePasswordForVoip, {}, {}, { login }).then(json => {
            if (json.captcha) this.data.captchaBase64 = json.captcha
            if (json.pemKey) this.data.pemKey = json.pemKey

            if (json.errorMsg) {
                SystemClass.showErrorMsg(json.errorMsg)
            } else {
                this.state.otpTimer = 60

                clearInterval(this.data.otpIntervalId)
                this.data.otpIntervalId = setInterval(() => {
                    this.state.otpTimer--
                    this.forceUpdate()

                    if (this.state.otpTimer == 0) {
                        clearInterval(this.data.otpIntervalId)
                    }
                }, 1000)

                json.successMsg && SystemClass.showMsg(json.successMsg)
            }
        }).finally(i => {
            this.state.otpSend = true
            SystemClass.setLoading(false)
            this.forceUpdate()
        })
    }

    isUsernameValid = () => {
        return Utils.isNationalCode(this.state.username) || Utils.isValidEmail(this.state.username)
    }

    isPasswordValid = () => {
        return !!this.state.otp && !!this.state.newPassword && !!this.state.repeatPassword && !!this.state.captcha && this.state.newPassword == this.state.repeatPassword
    }

    isValid = () => {
        if (this.state.state == 'username') {
            return !!this.isUsernameValid() && !this.state.loading
        }

        return !!this.isUsernameValid() && !!this.isPasswordValid() && !this.state.loading
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <div className='Form__container__error'>
                <FontAwesome className="Form__container__error__icon" name="exclamation-triangle" />
                <span className="Form__container__error__text">
                    خطایی روی داده است!
                </span>
                <Button onClick={this._handleReloadClick} outline className="Form__container__error__button">
                    <FontAwesome className="Form__container__error__button__icon" name="sync-alt" />
                    بارگذاری مجدد
                </Button>
            </div>;
        }

        const inputUserErrorClass = this.data.error.username && (this.isUsernameValid() ? '' : 'LoginContainer__alert')
        const inputRepeatPasswordErrorClass = this.data.error.repeatPassword && (this.state.newPassword == this.state.repeatPassword ? '' : 'LoginContainer__alert')

        const inputPasswordErrorClass = ''

        return (
            <div className="LoginContainer">
                <div className="LoginContainer__frame scroll__container">
                    <div data-tilt data-tilt-scale="1.1" ref={this.data.imageRef}>
                        <img className="LoginContainer__image" src={LoginLogo} alt="" />
                    </div>

                    <form className="LoginContainer__form">
                        <Translation>
                            {(t) => (
                                <span className="LoginContainer__form__title">
                                    {t("forgetpassword")}
                                </span>
                            )}
                        </Translation>
                        <Translation>{(t) => (
                            <div className={"LoginContainer__inputContainer " + inputUserErrorClass}
                                data-validate={t("UserIDErorr")}>
                                <input className="LoginContainer__input" type="tel" name="nationalCode"
                                    placeholder={t("UserID")}
                                    readOnly={this.state.state !== 'username'}
                                    disabled={this.state.state !== 'username'}
                                    autocomplete="nationalCode"

                                    value={this.state.username}
                                    onChange={this._handleUsernameChange}
                                    onBlur={() => this._handleError('username', true)}
                                    onFocus={() => this._handleError('username', false)}
                                />
                                <span className="LoginContainer__inputFocus"></span>
                                <span className="LoginContainer__inputSymbol">
                                    <i className="fa fa-user" aria-hidden="true"></i>
                                </span>


                                <div className={'LoginContainer__refreshIcon'} onClick={this._handleClearUsername}>
                                    <i className="fa fa-times" aria-hidden="true"></i>
                                </div>

                            </div>
                        )}
                        </Translation>
                        {this.state.state != 'username' &&
                            <Fragment>
                                <Translation>{(t) => (
                                    <div className={"LoginContainer__inputContainer " + inputPasswordErrorClass}
                                        data-validate={t("InvalidOneTimePassword")}>
                                        <input className="LoginContainer__input" type="tel" name="otp"
                                            placeholder={t("OtpPlaceholder")}

                                            readOnly={!this.state.otpSend}
                                            disabled={!this.state.otpSend}

                                            onChange={this._handlePasswordChange} />
                                        <span className="LoginContainer__inputFocus"></span>
                                        <span className="LoginContainer__inputSymbol">
                                            <i className="fa fa-lock" aria-hidden="true"></i>
                                        </span>

                                        <div
                                            className={'LoginContainer__refreshIcon ' + (!this.state.otpSend && 'LoginContainer__refreshIcon--text')}
                                            onClick={this._handleRefreshPassword}>
                                            {
                                                this.state.otpSend ?
                                                    (!this.state.otpTimer ?
                                                        <i className="fa fa-redo" aria-hidden="true" />
                                                        : this.state.otpTimer)
                                                    :
                                                    t("SendOtp")
                                            }
                                            {
                                                this.state.otpSend && this.state.otpTimer <= 0 ?
                                                    <div className={'LoginContainer__refreshIcon'} onClick={this._handleSendOTPByCall} style={{ marginLeft: '70px' }}>
                                                        <i className="fa fa-volume-up" aria-hidden="true" />
                                                    </div> : ''
                                            }
                                        </div>
                                    </div>
                                )}</Translation>
                                <Translation>{(t) => (
                                    <div className={"LoginContainer__inputContainer " + inputPasswordErrorClass}
                                        data-validate={t("newPassword_Error")}>
                                        <input className="LoginContainer__input" type="password" name="pass"
                                            placeholder={t("newPassword_Placeholder")}
                                            onKeyPress={this._handlePasswordKeyPress}

                                            onChange={this._handleNewPasswordChange} />
                                        <span className="LoginContainer__inputFocus"></span>
                                        <span className="LoginContainer__inputSymbol">
                                            <i className="fa fa-lock" aria-hidden="true"></i>
                                        </span>
                                    </div>
                                )}</Translation>
                                <Translation>{(t) => (
                                    <div className={"LoginContainer__inputContainer " + inputRepeatPasswordErrorClass}
                                        data-validate={t("repeatPassword_Error")}>
                                        <input className="LoginContainer__input" type="password" name="pass"
                                            placeholder={t("repeatPassword_Placeholder")}
                                            onKeyPress={this._handlePasswordKeyPress}

                                            onBlur={() => this._handleError('repeatPassword', true)}
                                            onFocus={() => this._handleError('repeatPassword', false)}

                                            onChange={this._handleRepeatPasswordChange} />
                                        <span className="LoginContainer__inputFocus"></span>
                                        <span className="LoginContainer__inputSymbol">
                                            <i className="fa fa-lock" aria-hidden="true"></i>
                                        </span>
                                    </div>
                                )}</Translation>
                                {
                                    this.state.isCapsLockOn &&
                                    <div className={'LoginContainer__warning'}>
                                        <Translation>{(t) => (t("CapsLock"))}</Translation>
                                    </div>
                                }

                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '.5rem' }}>
                                    <img className="LoginContainer__image"
                                        src={`data:image/jpeg;base64,${this.data.captchaBase64}`} alt="" />
                                </div>
                                <Translation>{(t) => (
                                    <div className={"LoginContainer__inputContainer "}
                                        data-validate={t("InvalidCaptcha")}>
                                        <input className="LoginContainer__input" type="text" name="captcha"
                                            placeholder={t("Captcha")}
                                            onChange={this._handleCaptchaChange} />
                                        <span className="LoginContainer__inputFocus"></span>
                                        <span className="LoginContainer__inputSymbol">
                                            <i className="fa fa-image" aria-hidden="true"></i>
                                        </span>

                                        <div className={'LoginContainer__refreshIcon'} onClick={this._handleRefreshCaptcha}>
                                            <i className="fa fa-redo" aria-hidden="true"></i>
                                        </div>
                                    </div>
                                )}</Translation>
                            </Fragment>}

                        <div className="LoginContainer__buttonContainer">
                            <button disabled={!this.isValid()} className="LoginContainer__button"
                                onClick={this._handleLoginClick}>
                                {
                                    this.state.state == 'username' ? <Translation>{(t) => (t("confirm"))}</Translation> : <Translation>{(t) => (t("loginText"))}</Translation>
                                }

                            </button>
                        </div>

                        <div className="LoginContainer__text">
                            <Link className="" to="/auth/login">
                                <Translation>{(t) => (t("Login_in_forgetpassword"))}</Translation>
                            </Link>
                        </div>

                        <div className="LoginContainer__text">
                            <a className="" href="#">
                                {/*ساخت حساب کاربری*/}
                                {/*<i className="fa fa-long-arrow-right m-l-5" aria-hidden="true"></i>*/}
                            </a>
                        </div>
                    </form>
                </div>
            </div>
        )
    }

}

export default ForgetPassword;