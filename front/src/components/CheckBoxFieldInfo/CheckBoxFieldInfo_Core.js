import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import Utils from "../../Utils";

class CheckBoxFieldInfo_Core extends TextFieldInfo {
  //------------------------------------------------
  //region component public method
  //------------------------------------------------

  initialize() {
    this.state = {
      isChecked: false,
      placeholder: this.fieldInfo.placeholder,
    };

    this.data = {
      isValid: true,
      isTouched: false,
      isDirty: false,
      containerNode: "",
    };
  }

  update() {
    const readOnly = !this.fieldInfo.canEdit;
    let value = this.state.isChecked;
    if (
      readOnly &&
      this.fieldInfo.dataSourceName == this.getFormInfo().dataSourceName
    ) {
      const ds = this._dataGetDataSource();
      if (ds && ds.dataArray[0]) {
        value = ds.dataArray[0][this.fieldInfo.fieldName];
      }
    }

    this.changeValue(value);
    this.forceUpdate();
  }

  /***
   * return component value
   * @return Boolean
   */
  getValue() {
    return !!this.state.isChecked;
  }

  /***
   * change the value of component with new value
   * @param  isChecked
   * @param forceChange
   */
  changeValue(isChecked, forceChange) {
    const readOnly = !this.fieldInfo.canEdit;

    let errorList = this._validationCheck(isChecked);
    this.data.isValid = errorList.length === 0;
    this.data.isValid && this._validationEffect();
    this.state.error = Utils.getErrorList(errorList, this.fieldInfo);

    if (readOnly && !forceChange) return;
    if (Utils.isEqual(isChecked, this.state.isChecked)) return;

    if (this.state.isChecked !== null) {
      //null mean first assign => default value set
      this.setDirty(true);
      this._fireCallees(isChecked);
    }

    this.state.isChecked = isChecked;
    this.fieldInfo._error = "";
    this.forceUpdate();
  }

  //------------------------------------------------
  //endregion component public method
  //-----------------------------------------------

  //------------------------------------------------
  //region component private method
  //-----------------------------------------------
  /***
   * return errorList
   * @param value
   * @return array {[...errorText]}
   */
  _validationCheck(value) {
    const errorList = [];
    const customError = this.getCustomError();
    customError && errorList.push(customError);
    return errorList;
  }

  /***
   * return fixed value by validation and config
   * @param value
   * @return value {value}
   */
  _validationFix(value) {
    return value;
  }

  /***
   * for onchange event handle
   * @param event
   */
  _handleInputChange(event) {
    let isChecked = event.target.checked;
    this.changeValue(isChecked);

    //preventing form close if checkbox value has changed
    if (this.props.setDirtyChildren) {
      this.props.setDirtyChildren();
    }

    this.checkGridRow();
  }
  //------------------------------------------------
  //endregion component private method
  //-----------------------------------------------
}

export default CheckBoxFieldInfo_Core;
