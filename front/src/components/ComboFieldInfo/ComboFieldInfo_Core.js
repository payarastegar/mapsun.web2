import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import Utils from "../../Utils";
import FilterCondition from "../../class/enums/FilterCondition";
import UiSetting from "../../UiSetting";

//https://codepen.io/MoorLex/pen/XeNzoK
class ComboFieldInfo_Core extends TextFieldInfo {
  //------------------------------------------------
  //region component public method
  //------------------------------------------------

  initialize() {
    this.state = {
      error: "",
      inputText: "",
      inputText_MultiSelectFilter: "",
      inputType: "text",
      inputNode: "",
      classShowMenu: "",
      selected: "",
      validationEffect: false,
    };

    this.data = {
      isValid: true,
      isTouched: false,
      isDirty: false,
      _validationEffectTimeoutId: "",
      _styleMenu: {},
      lastParentValue: "",
      selectedDataRow: [],
      checkBoxFields: {},
    };

    this.dataSource = this._dataGetDataSource();
  }

  update() {
    this._updateValue();
  }

  _updateValue() {
    this.changeValue(this.data.selectedDataRow);
  }

  /**
   * change value of combo
   * @param value can be id of value or tildaList of ids or regular string for open combo
   * value can be null to remove value
   */
  changeValue(value) {
    const idColName =
      this.fieldInfo.combo_IdColName || this.dataSource.combo_IdColName;

    if (this.fieldInfo.combo_MultipleSelect) {
      if (typeof value === "string" && value.startsWith("~")) {
        value = value.substring(1, value.length - 1).split("~");
      }
    }

    //all value change to list
    //for non open must set data row as value
    let valueList = Utils.toFlattenArray(value);
    if (this._isOpenCombo()) {
      valueList = value;
    } else {
      valueList = this.dataSource.dataArray.filter((row) =>
        valueList.find(
          (value) => (value[idColName] || value) + "" == row[idColName] + ""
        )
      );
    }

    this._setValue(valueList);
    this._setInputTextFromSelected();
  }

  rebindCombo() {
    //TODO
    this.rebind();
  }

  /*
   * در این شرایط رید-اونلی است:
   * 1-مالتی سلکت باشد
   * 2-یا فیلد کلا رید-اونلی است
   * یا این که :
   * 3- اوپن-کمبو نیست و اوتو-کامپلیت هم نیست
   */
  isReadOnly() {
    const readOnly = !this.fieldInfo.canEdit;
    return (
      this.fieldInfo.combo_MultipleSelect ||
      (!this.fieldInfo.combo_IsOpenCombo &&
        !this.fieldInfo.combo_AutoComplete) ||
      readOnly
    );
  }

  changeParent_Combo(value) {
    this.fieldInfo.combo_ParentId_Value = value;
  }

  /**
   * get value of selected values
   * if multiSelect id list
   * if combo id
   * if open combo string
   * @return {*}
   */
  getValue() {
    const multiSelect = this.fieldInfo.combo_MultipleSelect;
    const idColName =
      this.fieldInfo.combo_IdColName || this.dataSource.combo_IdColName;

    let valueList = this.data.selectedDataRow;
    valueList = valueList.map((dataRow) =>
      Utils.isObject(dataRow) ? dataRow[idColName] : dataRow
    );

    valueList = multiSelect ? Utils.toTildaList(valueList) : valueList[0];
    return valueList === undefined ? "" : valueList;
  }

  getSelectedValue() {
    const row = this.data.selectedDataRow;
    return row && row[0] && row[0][this.fieldInfo.combo_SelectedValueColName];
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    Object.values(this.data.checkBoxFields).forEach(
      (fieldInfo) =>
        fieldInfo.component && fieldInfo.changeValue(fieldInfo.initialValue)
    );
  }

  //------------------------------------------------
  //endregion component public method
  //------------------------------------------------

  //------------------------------------------------
  //region component private method
  //------------------------------------------------

