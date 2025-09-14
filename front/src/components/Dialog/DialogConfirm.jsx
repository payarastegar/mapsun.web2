import React, { Component } from "react";
import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
} from "reactstrap";

import "./Dialog.css";
import BaseComponent from "../BaseComponent";
import SystemClass from "../../SystemClass";
import Utils from "../../Utils";
import FormInfo from "../FormInfo/FormInfo";
import FontAwesome from "react-fontawesome";
import moment from "moment";
import CheckBoxFieldInfo from "../CheckBoxFieldInfo/CheckBoxFieldInfo";
import FieldInfo from "../../class/FieldInfo";
import FieldType from "../../class/enums/FieldType";
import { Checkbox } from "semantic-ui-react";
import UiSetting from "../../UiSetting";

class DialogConfirm extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      titleCancel:
        UiSetting.GetSetting("language") === "fa"
          ? "خیر، انجام نده"
          : "No, cancel",
      titleDo:
        UiSetting.GetSetting("language") === "fa"
          ? "بله، انجام بده"
          : "Yes, I'm sure",
      dontShowAgain: false,
    };

    this.data = {
      checkBoxFieldInfo: FieldInfo.create(null, {
        checkBox_FalseColor: "#212529",
        checkBox_TrueColor: "#212529",
        fieldType: FieldType.CheckBox,
        checkBox_FalseText:
          UiSetting.GetSetting("language") === "fa"
            ? "دیگر این پیغام را نمایش نده"
            : "Don't show this message again",
        checkBox_TrueText:
          UiSetting.GetSetting("language") === "fa"
            ? "دیگر این پیغام را نمایش نده"
            : "Don't show this message again",
      }),
    };

    SystemClass.confirmDialogComponent = this;

    this.data.promise = {
      resolve: () => {},
      reject: () => {},
    };
  }

  openDialog = (msg, canPostpone, fieldCid) => {
    this.state.dontShowAgain = false;

    if (canPostpone) {
      this.data.canPostpone = true;
      const lastDate =
        window.localStorage["_confirm" + fieldCid + Utils.hashCode(msg)];
      if (lastDate) {
        //and not expire
        const now = moment(
          Utils.getCurrentDataTime(),
          "jYYYY/jMM/jDD HH:mm:ss"
        );
        const lastMoment = moment(lastDate, "jYYYY/jMM/jDD HH:mm:ss");
        const differentDays = moment.duration(lastMoment.diff(now)).asDays();

        //one month
        if (differentDays < 30) {
          return new Promise((resolve, reject) => {
            resolve(true);
          });
        }
      }
    }

    this.state.msg = msg;
    this.state.fieldCid = fieldCid;
    this.state.isShow = true;
    this.data.promise._promise = new Promise((resolve, reject) => {
      this.data.promise.resolve = resolve;
      this.data.promise.reject = reject;
    });

    this.forceUpdate();

    return this.data.promise._promise;
  };

  cancelDialog(resolve) {
    if (!this.state.isShow) return;

    this.state.isShow = false;
    this.data.promise.resolve(resolve);

    if (resolve) {
      if (this.data.canPostpone && this.state.dontShowAgain) {
        window.localStorage[
          "_confirm" + this.state.fieldCid + Utils.hashCode(this.state.msg)
        ] = Utils.getCurrentDataTime();
      }
    }

    this.forceUpdate();
  }

  componentWillUnmount() {
    //  this.data.observer.disconnect();
  }

  //region events
  _handleOnDialogKeyPress = (event) => {
    if (event.keyCode === 27 && !SystemClass.loading) {
      this.cancelDialog();
    }
  };

  _handleOnDoClick = () => {
    this.cancelDialog(true);
  };

  _handleOnCancelClick = () => {
    this.cancelDialog();
  };

  _handleOnDialogClose = () => {
    this.cancelDialog();
  };

  _toggleCheckBox = () =>
    this.setState((prevState) => ({ dontShowAgain: !prevState.dontShowAgain }));
  //endregion

  // region element

  // endregion element
  render() {
    return (
      <div
        id="DialogContainer"
        className={["dialog"].filter((c) => c).join(" ")}
        onKeyDown={this._handleOnDialogKeyPress}
      >
        <Modal
          size=""
          isOpen={this.state.isShow}
          modalClassName={"scroll__container"}
          className={[""].filter((c) => c).join(" ")}
          onClosed={this._handleOnDialogClose.bind(this)}
          key={"_confirmDialog"}
          centered={true}
          style={{}}
        >
          <ModalBody
            style={{ fontSize: "14px", padding: "1.5rem" }}
            className={["dialog__body"].filter((c) => c).join(" ")}
          >
            {this.state.msg}
          </ModalBody>

          {/*TODO FOOTER*/}
          <ModalFooter className="d-flex flex-column align-items-start">
            {/*<CheckBoxFieldInfo fieldInfo={ this.data.checkBoxFieldInfo}/>*/}

            {/* <div style={{ flex: 1 }} /> */}
            <div className="mb-3">
              <Button
                color="primary"
                onClick={this._handleOnDoClick.bind(this)}
              >
                {" "}
                {this.state.titleDo}{" "}
              </Button>
              <Button
                color="secondary"
                onClick={this._handleOnCancelClick.bind(this)}
                className="mx-3"
              >
                {" "}
                {this.state.titleCancel}{" "}
              </Button>
            </div>
            <div>
              {this.data.canPostpone && (
                <Checkbox
                  label="به مدت یک ماه این پیغام را نمایش نده"
                  onChange={this._toggleCheckBox}
                  checked={this.state.dontShowAgain}
                />
              )}
            </div>
          </ModalFooter>
        </Modal>
      </div>
    );
  }
}

export default DialogConfirm;
