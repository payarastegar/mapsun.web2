import React, { Component } from "react";
import "./TextFieldInfo.css";
import { UncontrolledTooltip } from "reactstrap";
import LabelPosition from "../../class/enums/LabelPosition";
import FontAwesome from "react-fontawesome";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import "rc-tooltip/assets/bootstrap.css";
import SystemClass from "../../SystemClass";
import TextFieldInfo_Core from "./TextFieldInfo_core";
import UiSetting from "../../UiSetting";
import Utils from "../../Utils";

class TextFieldInfo extends TextFieldInfo_Core {
  constructor(props) {
    super(props);
    this.inputContainerRef = React.createRef();
  }

  //------------------------------------------------
  //region public methods
  //------------------------------------------------
  componentDidMount() {
    const initialValue =
      this.fieldInfo.initialValue === undefined
        ? ""
        : this.fieldInfo.initialValue;
    this.changeValue(initialValue);

    if (
      this.fieldInfo.fieldName === "passwordText_New" ||
      this.fieldInfo.fieldName === "passwordText_New_Confirm"
    ) {
      this.data.isPassword = true;
    }
  }

  componentWillUnmount() {
    this.data._validationEffectTimeoutId &&
      clearTimeout(this.data._validationEffectTimeoutId);
    this.data.inputNode = null;
  }

  //------------------------------------------------
  //endregion public methods
  //------------------------------------------------

  //------------------------------------------------
  //region render element
  //------------------------------------------------

  //for number field info only
  //switch to slider number picker
  _elementGetNumberSlider = () => {
    const slider_ShowSlider = this.fieldInfo.number_Slider_ShowSlider;
    const slider_Steps_ShowSteps = this.fieldInfo.number_Slider_Steps_ShowSteps;
    const slider_Steps_ShowStepLabels = this.fieldInfo
      .number_Slider_Steps_ShowStepLabels;
    const slider_ShowLabels = this.fieldInfo.number_Slider_ShowLabels;

    const slider_Steps_Numbers = +this.fieldInfo.number_Slider_Steps_Number;
    const minValue = +this.fieldInfo.number_MinValue;
    const maxValue = +this.fieldInfo.number_MaxValue;

    if (!Utils.isNumber(minValue) || !Utils.isNumber(maxValue)) {
      SystemClass.showErrorMsg(
        "خطا در فیلد " +
          this.fieldInfo.fieldName +
          " مقدار حداقل یا حداکثر تنظیم نشده است !"
      );
      return; //error
    }

    const Tag = slider_Steps_ShowStepLabels
      ? Slider.createSliderWithTooltip(Slider)
      : Slider;

    const props = {};
    if (Utils.isNumber(minValue)) {
      props.min = minValue;
    }
    if (Utils.isNumber(maxValue)) {
      props.max = maxValue;
    }
    if (Utils.isNumber(slider_Steps_Numbers)) {
      const sliceNumber = Math.round(
        (maxValue - minValue) / slider_Steps_Numbers
      );
      const marks = {};
      marks[minValue] = slider_ShowLabels && minValue;
      marks[maxValue] = slider_ShowLabels && maxValue;
      for (let i = minValue + sliceNumber; i < maxValue; i += sliceNumber) {
        marks[i] = "";
      }
      props.marks = marks;
      props.step = null;
    }

    return (
      <Tag
        onChange={(value) => {
          this.changeValue(value + "");
        }}
        {...props}
        value={+this.state.value}
        tipFormatter={(value) => value}
        defaultValue={+this.state.value}
        dots2={slider_Steps_ShowSteps}
      />
    );
  };