  _dataGetArray() {
    let dataArray = this.dataSource.dataArray;
    const combo_TextColName = this.fieldInfo.combo_TextColName;
    dataArray.sort((itemA, itemB) => {
      return itemA[combo_TextColName] > itemB[combo_TextColName]
        ? 1
        : itemA[combo_TextColName] < itemB[combo_TextColName]
          ? -1
          : 0;
    });

    if (!this._isOpenCombo() && this.fieldInfo.combo_Parent_Value) {
      dataArray = dataArray.filter(
        (dataRow) =>
          this.fieldInfo.combo_Parent_Value ==
          dataRow[this.fieldInfo.combo_Parent_ColName]
      );
    } else if (!this._isOpenCombo() && this.fieldInfo.combo_Parent_FieldName) {
      //filter by parent
      const parentCombo = this.getFieldInfo(
        this.fieldInfo.combo_Parent_FieldName
      );

      if (parentCombo.component) {
        //flatten array of arrays to one array
        parentCombo.addOnChange_Callee(this._handleParentChangeValue);
        this.data.lastParentValue = parentCombo.getValue();
        const valueList = Utils.toFlattenArray(this.data.lastParentValue);

        if (valueList.length > 0) {
          dataArray = dataArray.filter((dataRow) =>
            valueList.includes(dataRow[this.fieldInfo.combo_Parent_ColName])
          );
        }
      }
    }

    return dataArray;
  }

  _dataGetRowListForMenu() {
    let text = (this.state.inputText + "").toUpperCase();
    let multiSelect = this.fieldInfo.combo_MultipleSelect;
    let needFilter =
      this.fieldInfo.combo_AutoComplete ||
      this.fieldInfo.combo_IsOpenCombo ||
      this._elementGetMenuFilter_ForMultiSelect_ShowFilter();
    let dataArray = this._dataGetArray();

    if (this._elementGetMenuFilter_ForMultiSelect_ShowFilter())
      text = this.state.inputText_MultiSelectFilter;

    const idColName =
      this.fieldInfo.combo_IdColName || this.dataSource.combo_IdColName;

    let tartib_FieldName = this.fieldInfo.tartib_FieldName;
    if (tartib_FieldName) {
      //number or text
      let tartib_IsSortedByText = this.fieldInfo.tartib_IsSortedByText;
      let tartib_IsDescending = this.fieldInfo.tartib_IsDescending;

      let bigger = tartib_IsDescending ? -1 : 1;
      let lower = -1 * bigger;

      let getFieldValueFunction = (row, tartib_FieldName) => {
        const value = row[tartib_FieldName];
        const number = +value;
        const isString = tartib_IsSortedByText && typeof value === "string";

        return isString || isNaN(number) ? value + "" : number || 0;
      };

      //sort 2
      let tartib2_FieldName = this.fieldInfo.tartib2_FieldName;
      //number or text
      let tartib2_IsSortedByText = this.fieldInfo.tartib2_IsSortedByText;
      let tartib2_IsDescending = this.fieldInfo.tartib2_IsDescending;

      let bigger2 = tartib2_IsDescending ? -1 : 1;
      let lower2 = -1 * bigger2;

      let getFieldValueFunction2 = (row, tartib2_FieldName) => {
        const value = row[tartib2_FieldName];
        const number = +value;
        const isString = tartib2_IsSortedByText && typeof value === "string";

        return isString || isNaN(number) ? value + "" : number || 0;
      };

      let getEqualFunction = (rowA, rowB) => {
        if (!tartib2_FieldName) return 0;

        rowA = getFieldValueFunction2(rowA, tartib2_FieldName);
        rowB = getFieldValueFunction2(rowB, tartib2_FieldName);

        return rowA > rowB ? bigger2 : rowA < rowB ? lower2 : 0;
      };

      dataArray.sort((rowA, rowB) => {
        let equal = getEqualFunction(rowA, rowB, tartib2_FieldName);
        rowA = getFieldValueFunction(rowA, tartib_FieldName);
        rowB = getFieldValueFunction(rowB, tartib_FieldName);

        return rowA > rowB ? bigger : rowA < rowB ? lower : equal;
      });

      // dataArray.sort((rowA, rowB) => {
      //     rowA = getFieldValueFunction(rowA, tartib_FieldName)
      //     rowB = getFieldValueFunction(rowB, tartib_FieldName)
      //
      //     return rowA > rowB ? bigger : (rowA < rowB ? lower : 0)
      //
      // })
    }

    let filter_ColName = this.fieldInfo.filter_ColName;
    let filter_Condition = this.fieldInfo.filter_Condition;
    let filter_Value = this.fieldInfo.filter_Value;
    let filter_IsFiltered = this.fieldInfo.filter_IsFiltered;
    if (filter_IsFiltered && filter_ColName) {
      const valueCompare = {
        [FilterCondition.equal]: (rowValue, filterValue) =>
          rowValue == filterValue,
        [FilterCondition.notEqual]: (rowValue, filterValue) =>
          rowValue != filterValue,
        [FilterCondition.greaterThan]: (rowValue, filterValue) =>
          rowValue > filterValue,
        [FilterCondition.greaterThanOrEqual]: (rowValue, filterValue) =>
          rowValue >= filterValue,
        [FilterCondition.lessThan]: (rowValue, filterValue) =>
          rowValue < filterValue,
        [FilterCondition.lessThanOrEqual]: (rowValue, filterValue) =>
          rowValue <= filterValue,
        [FilterCondition.contains]: (rowValue, filterValue) =>
          (rowValue + "")
            .toUpperCase()
            .includes((filterValue + "").toUpperCase()),
      }[filter_Condition];

      dataArray = dataArray.filter((row) =>
        valueCompare(row[filter_ColName], filter_Value)
      );
    }

    if (!text || !needFilter) return dataArray;
    return dataArray.filter((dataRow) => {
      return this._getDataRowText(dataRow)
        .toUpperCase()
        .includes(text);
    });
  }

