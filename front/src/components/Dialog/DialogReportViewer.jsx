import React, { useState, useEffect, useImperativeHandle, forwardRef, useCallback, useRef } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import Script from "react-load-script";
import FontAwesome from "react-fontawesome";

import SystemClass from "../../SystemClass";
import Utils from "../../Utils";
import WebService from "../../WebService";
import ProgressBar from "../ProgressBar/ProgressBar";

// Import CSS
import "./Dialog.css";
import "../StimulSoftReport/Themes/stimulsoft.designer.office2013.whiteblue.css";
import "../StimulSoftReport/Themes/stimulsoft.viewer.office2013.whiteblue.css";

// Import Fonts
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

const DialogReportViewer = forwardRef((props, ref) => {
    const [isShow, setIsShow] = useState(false);
    const [loading, setLoading] = useState(true);
    // Viewer فقط به دو اسکریپت نیاز دارد
    const [scriptsLoaded, setScriptsLoaded] = useState({
        report: false,
        viewer: false,
    });
    const dataRef = useRef({ mrtFileUrl: null, formModel: null });
    const allScriptsLoaded = Object.values(scriptsLoaded).every(Boolean);

    const dialogInstance = {
        showDialog: (mrtFileUrl, formModel) => {
            dataRef.current = { mrtFileUrl, formModel };
            setIsShow(true);
            setLoading(true);
        },
        hideDialog: () => {
            setIsShow(false);
        },
    };

    useImperativeHandle(ref, () => dialogInstance, []);

    // اتصال به SystemClass
    useEffect(() => {
        SystemClass.DialogReportViewerContainer = dialogInstance;
        return () => {
            SystemClass.DialogReportViewerContainer = null;
        };
    }, [dialogInstance]);

    // مدیریت کلید Escape (مانند دیزاینر)
    const handleKeyPress = useCallback((event) => {
        if (event.keyCode === 27 && !SystemClass.loading) {
            dialogInstance.hideDialog();
        }
    }, [dialogInstance]);

    useEffect(() => {
        if (isShow) {
            document.addEventListener("keydown", handleKeyPress);
        }
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [isShow, handleKeyPress]);

    const handleScriptLoad = (scriptName) => {
        setScriptsLoaded((prev) => ({ ...prev, [scriptName]: true }));
    };
    
    // تابع اصلی برای ساخت Viewer
    const initializeViewer = useCallback(() => {
        const { mrtFileUrl, formModel } = dataRef.current;
        if (!allScriptsLoaded || !mrtFileUrl || !formModel || !window.Stimulsoft) {
            return;
        }

        const Stimulsoft = window.Stimulsoft;
        Stimulsoft.Base.StiLicense.key = "6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkcgIvwL0jnpsDqRpWg5FI5kt2G7A0tYIcUygBh1sPs7plofUOqPB1a4HBIXJB621mau2oiAIj+ysU7gKUXfjn/D5BocmduNB+ZMiDGPxFrAp3PoD0nYNkkWh8r7gBZ1v/JZSXGE3bQDrCQCNSy6mgby+iFAMV8/PuZ1z77U+Xz3fkpbm6MYQXYp3cQooLGLUti7k1TFWrnawT0iEEDJ2iRcU9wLqn2g9UiWesEZtKwI/UmEI2T7nv5NbgV+CHguu6QU4WWzFpIgW+3LUnKCT/vCDY+ymzgycw9A9+HFSzARiPzgOaAuQYrFDpzhXV+ZeX31AxWlnzjDWqpfluygSNPtGul5gyNt2CEoJD1Yom0VN9fvRonYsMsimkFFx2AwyVpPcs+JfVBtpPbTcZscnzUdmiIvxv8Gcin6sNSibM6in/uUKFt3bVgW/XeMYa7MLGF53kvBSwi78poUDigA2n12SmghLR0AHxyEDIgZGOTbNI33GWu7ZsPBeUdGu55R8w=";

        // ... بارگذاری فونت‌ها
        const fonts = [Vazir, Nahid, IRANSansWeb, B_Titr, B_Traffic, B_Homa, B_Koodak, B_Roya, B_Yekan, B_Zar, B_Kamran, B_Nazanin];
        fonts.forEach(font => Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(font));

        const report = new Stimulsoft.Report.StiReport();
        report.loadFile(mrtFileUrl);

        // ... آماده‌سازی دیتاسورس
        const dataSourceForViewer = {};
        Object.keys(formModel.dataSources).forEach((dataSourceName) => {
            const ds = formModel.dataSources[dataSourceName].dataArray;
            dataSourceForViewer[dataSourceName] = JSON.parse(JSON.stringify(ds));
        });
        const dataSet = new Stimulsoft.System.Data.DataSet("jsonDataSource");
        dataSet.readJson(dataSourceForViewer);
        report.regData(dataSet.dataSetName, "", dataSet);
        report.dictionary.synchronize();

        const options = new Stimulsoft.Viewer.StiViewerOptions();
        options.appearance.fullScreenMode = false; // ۱. جلوگیری از تمام‌صفحه شدن
        options.appearance.scrollbarsMode = false;
        options.height = "100%";
        options.toolbar.showDesignButton = true;
        options.toolbar.printDestination = Stimulsoft.Viewer.StiPrintDestination.Direct;
        options.appearance.htmlRenderMode = Stimulsoft.Report.Export.StiHtmlExportMode.Table;

        // ۲. ساخت viewer با options صحیح
        const viewer = new Stimulsoft.Viewer.StiViewer(options, "StiViewer", false);
        
        viewer.onClose = () => dialogInstance.hideDialog(); // بستن مودال با دکمه خود viewer
        viewer.report = report;
        viewer.renderHtml("reportViewer");

        setLoading(false);
    }, [allScriptsLoaded, dialogInstance]);

    useEffect(() => {
        if (isShow && allScriptsLoaded) {
            // یک تاخیر کوتاه برای اطمینان از آماده بودن DOM
            setTimeout(initializeViewer, 100);
        }
    }, [isShow, allScriptsLoaded, initializeViewer]);

    return (
        <div className="dialog">
            {isShow && (
                <>
                    <Script url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.reports.js`} onLoad={() => handleScriptLoad("report")} />
                    {scriptsLoaded.report && <Script url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.viewer.js?v=3`} onLoad={() => handleScriptLoad("viewer")} />}
                </>
            )}
            <Modal size="xl" isOpen={isShow} modalClassName="scroll__container" className="dialog__container dialog__container--report">
                <ModalHeader>
                    <div style={{ display: "flex", width: "100%" }}>
                        <div style={{ flex: "1" }} />
                        <Button className="Menu__icon dialog__closeIcon" outline color="light" onClick={() => dialogInstance.hideDialog()}>
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