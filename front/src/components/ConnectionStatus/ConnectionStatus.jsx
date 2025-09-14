import React, {Component, Fragment} from 'react';
import BaseComponent from "../BaseComponent";
import * as ReactDOM from "react-dom";
import Button from "reactstrap/es/Button";
import {UncontrolledTooltip} from "reactstrap";
import './ConnectionStatus.css';
import SystemClass from "../../SystemClass";
import FontAwesome from 'react-fontawesome';

class ConnectionStatus extends BaseComponent {

    constructor(props) {
        super(props);
        this.data = {
            enableOfflineMode: SystemClass.SystemConfig.offlineMode,
            online: true
        }

        SystemClass.ConnectionStatus = this

        this._handleWindowUpdateOnlineStatus = this._handleWindowUpdateOnlineStatus.bind(this)
    }

    setOfflineMode = (offlineMode) => {
        this.data.enableOfflineMode = offlineMode
        offlineMode && this._elementRemoveOfflineDialog()
    }

    componentDidMount() {
        window.addEventListener('online', this._handleWindowUpdateOnlineStatus)
        window.addEventListener('offline', this._handleWindowUpdateOnlineStatus)
        this.data._intervalId = setInterval(this._handleWindowUpdateOnlineStatus, 1000);
        this.data.node = ReactDOM.findDOMNode(this)
        this.forceUpdate()
    }

    componentWillUnmount() {
        window.removeEventListener('online', this._handleWindowUpdateOnlineStatus)
        window.removeEventListener('offline', this._handleWindowUpdateOnlineStatus)
        clearInterval(this.data._intervalId)
    }


    // region others

    //endregion


    //region events

    _handleWindowUpdateOnlineStatus(event, force) {
        if (force || (this.data.online != navigator.onLine)) {
            this.data.online = navigator.onLine
            this._elementSetOfflineDialog()
            this.forceUpdate()
        }
    }

    //endregion

    // region element


    _elementRemoveOfflineDialog = () => {
        let div = document.querySelector('#no-internet-panel');
        div && div.remove()
    }

    _elementSetOfflineDialog = () => {
        if (this.data.enableOfflineMode) {
            this._elementRemoveOfflineDialog()
            return
        }

        let div = document.querySelector('#no-internet-panel');
        if (this.data.online) {
            div && requestAnimationFrame(() => {
                div.style.display = 'none'
            })
            return
        }

        if (!div) {
            div = document.createElement('div');
            div.id = 'no-internet-panel';
            let style = div.style;
            style.position = 'fixed';
            style.right = '0';
            style.top = '0';
            style.left = '0';
            style.bottom = '0';
            style.zIndex = '10000000';
            style.textAlign = 'center';
            style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
            style.pointerEvents = 'all';

            const button = document.createElement('button');
            button.onclick = () => {
                this._handleWindowUpdateOnlineStatus(null, true)
            }
            button.className = "no-internet-panel__button";

            button.innerHTML = '<svg style="width:24px;height:24px; color:rgba(222, 222, 222, 1); margin-left: 8px" viewBox="0 0 24 24">\n' +
                '    <path fill="color" style="fill: currentColor" d="M19,12H22.32L17.37,16.95L12.42,12H16.97C17,10.46 16.42,8.93 15.24,7.75C12.9,5.41 9.1,5.41 6.76,7.75C4.42,10.09 4.42,13.9 6.76,16.24C8.6,18.08 11.36,18.47 13.58,17.41L15.05,18.88C12,20.69 8,20.29 5.34,17.65C2.22,14.53 2.23,9.47 5.35,6.35C8.5,3.22 13.53,3.21 16.66,6.34C18.22,7.9 19,9.95 19,12Z" />\n' +
                '</svg>';
            button.append('تلاش مجدد برای برقراری ارتباط');

            style = button.style;
            style.display = 'inline-flex';
            style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            style.border = 'none';
            style.outline = 'none';
            style.borderRadius = '4px';
            style.padding = '.5rem 1rem';
            style.color = 'rgba(222, 222, 222, 1)';
            style.cursor = 'pointer';


            let css = document.createElement('style');
            css.innerHTML = '@-webkit-keyframes sk-stretchdelay{0%,40%,100%{-webkit-transform:scaleY(0.4)}20%{-webkit-transform:scaleY(1)}}@keyframes sk-stretchdelay{0%,40%,100%{transform:scaleY(0.4);-webkit-transform:scaleY(0.4)}20%{transform:scaleY(1);-webkit-transform:scaleY(1)}}' +
                '.lb-spinner{margin:16px auto;width:50px;height:50px;text-align:center;font-size:14px}' +
                '.lb-spinner>div{background-color:#ccc;height:100%;width:6px;display:inline-block;-webkit-animation:sk-stretchdelay 1.2s infinite ease-in-out;animation:sk-stretchdelay 1.2s infinite ease-in-out}.lb-spinner>div.rect2{-webkit-animation-delay:-1.1s;animation-delay:-1.1s}.lb-spinner>div.rect3{-webkit-animation-delay:-1.0s;animation-delay:-1.0s}.lb-spinner>div.rect4{-webkit-animation-delay:-0.9s;animation-delay:-0.9s}.lb-spinner>div.rect5{-webkit-animation-delay:-0.8s;animation-delay:-0.8s}' +
                '.no-internet-panel__button:hover{background-color: rgba(0,0,0, 0.25) !important}';

            let loading = document.createElement('div');
            loading.className = "lb-spinner";
            loading.innerHTML =
                '<div class="rect1"></div>\n' +
                '<div class="rect2"></div>\n' +
                '<div class="rect3"></div>\n' +
                '<div class="rect4"></div>\n' +
                '<div class="rect5"></div>\n';

            let center = document.createElement('div');
            style = center.style;
            style.position = 'absolute';
            style.top = '50%';
            style.left = '50%';
            style.zIndex = '1';
            style.transform = 'translate(-50%,-50%)';

            let p = document.createElement('p');
            p.innerHTML = 'دسترسی به اینترنت وجود ندارد!';
            p.style.color = 'rgba(233, 233, 233, 1)';

            div.appendChild(css);
            center.appendChild(loading);
            center.appendChild(p);
            center.appendChild(button);
            div.appendChild(center);
            requestAnimationFrame(() => {
                document.documentElement.appendChild(div)
            })
        } else {
            requestAnimationFrame(() => {
                div.style.display = ''
            })
        }
    }

