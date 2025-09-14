import Utils from "../../Utils";
import LabelFieldInfo from "../LabelFieldInfo/LabelFieldInfo";
import SystemClass from "../../SystemClass";

class TextFieldInfo_Core extends LabelFieldInfo {
  static validationFix(value, fieldInfo) {
    //toString
    value = value + "";
    if (Utils.isNumber(fieldInfo.text_MaxLength)) {
      value = value.slice(0, +fieldInfo.text_MaxLength);
    }

    if (fieldInfo.text_AllowedChars) {
      value = value.replace(
        new RegExp(`[^${fieldInfo.text_AllowedChars}]`, "g"),
        ""
      );
    }

    if (fieldInfo.text_notAllowedChars) {
      value = value.replace(
        new RegExp(`[${fieldInfo.text_notAllowedChars}]`, "g"),
        ""
      );
    }

    value = value.replace(/!@#/g, "\n");
    return value;
  }

  //------------------------------------------------
  //region public methods
  //------------------------------------------------

  initialize() {
    //for binding
    this.state = {
      error: "",
      value: undefined, //must be undefined
      inputType: "text",
      validationEffect: false,
    };

    this.data = {
      isValid: true,
      isTouched: false,
      isDirty: false,
      _validationEffectTimeoutId: "",
      inputNode: "",
      isPassword: false,
    };
  }

  update() {
    const readOnly = !this.fieldInfo.canEdit;
    let value = this.state.value;
    if (
      readOnly &&
      this.fieldInfo.dataSourceName == this.getFormInfo().dataSourceName
    ) {
      const ds = this._dataGetDataSource();
      if (ds && ds.dataArray[0]) {
        value = ds.dataArray[0][this.fieldInfo.fieldName];
      }
    }

    //true for force changes
    this.changeValue(value, true);
    this.forceUpdate();
  }

  /***
   * return Json from text
   * @return Object
   */
  getJson() {}

  /***
   * set Json as text
   */
  setJson() {}

  /***
   * return component value as text
   * @return String
   */
  asText() {
    return this.getValue();
  }

  /***
   * return component value as Int
   * @return Integer
   */
  asInt() {
    return parseInt(this.getValue());
  }

  /***
   * return component value as Float
   * @return Number{Float}
   */
  asFloat() {
    return parseFloat(this.getValue());
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

  //------------------------------------------------
  //endregion public methods
  //------------------------------------------------

  /***
   * set touch of component
   * @param {boolean} touch
   * @return boolean
   */
  setTouched(touch) {
    return (this.data.isTouched = touch);
  }

  _isJsonText() {
    return this.fieldInfo.fieldName.startsWith("txtj");
  }

  /***
   * return errorList
   * @param value
   * @return array {[...errorText]}
   */
  _validationCheck(value) {
    let errorList = [];

    if (!value) {
      const customError = this.getCustomError();
      customError && errorList.push(customError);
      this.fieldInfo.require && errorList.push("require");
      return errorList;
    }

    //toString
    value = value + "";

    if (this._isJsonText()) {
      try {
        JSON.parse(value);
      } catch (e) {
        errorList.push("json");
      }
    }

    if (Utils.isNumber(this.fieldInfo.text_MaxLength)) {
      value.length > +this.fieldInfo.text_MaxLength &&
        errorList.push("text_MaxLength");
    }
    if (Utils.isNumber(this.fieldInfo.text_MinLength)) {
      value.length < +this.fieldInfo.text_MinLength &&
        errorList.push("text_MinLength");
    }

    if (this.fieldInfo.text_AllowedChars) {
      value.match(new RegExp(`[^${this.fieldInfo.text_AllowedChars}]`, "g")) &&
        errorList.push("text_AllowedChars");
    }

    if (this.fieldInfo.text_notAllowedChars) {
      value.match(
        new RegExp(`[${this.fieldInfo.text_notAllowedChars}]`, "g")
      ) && errorList.push("text_notAllowedChars");
    }

    if (this.fieldInfo.text_RegExp) {
      !value.match(new RegExp(this.fieldInfo.text_RegExp, "g")) &&
        errorList.push("text_RegExp");
    }

    const customError = this.getCustomError();
    customError && errorList.push(customError);

    return errorList;
  }

  /***
   * return fixed value by validation and config
   * @param value
   * @param fieldInfo
   * @return value {value}
   */
  _validationFix(value, fieldInfo) {
    return TextFieldInfo_Core.validationFix(value, fieldInfo);
  }

  _fireCallees(value) {
    if (this._lastValue == value) return;

    this._lastValue = value;
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
    if (this._isJsonText()) {
      //value can be json object
      try {
        // return JSON.parse(this.state.value)
        return this.state.value;
      } catch (e) {
        // SystemClass.showErrorMsg("متن مورد نظر جِیسون نمی باشد !")
        return null;
      }
    }

    return this.state.value || "" + "";
  }

  /***
   * change the value of component with new value
   * @param  value
   */
  changeValue(value) {
    if (typeof value === "object" && this._isJsonText()) {
      //value can be json object

      value = JSON.stringify(value);
    }

    if (this.fieldInfo.allowFixValidation) {
      value = this._validationFix(value, this.fieldInfo);
    }

    let errorList = this._validationCheck(value);
    this.data.isValid = errorList.length === 0;
    this.data.isValid && this._validationEffect();

    const needChange = value !== this.state.value;
    this.state.value = value;
    this.state.error = Utils.getErrorList(errorList, this.fieldInfo);

    if (needChange) {
      this.setDirty(true);
      this.forceUpdate();
      this._fireCallees(value);
    }

    this.fieldInfo._error = "";
  }

  checkGridRow = () => {
    if (!this.fieldInfo.onChange_SelectGridRow) return;
    if (!this.fieldInfo._grid) return;
    if (!this.fieldInfo._row) return;

    this.fieldInfo._grid.selectRow(this.fieldInfo._row);
  };

  rebind() {
    this.forceUpdate();
  }

  /***
   * for onchange event handle
   * @param event
   */
  _handleInputChange(event) {
    this.changeValue(event.target.value);
    this.checkGridRow();
    if (this.props.setDirtyChildren) {
      this.props.setDirtyChildren();
    }
  }

  _handleInsertLineBreak(event) {
    if (event.altKey && event.key === "Enter") {
      // Prevent the default action if necessary
      event.preventDefault();

      // Add line break
      this.changeValue(this.state.value + "\n");
    }
  }

  //region data

  //endregion data

  _getLabelWidthStyles = () => {
    const showLabelOnTop = this.fieldInfo.showLabelOnTop;
    const showLabelAfter_OnBottom = this.fieldInfo.showLabelAfter_OnBottom;

    const getWidthFromFieldInfo = () => {
      let totalWidth =
        +this.fieldInfo.width_Slice1 +
        +this.fieldInfo.width_Slice2 +
        +this.fieldInfo.width_Slice3;

      let slice1 = +this.fieldInfo.width_Slice1 || 0;
      let slice2 = +this.fieldInfo.width_Slice2 || 0;
      let slice3 = +this.fieldInfo.width_Slice3 || 0;

      if (showLabelOnTop) {
        slice1 = 0;
      }

      if (showLabelAfter_OnBottom) {
        slice3 = 0;
      }

      if (!totalWidth) {
        return {
          slice1: "",
          slice2: "",
          slice3: "",
        };
      } else {
        totalWidth = slice1 + slice2 + slice3;
        const normalize = 100 / Math.max(100, totalWidth);

        slice1 = +this.fieldInfo.width_Slice1 * normalize;
        slice2 = +this.fieldInfo.width_Slice2 * normalize;
        slice3 = +this.fieldInfo.width_Slice3 * normalize;
      }

      return {
        slice1: slice1 + "%",
        slice2: slice2 + "%",
        slice3: slice3 + "%",
      };
    };

    const sliceWidths = getWidthFromFieldInfo();

    //for show labels in seprate line

    if (showLabelOnTop) {
      sliceWidths.slice1 = "100%";
    }

    if (showLabelAfter_OnBottom) {
      sliceWidths.slice3 = "100%";
    }

    return sliceWidths;
  };
}

export default TextFieldInfo_Core;
