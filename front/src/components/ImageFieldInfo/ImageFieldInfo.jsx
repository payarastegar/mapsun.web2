import React, { Component } from "react";
import "./ImageFieldInfo.css";
import Utils from "../../Utils";
import * as ReactDOM from "react-dom";
import Tooltip from "reactstrap/es/Tooltip";
import { UncontrolledTooltip } from "reactstrap";
import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import defaultImage from "../../content/avatar_test.jpg";
import LabelPosition from "../../class/enums/LabelPosition";
import WebService from "../../WebService";
import UiSetting from "../../UiSetting";

// import Utils from '.././Utils.js';

class ImageFieldInfo extends TextFieldInfo {
  initialize() {
    //for binding
    this.state = {
      error: "",
      value: "",
      inputType: "text",
      validationEffect: false,
    };

    this.data = {
      isValid: true,
      isTouched: false,
      isDirty: false,
      _validationEffectTimeoutId: "",
      inputNode: "",
    };
  }

  update() {
    // const ds = this._dataGetDataSource()
    // ds.
  }

  _getUrl() {
    const url = this.fieldInfo._value;
    this.data.url = this.data.url || WebService.getFileUrl(url);
    return this.data.url;
  }

  render() {
    const labelPositionClass =
      this.fieldInfo.labelPosition === LabelPosition.LabelOnTop &&
      "TextFieldInfo--column";
    const sliceWidths = this._getLabelWidthStyles();
    const styleLabel = {
      flexBasis: sliceWidths.slice1,
      minWidth: sliceWidths.slice1,
      maxWidth: sliceWidths.slice1,
      dir: UiSetting.GetSetting("DefaultPageDirection"),
      textAlign:
        UiSetting.GetSetting("DefaultPageDirection") === "ltr"
          ? "left"
          : "right",
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

    const hideLabel = this.fieldInfo.label_HideLabel;

    const styleImage = {
      maxHeight: this.fieldInfo.image_MaxHeight,
      maxWidth: this.fieldInfo.image_MaxWidth,
    };

    // console.log(this.fieldInfo)
    const url = this._getUrl();
    return (
      <div
        className={["ImageFieldInfo", "TextFieldInfo", labelPositionClass]
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
          className={["TextFieldInfo__container", "ImageFieldInfo__container"]
            .filter((c) => c)
            .join(" ")}
        >
          <img
            style={styleImage}
            className="ImageFieldInfo__image"
            src={url || defaultImage}
            alt={"image"}
          />
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
}

export default ImageFieldInfo;
