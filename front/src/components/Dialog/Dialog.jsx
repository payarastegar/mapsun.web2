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
import * as ReactDOM from "react-dom";
import UiSetting from "../../UiSetting";

class ModalItem {
  formName;
  formId;
  paramList;
  formFieldInfo;
  isShow = true;
  isOpen = true;
  isDirty = false;
  titleHeader;
  titleCancel = "لغو";
  titleDo = "ذخیره";
  closeDialogCallback; //function
  expand = false;
}

class Dialog extends BaseComponent {
  drag = {
    x: "",
    y: "",
    isDragging: false,
    modelNode: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      titleCancel: "لغو",
      titleDo: "ذخیره",
      title: "دیالوگ فُرم",

      modal: false,
      nestedModal: false,
      closeAll: false,
      expand: false,
    };

    this.data = {
      modalList: [],
      observer: null,
      paddingLeft: "",
      activeComponent: "Transaction",
      dirtyChildren: false, //برای زمانیکه فرزندان این استیت فرزندان این دیالوگ تغییر کرده باشند
    };

    SystemClass.DialogComponent = this;
    this._startObserveBody();
    SystemClass.browserHistory.listen((location, action, sd) => {
      // location is an object like window.location
      // console.log(action, location.pathname, location.state)
      // console.log(SystemClass.browserHistory)
      if (action === "POP") {
        const lastItem = this.data.modalList
          .filter((item) => item.isShow)
          .slice(-1)[0];
        lastItem && this.cancelDialog(lastItem.formId, lastItem.paramList);
      }
    });