  _openDropdownMenu(open) {}

  /***
   * return errorList
   * @param value
   * @return array {[...errorText]}
   */
  _validationCheck(value) {}

  _validationSelectedCheck(selectedValue) {
    let require = this.fieldInfo.require;
    let selected = selectedValue.length !== 0;

    if (!selected && require && !this.state.inputText) {
      // return ["این مورد الزامی است"];
      return UiSetting.GetSetting("language") === "en"
        ? ["Mandatory"]
        : ["الزامی"];
    }

    if (!this._isOpenCombo() && !selected && this.state.inputText) {
      return ["مورد انتخاب شده صحیح نمی باشد!"];
    }

    const customError = this.getCustomError();
    if (customError) {
      return [customError];
    }

    return [];
  }

  /***
   * return fixed value by validation and config
   * @param value
   * @return value {value}
   */
  _validationFix(value) {
    return value;
  }

  _setInputText(inputText) {
    // this.setDirty(true);

    this.state.inputText = inputText;
    this.setState({ inputText: inputText });
  }

  _setInputText_MultiSelectFilter(inputText_MultiSelectFilter) {
    this.setState({ inputText_MultiSelectFilter: inputText_MultiSelectFilter });
  }

  _resetAll() {
    //first clean text
    this._setInputText("");

    //reset value
    this._setValue();

    this._openDropdownMenu(false);
  }

  _setSelected(selected) {
    if (this.state.selected != selected) {
      this.state.selected = selected;
      this.setState({ selected: selected });
    }
  }

  _getDataRowText(dataRow) {
    return dataRow[this.fieldInfo.combo_TextColName] + "";
  }

  _isDropdownMenuOpen() {
    return this.state.classShowMenu;
  }

  _isOpenCombo() {
    return this.fieldInfo.combo_IsOpenCombo;
  }

  /**
   * set value from value list
   * if not open combo then value must be row of datasource
   * @param value
   * @private
   */
  _setValue(value) {
    //if open combo must use text
    if (this._isOpenCombo()) {
      value = value || this.state.inputText;
      this.data.selectedDataRow = [value];
    } else {
      let dataRowList = Utils.toFlattenArray(value);
      this.data.selectedDataRow = dataRowList;
    }

    this._setValidation();
    this._fireCallees(this.getValue());
    this.fieldInfo._error = "";
  }

