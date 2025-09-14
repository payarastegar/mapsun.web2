import React, {Component} from 'react';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

import './ProfileDialog.css';
import BaseComponent from "../BaseComponent";
import Class_Base from "../../class/Class_Base";
import SystemClass from "../../SystemClass";
import Utils from "../../Utils";
import FormInfo from "../FormInfo/FormInfo";
import FieldInfo from "../../class/FieldInfo";
import {conditionallyUpdateScrollbar, setScrollbarWidth} from "reactstrap";
import FontAwesome from 'react-fontawesome';
import FileCompressor from "../../file/FileCompressor";
import WebService from "../../WebService";
import CryptoUtils from "../../file/CryptoUtils";
import moment from "moment-jalaali";
import defaultUserImage from '../../content/user-circle-solid.svg';
import LoginLogo from "../../content/login_logo.png";


class ProfileDialog extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
            titleCancel: 'لغو',
            titleDo: 'ذخیره',
            title: 'دیالوگ فُرم',

            modal: false,
            nestedModal: false,
            closeAll: false,

            tab: 'passEdit',
            needOtp: true
        };

        this.data = {
            modalList: [],
            observer: null,
            paddingLeft: '',
            imageUrl: '',
            saveTry: 0

        }

        SystemClass.ProfileDialog = this

        // SystemClass.browserHistory.listen((location, action, sd) => {
        //     // location is an object like window.location
        //     console.log(action, location.pathname, location.state)
        //     console.log(SystemClass.browserHistory)
        //     if (action === "POP") {
        //         const lastItem = this.data.modalList.filter(item => item.isShow).slice(-1)[0]
        //         lastItem && this.cancelDialog(lastItem.formId, lastItem.paramList)
        //     }
        // });
    }

    showDialog = (show) => {
        show = !!show

        if (show !== this.state.isShow) {
            this.state.isShow = show
            this.setState({isShow: show})
        }
    }

    componentWillUnmount() {
        clearInterval(this.data.otpIntervalId)
    }


    //region events
    _handleOnDialogKeyPress = (event) => {
        if (event.keyCode === 27 && !SystemClass.loading) {
            //Do whatever when esc is pressed
            const lastItem = this.data.modalList.filter(item => item.isShow).slice(-1)[0]
            lastItem && this.cancelDialog(lastItem.formId, lastItem.paramList)
        }
    }

    _handleOnDoClick = (modalItem) => {
        this.cancelDialog(modalItem.formId, modalItem.paramList)
    }

    _handleOnCancelClick = (modalItem) => {
        this.cancelDialog(modalItem.formId, modalItem.paramList)
    }

    _handleOnDialogClose = (modelItem) => {
    }

    _handleOnTabClick = (tab) => {
        this.state.tab = tab
        this.setState({tab: tab})
    }

    _setLastLoginInfo = (newUserInfo) => {
        const userInfo = WebService.getUserInfo(newUserInfo)
        window.localStorage._lastLogin = JSON.stringify(userInfo)
        window.localStorage._lastLoginExpire = moment().add("h", 24).format('jYYYY/jMM/jDD HH:mm:ss') //24 hours after now

        const loginName = userInfo.login.loginName
        SystemClass.setLastOtp(loginName, this.state.otp)
        SystemClass.setLastPemKey(loginName, this.data.pemKey)

        if (this.state.needOtp) {
            SystemClass.setLastLogin(loginName, JSON.stringify(userInfo))
        }

        window.sessionStorage.userDisplayName = userInfo.login && userInfo.login.result && userInfo.login.result.userDisplayName || window.sessionStorage.userDisplayName
    }

    _handleRefreshPassword = async () => {

        if (this.state.otpTimer) {
            SystemClass.showErrorMsg(this.state.otpTimer + ' ثانیه تا ارسال دوباره صبر نمایید.')
            return
        }

        await SystemClass.setLoading(true)

        //then get OnTimePassword for create password and send with sms
        return new WebService(WebService.URL.webService_GetOneTimePassword).then(json => {
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

    _handleOnSave = async (event) => {
        event && event.stopPropagation()
        event && event.preventDefault()

        this.data.saveTry++


        const login = {}

        let pemKey = this.data.pemKey
        login.oneTimePassword = this.state.otp

        if (!this.data.pemKey) {
            SystemClass.showErrorMsg("خطا در مقدار OTP")
            return
        }


        pemKey = CryptoUtils.AESDecrypt(pemKey, login.oneTimePassword)

        login.passwordText_New = CryptoUtils.RSAEncrypt(this.state.newPassword, pemKey)
        login.passwordText = CryptoUtils.RSAEncrypt(this.state.password, pemKey)

        await SystemClass.setLoading(true)
        return new WebService(WebService.URL.webService_ChangePassword, {}, {}, {login}).then(json => {
            if (json.successMsg) {
                this._setLastLoginInfo({login})
                SystemClass.showMsg(json.successMsg)

                this.showDialog(false)

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

    _handleOTPChange = (event) => {
        let value = event.target.value
        this.setState({otp: value})
    }

    _handlePasswordChange = (event) => {
        let value = event.target.value
        this.setState({password: value})
    }

    _handleRepeatPasswordChange = (event) => {
        let value = event.target.value
        this.setState({repeatPassword: value})
    }

    _handleNewPasswordChange = (event) => {
        let value = event.target.value
        this.setState({newPassword: value})
    }


    _handleImageUpload = (event) => {
        //TODO
        return

        const imageFile = event.target.files[0];
        console.log('originalFile instanceof Blob', imageFile instanceof Blob); // true
        console.log(`originalFile size ${imageFile.size / 1024 / 1024} MB`);

        FileCompressor.compressImage(imageFile, compress => {
            console.log(compress)
            this.data.imageUrl = URL.createObjectURL(compress)
            this.forceUpdate()
        })
    }
    //endregion


    isPasswordValid = () => {
        return !!this.state.username
    }

    isValid = () => {
        return this.state.newPassword && this.state.password && this.state.repeatPassword == this.state.newPassword
    }

    _handlePasswordKeyPress = (event) => {
        const isCapsLockOn = Utils.isCapsLockOn(event)
        if (this.state.isCapsLockOn != isCapsLockOn) {
            this.state.isCapsLockOn = isCapsLockOn
            this.forceUpdate()
        }
    }

    _getUserImage = (loginName) => {
        const userImage = SystemClass.getLastUserImage()
        if (!userImage) return

        return userImage

        return WebService.URL.webService_baseAddress + 'api/files/' + userImage + "/?userInfo=" + encodeURIComponent(SystemClass.getLastLogin(loginName))
    }

    // endregion element
    render() {
        // const width = (modelItem.formFieldInfo.defaultWidthInPixel ?
        //     modelItem.formFieldInfo.defaultWidthInPixel : '') + 'px'
        // const style = {
        //     width: width,
        //     maxWidth: width,
        //     height2: modelItem.formFieldInfo.defaultHeightInPixel + 'px',
        // }

        const tab = this.state.tab
        // const inputUserErrorClass = this.data.saveTry == 0 || this.isUsernameValid() ? '' : 'LoginContainer__alert'
        // const inputPasswordErrorClass = this.data.saveTry == 0 || this.isPasswordValid() ? '' : 'LoginContainer__alert'

        const inputPasswordErrorClass = ''

        return (
            <div id="DialogContainer" className={["dialog"].filter(c => c).join(' ')}
                 onKeyDown={this._handleOnDialogKeyPress}>

                <Modal size="sm" isOpen={this.state.isShow} modalClassName={"scroll__container"}
                       className={["scroll__container", "dialog__container", 'ProfileDialog'].filter(c => c).join(' ')}
                       onClosed={this._handleOnDialogClose.bind(this)}
                       centered={true} style={{}}
                >
                    {/*<ModalHeader>*/}
                    {/**/}
                    {/*/!*<Button className={'Menu__icon'} outline color="light"*!/*/}
                    {/*/!*onClick={this._handleOnCancelClick.bind(this)}>*!/*/}
                    {/*/!*<FontAwesome style={{color: 'black'}} className={''} name="times-circle"/>*!/*/}
                    {/*/!*</Button>*!/*/}

                    {/*/!*{this._getModalItemHeader()}*!/*/}
                    {/*</ModalHeader>*/}

                    <div className="ProfileDialog__header">

                        <div className="ProfileDialog__headerBar">
                            <Button
                                className={['Menu__icon', 'Menu__search-icon'].filter(c => c).join(' ')}
                                outline color="light"
                                onClick={() => {
                                    this.showDialog(false)
                                }}>
                                <FontAwesome className={''} name="times"/>
                            </Button>
                            <div style={{flex: '1'}}></div>
                            {/*<Button*/}
                            {/*className={['Menu__icon', 'Menu__search-icon'].filter(c => c).join(' ')}*/}
                            {/*outline color="light"*/}
                            {/*onClick={() => {*/}
                            {/*this.showDialog(false)*/}
                            {/*}}>*/}
                            {/*<FontAwesome className={''} name="times"/>*/}
                            {/*</Button>*/}
                        </div>
                    </div>

                    <div>
                        <div className="ProfileDialog__avatarContainer">
                            <div className="ProfileDialog__imageContainer">
                                <div className="ProfileDialog__imageUploadContainer">
                                    {/*<input className="ProfileDialog__inputFile" type="file" accept="image/*"*/}
                                           {/*onChange={this._handleImageUpload}/>*/}
                                    <img className="ProfileDialog__avatar"
                                         src={this._getUserImage() || defaultUserImage}
                                    />
                                    {/*<div className="ProfileDialog__avatarHover">*/}
                                        {/*<FontAwesome className={'ProfileDialog__uploadIcon'} name="camera"/>*/}
                                    {/*</div>*/}
                                </div>
                                <div
                                    className="ProfileDialog__name"> {window.sessionStorage.userDisplayName || ''}</div>
                            </div>
                        </div>
                        <div className="ProfileDialog__tabs ">
                            {/*<Button outline*/}
                            {/*className={["ProfileDialog__tabButton", tab === 'userEdit' && "ProfileDialog__tabButton--active"].filter(c => c).join(' ')}*/}
                            {/*onClick={this._handleOnTabClick.bind(this, 'userEdit')}>*/}
                            {/*<FontAwesome className={'ml-2'} name="user-edit"/>*/}
                            {/*پروفایل*/}
                            {/*</Button>*/}
                            <Button outline
                                    className={["ProfileDialog__tabButton", tab === 'passEdit' && "ProfileDialog__tabButton--active"].filter(c => c).join(' ')}
                                    onClick={this._handleOnTabClick.bind(this, 'passEdit')}>
                                <FontAwesome className={'ml-2'} name="user-lock"/>
                                تغییر رمز
                            </Button>
                        </div>
                    </div>
                    <ModalBody className={["dialog__body"].filter(c => c).join(' ')}>
                        <div>
                            <form autocomplete="off" autoComplete="off">

                                <div
                                    className={["ProfileDialog__tabBody", tab !== 'userEdit' && "ProfileDialog__tabBody--hide"].filter(c => c).join(' ')}>
                                    <div className={"LoginContainer__inputContainer "}
                                         data-validate="رمز ورود صحیح نمی باشد">
                                        <input className="LoginContainer__input" type="text" name="pass"
                                               placeholder="نام و نام خانوادگی"


                                               onChange={this._handlePasswordChange}/>
                                        <span className="LoginContainer__inputFocus"></span>
                                        <span className="LoginContainer__inputSymbol">
							<i className="fa fa-file-signature" aria-hidden="true"></i>
						</span>
                                    </div>

                                </div>

                                <div
                                    className={["ProfileDialog__tabBody", tab !== 'passEdit' && "ProfileDialog__tabBody--hide"].filter(c => c).join(' ')}>


                                    <div className={"LoginContainer__inputContainer " + inputPasswordErrorClass}
                                         data-validate="یکبار رمز صحیح نمی باشد رمز پیامک شده به موبایلتان را وارد نمایید">
                                        <input className="LoginContainer__input" type="tel" name="otp"
                                               placeholder="(OTP) یکبار رمز"

                                               style={{paddingRight: '5rem'}}
                                               onChange={this._handleOTPChange}/>
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
                                                        <i className="fa fa-redo" aria-hidden="true"/>
                                                        : this.state.otpTimer)
                                                    :
                                                    ' ارسال پیامک '
                                            }
                                        </div>

                                    </div>

                                    <div className={"LoginContainer__inputContainer "}
                                         data-validate="رمز ورود فعلی صحیح نمی باشد">
                                        <input className="LoginContainer__input" type="password" name="pass"
                                               placeholder="رمز ورود فعلی"

                                               autocomplete="new-password"
                                               autoComplete="new-password"

                                               onKeyPress={this._handlePasswordKeyPress}

                                               onChange={this._handlePasswordChange}/>
                                        <span className="LoginContainer__inputFocus"></span>
                                        <span className="LoginContainer__inputSymbol">
							<i className="fa fa-lock" aria-hidden="true"></i>
						</span>
                                    </div>
                                    <div className={"LoginContainer__inputContainer "}
                                         data-validate="رمز ورود جدید صحیح نمی باشد">
                                        <input className="LoginContainer__input" type="password" name="pass1"
                                               placeholder="رمز ورود جدید"

                                               autocomplete="new-password"
                                               autoComplete="new-password"

                                               onKeyPress={this._handlePasswordKeyPress}

                                               onChange={this._handleNewPasswordChange}/>
                                        <span className="LoginContainer__inputFocus"></span>
                                        <span className="LoginContainer__inputSymbol">
							<i className="fa fa-lock" aria-hidden="true"></i>
						</span>
                                    </div>
                                    <div className={"LoginContainer__inputContainer "}
                                         data-validate="تکرار رمز ورود جدید صحیح نمی باشد">
                                        <input className="LoginContainer__input" type="password" name="pass2"
                                               placeholder="تکرار رمز ورود جدید"

                                               autocomplete="new-password"
                                               autoComplete="new-password"

                                               onKeyPress={this._handlePasswordKeyPress}

                                               onChange={this._handleRepeatPasswordChange}/>
                                        <span className="LoginContainer__inputFocus"></span>
                                        <span className="LoginContainer__inputSymbol">
							<i className="fa fa-lock" aria-hidden="true"></i>
						</span>
                                    </div>
                                </div>

                                {
                                    this.state.isCapsLockOn &&
                                    <div className={'LoginContainer__warning'}>
                                        Caps Lock روشن است
                                    </div>
                                }

                                <div className="mt-4">
                                    <Button outline onClick={this._handleOnSave}
                                            disabled={!this.isValid()}>
                                        <FontAwesome className={'ml-2'} name="save"/>
                                        تغییر رمزعبور
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </ModalBody>


                </Modal>

            </div>
        );
    }
}

export default ProfileDialog;
