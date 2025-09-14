import React, { Component } from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

import "./Dialog.css";
import BaseComponent from "../BaseComponent";
import Class_Base from "../../class/Class_Base";
import SystemClass from "../../SystemClass";
import Utils from "../../Utils";
import FormInfo from "../FormInfo/FormInfo";
import FieldInfo from "../../class/FieldInfo";
import {
  conditionallyUpdateScrollbar,
  setScrollbarWidth,
} from "reactstrap/es/utils";
import FontAwesome from "react-fontawesome";
import Script from "react-load-script";

import "../StimulSoftReport/Themes/stimulsoft.designer.office2013.whiteblue.css";
import "../StimulSoftReport/Themes/stimulsoft.viewer.office2013.whiteblue.css";
import ProgressBar from "../ProgressBar/ProgressBar";

import Vazir from "../../content/fonts/Vazir-Bold-FD.woff";
import Nahid from "../../content/fonts/Nahid-FD.woff";
import IRANSansWeb from "../../content/IRANSans/Farsi_numerals/webFonts/fonts/woff/IRANSansWeb(FaNum).woff";

import B_Titr from "../../content/fonts/report/B Titr Bold.TTF";
import B_Traffic from "../../content/fonts/report/B Traffic.TTF";
import B_Homa from "../../content/fonts/report/B Homa.TTF";
import B_Koodak from "../../content/fonts/report/B Koodak Outline.TTF";
import B_Roya from "../../content/fonts/report/B Roya.TTF";
import B_Yekan from "../../content/fonts/report/B Yekan.TTF";
import B_Zar from "../../content/fonts/report/B Zar.TTF";
import B_Kamran from "../../content/fonts/report/B Kamran.TTF";
import B_Nazanin from "../../content/fonts/report/B Nazanin.TTF";
import WebService from "../../WebService";

