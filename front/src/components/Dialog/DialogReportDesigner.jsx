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

const DialogReportDesigner = forwardRef((props, ref) => {
    // State management with hooks
    const [isShow, setIsShow] = useState(false);
    const [loading, setLoading] = useState(true);
    const [scriptsLoaded, setScriptsLoaded] = useState({
        report: false,
        viewer: false,
        designer: false,
    });

    // Use a ref to store data that doesn't trigger re-renders
    const dataRef = useRef({ mrtFileUrl: null, formModel: null });

    const allScriptsLoaded = Object.values(scriptsLoaded).every(Boolean);

    // Expose methods to be called from outside (e.g., from SystemClass)
    useImperativeHandle(ref, () => ({
        showDialog: (mrtFileUrl, formModel) => {
            dataRef.current = { mrtFileUrl, formModel };
            setIsShow(true);
            setLoading(true); // Show loader when dialog opens
        },
        hideDialog: () => {
            setIsShow(false);
        },
    }));

    // Callback for when a script is loaded
    const handleScriptLoad = (scriptName) => {
        setScriptsLoaded((prev) => ({ ...prev, [scriptName]: true }));
    };

    // This function contains the logic to initialize the Stimulsoft Designer
    const initializeDesigner = useCallback(() => {
        const { mrtFileUrl, formModel } = dataRef.current;
        if (!allScriptsLoaded || !mrtFileUrl || !formModel || !window.Stimulsoft) {
            return;
        }

        const Stimulsoft = window.Stimulsoft;
        Stimulsoft.Base.StiLicense.key = "6vJhGtLLLz2GNviWmUTrhSqnOItdDwjBylQzQcAOiHkcgIvwL0jnpsDqRpWg5FI5kt2G7A0tYIcUygBh1sPs7plofUOqPB1a4HBIXJB621mau2oiAIj+ysU7gKUXfjn/D5BocmduNB+ZMiDGPxFrAp3PoD0nYNkkWh8r7gBZ1v/JZSXGE3bQDrCQCNSy6mgby+iFAMV8/PuZ1z77U+Xz3fkpbm6MYQXYp3cQooLGLUti7k1TFWrnawT0iEEDJ2iRcU9wLqn2g9UiWesEZtKwI/UmEI2T7nv5NbgV+CHguu6QU4WWzFpIgW+3LUnKCT/vCDY+ymzgycw9A9+HFSzARiPzgOaAuQYrFDpzhXV+ZeX31AxWlnzjDWqpfluygSNPtGul5gyNt2CEoJD1Yom0VN9fvRonYsMsimkFFx2AwyVpPcs+JfVBtpPbTcZscnzUdmiIvxv8Gcin6sNSibM6in/uUKFt3bVgW/XeMYa7MLGF53kvBSwi78poUDigA2n12SmghLR0AHxyEDIgZGOTbNI33GWu7ZsPBeUdGu55R8w=";

        // Load fonts
        const fonts = [Vazir, Nahid, IRANSansWeb, B_Titr, B_Traffic, B_Homa, B_Koodak, B_Roya, B_Yekan, B_Zar, B_Kamran, B_Nazanin];
        fonts.forEach((font, index) => {
            const fontName = ['Vazir-FD', 'Nahid-FD', 'IRANSansWeb(FaNum)'][index];
            Stimulsoft.Base.StiFontCollection.addOpentypeFontFile(font, fontName);
        });

        const report = new Stimulsoft.Report.StiReport();
        report.loadFile(mrtFileUrl);

        // Prepare and register data sources
        const dataSourceForDesigner = {};
        Object.keys(formModel.dataSources).forEach((dataSourceName) => {
            const ds = formModel.dataSources[dataSourceName].dataArray;
            const designerDataSource = JSON.parse(JSON.stringify(ds)).map((row) => {
                Object.keys(row).forEach((key) => {
                    if (typeof row[key] === "string") {
                        row[key] = row[key].replace(/!@#/g, "\n").replace(/\(\(.*?\)\)/g, "");
                    }
                    if (Array.isArray(row[key]) || Utils.isObject(row[key])) {
                        row[key] = undefined;
                    }
                });
                return row;
            });
            dataSourceForDesigner[dataSourceName] = designerDataSource;
        });

        const dataSet = new Stimulsoft.System.Data.DataSet("jsonDataSource");
        dataSet.readJson(dataSourceForDesigner);
        report.regData(dataSet.dataSetName, "", dataSet);
        report.dictionary.synchronize();

        // Configure and render the designer
        const options = new Stimulsoft.Designer.StiDesignerOptions();
        options.appearance.fullScreenMode = false;
        options.appearance.htmlRenderMode = Stimulsoft.Report.Export.StiHtmlExportMode.Table;

        const designer = new Stimulsoft.Designer.StiDesigner(options, "StiDesigner", false);
        designer.onExit = () => setIsShow(false);
        designer.onClose = () => setIsShow(false);
        designer.report = report;
        designer.renderHtml("reportDesigner");

        setLoading(false); // Hide loader after designer is rendered
    }, [allScriptsLoaded]);

    // Effect to initialize the designer when modal is shown and scripts are loaded
    useEffect(() => {
        if (isShow && allScriptsLoaded) {
            // A small delay can help ensure the DOM element is ready
            setTimeout(initializeDesigner, 100);
        }
    }, [isShow, allScriptsLoaded, initializeDesigner]);

    return (
        <div className="dialog">
            {isShow && (
                <>
                    <Script url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.reports.js`} onLoad={() => handleScriptLoad("report")} />
                    {scriptsLoaded.report && (
                        <Script url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.viewer.js?v=3`} onLoad={() => handleScriptLoad("viewer")} />
                    )}
                    {scriptsLoaded.viewer && (
                        <Script url={`${WebService.URL.mapsunSite_Address}/content/stimulsoft.designer.js`} onLoad={() => handleScriptLoad("designer")} />
                    )}
                </>
            )}
            <Modal
                size="xl"
                isOpen={isShow}
                modalClassName="scroll__container"
                className="dialog__container dialog__container--report"
            >
                <ModalHeader>
                    <div style={{ display: "flex", width: "100%" }}>
                        <div style={{ flex: "1" }} />
                        <Button
                            className="Menu__icon dialog__closeIcon"
                            outline
                            color="light"
                            onClick={() => setIsShow(false)}
                        >
                            <FontAwesome name="times-circle" />
                        </Button>
                    </div>
                </ModalHeader>
                <ModalBody
                    style={{ padding: "0" }}
                    className="dialog__body dialog__body--report"
                >
                    {loading && (
                        <div>
                            <ProgressBar />
                            <h5 style={{ textAlign: "center", padding: "2rem" }}>
                                در حال بارگذاری محیط طراحی گزارش
                            </h5>
                        </div>
                    )}
                    {/* The designer will be rendered inside this div */}
                    <div
                        style={{ direction: "ltr", textAlign: "left", display: loading ? 'none' : 'block' }}
                        id="reportDesigner"
                    />
                </ModalBody>
            </Modal>
        </div>
    );
});

export default DialogReportDesigner;