    // endregion element
    render() {
        const offline = !this.data.online
        let status = offline ? 'عدم اتصال به اینترنت !' : 'متصل به اینترنت'
        if (navigator.connection) {
            status += " و سرعت " + ({
                '3g': 'خوب',
                '4g': 'عالی'
            }[navigator.connection.effectiveType] || 'معمولی')
        }

        return (
            <div className={["ConnectionStatus"].filter(c => c).join(' ')}>
                <Button className={'Menu__icon ConnectionStatus__button'} outline color="light">
                    <FontAwesome
                        className={['ConnectionStatus__icon', offline
                        && 'ConnectionStatus__icon--offline'].filter(c => c).join(' ')}
                        name="signal"/>
                </Button>
                {
                    this.data.node &&
                    <UncontrolledTooltip target={this.data.node}>
                        {status}
                    </UncontrolledTooltip>
                }
            </div>
        );
    }
}

// (() => {
//     window.FarawinNet = function (toastFunction) {
//         window.FarawinNet.toastFunction = toastFunction;
//         window.addEventListener('load', function () {
//             window.addEventListener('online', window.FarawinNet.updateOnlineStatus);
//             window.addEventListener('offline', window.FarawinNet.updateOnlineStatus);
//         });
//         window.addEventListener('online', window.FarawinNet.updateOnlineStatus);
//         window.addEventListener('offline', window.FarawinNet.updateOnlineStatus);
//
//         setInterval(window.FarawinNet.updateOnlineStatus, 1500);
//     };
//
//     window.FarawinNet.setOffline = function () {
//         window.FarawinNet._isOffline = true;
//         var div = document.querySelector('#no-internet-panel');
//         if (!div) {
//             div = document.createElement('div');
//             div.id = 'no-internet-panel';
//             var style = div.style;
//             style.position = 'fixed';
//             style.right = '0';
//             style.top = '0';
//             style.left = '0';
//             style.bottom = '0';
//             style.zIndex = '10000000';
//             style.textAlign = 'center';
//             style.backgroundColor = 'rgba(0, 0, 0, 0.65)';
//             style.pointerEvents = 'all';
//
//             var button = document.createElement('button');
//             button.onclick = function () {
//                 window.FarawinNet.updateOnlineStatus();
//             };
//             button.className = "no-internet-panel__button";
//
//             button.innerHTML = '<svg style="width:24px;height:24px; color:rgba(222, 222, 222, 1); margin-left: 8px" viewBox="0 0 24 24">\n' +
//                 '    <path fill="color" style="fill: currentColor" d="M19,12H22.32L17.37,16.95L12.42,12H16.97C17,10.46 16.42,8.93 15.24,7.75C12.9,5.41 9.1,5.41 6.76,7.75C4.42,10.09 4.42,13.9 6.76,16.24C8.6,18.08 11.36,18.47 13.58,17.41L15.05,18.88C12,20.69 8,20.29 5.34,17.65C2.22,14.53 2.23,9.47 5.35,6.35C8.5,3.22 13.53,3.21 16.66,6.34C18.22,7.9 19,9.95 19,12Z" />\n' +
//                 '</svg>';
//             button.append('تلاش مجدد برای برقراری ارتباط');
//
//             style = button.style;
//             style.display = 'inline-flex';
//             style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
//             style.border = 'none';
//             style.outline = 'none';
//             style.borderRadius = '4px';
//             style.padding = '8px';
//             style.color = 'rgba(222, 222, 222, 1)';
//
//
//             var css = document.createElement('style');
//             css.innerHTML = '@-webkit-keyframes sk-stretchdelay{0%,40%,100%{-webkit-transform:scaleY(0.4)}20%{-webkit-transform:scaleY(1)}}@keyframes sk-stretchdelay{0%,40%,100%{transform:scaleY(0.4);-webkit-transform:scaleY(0.4)}20%{transform:scaleY(1);-webkit-transform:scaleY(1)}}' +
//                 '.lb-spinner{margin:16px auto;width:50px;height:50px;text-align:center;font-size:14px}' +
//                 '.lb-spinner>div{background-color:#ccc;height:100%;width:6px;display:inline-block;-webkit-animation:sk-stretchdelay 1.2s infinite ease-in-out;animation:sk-stretchdelay 1.2s infinite ease-in-out}.lb-spinner>div.rect2{-webkit-animation-delay:-1.1s;animation-delay:-1.1s}.lb-spinner>div.rect3{-webkit-animation-delay:-1.0s;animation-delay:-1.0s}.lb-spinner>div.rect4{-webkit-animation-delay:-0.9s;animation-delay:-0.9s}.lb-spinner>div.rect5{-webkit-animation-delay:-0.8s;animation-delay:-0.8s}' +
//                 '.no-internet-panel__button:hover{background-color: rgba(0,0,0, 0.25) !important}';
//
//             var loading = document.createElement('div');
//             loading.className = "lb-spinner";
//             loading.innerHTML =
//                 '<div class="rect1"></div>\n' +
//                 '<div class="rect2"></div>\n' +
//                 '<div class="rect3"></div>\n' +
//                 '<div class="rect4"></div>\n' +
//                 '<div class="rect5"></div>\n';
//
//             var center = document.createElement('div');
//             style = center.style;
//             style.position = 'absolute';
//             style.top = '50%';
//             style.left = '50%';
//             style.zIndex = '1';
//             style.transform = 'translate(-50%,-50%)';
//
//             var p = document.createElement('p');
//             p.innerHTML = 'دسترسی به اینترنت وجود ندارد!';
//             p.style.color = 'rgba(233, 233, 233, 1)';
//
//             div.appendChild(css);
//             center.appendChild(loading);
//             center.appendChild(p);
//             center.appendChild(button);
//             div.appendChild(center);
//             document.documentElement.appendChild(div);
//         } else {
//             div.style.display = '';
//         }
//
//     };
//
//     window.FarawinNet.setOnline = function () {
//         window.FarawinNet._isOffline = false;
//         var div = document.querySelector('#no-internet-panel');
//         if (div) {
//             div.style.display = 'none';
//         }
//     };
//
//     window.FarawinNet.updateOnlineStatus = function () {
//         if (navigator.onLine) {
//             window.FarawinNet.setOnline();
//             if (window.FarawinNet.toastFunction.toastSuccess && window.FarawinNet._isOffline)
//                 window.FarawinNet.toastFunction.toastSuccess();
//
//         } else {
//             window.FarawinNet.setOffline();
//             if (window.FarawinNet.toastFunction.toastError && !window.FarawinNet._isOffline)
//                 window.FarawinNet.toastFunction.toastError();
//         }
//     };
//
// })();

export default ConnectionStatus;
