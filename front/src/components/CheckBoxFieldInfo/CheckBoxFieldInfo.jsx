import "./CheckBoxFieldInfo.css";
import React from "react";
import LabelPosition from "../../class/enums/LabelPosition";
import { UncontrolledTooltip } from "reactstrap";
import * as ReactDOM from "react-dom";
import Utils from "../../Utils";
import CheckBoxFieldInfo_Core from "./CheckBoxFieldInfo_Core";
import UiSetting from "../../UiSetting";

//https://codepen.io/MoorLex/pen/XeNzoK
class CheckBoxFieldInfo extends CheckBoxFieldInfo_Core {
  //------------------------------------------------
  //region component public methods
  //-----------------------------------------------
  componentDidMount() {
    this.data.containerNode = ReactDOM.findDOMNode(this).querySelector(
      "input"
    ).parentElement;
    this.state.isChecked = false;
    this.changeValue(Utils.getBoolean(this.fieldInfo.initialValue), true);
    this.forceUpdate();
  }

  componentWillUnmount() {
    this.data._validationEffectTimeoutId &&
      clearTimeout(this.data._validationEffectTimeoutId);
  }

  //------------------------------------------------
  //endregion component public methods
  //-----------------------------------------------

  //------------------------------------------------
  //region render
  //-----------------------------------------------

  render() {
    const labelPositionClass =
      this.fieldInfo.labelPosition === LabelPosition.LabelOnTop &&
      "TextFieldInfo--column";
    const styleLabel = {
      maxWidth: this.fieldInfo.width_Slice1 + "%",
      minWidth: this.fieldInfo.width_Slice1 + "%",
    };
    const styleInput = {
      maxWidth: this.fieldInfo.width_Slice2 + "%",
      minWidth: this.fieldInfo.width_Slice2 + "%",
    };
    const styleLabelAfter = {
      maxWidth: this.fieldInfo.width_Slice3 + "%",
      minWidth: this.fieldInfo.width_Slice3 + "%",
    };

    const classList = {
      label: "CheckBoxFieldInfo__label",
      input: "CheckBoxFieldInfo__input",
      background: "CheckBoxFieldInfo__background",
      check: "CheckBoxFieldInfo__check",
    };

    if (this.fieldInfo.checkBox_SwitchMode) {
      classList.label += " " + classList.label + "--switch";
      classList.input += " " + classList.input + "--switch";
      classList.background += " " + classList.background + "--switch";
      classList.check += " " + classList.check + "--switch";
    }

    const checkBox_HideToggleControl = this.fieldInfo
      .checkBox_HideToggleControl;
    if (checkBox_HideToggleControl) {
      classList.label += " CheckBoxFieldInfo__label--labelOnly";
      classList.input += " CheckBoxFieldInfo__check--hide";
      classList.background += " CheckBoxFieldInfo__check--hide";
      classList.check += " CheckBoxFieldInfo__check--hide";
    }

    // console.log(this.fieldInfo.a, this.state.isChecked, this.fieldInfo.initialValue, this.fieldInfo)
    const readOnly = !this.fieldInfo.canEdit;

    const hideLabel = this.fieldInfo.label_HideLabel;

    // console.log(readOnly, this.fieldInfo)

    const fontColor = this.fieldInfo.fontColor;

    return (
      <div
        style={this.props.style}
        className={[
          this.props.className,
          "CheckBoxFieldInfo",
          labelPositionClass,
        ]
          .filter((c) => c)
          .join(" ")}
        onClick={(event) => event.stopPropagation()}
      >
        {/*{*/}
        {/*this.fieldInfo.label &&*/}
        {/*<label style={styleLabel} className={''}>*/}
        {/*{this.fieldInfo.label}*/}
        {/*</label>*/}
        {/*}*/}

        <label className={"CheckBoxFieldInfo__container"} style={styleInput}>
          <span
            className={classList.label}
            style={{
              color:
                (this.state.isChecked
                  ? this.fieldInfo.checkBox_TrueColor
                  : this.fieldInfo.checkBox_FalseColor) || fontColor,
            }}
          >
            {!hideLabel &&
              ((this.state.isChecked
                ? this.fieldInfo.checkBox_TrueText
                : this.fieldInfo.checkBox_FalseText) ||
                this.fieldInfo.label)}
          </span>

          <input
            className={classList.input}
            type="checkbox"
            dir="auto"
            checked={this.state.isChecked}
            placeholder={this.state.placeholder}
            onChange={this._handleInputChange.bind(this)}
            onFocus={this._handleInputFocus.bind(this)}
            readOnly={readOnly}
            disabled={readOnly}
          />

          <span className={classList.background} />
          <span className={classList.check} />

          {this.data.containerNode && this.fieldInfo.tooltip && (
            <UncontrolledTooltip target={this.data.containerNode}>
              {this._getTooltip()}
            </UncontrolledTooltip>
          )}
        </label>

        {this.state.error && (
          <div className="invalid-feedback" style={{ display: "block" }}>
            {this.state.error}
          </div>
        )}

        {this.fieldInfo.label_After && (
          <label style={styleLabelAfter} className={""}>
            {!hideLabel && this.fieldInfo.label_After}
          </label>
        )}
      </div>
    );
  }

  //------------------------------------------------
  //endregion render
  //-----------------------------------------------
}

export default CheckBoxFieldInfo;
