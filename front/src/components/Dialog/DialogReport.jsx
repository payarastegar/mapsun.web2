import React, { useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import FontAwesome from 'react-fontawesome';

import './Dialog.css';
import SystemClass from "../../SystemClass";
import FormInfo from "../FormInfo/FormInfo"; // Assuming you might need FormInfo here later

const DialogReport = forwardRef((props, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [modelItem, setModelItem] = useState(null); // To hold form info if needed

    // Expose methods to be called from SystemClass
    useImperativeHandle(ref, () => ({
        showDialog: (item) => {
            // You can pass data here when opening the dialog
            // For example, an object containing formFieldInfo
            setModelItem(item);
            setIsOpen(true);
        },
        hideDialog: () => {
            setIsOpen(false);
        }
    }));
    
    // Handler for keyboard events, e.g., closing with ESC key
    const handleKeyPress = useCallback((event) => {
        if (event.keyCode === 27 && !SystemClass.loading) {
            setIsOpen(false);
        }
    }, []);

    // Function to get the modal header title
    const getModalHeader = () => {
        if (modelItem && modelItem.formFieldInfo) {
            return modelItem.titleHeader || modelItem.formFieldInfo.label;
        }
        return "گزارش"; // Default title
    };
    
    if (!isOpen) {
        return null;
    }

    return (
        <div className="dialog" onKeyDown={handleKeyPress}>
            <Modal
                size="xl"
                isOpen={isOpen}
                toggle={() => setIsOpen(false)}
                modalClassName="scroll__container"
                className="dialog__container"
                centered={false}
            >
                <ModalHeader toggle={() => setIsOpen(false)}>
                    <div style={{ display: "flex", width: "100%" }}>
                        <span>{getModalHeader()}</span>
                        <div style={{ flex: '1', width: '100%' }}/>
                        <Button 
                            className={'Menu__icon dialog__closeIcon'} 
                            outline color="light"
                            onClick={() => setIsOpen(false)}
                        >
                            <FontAwesome name="times-circle"/>
                        </Button>
                    </div>
                </ModalHeader>
                <ModalBody className="dialog__body">
                    {/* You can place your report content here.
                      If you receive formFieldInfo, you can render a FormInfo component like this:
                    */}
                    {modelItem && modelItem.formFieldInfo ? (
                        <FormInfo fieldInfo={modelItem.formFieldInfo} />
                    ) : (
                        <p>محتوای گزارش در اینجا قرار می‌گیرد.</p>
                    )}
                </ModalBody>
            </Modal>
        </div>
    );
});

export default DialogReport;
