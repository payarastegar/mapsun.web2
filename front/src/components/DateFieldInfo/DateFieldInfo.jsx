import React, { Component } from "react";
import "./DateFieldInfo.css";
import * as ReactDOM from "react-dom";
import { UncontrolledTooltip } from "reactstrap";
import LabelPosition from "../../class/enums/LabelPosition";
import DatePicker from "../DatePicker";
import moment from "moment-jalaali";
import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import DateFieldInfo_Core from "./DateFieldInfo_Core";
import InputFieldComponent from "../FintracTransaction/UtilityComponents/InputFieldComponent";
import "./DateFieldInfo.css";
import UiSetting from "../../UiSetting";

class DateFieldInfo extends DateFieldInfo_Core {
  //------------------------------------------------
  //region component private method
  //------------------------------------------------

  _validationEffect() {
    let errorInput = ReactDOM.findDOMNode(this).querySelector(".is-invalid");

    const delay = 600; // .6 second
    if (errorInput) {
      this.setState({ validationEffect: true });
      this.data._validationEffectTimeoutId &&
        clearTimeout(this.data._validationEffectTimeoutId);
      this.data._validationEffectTimeoutId = setTimeout(
        () => this.setState({ validationEffect: false }),
        delay
      );
    }
  }

  componentDidMount() {
    this.data.inputNode = ReactDOM.findDOMNode(this).querySelector("input");
    const initialValue =
      this.fieldInfo.initialValue === undefined
        ? ""
        : this.fieldInfo.initialValue;
    this.changeValue(initialValue + "", true);

    if (!this.fieldInfo.date_IsShamsi) {
      this.setState({ value: this.fieldInfo.initialValue });
    }
  }

  componentWillUnmount() {
    this.data._validationEffectTimeoutId &&
      clearTimeout(this.data._validationEffectTimeoutId);
    this.data.inputNode = null;
  }

  //------------------------------------------------
  //endregion component private method
  //------------------------------------------------

  //------------------------------------------------
  //region render
  //------------------------------------------------

  render() {
    // if (this.props.fieldInfo.fieldName === "startDate_Min")
    //   console.log(this.state.value);

    const labelPositionClass =
      this.fieldInfo.labelPosition === LabelPosition.LabelOnTop &&
      "TextFieldInfo--column";
    const sliceWidths = this._getLabelWidthStyles();
    const styleLabel = {
      maxWidth: sliceWidths.slice1,
      minWidth: sliceWidths.slice1,
      dir: UiSetting.GetSetting("DefaultPageDirection"),
      textAlign:
        UiSetting.GetSetting("DefaultPageDirection") === "ltr"
          ? "left"
          : "right",
    };
    const styleInput = {
      maxWidth: sliceWidths.slice2,
      minWidth: sliceWidths.slice2,
    };
    const styleLabelAfter = {
      maxWidth: sliceWidths.slice3,
      minWidth: sliceWidths.slice3,
    };

    const hideLabel = this.fieldInfo.label_HideLabel;
    const readOnly = !this.fieldInfo.canEdit;
    const inputColorStyle = {
      color: this.fieldInfo.fontColor,
    };

    return (
      <div
        className={["TextFieldInfo", labelPositionClass]
          .filter((c) => c)
          .join(" ")}
      >
        {this.fieldInfo.label && (
          <label style={styleLabel} className={"TextFieldInfo__label"}>
            {!hideLabel && this.fieldInfo.label}
          </label>
        )}

        <div
          style={styleInput}
          className={["TextFieldInfo__container"].filter((c) => c).join(" ")}
        >
          {this.fieldInfo.date_IsShamsi ? (
            <DatePicker
              disabled={readOnly}
              styleInput={inputColorStyle}
              className={[
                "TextFieldInfo__input",
                "form-control",
                !this.isValid() && "is-invalid",
                this.state.validationEffect && "is-valid",
              ]
                .filter((c) => c)
                .join(" ")}
              isGregorian={!this.fieldInfo.date_IsShamsi}
              timePicker={false} //{this.fieldInfo.date_ShowTime}
              removable={true}
              min={this.data.min}
              max={this.data.max}
              onChange={this._handleDateChange}
              value={this.state.value}
              showTodayButton={false}
              setTodayOnBlur={false}
              setDirtyChildren={this.props.setDirtyChildren}
            />
          ) : (
            <input
              class="form-control"
              id="formGroupExampleInput"
              type={
                this.props.fieldInfo.date_ShowTime ? "datetime-local" : "date"
              }
              name={"dateAndTimeOfTransaction_Text"}
              value={this.state.value}
              onChange={(e) => {
                this._handleDateChange(e.target.value);
              }}
              onBlur={this._handleDateTimeClick.bind(this, this.state.value)}
              max={
                this.props.fieldInfo.date_ShowTime
                  ? "9999-12-31T23:59"
                  : "2999-12-31"
              }
            />
          )}

          {this.data.inputNode && this.fieldInfo.tooltip && (
            <UncontrolledTooltip target={this.data.inputNode}>
              {this._getTooltip()}
            </UncontrolledTooltip>
          )}
          {this.state.error && (
            <div style={{ display: "block" }} className="invalid-feedback">
              {this.state.error}
            </div>
          )}
        </div>

        {this.fieldInfo.label_After && (
          <label
            style={styleLabelAfter}
            className={"TextFieldInfo__label_after"}
          >
            {!hideLabel && this.fieldInfo.label_After}
          </label>
        )}
      </div>
    );
  }

  //------------------------------------------------
  //endregion render
  //------------------------------------------------
}

export default DateFieldInfo;