  render() {
    const labelPositionClass =
      this.fieldInfo.labelPosition === LabelPosition.LabelOnTop &&
      "TextFieldInfo--column";
    const sliceWidths = this._getLabelWidthStyles();
    const styleLabel = {
      flexBasis: sliceWidths.slice1,
      minWidth: sliceWidths.slice1,
      maxWidth: sliceWidths.slice1,
      textAlign:
        UiSetting.GetSetting("DefaultPageDirection") === "ltr" ? "left" : "right",
    };
    const styleInput = {
      flexBasis: sliceWidths.slice2,
      minWidth: sliceWidths.slice2,
      maxWidth: sliceWidths.slice2,
    };
    const styleLabelAfter = {
      flexBasis: sliceWidths.slice3,
      minWidth: sliceWidths.slice3,
      maxWidth: sliceWidths.slice3,
    };

    const icon = this.fieldInfo.iconName;
    const inputClass = icon && "TextFieldInfo__input--icon";
    const readOnly = !this.fieldInfo.canEdit;
    const hideLabel = this.fieldInfo.label_HideLabel;
    const Tag = this.fieldInfo.text_MultiLine_IsMultiLine ? "textarea" : "input";
    const text_MultiLine_NumberOfLines = this.fieldInfo.text_MultiLine_NumberOfLines;
    if (this.fieldInfo.fontColor) {
      styleInput.color = this.fieldInfo.fontColor;
    }
    const styleTag = {};
    if (this.fieldInfo.field_BackColor_Normal)
      styleTag.background = this.fieldInfo.field_BackColor_Normal;
    if (this.fieldInfo.field_BackColor_ReadOnly)
      styleTag.background = this.fieldInfo.field_BackColor_ReadOnly;

    const elementId = `textfield_${this.fieldInfo.fieldName}`;

    return (
      <div className={["TextFieldInfo", labelPositionClass].filter((c) => c).join(" ")}>
        {this.fieldInfo.label && (
          <label style={styleLabel} className={"TextFieldInfo__label"}>
            {!hideLabel && this.fieldInfo.label}
          </label>
        )}

        <div
          ref={this.inputContainerRef}
          id={elementId}
          style={styleInput}
          className={["TextFieldInfo__container"].filter((c) => c).join(" ")}
        >
          <Tag
            className={[
              "TextFieldInfo__input",
              "form-control",
              inputClass,
              !this.isValid() && "is-invalid",
              this.state.validationEffect && "is-valid",
            ]
              .filter((c) => c)
              .join(" ")}
            dir={
              this.state.inputType === "tel"
                ? "ltr"
                : UiSetting.GetSetting("DefaultPageDirection")
            }
            type={
              this.data.isPassword
                ? "password"
                : this.state.inputType === "tel"
                ? "text"
                : this.state.inputType
            }
            value={this.state.value || ""}
            placeholder={this.fieldInfo.placeholder}
            onChange={this._handleInputChange.bind(this)}
            onKeyDown={this._handleInsertLineBreak.bind(this)}
            onFocus={this._handleInputFocus.bind(this)}
            readOnly={readOnly}
            rows={text_MultiLine_NumberOfLines}
            ref={(node) => {
              if (node && styleTag.background)
                node.style.setProperty("background", styleTag.background, "important");
            }}
          />

          {icon && <FontAwesome className="TextFieldInfo__icon" name={icon} />}
          
          {this.fieldInfo.tooltip && (
            <UncontrolledTooltip target={elementId}>
              {this._getTooltip()}
            </UncontrolledTooltip>
          )}

          <div className="invalid-feedback">{this.state.error}</div>
        </div>

        {this.fieldInfo.number_Slider_ShowSlider ? (
          <div
            style={styleLabelAfter}
            className={"TextFieldInfo__sliderContainer"}
          >
            {this._elementGetNumberSlider()}
          </div>
        ) : (
          this.fieldInfo.label_After && (
            <label
              style={styleLabelAfter}
              className={"TextFieldInfo__label_after"}
            >
              {!hideLabel && this.fieldInfo.label_After}
            </label>
          )
        )}
      </div>
    );
  }

  //------------------------------------------------
  //endregion public methods
  //------------------------------------------------
}

export default TextFieldInfo;