class DialogReportViewer extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };

    this.data = {
      loaded: {
        report: false,
        viewer: false,
      },

      mrtFileUrl: null,
      formModel: null,
    };

    SystemClass.DialogReportViewerContainer = this;
    SystemClass.browserHistory.listen((location, action, sd) => {
      console.log(action, location.pathname, location.state);
      if (action === "POP") {
        //close this
      }
    });
  }

  //endregion

  _loadScript = (script) => {
    this.data.loaded[script] = true;

    //find any false
    this.state.loaded =
      Object.values(this.data.loaded).findIndex((s) => !s) == -1;

    this.forceUpdate();

    if (this.state.loaded) {
      this._onLoad();
    }
  };

  _onLoad = () => {
    // load it
    this.state.loading = false;
    this._setReport();

    this.forceUpdate();
  };

  _setReport = () => {
    this._setDesigner(this.data.mrtFileUrl, this.data.formModel);
  };

  //region events
  _handleOnDialogKeyPress = (event) => {
    if (event.keyCode === 27 && !SystemClass.loading) {
      //Do whatever when esc is pressed
      //close this
    }
  };

  _setDesigner = (mrtFileUrl, formModel) => {
    const Stimulsoft = window.Stimulsoft;
    Stimulsoft.Base.StiLicense.key =
      "6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkcgIvwL0jnpsDqRpWg5FI5kt2G7A0tYIcUygBh1sPs7plofUOqPB1a4HBIXJB621mau2oiAIj+ysU7gKUXfjn/D5BocmduNB+ZMiDGPxFrAp3PoD0nYNkkWh8r7gBZ1v/JZSXGE3bQDrCQCNSy6mgby+iFAMV8/PuZ1z77U+Xz3fkpbm6MYQXYp3cQooLGLUti7k1TFWrnawT0iEEDJ2iRcU9wLqn2g9UiWesEZtKwI/UmEI2T7nv5NbgV+CHguu6QU4WWzFpIgW+3LUnKCT/vCDY+ymzgycw9A9+HFSzARiPzgOaAuQYrFDpzhXV+ZeX31AxWlnzjDWqpfluygSNPtGul5gyNt2CEoJD1Yom0VN9fvRonYsMsimkFFx2AwyVpPcs+JfVBtpPbTcZscnzUdmiIvxv8Gcin6sNSibM6in/uUKFt3bVgW/XeMYa7MLGF53kvBSwi78poUDigA2n12SmghLR0AHxyEDIgZGOTbNI33GWu7ZsPBeUdGu55R8w=";

    Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(Vazir, "Vazir-FD");
    Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(Nahid, "Nahid-FD");
    Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(
      IRANSansWeb,
      "IRANSansWeb(FaNum)"
    );

    const fonts = [
      IRANSansWeb,
      B_Titr,
      B_Traffic,
      B_Homa,
      B_Koodak,
      B_Roya,
      B_Yekan,
      B_Zar,
      B_Kamran,
      B_Nazanin,
    ];

    fonts.forEach((font) =>
      Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(font)
    );

    const report = new Stimulsoft.Report.StiReport();
    report.loadFile(mrtFileUrl);

    // report.dictionary.databases.clear();

    const dataSourceForDesigner = {};

    Object.keys(formModel.dataSources).forEach((dataSourceName) => {
      //const dataSet = new Stimulsoft.System.Data.DataSet(dataSourceName);

      //remove object from data source
      const ds = formModel.dataSources[dataSourceName].dataArray;
      const designerDataSource = JSON.parse(JSON.stringify(ds)).map((row) => {
        Object.keys(row).forEach((key) => {
          if (typeof row[key] === "string") {
            const msg = row[key];
            row[key] = msg.replace(/!@#/g, "\n").replace(/\(\(.*?\)\)/g, "");
          }

          if (Array.isArray(row[key]) || Utils.isObject(row[key])) {
            row[key] = undefined;
          }
        });

        return row;
      });

      dataSourceForDesigner[dataSourceName] = designerDataSource;

      //dataSet.readJson({[dataSet.dataSetName]: designerDataSource});
      //report.regData(dataSet.dataSetName, "", dataSet);
    });

    const dataSet = new Stimulsoft.System.Data.DataSet("jsonDataSource");
    dataSet.readJson(dataSourceForDesigner);
    report.regData(dataSet.dataSetName, "", dataSet);

    report.dictionary.synchronize();

    const options = new window.Stimulsoft.Viewer.StiViewerOptions();
    options.height = "100%";
    options.appearance.scrollbarsMode = true;
    options.toolbar.showDesignButton = true;
    options.toolbar.printDestination =
      window.Stimulsoft.Viewer.StiPrintDestination.Direct;
    options.appearance.htmlRenderMode =
      window.Stimulsoft.Report.Export.StiHtmlExportMode.Table;

    const viewer = new Stimulsoft.Viewer.StiViewer(null, "StiViewer", false);

    viewer.report = report;
    viewer.renderHtml("reportViewer");
  };

  showDialog = (mrtFileUrl, formModel) => {
    this.data.mrtFileUrl = mrtFileUrl;
    this.data.formModel = formModel;

    this.state.isShow = true;
    this.forceUpdate();
  };

  hideDialog = () => {
    this.state.isShow = false;
    this.forceUpdate();
  };

  _handleOnDialogClose = () => {};
  // region element

  // endregion element
  render() {
    //
    // const style = {
    //     width: width && width + 'px',
    //     maxWidth: width && width + 'px',
    //     //TODO CHECK
    //     height2: modelItem.formFieldInfo.defaultHeightInPixel + 'px',
    //     marginRight: width && 'auto',
    //     marginLeft: width && 'auto',
    //     marginTop: modelIndex === 0 ? '' : (2.5 + (modelIndex * 3)) + 'rem'
    // }
    //

    const state = this.state;

    return (
      <div
        id="DialogContainer"
        className={["dialog"].filter((c) => c).join(" ")}
        onKeyDown={this._handleOnDialogKeyPress}
      >
        <Modal
          size="xl"
          isOpen={state.isShow}
          modalClassName={"scroll__container"}
          className={["dialog__container", "dialog__container--report"]
            .filter((c) => c)
            .join(" ")}
          onClosed={this._handleOnDialogClose.bind(this)}
          key={"1"}
          centered={false}
        >
          <div>
            <Script
              url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.reports.js`} /* http://mapsun-futech.ir:80 */
              onLoad={this._loadScript.bind(this, "report")}
            />

            {this.data.loaded.report && (
              <Script
                url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.viewer.js?v=3`} /* http://mapsun-futech.ir:80 */
                onLoad={this._loadScript.bind(this, "viewer")}
              />
            )}
          </div>

          <ModalHeader>
            <div style={{ display: "flex", width: "100%" }}>
              <span />

              <div style={{ flex: "1", width: "100%" }} />

              <Button
                className={"Menu__icon dialog__closeIcon"}
                outline
                color="light"
                onClick={this.hideDialog.bind(this)}
              >
                <FontAwesome className={""} name="times-circle" />
              </Button>
            </div>
          </ModalHeader>

          <ModalBody
            style={{ padding: "0" }}
            className={["dialog__body", "dialog__body--report"]
              .filter((c) => c)
              .join(" ")}
          >
            {this.state.loading && (
              <div>
                <ProgressBar />
                <h5 style={{ textAlign: "center", padding: "2rem" }}>
                  {" "}
                  در حال بارگذاری محیط نمایش گزارش{" "}
                </h5>
              </div>
            )}

            <div
              style={{ direction: "ltr", textAlign: "left" }}
              id={"reportViewer"}
            />
          </ModalBody>
        </Modal>
      </div>
    );
  }
}

export default DialogReportViewer;