  _setValidation = () => {
    let errorList = this._validationSelectedCheck(this.data.selectedDataRow);

    this.data.isValid = errorList.length === 0;
    this.data.isValid && this._validationEffect();
    let selected = this.data.isValid && this.data.selectedDataRow.length > 0;

    if (this._isOpenCombo() && selected) {
      // const idColName =
      //   this.fieldInfo.combo_IdColName || this.dataSource.combo_IdColName;
      const title = this.data.selectedDataRow[0];
      const item = this._dataGetArray().find(
        (item) => this._getDataRowText(item) == title
      );
      this._setSelected(!!item);
    } else {
      this._setSelected(selected);
    }

    this.setState({ error: errorList.join(" - ") });
  };


  applyCrossComponentFilters(filters) {
    const idColName =
      this.fieldInfo.combo_IdColName || (this.dataSource && this.dataSource.combo_IdColName);

    if (!filters || filters.length === 0) {
      if (this._original_DataSource) {
        this.dataSource.dataArray = this._original_DataSource.slice();
      }
      this.forceUpdate && this.forceUpdate();
      return;
    }
    if (!this._original_DataSource) {
      this._original_DataSource = this.dataSource.dataArray.slice();
    }
    let filteredDataSource = this._original_DataSource;
    Object.entries(filters).forEach(([col, values]) => {
      if (filteredDataSource.some(row => col in row)) {
        filteredDataSource = filteredDataSource.filter(row => !row[col] || values.includes(row[col]));
      }
    });
    this.dataSource.dataArray = filteredDataSource;
    this.forceUpdate && this.forceUpdate();
  }

  //------------------------------------------------
  //endregion component private method
  //------------------------------------------------

  //------------------------------------------------
  //region component private  handle event method
  //------------------------------------------------

  /***
   * for onchange event handle
   * @param event
   */
  _handleInputChange(event) {
    let inputText = event && event.target.value;

    if (inputText != this.state.inputText) {
      this._setInputText(inputText);
      this._openDropdownMenu(true);
      this._setValue();
    }
  }

  _handleInputChange_MultiSelectFilter(event) {
    let inputText_MultiSelectFilter = event && event.target.value;

    if (inputText_MultiSelectFilter != this.state.inputText_MultiSelectFilter) {
      this._setInputText_MultiSelectFilter(inputText_MultiSelectFilter);
    }
  }

  _handleInputClick(event) {
    //set dirty combo
    if (
      this.props.setDirtyChildren &&
      this.fieldInfo._parentFieldInfo.form_NotSavedAlarm_OnFormClose === true
    ) {
      this.props.setDirtyChildren();
    }

    this._openDropdownMenu(true);
  }

  _handleInputFocus(event) {
    this._openDropdownMenu(true);
    this._setSelected(false);
  }

  _handleMenuItemClick(dataRow, title, event) {
    //first must set text for combo open
    this._setInputText(title);
    //then change value
    this._setValue(dataRow);
    this._openDropdownMenu(false);
    //check later
    this._validationEffect();
  }

  _handleArrowIconClick(event) {
    this._openDropdownMenu(!this._isDropdownMenuOpen());
  }

  _handleCloseIconClick(event) {
    if (
      this.props.setDirtyChildren &&
      this.fieldInfo._parentFieldInfo.form_NotSavedAlarm_OnFormClose === true
    ) {
      this.props.setDirtyChildren();
    }

    this._resetAll();
  }

  //must be unique value to not add again (duplicate) in onChange_Callees
  _handleParentChangeValue = (parentComponent, value) => {
    if (this.data.lastParentValue != value) {
      this._resetAll();
    }
  };

  //------------------------------------------------
  //endregion component private  handle event method
  //------------------------------------------------

  //------------------------------------------------
  //region :فیلتر روی مالتی سلکت
  //------------------------------------------------

  _elementGetMenuFilter_ForMultiSelect_ShowFilter() {
    const multiSelect = this.fieldInfo.combo_MultipleSelect;
    const autoComplete = this.fieldInfo.combo_AutoComplete;
    if (!multiSelect || !autoComplete) return false;

    if (
      this.dataSource &&
      this.dataSource.dataArray &&
      this.dataSource.dataArray.length <= 10
    )
      return false;

    return true;
  }
}

export default ComboFieldInfo_Core;
