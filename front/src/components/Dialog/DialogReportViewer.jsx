import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import "./Dialog.css";
import SystemClass from "../../SystemClass";
import Utils from "../../Utils";
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


const DialogReportViewer = forwardRef((props, ref) => {
  const [isShow, setIsShow] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scriptsLoaded, setScriptsLoaded] = useState({ report: false, viewer: false });

  const dataRef = useRef({ mrtFileUrl: null, formModel: null });

  const allScriptsLoaded = Object.values(scriptsLoaded).every(Boolean);

  useImperativeHandle(ref, () => ({
    showDialog: (mrtFileUrl, formModel) => {
      dataRef.current = { mrtFileUrl, formModel };
      setIsShow(true);
      setLoading(true);
    },
    hideDialog: () => {
      setIsShow(false);
    }
  }));

  const handleScriptLoad = (scriptName) => {
    setScriptsLoaded(prev => ({ ...prev, [scriptName]: true }));
  };

  const setReport = useCallback(() => {
    const { mrtFileUrl, formModel } = dataRef.current;
    if (!allScriptsLoaded || !mrtFileUrl || !formModel || !window.Stimulsoft) return;

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
    // ... ساخت دیتاست
    const dataSourceForDesigner = {};
    Object.keys(formModel.dataSources).forEach(dataSourceName => {
      const ds = formModel.dataSources[dataSourceName].dataArray;
      dataSourceForDesigner[dataSourceName] = JSON.parse(JSON.stringify(ds)).map((row) => {
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

    setLoading(false);
  }, [allScriptsLoaded]);

  useEffect(() => {
    if (isShow && allScriptsLoaded) {
      setReport();
    }
  }, [isShow, allScriptsLoaded, setReport]);

  return (
    <div className="dialog">
      {isShow && (
        <>
          <Script url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.reports.js`} onLoad={() => handleScriptLoad("report")} />
          {scriptsLoaded.report && (
            <Script url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.viewer.js?v=3`} onLoad={() => handleScriptLoad("viewer")} />
          )}
        </>
      )}
      <Modal size="xl" isOpen={isShow} modalClassName="scroll__container" className="dialog__container dialog__container--report">
        <ModalHeader>
          <div style={{ display: "flex", width: "100%" }}>
            <div style={{ flex: "1" }} />
            <Button className="Menu__icon dialog__closeIcon" outline color="light" onClick={() => setIsShow(false)}>
              <FontAwesome name="times-circle" />
            </Button>
          </div>
        </ModalHeader>
        <ModalBody style={{ padding: "0" }} className="dialog__body dialog__body--report">
          {loading && (
            <div>
              <ProgressBar />
              <h5 style={{ textAlign: "center", padding: "2rem" }}>در حال بارگذاری محیط نمایش گزارش</h5>
            </div>
          )}
          <div style={{ direction: "ltr", textAlign: "left", display: loading ? 'none' : 'block' }} id="reportViewer" />
        </ModalBody>
      </Modal>
    </div>
  );
});

export default DialogReportViewer;