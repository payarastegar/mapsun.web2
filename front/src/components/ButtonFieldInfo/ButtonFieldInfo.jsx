import React, { Component } from "react";
import "./ButtonFieldInfo.css";
import { UncontrolledTooltip } from "reactstrap";
import LabelPosition from "../../class/enums/LabelPosition";
import FontAwesome from "react-fontawesome";
import ButtonFieldInfo_Core from "./ButtonFieldInfo_Core";
// import Button from "reactstrap/es/Button";
import { Button } from "reactstrap";

class ButtonFieldInfo extends ButtonFieldInfo_Core {
  constructor(props) {
    super(props);
    this.nodeRef = React.createRef();
  }

  //------------------------------------------------
  //region component public method
  //------------------------------------------------

  componentDidMount() {
    this.data.getDataFromExternal = this.props.getDataFromExternal;
    this.data.node = this.nodeRef.current;
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

    const numberElement = !number ? (
      ""
    ) : (
      <span className={"ButtonFieldInfo__number"}>{number}</span>
    );

    if (this.fieldInfo.fontColor) {
      styleInput.color = this.fieldInfo.fontColor;
    }

    // A unique ID for the tooltip to target
    const elementId = `button_${this.fieldInfo.fieldName}_${this.fieldInfo.formId}`;

    return (
      <div
        ref={this.nodeRef}
        id={elementId} // An ID is needed for UncontrolledTooltip
        style2={{ display: "inline" }}
        className={[
          "TextFieldInfo",
          labelPositionClass,
          iconButton && "ButtonFieldInfo__iconContainer",
        ]
          .filter((c) => c)
          .join(" ")}
      >
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
        {this.fieldInfo.tooltip && (
          <UncontrolledTooltip target={elementId}>
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