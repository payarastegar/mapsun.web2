import React from "react";
import BaseComponent from "../BaseComponent";
import SystemClass from "../../SystemClass";
import FieldType from "../../class/enums/FieldType";
import moment from "moment-jalaali";

class LabelFieldInfo_Core extends BaseComponent {
  //------------------------------------------------
  //region share public properties
  //------------------------------------------------
  /** @type {(FieldInfo)} */
  fieldInfo;

  /** array[onChangeFunction]
   * @type {array<Function>}  */
  onChange_Callees = [];

  //------------------------------------------------
  //endregion share public properties
  //------------------------------------------------

  //------------------------------------------------
  //region component method
  //------------------------------------------------
  /**
   * base component's constructor that load initialize
   * */

  constructor(props) {
    super(props);
    this.fieldInfo = props.fieldInfo;
    // This line is critical: it links the data object back to the component instance.
    this.fieldInfo.component = this;
    this.props.onChange && this.addOnChange_Callee(this.props.onChange);
    //for init
    if (this.fieldInfo.label === undefined) {
      this.fieldInfo.label = this.fieldInfo.fieldName;
    }
    this.initialize();
  }

  /** react component method*/
  componentDidMount() {}

  /** react component method*/
  componentWillUnmount() {}

  //------------------------------------------------
  //endregion component method
  //------------------------------------------------

  //------------------------------------------------
  //region field info component method
  //------------------------------------------------
  
  initialize() {}

  _validationEffect() {}

  _getTooltip = () => {
    return (this.fieldInfo.tooltip || "").replace(/!@#/g, "\n");
  };

  /**
   * return formFieldInfo that show this component
   * @return {(FieldInfo)}
   */
  getFormInfo = () => {
    let formFieldInfo = this.fieldInfo._parentFieldInfo;
    while (formFieldInfo && formFieldInfo.fieldType !== FieldType.Form) {
      formFieldInfo = formFieldInfo._parentFieldInfo;
    }
    return formFieldInfo;
  };

  /**
   * return find FieldInfo by name that are in same form FieldInfo
   * @return {(FieldInfo)}
   */
  getFieldInfo(fieldName) {
    const formInfo = this.getFormInfo();
    return formInfo ? formInfo.getFieldInfo(fieldName) : null;
  }

  /**
   * return find FieldInfo by dataSourceName that are in same form FieldInfo
   * @return {(FieldInfo)}
   */
  getFieldInfoByDSName(dsName) {
     if (this.fieldInfo._parentComponent && this.fieldInfo._parentComponent.getFieldInfoByDSName) {
      return this.fieldInfo._parentComponent.getFieldInfoByDSName(dsName);
    }
    const formInfo = this.getFormInfo();
    return formInfo ? formInfo.getFieldInfoByDSName(dsName) : null;
  }

  /**
   * event that fire on value change
   * default fire rebind component
   */
  onChange = (value) => {
    if (value && this.fieldInfo.checkBox_ShowFormMenu_OnSelect) {
      const formFieldInfo = this.getFormInfo();
      formFieldInfo.component && formFieldInfo.component.showMenu(true);
    }
    this._fireRebindCallees(value);
  };

  _fireRebindCallees(value) {
    const fieldInfoList = [
      this.getFieldInfo(this.fieldInfo.onChange_Callee_1),
      this.getFieldInfo(this.fieldInfo.onChange_Callee_2),
      this.getFieldInfo(this.fieldInfo.onChange_Callee_3),
    ].filter((i) => i);

    fieldInfoList.forEach((fieldInfo) => fieldInfo && fieldInfo._rebindFromParent(value));
  }

  /**
   * rebind  component that need update after this component value change
   * for now only comboBox and Parent ComboBox that change in parent Value must rebind child
   */
  _rebindFromParent(value) {
    const combo_IdColName = this.fieldInfo.combo_IdColName;
    const parentFieldName =
      this.fieldInfo.combo_Parent_Value_GetFromThis_FieldName ||
      "twentyFourHour_PeriodStartTime_DateTime";
    const combo_TextColName = this.fieldInfo.combo_TextColName;

    const dataSource = this._dataGetDataSource();
    const parentFieldInfo = this.getFieldInfo(parentFieldName);

    const parentValue = parentFieldInfo && parentFieldInfo.getValue();

    // console.log(parentFieldInfo.getValue());

    const dataRow = dataSource.dataArray.find(
      (row) => row[combo_IdColName] == parentValue
    );

    if (dataSource.formName === "fintrac_Transaction_ReportEdit") {
      const rebindValue = parentFieldInfo.getValue();

      if (!rebindValue) return;

      const startDate = new Date(rebindValue);
      const endDate = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate(),
        startDate.getHours(),
        startDate.getMinutes(),
        startDate.getSeconds()
      );

      const endTime_Formatted = moment(endDate)
        .add(24, "h")
        .subtract(1, "s")
        .toISOString(true)
        .substring(0, 19);

      this.changeValue(endTime_Formatted, true);
      return;
    } else if (!dataRow) return;

    const rebindValue = dataRow[combo_TextColName];

    this.changeValue(rebindValue);
  }

  /**
   * update component such
   * datasource binding
   */
  update() {}

  /**
   * add callback event for onChange
   * fire callback when component value change
   */
  addOnChange_Callee(callback) {
    //not add again
    if (this.onChange_Callees.indexOf(callback) === -1)
      this.onChange_Callees.push(callback);
  }

  /**
   * return value of component
   * depend on type
   */
  getValue() {
    //no value component
  }

  /**
   * error return on web service validation
   * for now just say fill field
   */
  getCustomError() {
    if (this.fieldInfo._error === "updateError") {
      return "فیلد را مشخص نمایید";
    }
  }

  isValid() {
    throw "CustomError: Unimplemented!";
  }

  _dataGetDataSource(dataSourceName) {
    return this.fieldInfo.getDataSource(dataSourceName);
  }

  // Other abstract methods
  asInt() { throw "CustomError: Unimplemented!"; }
  asFloat() { throw "CustomError: Unimplemented!"; }
  asText() { throw "CustomError: Unimplemented!"; }
  asDate() { throw "CustomError: Unimplemented!"; }
  rebind() { throw "CustomError: Unimplemented!"; }
  changeValue(newValue) { throw "CustomError: Unimplemented!"; }
}

export default LabelFieldInfo_Core;
