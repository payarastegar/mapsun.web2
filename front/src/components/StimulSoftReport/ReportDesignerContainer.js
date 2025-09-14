import React, { Component, Fragment, PureComponent } from "react";
import BaseComponent from "../BaseComponent";
import SystemClass from "../../SystemClass";
import FontAwesome from "react-fontawesome";
import { Button } from "reactstrap";

import Script from "react-load-script";

import "./Themes/stimulsoft.designer.office2013.whiteblue.css";
import "./Themes/stimulsoft.viewer.office2013.whiteblue.css";
import WebService from "../../WebService";

class ReportDesignerContainer extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
    };

    this.data = {
      loaded: {
        report: false,
        viewer: false,
        designer: false,
      },
    };

    SystemClass.ReportDesignerContainer = this;
    this.initialize();
  }

  initialize = async () => {};

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    console.log(error);
    return { hasError: true };
  }

  _handleReloadClick = (event) => {
    this.initialize();
  };

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !SystemClass.loading &&
      SystemClass.FormContainer &&
      (nextProps.location.state.reload ||
        nextProps.match.params.formId !== SystemClass.FormContainer.data.formId)
    ) {
      nextProps.location.state.reload = false;
      SystemClass.FormContainer.data.formId = nextProps.match.params.formId;
      SystemClass.FormContainer.initialize();

      return {
        hasError: false,
        loaded: false,
      };
    }
    return null;
  }

  _loadScript = (script) => {
    this.data.loaded[script] = true;

    //find any false
    this.state.loaded =
      Object.values(this.data.loaded).findIndex((s) => !s) == -1;

    this.forceUpdate();

    if (this.state.loaded) {
      this._setReport();
    }
  };

  _setReport = () => {
    const Stimulsoft = window.Stimulsoft;
    Stimulsoft.Base.StiLicense.key =
      "6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkcgIvwL0jnpsDqRpWg5FI5kt2G7A0tYIcUygBh1sPs7plofUOqPB1a4HBIXJB621mau2oiAIj+ysU7gKUXfjn/D5BocmduNB+ZMiDGPxFrAp3PoD0nYNkkWh8r7gBZ1v/JZSXGE3bQDrCQCNSy6mgby+iFAMV8/PuZ1z77U+Xz3fkpbm6MYQXYp3cQooLGLUti7k1TFWrnawT0iEEDJ2iRcU9wLqn2g9UiWesEZtKwI/UmEI2T7nv5NbgV+CHguu6QU4WWzFpIgW+3LUnKCT/vCDY+ymzgycw9A9+HFSzARiPzgOaAuQYrFDpzhXV+ZeX31AxWlnzjDWqpfluygSNPtGul5gyNt2CEoJD1Yom0VN9fvRonYsMsimkFFx2AwyVpPcs+JfVBtpPbTcZscnzUdmiIvxv8Gcin6sNSibM6in/uUKFt3bVgW/XeMYa7MLGF53kvBSwi78poUDigA2n12SmghLR0AHxyEDIgZGOTbNI33GWu7ZsPBeUdGu55R8w=";

    var options = new Stimulsoft.Designer.StiDesignerOptions();
    // options.appearance.fullScreenMode = false;
    // options.appearance.htmlRenderMode = Stimulsoft.Report.Export.StiHtmlExportMode.Table;

    // Create an instance of the designer
    let designer = new Stimulsoft.Designer.StiDesigner(
      options,
      "StiDesigner",
      false
    );

    // Add the exit menu item event
    designer.onExit = function(e) {
      // this.visible = false;
      // viewer.visible = true;
    };

    designer.renderHtml("designer");
  };

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
            خطایی روی داده است!
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
            بارگذاری مجدد
          </Button>
        </div>
      );
    }

    return (
      <div>
        <Script
          url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.reports.js`} /* http://mapsun-futech.ir:80 */
          onLoad={this._loadScript.bind(this, "report")}
        />

        {this.data.loaded.report && (
          <Script
            url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.viewer.js?v=3`}  /* http://mapsun-futech.ir:80 */
            onLoad={this._loadScript.bind(this, "viewer")}
          />
        )}

        {this.data.loaded.viewer && (
          <Script
            url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.designer.js`} /* http://mapsun-futech.ir:80 */
            onLoad={this._loadScript.bind(this, "designer")}
          />
        )}

        <div id="designer" style={{ direction: "ltr" }} />
      </div>
    );
  }
}

export default ReportDesignerContainer;
