import React, { useState, useRef, useImperativeHandle, forwardRef, useCallback , useEffect} from "react";
import { Button, Modal, ModalHeader, ModalBody } from "reactstrap";
import "./Dialog.css";
import SystemClass from "../../SystemClass";
import Utils from "../../Utils";
import FormInfo from "../FormInfo/FormInfo";
import FontAwesome from "react-fontawesome";
import UiSetting from "../../UiSetting";

const ModalItem = {
    formName: '',
    formId: '',
    paramList: null,
    formFieldInfo: null,
    isShow: true,
    isOpen: true,
    isDirty: false,
    titleHeader: '',
    titleCancel: "لغو",
    titleDo: "ذخیره",
    closeDialogCallback: null,
    expand: false,
};

const Dialog = forwardRef((props, ref) => {
    const [modalList, setModalList] = useState([]);
    const [activeComponent, setActiveComponent] = useState("Transaction");
    
    const dragRef = useRef({
        x: 0,
        y: 0,
        isDragging: false,
        modelNode: null,
        left: 0,
        top: 0,
    });

    const createModalItem = useCallback((formId, paramList, formFieldInfo, closeDialogCallback) => {
        const formModel = SystemClass.getFormModel(formId, paramList);
        if (!formModel) {
            console.error(`FormModel not found for formId: ${formId}`);
            return null; 
        }
        const jsFieldInfo = formModel.jsFormInfo;

        const newFormFieldInfo = SystemClass.createFormInfo(
            formFieldInfo,
            formModel,
            formId,
            paramList
        );
        formModel.formFieldInfo = newFormFieldInfo;

        return {
            ...ModalItem,
            paramList,
            formId,
            formName: jsFieldInfo.fieldName,
            formFieldInfo: newFormFieldInfo,
            closeDialogCallback,
        };
    }, []); 

    const dialogInstance = {
        openDialog: (formId, paramList, formFieldInfo, closeDialogCallback) => {
            const modalItem = createModalItem(formId, paramList, formFieldInfo, closeDialogCallback);
            if (!modalItem) return; 
            
            setModalList(currentList => {
                const filteredList = currentList.filter(item => 
                    !(item.formId === formId && Utils.deepCompare(item.paramList, paramList))
                );
                return [...filteredList, modalItem];
            });
        },
        cancelDialog: (formId, paramList) => {
            setModalList(currentList => 
                currentList.map(item => 
                    (item.formId === formId && Utils.deepCompare(item.paramList, paramList))
                        ? { ...item, isShow: false }
                        : item
                )
            );
        },
        cancelAllDialogs: () => {
            setModalList(currentList => currentList.map(item => ({ ...item, isShow: false })));
        },
        anyDialogOpen: () => {
            return modalList.some(item => item.isShow);
        }
    }

    useImperativeHandle(ref, () => dialogInstance, [createModalItem,modalList]);

    useEffect(() => {
        SystemClass.DialogComponent = dialogInstance;
        return () => {
            SystemClass.DialogComponent = null;
        };
    }, [dialogInstance]); 

    const setDirtyModal = (modalItem) => {
        setModalList(currentList => 
            currentList.map(item => 
                item.formId === modalItem.formId ? { ...item, isDirty: true } : item
            )
        );
    };

    const handleOnDialogClose = (closedItem) => {
        setModalList(currentList => currentList.filter(item => item !== closedItem));
        if (closedItem.closeDialogCallback) {
            closedItem.closeDialogCallback();
        }
    };
    
    const handleOnCancelClick = (modalItem) => {
        ref.current.cancelDialog(modalItem.formId, modalItem.paramList);
    };

    const handleOnExpandClick = (modalItem) => {
        setModalList(currentList => 
            currentList.map(item => 
                item === modalItem ? { ...item, expand: !item.expand } : item
            )
        );
    };

    const handleOnDialogKeyPress = useCallback(async (event) => {
        if (event.keyCode === 27 && !SystemClass.loading) {
            const lastItem = [...modalList].filter(item => item.isShow).pop();
            if (!lastItem) return;

            if (lastItem.isDirty && lastItem.formFieldInfo.form_NotSavedAlarm_OnFormClose) {
                const confirm = await SystemClass.showConfirm(
                    UiSetting.GetSetting("language") === "fa"
                        ? "فرم دارای تغییرات ذخیره نشده است. برای خروج اطمینان دارید؟"
                        : "You have unsaved changes, are you sure you want to close?",
                    false,
                    lastItem.formId
                );
                if (!confirm) return;
            }
            handleOnCancelClick(lastItem);
        }
    }, [modalList]);
    
    // --- Drag Logic ---
    const onDragMouseMove = useCallback((e) => {
        if (dragRef.current.isDragging) {
            let left = e.pageX - dragRef.current.x;
            let top = e.pageY - dragRef.current.y;
            if (left < 0) left = 0;
            if (top < 0) top = 0;
            dragRef.current.left = left;
            dragRef.current.top = top;

            requestAnimationFrame(() => {
                if (dragRef.current.modelNode) {
                    dragRef.current.modelNode.style.marginTop = `${dragRef.current.top}px`;
                    dragRef.current.modelNode.style.marginLeft = `${dragRef.current.left}px`;
                }
            });
        }
        e.stopPropagation();
        e.preventDefault();
    }, []);

    const onDragMouseUp = useCallback((e) => {
        document.removeEventListener("mousemove", onDragMouseMove);
        document.removeEventListener("mouseup", onDragMouseUp);
        dragRef.current.isDragging = false;
        e.stopPropagation();
    }, [onDragMouseMove]);

    const onHeaderMouseDown = useCallback((e) => {
        if (e.button !== 0) return;
        document.addEventListener("mousemove", onDragMouseMove);
        document.addEventListener("mouseup", onDragMouseUp);

        const dialogNode = e.currentTarget.closest(".modal-dialog");
        if (!dialogNode) return;
        
        dragRef.current.modelNode = dialogNode;
        dragRef.current.x = e.pageX - dialogNode.offsetLeft;
        dragRef.current.y = e.pageY - dialogNode.offsetTop;
        dragRef.current.isDragging = true;

        e.stopPropagation();
        e.preventDefault();
    }, [onDragMouseMove, onDragMouseUp]);


    return (
        <div id="DialogContainer" className="dialog" onKeyDown={handleOnDialogKeyPress}>
            {modalList.map((modelItem, index) => {
                const width = modelItem.formFieldInfo.defaultWidthInPixel;
                const style = {
                    width: width ? `${width}px` : undefined,
                    maxWidth: width ? `${width}px` : undefined,
                    marginRight: width ? "auto" : undefined,
                    marginLeft: width ? "auto" : undefined,
                    marginTop: index === 0 ? "" : `${2.5 + index * 3}rem`,
                };
                const expandIconStyle = { transform: modelItem.expand ? "scale(0.85)" : "scale(1.1)" };

                return (
                    modelItem.isOpen && (
                        <Modal
                            isOpen={modelItem.isShow}
                            size="xl"
                            modalClassName="scroll__container"
                            className={`dialog__container ${modelItem.expand ? "dialog__container--expand" : ""}`}
                            onClosed={() => handleOnDialogClose(modelItem)}
                            key={`${modelItem.formName}-${index}`}
                            centered={false}
                            style={style}
                        >
                            <ModalHeader onMouseDown={onHeaderMouseDown} style={{ cursor: "move" }}>
                                <div style={{ display: "flex", width: "100%" }}>
                                    <span>{modelItem.titleHeader || modelItem.formFieldInfo.label}</span>
                                    <div style={{ flex: "1" }} />
                                    <Button className="Menu__icon dialog__closeIcon" outline color="light" onClick={() => handleOnExpandClick(modelItem)}>
                                        <FontAwesome style={expandIconStyle} name="expand" />
                                    </Button>
                                    <Button className="Menu__icon dialog__closeIcon" outline color="light" onClick={() => handleOnCancelClick(modelItem)}>
                                        <FontAwesome name="times" />
                                    </Button>
                                </div>
                            </ModalHeader>
                            <ModalBody className="dialog__body">
                                <FormInfo
                                    fieldInfo={modelItem.formFieldInfo}
                                    activeComponent={activeComponent}
                                    setActiveComponent={setActiveComponent}
                                    setDirtyModal={setDirtyModal}
                                    modelItem={modelItem}
                                />
                            </ModalBody>
                        </Modal>
                    )
                );
            })}
        </div>
    );
});

export default Dialog;