import React, { useState, useRef, useImperativeHandle, forwardRef, useCallback } from "react";
import { Button, Modal, ModalBody, ModalFooter, Input, Label, FormGroup } from "reactstrap";
import "./Dialog.css";
import SystemClass from "../../SystemClass";
import Utils from "../../Utils";
import moment from "moment";
import UiSetting from "../../UiSetting";

const DialogConfirm = forwardRef((props, ref) => {
    const [isShow, setIsShow] = useState(false);
    const [msg, setMsg] = useState("");
    const [canPostpone, setCanPostpone] = useState(false);
    const [fieldCid, setFieldCid] = useState(null);
    const [dontShowAgain, setDontShowAgain] = useState(false);

    const promiseRef = useRef({ resolve: null, reject: null });

    useImperativeHandle(ref, () => ({
        openDialog: (message, canPostponeFlag, cid) => {
            setDontShowAgain(false);
            setCanPostpone(canPostponeFlag);
            
            if (canPostponeFlag) {
                const storageKey = `_confirm${cid}${Utils.hashCode(message)}`;
                const lastDate = window.localStorage.getItem(storageKey);
                if (lastDate) {
                    const now = moment(Utils.getCurrentDataTime(), "jYYYY/jMM/jDD HH:mm:ss");
                    const lastMoment = moment(lastDate, "jYYYY/jMM/jDD HH:mm:ss");
                    const differentDays = now.diff(lastMoment, 'days');

                    if (differentDays < 30) {
                        return Promise.resolve(true);
                    }
                }
            }

            setMsg(message);
            setFieldCid(cid);
            setIsShow(true);

            return new Promise((resolve, reject) => {
                promiseRef.current = { resolve, reject };
            });
        }
    }));

    const closeDialog = (resolveValue) => {
        if (!isShow) return;

        if (resolveValue && canPostpone && dontShowAgain) {
            const storageKey = `_confirm${fieldCid}${Utils.hashCode(msg)}`;
            window.localStorage.setItem(storageKey, Utils.getCurrentDataTime());
        }

        if (promiseRef.current.resolve) {
            promiseRef.current.resolve(resolveValue);
        }
        setIsShow(false);
    };

    const handleOnDoClick = () => closeDialog(true);
    const handleOnCancelClick = () => closeDialog(false);

    const handleOnDialogKeyPress = useCallback((event) => {
        if (event.keyCode === 27 && !SystemClass.loading) {
            closeDialog(false);
        }
    }, []);

    return (
        <div className="dialog" onKeyDown={handleOnDialogKeyPress}>
            <Modal isOpen={isShow} centered onClosed={() => closeDialog(false)}>
                <ModalBody style={{ fontSize: "14px", padding: "1.5rem" }}>
                    {msg}
                </ModalBody>
                <ModalFooter className="d-flex flex-column align-items-start">
                    <div className="mb-3">
                        <Button color="primary" onClick={handleOnDoClick}>
                            {UiSetting.GetSetting("language") === "fa" ? "بله، انجام بده" : "Yes, I'm sure"}
                        </Button>
                        <Button color="secondary" onClick={handleOnCancelClick} className="mx-3">
                            {UiSetting.GetSetting("language") === "fa" ? "خیر، انجام نده" : "No, cancel"}
                        </Button>
                    </div>
                    <div>
                        {canPostpone && (
                            <FormGroup check>
                                <Input
                                    type="checkbox"
                                    id="dontShowAgainCheckbox"
                                    checked={dontShowAgain}
                                    onChange={() => setDontShowAgain(prev => !prev)}
                                />
                                <Label check htmlFor="dontShowAgainCheckbox">
                                    به مدت یک ماه این پیغام را نمایش نده
                                </Label>
                            </FormGroup>
                        )}
                    </div>
                </ModalFooter>
            </Modal>
        </div>
    );
});

export default DialogConfirm;