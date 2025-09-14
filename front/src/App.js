import React, { Component, Fragment } from "react";

import CSSImporter from "./CSSImporter";
import { toast, ToastContainer } from "react-toastify";
import SystemClass from "./SystemClass";
import Dialog from "./components/Dialog/Dialog";

import Menu from "./components/Menu/Menu";
import Logger from "./Logger";
import WebService from "./WebService";
import UiSetting from "./UiSetting";
import { Route, Router, Switch, Redirect } from "react-router-dom";
import "./components/Component.css";
import FormContainer from "./components/FormContainer";
import FrameContainer from "./components/FrameContainer";
import ErrorContainer from "./components/ErrorContainer";
import HomeContainer from "./components/HomeContainer";
import LoadingContainer from "./components/LoadingContainer";
import LoginContainer from "./pages/Login/LoginContainer";
import ProfileDialog from "./components/ProfileDialog/ProfileDialog";
import DialogConfirm from "./components/Dialog/DialogConfirm";
// import ProgressBar from "./components/ProgressBar/ProgressBar";
// import FormInfo from "./components/FormInfo/FormInfo";
// import LanguageSwitcher from "./components/LanguageSwitcher";
// import vanillaTilt from "vanilla-tilt";
// import { Popup } from "semantic-ui-react";
// import Button from "semantic-ui-react/dist/commonjs/elements/Button";
// import CryptoUtils from "./file/CryptoUtils";
// import TestContainer from "./pages/Test/TestContainer";

import nodeRsa from "node-rsa";
import cryptoJs from "crypto-js";
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";
import ReportDesignerContainer from "./components/StimulSoftReport/ReportDesignerContainer";
import DialogReportDesigner from "./components/Dialog/DialogReportDesigner";
import DialogReportViewer from "./components/Dialog/DialogReportViewer";

import Home from "./pages/Home/Home";

// import StimulSoftReportViewer from "./components/StimulSoftReport/StimulSoftReport";

