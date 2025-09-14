import React, { Component } from "react";
import "./ButtonFieldInfo.css";
import Utils from "../../Utils";
import * as ReactDOM from "react-dom";
import Tooltip from "reactstrap/es/Tooltip";
import { UncontrolledTooltip } from "reactstrap";
import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import defaultImage from "../../content/divider.png";
import Button from "reactstrap/es/Button";
import LabelPosition from "../../class/enums/LabelPosition";
import ButtonActionTypes from "../../class/enums/ButtonActionTypes";
import SystemClass from "../../SystemClass";
import WebService from "../../WebService";
import FieldType from "../../class/enums/FieldType";
import FontAwesome from "react-fontawesome";
import FileUtils from "../../file/FileUtils";
import ButtonFieldInfo_Core from "./ButtonFieldInfo_Core";

class ButtonFieldInfo extends ButtonFieldInfo_Core {
  //------------------------------------------------
  //region component public method
  //------------------------------------------------

  componentDidMount() {
    this.data.getDataFromExternal = this.props.getDataFromExternal;
    this.data.node = ReactDOM.findDOMNode(this); //get node of button
    this.forceUpdate();
  }

  componentWillUnmount() {
    this.data._validationEffectTimeoutId &&
      clearTimeout(this.data._validationEffectTimeoutId);
    this.data.node = null;
  }

  //------------------------------------------------
  //endregion component public method
  //------------------------------------------------

  //------------------------------------------------
  //region render
  //------------------------------------------------

  render() {
    const labelPositionClass =
      this.fieldInfo.labelPosition === LabelPosition.LabelOnTop &&
      "TextFieldInfo--column";
    const sliceWidths = this._getLabelWidthStyles();

    const styleLabel = {
      maxWidth: sliceWidths.slice1,
      minWidth: sliceWidths.slice1,
    };
    const styleInput = {
      maxWidth: sliceWidths.slice2,
      minWidth: sliceWidths.slice2,
    };
    const styleLabelAfter = {
      maxWidth: sliceWidths.slice3,
      minWidth: sliceWidths.slice3,
    };

    const icon = this.fieldInfo.button_IconName;
    const image = this.fieldInfo.button_ImageName;
    const hideText = !this.fieldInfo.button_ShowText && !!icon;

    const iconButton = icon && !image && hideText;

    const hideLabel = this.fieldInfo.label_HideLabel;

    const button_ShowNumber_FieldName = this.fieldInfo
      .button_ShowNumber_FieldName;
    const number =
      this.fieldInfo._row && this.fieldInfo._row[button_ShowNumber_FieldName];

    //number exit and not Zero
    const numberElement = !number ? (
      ""
    ) : (
      <span className={"ButtonFieldInfo__number"}>{number}</span>
    );

    // if (this.fieldInfo._row && this.fieldInfo._row.fieldName === 'fileNameAndPath') console.log(this.fieldInfo)

    if (this.fieldInfo.fontColor) {
      styleInput.color = this.fieldInfo.fontColor;
    }

    return (
      <div
        style2={{ display: "inline" }}
        className={[
          "TextFieldInfo",
          labelPositionClass,
          iconButton && "ButtonFieldInfo__iconContainer",
        ]
          .filter((c) => c)
          .join(" ")}
      >
        {/*{*/}
        {/*this.fieldInfo.label &&*/}
        {/*<label style={styleLabel} className={'TextFieldInfo__label'}>*/}
        {/*{this.fieldInfo.label}*/}
        {/*</label>*/}
        {/*}*/}

        <Button
          outline={hideText}
          style={styleInput}
          color="primary"
          className={[
            "ButtonFieldInfo__button",
            iconButton && "ButtonFieldInfo__buttonIcon",
          ]
            .filter((c) => c)
            .join(" ")}
          onClick={this._handleClick.bind(this)}
        >
          {icon && (
            <FontAwesome className="ButtonFieldInfo__icon" name={icon} />
          )}

          {numberElement}

          {!hideLabel && !hideText && this.fieldInfo.label}
        </Button>

        {this.fieldInfo.label_After && (
          <label
            style={styleLabelAfter}
            className={"TextFieldInfo__label_after"}
          >
            {!hideLabel && this.fieldInfo.label_After}
          </label>
        )}
        {this.data.node && this.fieldInfo.tooltip && (
          <UncontrolledTooltip target={this.data.node}>
            {this._getTooltip()}
          </UncontrolledTooltip>
        )}
      </div>
    );
  }

  //------------------------------------------------
  //endregion render
  //------------------------------------------------
}

export default ButtonFieldInfo;
