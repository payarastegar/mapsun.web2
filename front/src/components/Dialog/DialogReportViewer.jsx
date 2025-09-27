import React, { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import "./Dialog.css";
import SystemClass from "../../SystemClass";
import FontAwesome from "react-fontawesome";
import ProgressBar from "../ProgressBar/ProgressBar";

const DialogReportViewer = forwardRef((props, ref) => {
    const [isShow, setIsShow] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const dataRef = useRef({ mrtFileUrl: null, formModel: null });
    const iframeRef = useRef(null);

    const dialogInstance = {
        showDialog: (mrtFileUrl, formModel) => {
            dataRef.current = { mrtFileUrl, formModel };
            setIsShow(true);
            setIsLoading(true); // نمایش لودر تا زمانیکه iframe آماده شود
        },
        hideDialog: () => {
            setIsShow(false);
        }
    };

    useImperativeHandle(ref, () => dialogInstance, []);

    useEffect(() => {
        SystemClass.DialogReportViewerContainer = dialogInstance;
        return () => {
            SystemClass.DialogReportViewerContainer = null;
        };
    }, [dialogInstance]);

    // وقتی iframe به طور کامل بارگذاری شد، داده‌ها را به آن ارسال می‌کنیم
    const handleIframeLoad = () => {
        if (isShow && iframeRef.current) {
            const { mrtFileUrl, formModel } = dataRef.current;
            const dataSourceForViewer = {};
             Object.keys(formModel.dataSources).forEach((dataSourceName) => {
                dataSourceForViewer[dataSourceName] = formModel.dataSources[dataSourceName].dataArray;
            });

            const message = {
                action: 'renderReport',
                mrtFileUrl: mrtFileUrl,
                dataSource: JSON.stringify(dataSourceForViewer),
            };
            
            // ارسال پیام به iframe
            iframeRef.current.contentWindow.postMessage(message, '*');
            setIsLoading(false); // مخفی کردن لودر
        }
    };

    return (
        <Modal size="xl" isOpen={isShow} modalClassName="scroll__container" className="dialog__container dialog__container--report">
            <ModalHeader>
                <div style={{ display: "flex", width: "100%" }}>
                    <span>نمایش گزارش</span>
                    <div style={{ flex: "1" }} />
                    <Button className="Menu__icon dialog__closeIcon" outline color="light" onClick={() => dialogInstance.hideDialog()}>
                        <FontAwesome name="times-circle" />
                    </Button>
                </div>
            </ModalHeader>
            <ModalBody style={{ padding: '0', height: '80vh', overflow: 'visible' }} className="dialog__body dialog__body--report">
                {isLoading && (
                    <div style={{textAlign: 'center', paddingTop: '2rem'}}>
                        <ProgressBar />
                        <h5 style={{margin:"1rem"}}>در حال آماده‌سازی محیط گزارش...</h5>
                    </div>
                )}
                {isShow && (
                    <iframe
                        ref={iframeRef}
                        src="/report-viewer.html" // آدرس فایل HTML در پوشه public
                        onLoad={handleIframeLoad}
                        title="Report Viewer"
                        style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            visibility: isLoading ? 'hidden' : 'visible'
                        }}
                    />
                )}
            </ModalBody>
        </Modal>
    );
});

export default DialogReportViewer;