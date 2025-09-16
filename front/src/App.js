import React, { Fragment, useState, useEffect, useRef } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import CSSImporter from "./CSSImporter";
import SystemClass from "./SystemClass";
import Logger from "./Logger";
import WebService from "./WebService";
import UiSetting, { isLocalInternet_Front } from "./UiSetting";

// Import components
import Menu from "./components/Menu/Menu";
import FormContainer from "./components/FormContainer";
import FrameContainer from "./components/FrameContainer";
import ErrorContainer from "./components/ErrorContainer";
import HomeContainer from "./components/HomeContainer";
import LoadingContainer from "./components/LoadingContainer";
import ErrorBoundary from "./components/ErrorBoundary";
import ProfileDialog from "./components/ProfileDialog/ProfileDialog";

// Import functional Dialog components
import Dialog from "./components/Dialog/Dialog";
import DialogConfirm from "./components/Dialog/DialogConfirm";
import ReportDesignerContainer from "./components/StimulSoftReport/ReportDesignerContainer";
import DialogReportDesigner from "./components/Dialog/DialogReportDesigner";
import DialogReportViewer from "./components/Dialog/DialogReportViewer";

import RouteChangeListener from "./components/RouteChangeListener";

// Import pages
import LoginContainer from "./pages/Login/LoginContainer";
import ForgetPassword from "./pages/ForgetPassword/ForgetPassword";
import Home from "./pages/Home/Home";

// Import global CSS
import "./components/Component.css";

// Import libraries for global access
import nodeRsa from "node-rsa";
import cryptoJs from "crypto-js";

// Initialize system-wide settings
CSSImporter.init();

function App() {
  // State management using useState hook
  const [isLtr, setIsLtr] = useState(false);

  // Create refs for dialog components to be accessed globally via SystemClass
  const dialogRef = useRef(null);
  const dialogConfirmRef = useRef(null);
  const dialogReportDesignerRef = useRef(null);
  const dialogReportViewerRef = useRef(null);
  const profileDialogRef = useRef(null); // Ref for ProfileDialog as well
  // const formContainerRef = useRef(null);
  const loadingContainerRef = useRef(null);

  // This effect runs once after the initial render, similar to componentDidMount
  useEffect(() => {
    // Make libraries globally accessible if needed
    window.SystemClass = SystemClass;
    window.WebService = WebService;
    window.nodeRsa = nodeRsa;
    window.cryptoJs = cryptoJs;

    // Connect refs to SystemClass so other parts of the app can call their methods
    SystemClass.DialogComponent = dialogRef.current;
    SystemClass.confirmDialogComponent = dialogConfirmRef.current;
    SystemClass.DialogReportDesignerContainer = dialogReportDesignerRef.current;
    SystemClass.DialogReportViewerContainer = dialogReportViewerRef.current;
    SystemClass.ProfileDialog = profileDialogRef.current;
    // SystemClass.FormContainer = formContainerRef.current;

    // Provide a way for SystemClass to interact with the App component's state
    SystemClass.AppComponent = loadingContainerRef.current;

    // Set initial language and direction
    setSiteLanguage(UiSetting.GetSetting("language"));

    // Log user and system info
    Logger.getUserAgain();
    Logger.getSystemInfo();

    if (!isLocalInternet_Front) {
      if (!document.getElementById('pushe-web-script')) {
        const script = document.createElement("script");
        script.id = 'pushe-web-script'; 
        script.src = "https://static.pushe.co/pusheweb.js";
        script.async = true; 
        document.body.appendChild(script);
      }
    } 

  }, []); // Empty dependency array ensures this runs only once

  const setSiteLanguage = (lang) => {
    const viewportWidth = window.innerWidth;
    if (viewportWidth < 480) {
      document.querySelector("html").style.fontSize = "16px";
    } else {
      document.querySelector("html").style.fontSize = "14px";
    }

    const direction = lang === "en" ? "ltr" : "rtl";
    setIsLtr(lang === "en");

    document.querySelector("html").setAttribute("dir", direction);
    document.querySelector("html").setAttribute("lang", lang);
    document.querySelector("body").setAttribute("direction", direction);
    document.querySelector("body").style.fontFamily =
      direction === "ltr" ? "TitilliumWeb" : "IRANSans";
  };

  // A layout component for pages that include the main menu and dialogs
  const LayoutWithMenu = ({ children }) => (
    <Fragment>
      <Menu />
      <div id="background_main" className={"background_main"} />
      {children}
      {/* Render all dialogs here and pass their refs */}
      <Dialog ref={dialogRef} />
      <DialogReportDesigner ref={dialogReportDesignerRef} />
      <DialogReportViewer ref={dialogReportViewerRef} />
      <DialogConfirm ref={dialogConfirmRef} />
      <ProfileDialog ref={profileDialogRef} />
    </Fragment>
  );

  const toastBodyClasses = `toast-scroll ${!isLtr ? "toast-rtl" : ""}`;

  return (
    <div className="App">
      <BrowserRouter>
        <RouteChangeListener />
        <ErrorBoundary>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route
              path="/auth/login"
              element={<LoginContainer onChangeLang={setSiteLanguage} />}
            />
            <Route path="/auth/forgetPassword" element={<ForgetPassword />} />

            {/* Protected Routes with Layout */}
            <Route
              path="/form"
              element={
                <LayoutWithMenu>
                  <HomeContainer />
                </LayoutWithMenu>
              }
            />
            <Route
              path="/report/designer/:reportId?"
              element={
                <LayoutWithMenu>
                  <ReportDesignerContainer />
                </LayoutWithMenu>
              }
            />
            <Route
              path="/form/:formId/:dialogFormId?"
              element={
                <LayoutWithMenu>
                  {/* Ensure FormContainer is rendered */}
                  <FormContainer />
                </LayoutWithMenu>
              }
            />
            <Route
              path="/frame/:frameUrl"
              element={
                <LayoutWithMenu>
                  <FrameContainer />
                </LayoutWithMenu>
              }
            />

            {/* Catch-all route for 404 pages */}
            <Route
              path="*"
              element={
                <LayoutWithMenu>
                  <ErrorContainer />
                </LayoutWithMenu>
              }
            />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>

      <ToastContainer
        // style={{ top: "1em" }}
        closeButton={false}
        rtl={!isLtr}
        autoClose={3000}
        pauseOnHover={true}
        hideProgressBar={false}
        closeOnClick
        bodyClassName={toastBodyClasses}
      />
      <LoadingContainer ref={loadingContainerRef} />
    </div>
  );
}

export default App;
