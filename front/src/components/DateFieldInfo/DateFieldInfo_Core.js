import moment from "moment-jalaali";
import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";

class DateFieldInfo_Core extends TextFieldInfo {
  //------------------------------------------------
  //region component public method
  //------------------------------------------------

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
      min: undefined,
      max: undefined,
    };

    const isPersianDate = this.fieldInfo.date_IsShamsi;
    const min = this.fieldInfo.date_Min;
    const max = this.fieldInfo.date_Max;
    if (min) {
      this.data.min = moment(min, isPersianDate && "jYYYY/jM/jD");
    }
    if (max) {
      this.data.max = moment(max, isPersianDate && "jYYYY/jM/jD");
    }
  }

  /***
   * return if component is valid
   * @return object {isValid: bool, errorList: [...errorText]}
   */
  isValid() {
    return this.data.isValid;
  }

  /***
   * return if component is dirty mean changed value from input
   * @return boolean
   */
  isDirty() {
    return this.data.isDirty;
  }

  /***
   * return if component is touched mean focused
   * @return boolean
   */
  isTouched() {
    return this.data.isTouched;
  }

  /***
   * set dirty of component
   * @param {boolean} dirty
   * @return boolean
   */
  setDirty(dirty) {
    return (this.data.isDirty = dirty);
  }

  /***
   * set touch of component
   * @param {boolean} touch
   * @return boolean
   */
  setTouched(touch) {
    console.log(touch);
    return (this.data.isTouched = touch);
  }

  //------------------------------------------------
  //endregion component public method
  //------------------------------------------------

  //------------------------------------------------
  //region component private method
  //------------------------------------------------
  getCustomError() {
    const error = this.fieldInfo._error;
    if (error == "updateError") {
      if (!this.state.value) {
        return "فیلد را مشخص نمایید";
      } else {
        return "تاریخ معتبر نمی باشد";
      }
    }
  }

  /***
   * return errorList
   * @param value
   * @return array {[...errorText]}
   */
  _validationCheck(value) {
    const errorList = [];
    if (!value) {
      this.fieldInfo.require && errorList.push("require");
    }
    const customError = this.getCustomError();
    customError && errorList.push(customError);
    return errorList;
  }

  static validationFix(value, fieldInfo) {
    const isPersianDate = fieldInfo.date_IsShamsi;
    const showTime = isPersianDate ? false : fieldInfo.date_ShowTime;
    let format = isPersianDate ? "jYYYY/jM/jD" : "YYYY/MM/DD";
    format += showTime ? " HH:mm" : "";
    value = moment(value);
    return value.format(format);
  }

  _fireCallees(value) {
    this.onChange_Callees.forEach((cb) => cb && cb(this, value));
    this.onChange(value);
  }

  /***
   * for onfocus event handle
   * @param event
   */
  _handleInputFocus(event) {
    this.setTouched(true);
  }

  /***
   * return component value
   * @return String
   */
  getValue() {
    if (!this.state.value) {
      return null;
    }

    return this.fieldInfo.date_IsShamsi
      ? this.state.value.format("YYYY/MM/DD")
      : this.state.value;
  }

  /***
   * change the value of component with new value
   * @param  value
   */
  changeValue(value, forceRefresh) {
    const isPersianDate = this.fieldInfo.date_IsShamsi;

    if (typeof value === "string") {
      // console.log("before:", value);
      // value = moment(value, isPersianDate && "jYYYY/jM/jD");
      value = isPersianDate ? moment(value) : value;
      // console.log("after:", value);
    }

    if (isPersianDate && value && !value.isValid()) {
      value = "";
    }

    let errorList = this._validationCheck(value);
    this.data.isValid = errorList.length === 0;
    this.data.isValid && this._validationEffect();

    if (forceRefresh || value != this.state.value) {
      this.setDirty(true);

      this.state.value = value;
      this.setState({ value: value, error: errorList.join(" - ") });
      this._fireCallees(value);
    }

    //reset custom error
    this.fieldInfo._error = "";
  }

  rebind() {
    this.forceUpdate();
  }

  /***
   * for onchange event handle
   * @param date
   */
  _handleDateChange = (date) => {
    this.fieldInfo.date_IsShamsi
      ? this.changeValue(date)
      : this.props.fieldInfo.date_ShowTime && date.length > 0
      ? this.setState({ value: (date += ":00") })
      : this.setState({ value: date });
  };

  _handleDateTimeClick(dataRow) {
    ////first must set text for combo open
    // this._setInputText(title);
    ////then change value
    this._setValue(dataRow);
    // this._openDropdownMenu(false);
    ////check later
    // this._validationEffect();
  }

  _setValue(value) {
    this._fireCallees(this.getValue());
  }
  //------------------------------------------------
  //endregion component private method
  //------------------------------------------------
}

export default DateFieldInfo_Core;