    // console.log("Dialog component rendered...");
  }

  _onDragMouseMove = (e) => {
    if (this.drag.isDragging) {
      let left = e.pageX - this.drag.x;
      let top = e.pageY - this.drag.y;

      if (left < 0) left = 0;
      if (top < 0) top = 0;

      this.drag.left = left;
      this.drag.top = top;
    }

    requestAnimationFrame(() => {
      if (this.drag.modelNode) {
        this.drag.modelNode.style.marginTop = this.drag.top + "px";
        this.drag.modelNode.style.marginLeft = this.drag.left + "px";
      }
    });
    // this.forceUpdate()

    e.stopPropagation();
    e.preventDefault();
  };

  _onDragMouseUp = (e) => {
    document.removeEventListener("mousemove", this._onDragMouseMove);
    document.removeEventListener("mouseup", this._onDragMouseMove);
    this.drag.isDragging = false;
    e.stopPropagation();
    // e.preventDefault();
  };

  _onHeaderMouseDown = (e) => {
    // only left mouse button
    //event on document not at elemnt (mouse maybe over that)
    document.addEventListener("mousemove", this._onDragMouseMove);
    document.addEventListener("mouseup", this._onDragMouseUp);

    if (e.button !== 0) return;

    const dialogNode = e.currentTarget.parentElement.parentElement;
    this.drag.modelNode = dialogNode;

    this.drag.x = e.pageX - dialogNode.offsetLeft;
    this.drag.y = e.pageY - dialogNode.offsetTop;
    this.drag.isDragging = true;

    e.stopPropagation();
    e.preventDefault();
  };

  // region others
  _createModalItem = (
    formId,
    paramList,
    formFieldInfo,
    closeDialogCallback
  ) => {
    // formInfo
    const formModel = SystemClass.getFormModel(formId, paramList);
    const jsFieldInfo = formModel.jsFormInfo;

    formFieldInfo = SystemClass.createFormInfo(
      formFieldInfo,
      formModel,
      formId,
      paramList
    );
    formModel.formFieldInfo = formFieldInfo;
    const modalItem = new ModalItem();
    modalItem.paramList = paramList;
    modalItem.formId = formId;
    modalItem.formName = jsFieldInfo.fieldName;
    modalItem.formFieldInfo = formFieldInfo;
    modalItem.closeDialogCallback = closeDialogCallback;
    return modalItem;
  };

  _getModalItemHeader = (modalItem) => {
    // console.log("Modal header rendered....");
    return modalItem.titleHeader || modalItem.formFieldInfo.label;
  };

  _startObserveBody = () => {
    // this.data.observer = new MutationObserver((mutationsList, observer) => {
    //     mutationsList.forEach(mutation => {
    //         if (mutation.target !== document.body ||
    //             mutation.type !== 'attributes' || mutation.attributeName !== 'style') return
    //
    //         // requestAnimationFrame(() => {
    //         const paddingRight = document.body.style.paddingRight
    //         // if (this.data.paddingLeft) {
    //         //     this.data.paddingLeft = document.body.style.paddingLeft
    //         // }
    //
    //         if (paddingRight) {
    //             // document.body.style.paddingLeft = paddingRight
    //             document.body.style.paddingRight = ''
    //         }
    //     })
    //
    //     // })
    // });
    // this.data.observer.observe(document.body, {attributes: true, attributeFilter: ['style']});
  };

  setActiveComponent = (newComp) => {
    this.data.activeComponent = newComp;
    this.forceUpdate();
  };

  setDirtyModal = (modalItem) => {
    // this.data.dirtyChildren = true;
    const modalIndex = this.data.modalList.findIndex(
      (mItem) => mItem.formId == modalItem.formId
    );

    this.data.modalList[modalIndex].isDirty = true;
  };

  //endregion

  anyDialogOpen() {
    return this.data.modalList.length !== 0;
  }

  openDialog(formId, paramList, formFieldInfo, closeDialogCallback) {
    const modalItem = this._createModalItem(
      formId,
      paramList,
      formFieldInfo,
      closeDialogCallback
    );

    const modalIndex = this.data.modalList.findIndex(
      (modalItem) =>
        modalItem.formId == formId &&
        Utils.deepCompare(modalItem.paramList, paramList)
    );
    if (modalIndex !== -1) {
      this.data.modalList.splice(modalIndex, 1);
    }
    this.data.modalList.push(modalItem);
    SystemClass.browserHistory.push(SystemClass.browserHistory.path, {
      openDialog: formId,
    });
    this.forceUpdate();
  }

  cancelDialog(formId, paramList) {
    const modalItem = this.data.modalList.find(
      (modalItem) =>
        modalItem.formId == formId &&
        Utils.deepCompare(modalItem.paramList, paramList)
    );
    if (!modalItem) throw "Dialog Not Found !!!";
    modalItem.isShow = false;
    this.forceUpdate();
  }

  cancelAllDialogs() {
    this.data.modalList.forEach((m) => (m.isShow = false));
    this.forceUpdate();
  }

  componentWillUnmount() {
    //  this.data.observer.disconnect();
    // this.data.dirtyChildren = false;
  }

  //region events
  _handleOnDialogKeyPress = async (event) => {
    if (event.keyCode === 27 && !SystemClass.loading) {
      //Do whatever when esc is pressed
      const lastItem = this.data.modalList
        .filter((item) => item.isShow)
        .slice(-1)[0];

      // if (this.data.dirtyChildren === true) return;
      // console.log(this.fieldInfo);

      if (
        lastItem.isDirty === true &&
        lastItem.formFieldInfo.form_NotSavedAlarm_OnFormClose === true
      ) {
        const confirm = await SystemClass.showConfirm(
          UiSetting.GetSetting("language") === "fa"
            ? "فرم دارای تغییرات ذخیره نشده است. برای خروج اطمینان دارید؟"
            : "You have unsaved changes in the form, Are you sure for closing form?",
          false,
          lastItem.formId
        );

        if (!confirm) return;
      }

      lastItem && this.cancelDialog(lastItem.formId, lastItem.paramList);
    }
  };

  _handleOnDoClick = (modalItem) => {
    this.cancelDialog(modalItem.formId, modalItem.paramList);
  };

  _handleOnCancelClick = (modalItem) => {
    this.cancelDialog(modalItem.formId, modalItem.paramList);
  };

  _handleOnExpandClick = (modalItem) => {
    modalItem.expand = !modalItem.expand;
    this.forceUpdate();
  };

  _handleOnDialogClose = (modelItem) => {
    modelItem.isOpen = false;
    Utils.removeFromArray(this.data.modalList, modelItem);
    if (this.data.modalList.length === 0) {
      // requestAnimationFrame(() => {
      //document.body.style.paddingLeft = this.data.paddingLeft
      // })
    }

    if (modelItem.closeDialogCallback) {
      modelItem.closeDialogCallback();
      modelItem.closeDialogCallback = null;
    }
  };

  //endregion

  // region element
  _elementGetModalItemList = () => {
    return this.data.modalList.map(this._elementGetModalItem);
  };

  _elementGetModalItem = (modelItem, index) => {
    // const width = (modelItem.formFieldInfo.defaultWidthInPixel ?
    //     modelItem.formFieldInfo.defaultWidthInPixel : '') + 'px'

    const modelIndex = this.data.modalList.indexOf(modelItem);

    const width = modelItem.formFieldInfo.defaultWidthInPixel;
    const style = {
      width: "100vw" || (width && width + "px"),
      maxWidth: width && width + "px",
      //TODO CHECK
      height2: modelItem.formFieldInfo.defaultHeightInPixel + "px",
      marginRight: width && "auto",
      marginLeft: width && "auto",
      marginTop: modelIndex === 0 ? "" : 2.5 + modelIndex * 3 + "rem",
    };

    const expandIconStyle = {
      transform: modelItem.expand ? "scale(0.85)" : "scale(1.1)",
    };
    // if (this.drag.left) {
    //     style.marginLeft = this.drag.left + "px"
    // }
    //
    // if (this.drag.top) {
    //     style.marginTop = this.drag.top + "px"
    // }

    return (
      modelItem.isOpen && (
        <Modal
          size="xl"
          isOpen={modelItem.isShow}
          modalClassName={"scroll__container"}
          className={[
            "dialog__container",
            modelItem.expand && "dialog__container--expand",
          ]
            .filter((c) => c)
            .join(" ")}
          onClosed={this._handleOnDialogClose.bind(this, modelItem)}
          key={modelItem.formName + index}
          centered={false}
          style={style}
        >
          <ModalHeader
            onMouseDown={this._onHeaderMouseDown}
            style={{ cursor: "move" }}
          >
            <div style={{ display: "flex", width: "100%" }}>
              <span>{this._getModalItemHeader(modelItem)}</span>

              <div style={{ flex: "1", width: "100%" }} />

              <Button
                className={"Menu__icon dialog__closeIcon"}
                outline
                color="light"
                onClick={this._handleOnExpandClick.bind(this, modelItem)}
              >
                <FontAwesome
                  style={expandIconStyle}
                  className={""}
                  name="expand"
                />
              </Button>

              <Button
                className={"Menu__icon dialog__closeIcon"}
                outline
                color="light"
                onClick={this._handleOnCancelClick.bind(this, modelItem)}
              >
                <FontAwesome className={""} name="times" />
              </Button>
            </div>
          </ModalHeader>

          <ModalBody className={["dialog__body"].filter((c) => c).join(" ")}>
            <FormInfo
              fieldInfo={modelItem.formFieldInfo}
              activeComponent={this.data.activeComponent}
              setActiveComponent={this.setActiveComponent}
              setDirtyModal={(modelItem) => this.setDirtyModal(modelItem)}
              modelItem={modelItem}
            />
          </ModalBody>

          {/*TODO FOOTER*/}
          {/*<ModalFooter>*/}
          {/*<Button color="secondary"*/}
          {/*onClick={this._handleOnCancelClick.bind(this, (modelItem))}> {this.state.titleCancel} </Button>*/}
          {/*<Button color="primary"*/}
          {/*onClick={this._handleOnDoClick.bind(this, (modelItem))}> {this.state.titleDo}  </Button>*/}
          {/*</ModalFooter>*/}
        </Modal>
      )
    );
  };

  // endregion element
  render() {
    return (
      <div
        id="DialogContainer"
        className={["dialog"].filter((c) => c).join(" ")}
        onKeyDown={this._handleOnDialogKeyPress}
      >
        {this._elementGetModalItemList()}
      </div>
    );
  }
}

export default Dialog;
