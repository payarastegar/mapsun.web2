import React, { Component } from "react";
import "./DashboardButton.css";
// import Button from "reactstrap/es/Button";
import { Button } from "reactstrap";
import LabelPosition from "../../class/enums/LabelPosition";
import ButtonFieldInfo_Core from "../ButtonFieldInfo/ButtonFieldInfo_Core";

class DashboardButton extends ButtonFieldInfo_Core {
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

  _handleButtonClick = (e) => {
    this._handleClick(e, null, this.props.extraParams);
  };
  //------------------------------------------------
  //endregion component public method
  //------------------------------------------------

  //------------------------------------------------
  //region render
  //------------------------------------------------

  render() {
    const sliceWidths = this._getLabelWidthStyles();
    const styleInput = {
      maxWidth: sliceWidths.slice2,
      minWidth: sliceWidths.slice2,
    };

    const icon = this.fieldInfo.button_IconName;
    const hideText = !this.fieldInfo.button_ShowText && !!icon;
    const hideLabel = this.fieldInfo.label_HideLabel;
    const button_ShowNumber_FieldName = this.fieldInfo.button_ShowNumber_FieldName;
    const number = this.fieldInfo._row && this.fieldInfo._row[button_ShowNumber_FieldName];
    const numberElement = !number ? ("") : (<span className={"ButtonFieldInfo__number"}>{number}</span>);

    if (this.fieldInfo.fontColor) {
      styleInput.color = this.fieldInfo.fontColor;
    }

    return (
      <Button
        ref={this.nodeRef}
        outline={hideText}
        style={styleInput}
        color="primary"
        className={["btn-dashboard"].filter((c) => c).join(" ")}
        onClick={this._handleButtonClick.bind(this)}
      >
        {icon && <i className={`btn-dashboard_Icon bi bi-${icon}`} />}
        {numberElement}
        {!hideLabel && !hideText && this.fieldInfo.label}
      </Button>
    );
  }

  //------------------------------------------------
  //endregion render
  //------------------------------------------------
}

export default DashboardButton;