//https://www.npmjs.com/package/react-toastify
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loaded: true, //TODO
      value: "",
      error: "",
      isLtr: false,
      showCustomLoading: false,
    };

    this.data = {
      frameUrl: "",
      _router: "",
    };

    //default Direction
    this.pageDirection = UiSetting.GetSetting("DefaultPageDirection");

    CSSImporter.init();
    //test
    // const componentName = window.location.search.substr(1).split("&")[0]
    // Test[componentName] && Test[componentName]()
    //
    // Test.Datepicker()
    SystemClass.AppComponent = this;
    window.SystemClass = SystemClass;
    window.systemClass = SystemClass;

    window.WebService = WebService;

    window.nodeRsa = nodeRsa;
    window.cryptoJs = cryptoJs;

    //window.sessionStorage._userInfo = ''
    //window.sessionStorage._userInfoExpire = ''

    Logger.getUserAgain();
    Logger.getSystemInfo();
  }

  setShowCustomLoading = (show) => {
    this.setState({ showCustomLoading: show });
  };

  _setLoaded = (loaded) => {
    if (this.state.loaded == loaded) return;
    this.state.loaded = loaded;
    this.forceUpdate();
  };

  _setLoading = (loading) => {
    if (this.state.loaded == loading) return;

    this.state.loaded = loading;
    if (!this.state.loaded && !toast.isActive("loading")) {
      toast("درحال بارگذاری سایت...", {
        autoClose: 3000,
        toastId: "loading",
      });
    }

    // console.log(this.state.loaded, toast.isActive("loading"));
    if (toast.isActive("loading") && this.state.loaded) {
      toast.update("loading", {
        type: toast.TYPE.SUCCESS,
        autoClose: 1500,
        render: "بارگذاری کامل شد",
      });
    }

    this.forceUpdate();
  };

  componentDidMount() {
    // this._setLoaded(false)
    // SystemClass.checkFirstTimeLogin().finally(i => this._setLoaded(true))
  }

  update() {
    this.data._router = null;
    this.setSiteLangueage(UiSetting.GetSetting("language"));
    this.forceUpdate();
  }

  //error handling
  componentDidCatch(error, info) {
    Logger.log("error", {
      error: error.toString(),
      componentStack: info.componentStack,
    });
    // Display fallback UI
    this.setState({ error: error });
    // You can also log the error to an error reporting service
    if (Logger.isLogEnable) {
      const reload = window.confirm(
        "خطایی رخ داد! بارگذاری مجدد؟\n " + error + info.componentStack
      );
      reload && window.location.reload();
    }
  }

  setSiteLangueage = (lang) => {
    // console.log(lang);
    const viewportWidth = window.innerWidth;

    //change font size based on viewport width in order to prevent zoom on mobile devices by RezaRad
    if (viewportWidth < 480) {
      document.querySelector("html").style.fontSize = "16px";
    } else {
      document.querySelector("html").style.fontSize = "14px";
    }

    this.setState({ isLtr: lang === "en" ? true : false });
    this.pageDirection = lang === "en" ? "ltr" : "rtl";
    document.querySelector("html").setAttribute("dir", this.pageDirection);
    document.querySelector("html").setAttribute("lang", lang);
    document
      .querySelector("body")
      .setAttribute("direction", this.pageDirection);
    document.querySelector("body").style.fontFamily =
      UiSetting.GetSetting("DefaultPageDirection") === "ltr"
        ? "TitilliumWeb"
        : "IRANSans";
    // console.log(this.state.isLtr, this.pageDirection);
  };

  //routes must declare in web.config
  /*
        <rule name="DynamicContent1">
        <conditions>
        <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True" />
              </conditions>
              
              
              <match url="auth*" />
              <action type="Rewrite" url="index.html" />
              </rule>
    */

  _elementGetRouter = () => {
    return (this.data._router = this.data._router || (
      <>
        <Router history={SystemClass.getBrowserHistory()}>
          <Switch>
            {/*<Route path="/test" component={StimulSoftReportViewer}>*/}
            {/*</Route>*/}

            {/*<Route exact path="/" component={Redirect} loc={window.location.origin}>*/}
            {/*</Route>*/}

            <Route exact path="/" component={Home} />

            {/* <Route path="/auth/login" component={LoginContainer} /> */}
            <Route
              path="/auth/login"
              render={(props) => (
                <LoginContainer
                  {...props}
                  onChangeLang={(lang) => this.setSiteLangueage(lang)}
                />
              )}
            />

            <Route path="/auth/forgetPassword" component={ForgetPassword} />

            <Route>
              <Fragment>
                <Menu />

                {SystemClass.MenuComponent &&
                  SystemClass.MenuComponent.state.loaded && (
                    <Switch>
                      <Route exact path="/form" component={HomeContainer} />

                      <Route
                        strict={true}
                        path="/report/designer/:reportId?"
                        component={ReportDesignerContainer}
                      />

                      <Route
                        strict={true}
                        path="/form/:formId/:dialogFormId?"
                        render={(props) => (
                          <>
                            <div
                              // style={{
                              //   backgroundImage: `url(${WebService.URL
                              //     .webService_baseAddress +
                              //     "images/background_main.jpg"})`,
                              // }}
                              id="background_main"
                              className={"background_main"}
                            />

                            <FormContainer {...props} />

                            <Dialog className={"scroll__container"} />
                            <DialogReportDesigner />
                            <DialogReportViewer />

                            <DialogConfirm />

                            <ProfileDialog />

                            {/*<Report />*/}
                          </>
                        )}
                      />

                      <Route
                        path="/frame/:frameUrl"
                        component={FrameContainer}
                      />
                      {/*<Route path="/error/:error" component={ErrorContainer}/>*/}
                      <Route component={ErrorContainer} />
                    </Switch>
                  )}
              </Fragment>
            </Route>
          </Switch>
        </Router>
      </>
    ));
  };

  render() {
    if (!this.state.loaded) return null;

    let toastBodyClasses = "toast-scroll ";
    toastBodyClasses += this.pageDirection === "rtl" ? "toast-rtl" : "";

    return (
      <div className="App">
        {this._elementGetRouter()}

        <ToastContainer
          style={{ TOP_RIGHT: "1em" }}
          closeButton={false}
          rtl={true}
          autoClose={3000}
          pauseOnHover={true}
          hideProgressBar={false}
          closeOnClick
          bodyClassName={toastBodyClasses}
        />
        <LoadingContainer showCustomLoading={this.state.showCustomLoading}/>
      </div>
    );
  }
}

export default App;
