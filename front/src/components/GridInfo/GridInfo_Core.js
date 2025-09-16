import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import FilterCondition from "../../class/enums/FilterCondition";
import FieldInfo from "../../class/FieldInfo";
import ColumnInfo from "../../class/ColumnInfo";
import ComponentUtils from "../ComponentUtils";
import Utils from "../../Utils";
import ButtonFieldInfo from "../ButtonFieldInfo/ButtonFieldInfo";
import { dataLoader, utils } from "@amcharts/amcharts4/core";
import FieldType from "../../class/enums/FieldType";
import UiSetting from "../../UiSetting";

class GridInfo_Core extends TextFieldInfo {
  //------------------------------------------------
  //region public methods
  //------------------------------------------------

  initialize() {
    this.state = {
      error: "",
      inputText: "",
      inputType: "text",
      inputNode: "",
      currentPage: 1,
      filterValue: "",
      selected: "",
      validationEffect: false,
    };

    this.data = {
      isValid: true,
      isTouched: false,
      isDirty: false,
      _validationEffectTimeoutId: "",
      selectedDataRow: [],
      componentFields: {}, //object with row key as key and object with column name as key
      //{61: {chbSelect: FieldInfo, btnOpenDocList: FieldInfo}}}
      columnsHide: {},
      groupRowList: [],
      tartib_FieldName: "",
      tartib_IsDescending: false,
      needUpdate: false,
    };

    this.dataSource = this._dataGetDataSource();

    //for filter text
    this.data._textFieldInfo = this._createFilterTextFieldInfo();

    //for sort
    this.data.tartib_FieldName = this.fieldInfo.tartib_FieldName;
    this.data.tartib_IsDescending = this.fieldInfo.tartib_IsDescending;

    this.update(true);
  }

  /**
   * update grid component and rebind datasource
   */
  update(notUpdateState) {
    //create column list of type ColumnInfo
    this.data.gridColumnInfo_List = this.fieldInfo.columnInfo_List.map(
      (c) => new ColumnInfo(c)
    );

    //TODO need invisible column in future
    //only need visible column
    // this.data.columnInfo_List = this.data.gridColumnInfo_List.filter(c => this._isColumnVisible(c))
    this.data.columnInfo_List = this.data.gridColumnInfo_List;

    const isGrouping = this.fieldInfo.grouping_IsGrouped;
    if (isGrouping) {
      //all column in group expect last not need
      let groupArray = this._getGroupingArray().slice(0, -1);

      this.data.columnInfo_List = this.data.columnInfo_List.filter(
        (c) => !groupArray.includes(c.fieldName)
      );
    }

    this.data.columnInfo_List = this.data.columnInfo_List.filter(
      (c) => c.fieldName && c.tartib
    );

    //sort columns
    this.data.columnInfo_List.sort((itemA, itemB) => {
      return itemA.tartib > itemB.tartib
        ? 1
        : itemA.tartib < itemB.tartib
        ? -1
        : 0;
    });

    const idColName = this.dataSource.idColName;
    const dataArray = this.dataSource.dataArray;

    //filter components only need component that their row in datasource exist

    const tempComponentFields = {};
    dataArray.forEach((dataRow) => {
      const componentList = this.data.componentFields[dataRow[idColName]];
      if (componentList)
        tempComponentFields[dataRow[idColName]] = componentList;
    });
    this.data.componentFields = tempComponentFields;

    //update each component
    Object.keys(this.data.componentFields).forEach((rowKey) =>
      Object.keys(this.data.componentFields[rowKey]).forEach((componentKey) =>
        this.data.componentFields[rowKey][componentKey].update()
      )
    );

    this._setColumnComponents(this.dataSource.dataArray);

    //set for recreate component in Render
    this.data.needUpdate = true;

    //re collapse group rows
    this._collapseAll(true);

    !notUpdateState && this.forceUpdate();
  }

  /**
   * return array of components value
   * @return {Array}
   */
  getValue() {
    const valueList = [];
    const idColName = this.dataSource.idColName;

    if (!this.data || !this.data.columnInfo_List) return;

    let chbSelect_List = this.data.columnInfo_List.filter(
      (t) => t.fieldName == "chbSelect" && t.fieldType == FieldType.CheckBox
    );

    if (!chbSelect_List || chbSelect_List.length == 0) return;

    Object.keys(this.data.componentFields).forEach((rowKey) => {
      let temp = {};
      let chbSelect_Value = false;
      temp[idColName] = rowKey;
      Object.keys(this.data.componentFields[rowKey]).forEach((fieldNameKey) => {
        let fieldInfo = this.data.componentFields[rowKey][fieldNameKey];
        temp[fieldNameKey] = fieldInfo.component ? fieldInfo.getValue() : "";

        if (
          fieldInfo &&
          fieldInfo.fieldName == "chbSelect" &&
          fieldInfo.fieldType == FieldType.CheckBox
        )
          chbSelect_Value = fieldInfo.getValue();
      });
      if (chbSelect_Value) valueList.push(temp);
    });
    return valueList;
  }

  //------------------------------------------------
  //endregion public methods
  //------------------------------------------------

  //------------------------------------------------
  //region private methods
  //------------------------------------------------

  //create field info for filter text component
  _createFilterTextFieldInfo() {
    return FieldInfo.create(this.fieldInfo, {
      placeholder:
        UiSetting.GetSetting("language") === "en" ? "Filter" : "فیلتر",
      require: false,
      autocomplete: "off",
      name: "grid_FilterField",
    });
  }

  //region validation
  /***
   * return errorList
   * @param value
   * @return array {[...errorText]}
   */
  _validationCheck(value) {
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

  //endregion

  //region data

  /**
   * get data row for show in grid
   * sort and filter them then return
   * @return {*}
   * @private
   */
  _dataGetRowList() {
    let dataArray = this.dataSource.dataArray;
    //set component for all row
    // this._setColumnComponents(dataArray);

    const idColName = this.dataSource.idColName;

    let enableFilter = true;
    let filterValue = this.fieldInfo.filter_Value;

    let forceFilter = false;
    let filter_FieldName = this.fieldInfo.filter_FieldName;
    let filter_FieldName_IsNumber = this.fieldInfo.filter_FieldName_IsNumber;
    let filter_FieldName_IsBoolean = this.fieldInfo.filter_FieldName_IsBoolean;

    if (enableFilter && (forceFilter || filterValue)) {
      //filter
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
      }[this.fieldInfo.filter_Condition];

      let getFieldValueFunction = (dataRow, filterColumnInfo) => {
        if (filterColumnInfo && this._columnIsFieldInfo(filterColumnInfo)) {
          let componentField = this.data.componentFields[dataRow[idColName]];
          if (
            componentField &&
            componentField[filterColumnInfo.fieldName] &&
            componentField[filterColumnInfo.fieldName].component
          ) {
            return componentField[filterColumnInfo.fieldName].getValue();
          }
        }
        if (filter_FieldName_IsNumber) {
          return +dataRow[filterColumnInfo.fieldName];
        }

        return dataRow[filterColumnInfo.fieldName];
      };

      if (filter_FieldName_IsNumber) {
        filterValue = +filterValue;
      }

      if (filter_FieldName_IsBoolean) {
        filterValue = Utils.getBoolean(filterValue);
      }

      const filterOnColumnInfo = this.data.columnInfo_List.find(
        (ci) => ci.fieldName == filter_FieldName
      );

      if (filterOnColumnInfo) {
        dataArray = dataArray.filter((dataRow) =>
          valueCompare(
            getFieldValueFunction(dataRow, filterOnColumnInfo),
            filterValue
          )
        );
      } else {
        dataArray = dataArray.filter((dataRow) =>
          this.data.columnInfo_List.find((filterColumnInfo) =>
            valueCompare(
              getFieldValueFunction(dataRow, filterColumnInfo),
              filterValue
            )
          )
        );
      }
    }

    //search box
    filterValue =
      this.data._textFieldInfo.component && this.data._textFieldInfo.getValue();
    if (filterValue) {
      filterValue = (filterValue + "").toUpperCase();

      const filterColumnList = this.data.columnInfo_List.filter(
        (c) => c.visible && !c.gridColumn_IsFieldInfo
      );

      dataArray = dataArray.filter((dataRow) => {
        let rowText = "";
        filterColumnList.forEach((c) => {
          let tempRowValue = dataRow[c.fieldName];
          if (tempRowValue && !Utils.isObject(tempRowValue)) {
            rowText += tempRowValue + " ";
          }
        });

        rowText = rowText.toUpperCase();
        // const rowText = Object.values(dataRow).map((rowValue) => (rowValue + '').toUpperCase()).join(' ')
        const filterWordList = filterValue.split(/[ |\t]/g).filter((w) => w);
        return !filterWordList.find(
          (filterWord) => !rowText.includes(filterWord)
        );
      });
    }

    //sort
    let tartib_FieldName = this.data.tartib_FieldName;
    if (tartib_FieldName) {
      //number or text
      let tartib_IsSortedByText = this.fieldInfo.tartib_IsSortedByText;
      let tartib_IsDescending = this.data.tartib_IsDescending;

      let bigger = tartib_IsDescending ? -1 : 1;
      let lower = -1 * bigger;

      let getFieldValueFunction = (row, tartib_FieldName) => {
        const component = this.data.componentFields[row[idColName]][
          tartib_FieldName
        ];
        if (component && component.component) return component.getValue();

        if (row["isFooter"]) return bigger * -Infinity;
        if (!row[tartib_FieldName]) return 0;
        // const columnInfo = this.data.columnInfo_List.find(col => col.fieldName == tartib_FieldName)
        // if (columnInfo.gridColumn_IsRowNumber) {
        //     return dataArray.indexOf(row)
        // }

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
        const component = this.data.componentFields[row[idColName]][
          tartib2_FieldName
        ];
        if (component && component.component) return component.getValue();

        if (row["isFooter"]) return bigger2 * -Infinity;
        if (!row[tartib2_FieldName]) return 0;

        // const columnInfo = this.data.columnInfo_List.find(col => col.fieldName == tartib_FieldName)
        // if (columnInfo.gridColumn_IsRowNumber) {
        //     return dataArray.indexOf(row)
        // }

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
    }

    return dataArray;
  }

  /**
   * _dataGetRowList for only current page
   * @return {*}
   * @private
   */
  _dataCurrentPageRowList() {
    const isGrouping = this.fieldInfo.grouping_IsGrouped;

    if (isGrouping) {
      return this._dataGetGroupRowList();
    }

    let list = this._dataGetRowList();

    let pagingEnable = this.fieldInfo.paging_IsPaged;
    if (pagingEnable) {
      let pageSize = +this.fieldInfo.paging_pageSize;
      let currentPage = +this.state.currentPage;
      let startIndex = pageSize * (currentPage - 1);
      list = list.slice(startIndex, startIndex + pageSize);
    }
    return list;
  }

  /**
     * for grouping gird must call this function to get data row
     * return data row consists off
     *  key: key,
     id: id,
     level: index,
     className: classNames[index],
     parentName: fieldNames[index - 1],
     parentList: fieldNames.filter((name, i) => i < index).map(name => dataRow[name]),
     visibility: false,
     name: name,
     dataRow: dataRow  // main data row
     * @return {Array}
     * @private
     */
  _dataGetGroupRowList() {
    // if (this.data.groupRowList.length !== 0) return this.data.groupRowList
    let list = this._dataGetRowList();
    const temp = {};
    // const fieldNames = this.fieldInfo.grouping_GroupInfo_Array.map(g => g.groupFieldName)
    const fieldNames = this._getGroupingArray();
    // const classNames = this.fieldInfo.grouping_GroupInfo_Array.map(g => g.groupClassName)
    const classNames = []; //TODO Class name for grid groups

    const tempList = [];
    const lastLevel = fieldNames.length - 1;

    fieldNames.forEach((name, index) => {
      temp[index] = {};
    });

    const idColName = this.dataSource.idColName;
    list.forEach((dataRow) => {
      fieldNames.forEach((name, index) => {
        const id = dataRow[idColName];

        const key = "level:" + index + ",id:" + dataRow[idColName];

        const sameRow = tempList.find((r) => {
          return (
            r.level == index &&
            r.dataRow[r.name] === dataRow[r.name] &&
            (r.level != lastLevel || r.id === id) &&
            !r.parentList.find((row, i) => row !== dataRow[fieldNames[i]])
          );
        });

        if (!sameRow) {
          const row = {
            key: key,
            id: id,
            level: index,
            className: classNames[index],
            parentName: fieldNames[index - 1],
            parentList: fieldNames
              .filter((name, i) => i < index)
              .map((name) => dataRow[name]),
            visibility: false,
            name: name,
            dataRow: dataRow,
          };

          const lastRow = this.data.groupRowList.find(
            (r) => r.level === row.level && r.id === row.id
          );

          row.collapse = lastRow && lastRow.collapse;
          row.visibility = !row.parentName
            ? true
            : lastRow && lastRow.visibility;

          tempList.push(row);
        }
        temp[index][id] = true;
      });
    });

    //sort

    const tartib_FieldName = this.data.tartib_FieldName;
    const sortList = (listToSort) => {
      if (tartib_FieldName) {
        //number or text
        let tartib_IsSortedByText = this.fieldInfo.tartib_IsSortedByText;
        let tartib_IsDescending = this.data.tartib_IsDescending;

        let bigger = tartib_IsDescending ? -1 : 1;
        let lower = -1 * bigger;

        let getFieldValueFunction = (row, tartib_FieldName) => {
          const component = this.data.componentFields[row[idColName]][
            tartib_FieldName
          ];
          if (component && component.component) return component.getValue();

          const value = row[tartib_FieldName];
          const number = parseFloat(value);

          const isString = tartib_IsSortedByText && typeof value === "string";

          return isString || isNaN(number) ? value + "" : number || 0;
        };

        listToSort.sort((rowA, rowB) => {
          rowA = getFieldValueFunction(rowA.dataRow, tartib_FieldName);
          rowB = getFieldValueFunction(rowB.dataRow, tartib_FieldName);

          return rowA > rowB ? bigger : rowA < rowB ? lower : 0;
        });
      }
      return listToSort;
    };

    let count = 0;
    const array = [];
    const addItem = (item) => {
      if (!array.includes(item)) {
        array.push(item);
        if (item.level == lastLevel) {
          item.rowIndex = ++count;
        }
        sortList(
          tempList.filter((r) => {
            return (
              r.dataRow[item.name] === item.dataRow[item.name] &&
              r.level - 1 === item.level &&
              !item.parentList.find((row, i) => row !== r.parentList[i])
            );
          })
        ).forEach(addItem);
      }
    };
    sortList(tempList.filter((r) => r.level == 0)).forEach(addItem);

    //add child counts
    tempList.forEach((row) => {
      if (row.level != lastLevel) {
        row.childSize = this.data.groupRowList.filter((r) => {
          return (
            r.level == lastLevel &&
            r.dataRow[row.name] === row.dataRow[row.name] &&
            !row.parentList.find(
              (rowOfParent, i) => rowOfParent !== r.parentList[i]
            )
          );
        }).length;
      }
    });

    this.data.groupRowList = array;

    return array;
  }

  //endregion data

  /**
   * clean collapse in groups
   * @param keepCollapse
   * @private
   */
  _collapseAll(keepCollapse) {
    const isGrouping = this.fieldInfo.grouping_IsGrouped;

    if (!isGrouping) return;

    //TODO keep collapse in sort
    const collapsedKeys = this.data.groupRowList
      .filter((i) => i.collapse)
      .map((i) => i.key);

    this.data.groupRowList.forEach((row) => {
      row.collapse = false;
      row.visibility = false;
    });

    keepCollapse &&
      this.data.groupRowList.forEach((row) => {
        if (collapsedKeys.includes(row.key)) {
          this._handleOnClickItemCollapse(row);
        }
      });
  }

  //region event handler

  _handleOnClickItemCollapse = (dataRow) => {
    dataRow.collapse = !dataRow.collapse;

    //next row

    const findNextRowList = (row) => {
      return this.data.groupRowList.filter((r) => {
        return (
          r.dataRow[row.name] === row.dataRow[row.name] &&
          r.level - 1 === row.level &&
          !row.parentList.find(
            (rowOfParent, i) => rowOfParent !== r.parentList[i]
          )
        );
      });
    };

    const nextRowList = findNextRowList(dataRow);

    if (dataRow.collapse) {
      nextRowList.forEach((row) => {
        row.visibility = true;
        row.collapse = false;
      });
    } else {
      const off = (row) => {
        row.visibility = false;
        row.collapse = false;
        findNextRowList(row).forEach(off);
      };
      nextRowList.forEach(off);
    }

    this.forceUpdate();
  };

  _handleOnPageItemClick(value) {
    this._setPage(value);
  }

  /**
   * change window size mean change size of grid table
   * if mobile size window must hide somes...
   * @param event
   * @private
   */
  _handleWindowResize = (event) => {
    //const windowHeight = window.innerHeight
    //const windowWidth = window.innerWidth
    this._updateColumnVisibility();
  };

  _handleOnHeaderClick = (columnInfo) => {
    if (columnInfo.gridColumn_IsRowNumber) {
      return;
    }

    if (this.data.tartib_FieldName == columnInfo.fieldName) {
      this.data.tartib_IsDescending = !this.data.tartib_IsDescending;
    } else {
      this.data.tartib_FieldName = columnInfo.fieldName;
      this.data.tartib_IsDescending = false;
    }

    this._collapseAll();
    this.forceUpdate();
  };

  /**
   * on row click mean click on component  checkBox_SelectGridRow_OnSelect if exist
   * @param row
   * @private
   */

  _handleOnRowClick = (row, rowIndex, event) => {
    const selectColumnInfo = this.data.columnInfo_List.find(
      (c) => c.checkBox_SelectGridRow_OnSelect
    );
    if (!selectColumnInfo) return;

    if (event) {
      let parent = event.target;
      let deep = 0;
      while (parent !== event.currentTarget) {
        parent = parent.parentElement;
        deep++;
      }
      if (deep > 2) return;
    }

    const idColName = this.dataSource.idColName;
    const componentFieldInfo = this.data.componentFields[row[idColName]][
      selectColumnInfo.fieldName
    ];
    if (!componentFieldInfo || !componentFieldInfo.component) return;

    componentFieldInfo.changeValue(!componentFieldInfo.getValue());
    this.forceUpdate();
  };

  selectRow = (row) => {
    const selectColumnInfo = this.data.columnInfo_List.find(
      (c) => c.checkBox_SelectGridRow_OnSelect
    );
    if (!selectColumnInfo) return;

    const idColName = this.dataSource.idColName;
    const componentFieldInfo = this.data.componentFields[row[idColName]][
      selectColumnInfo.fieldName
    ];
    if (!componentFieldInfo || !componentFieldInfo.component) return;

    componentFieldInfo.changeValue(true);
    this.forceUpdate();
  };

  //endregion

  //region others

  _columnIsFieldInfo(columnInfo) {
    return columnInfo.gridColumn_IsFieldInfo;
  }

  _columnIsVisible(columnInfo) {
    return columnInfo.visible;
  }

  _rowIsSelected(row) {
    const selectColumnInfo = this.data.columnInfo_List.find(
      (c) => c.checkBox_SelectGridRow_OnSelect
    );
    if (!selectColumnInfo) return;

    const idColName = this.dataSource.idColName;
    const component = this.data.componentFields[row[idColName]][
      selectColumnInfo.fieldName
    ];
    //not mount
    if (!component.component) return;
    return component.getValue();
  }

  /**
   * return grouping field names of column
   * @return {*[]}
   * @private
   */
  _getGroupingArray() {
    return [
      this.fieldInfo.grouping_FieldName_1,
      this.fieldInfo.grouping_FieldName_2,
      this.fieldInfo.grouping_FieldName_3,
      this.fieldInfo.grouping_FieldName_4,
      this.fieldInfo.grouping_StartFieldName,
    ].filter((i) => i);
  }

  /**
     * return option for paging
     *       list, //list of numbers
     showStartDot, // show 3dot in start
     showEndDot,   // show 3dot in end
     paging_IsPaged: list.length > 1 //show paging or not
     * @return {*}
     * @private
     */
  _pagingGetOptions() {
    let paging_IsPaged = this.fieldInfo.paging_IsPaged;
    if (!paging_IsPaged)
      return {
        paging_IsPaged: false,
      };

    //max page number that show to user
    let maxPageNumber = 5;
    let pageSize = +this.fieldInfo.paging_pageSize;
    let rowSize = +this._dataGetRowList().length;
    let currentPageNumber = +this.state.currentPage;
    let totalPageNumber = Math.ceil(rowSize / pageSize);
    let pageLength = Math.min(maxPageNumber, totalPageNumber);
    let pageLengthHalf = Math.floor(pageLength / 2);
    // maxPageNumber % 2 for start half for even number
    let startNumber = currentPageNumber - pageLengthHalf;
    if (maxPageNumber % 2 === 0) startNumber++;

    startNumber = startNumber < 1 ? 1 : startNumber;

    if (startNumber + pageLength > totalPageNumber) {
      startNumber = totalPageNumber - pageLength + 1;
    }

    let list = Array.from(
      { length: pageLength },
      (value, index) => index + startNumber
    );

    let showStartDot = startNumber !== 1;
    let showEndDot = list.slice(-1)[0] !== totalPageNumber;

    return {
      list,
      showStartDot,
      showEndDot,
      paging_IsPaged: list.length > 1,
    };
  }

  /**
   * set current page
   * -1 to set last page
   * @param value
   * @private
   */
  _setPage(value) {
    if (value === -1) {
      let pageSize = +this.fieldInfo.paging_pageSize;
      let rowSize = +this._dataGetRowList().length;
      let totalPageNumber = Math.ceil(rowSize / pageSize);
      value = totalPageNumber;
    }

    this.setState({ currentPage: value });
  }

  /**
   * create fieldInfo for component that use in grid
   * save them in data.componentFields to update them later
   * @param rowList
   * @private
   */
  _setColumnComponents(rowList) {
    const idColName = this.dataSource.idColName;

    this.data.columnInfo_List.forEach((columnInfo) => {
      rowList.forEach((row) => {
        let componentField = (this.data.componentFields[row[idColName]] =
          this.data.componentFields[row[idColName]] || {});

        if (!this._columnIsFieldInfo(columnInfo)) {
          return delete componentField[columnInfo.fieldName];
        }

        const value = row[columnInfo.fieldName];

        //TODO need later
        //const columnFieldInfo = Utils.mergeObject(columnInfo, value)
        if (!value) return delete componentField[columnInfo.fieldName];

        //this.data.needUpdate => force update...
        if (
          !this.data.needUpdate &&
          componentField[columnInfo.fieldName] &&
          componentField[columnInfo.fieldName].component
        ) {
          componentField[columnInfo.fieldName].initialValue = componentField[
            columnInfo.fieldName
          ].getValue();
        } else {
          componentField[columnInfo.fieldName] = FieldInfo.create(
            this.fieldInfo,
            value
          );

          //component in grid have this props
          componentField[columnInfo.fieldName]._value =
            row[columnInfo.fieldName];
          componentField[columnInfo.fieldName]._grid = this;
          componentField[columnInfo.fieldName]._row = row;
          componentField[columnInfo.fieldName]._columnInfo = columnInfo;

          const initValue =
            componentField[columnInfo.fieldName] &&
            componentField[columnInfo.fieldName].getValue();
          if (Utils.isDefine(initValue)) {
            componentField[columnInfo.fieldName].initValue = initValue;
          }
        }
      });
    });
  }

  /**
   * get fixed value from value
   * such fix number for number fields
   * @param value
   * @param columnInfo
   * @param cardInfo
   * @return {*}
   * @private
   */
  _getRowDataForColumn = (value, columnInfo, cardInfo) => {
    //fix is static function with validationFix name
    //find component then call its validationFix function
    let component = ComponentUtils.getComponentTag(columnInfo);
    if (component && component.validationFix) {
      value = component.validationFix(value, columnInfo);
    }

    //card text maybe need add label to it
    if (cardInfo) {
      value = Utils.toString(cardInfo.label) + " " + value;
      value = value + " " + Utils.toString(cardInfo.label_After);
    }
    if(value === "undefined" && UiSetting.GetSetting("language") === "fa")
      value = "تعریف نشده"
    return value;
  };

  /**
   * main group column name that must show in grid
   * other column is hide
   * @param columnInfo
   * @return {boolean}
   * @private
   */
  _isGroupColumn = (columnInfo) => {
    return columnInfo.fieldName === this.fieldInfo.grouping_StartFieldName;
  };

  /**
   * @param columnInfo
   * @return {boolean}
   * @private
   */
  _isDragColumn = (columnInfo) => {
    return columnInfo.drag_CanDrag;
  };

  _isColumnVisible(columnInfo) {
    return (
      this._isCardView() ||
      (!this.data.columnsHide[columnInfo.fieldName] && columnInfo.visible)
    );
  }

  _isCardView() {
    return this.fieldInfo.row_CardView_Definition;
  }

  /**
   * get key for render tags
   * @param rowId
   * @param level
   * @return {*}
   * @private
   */
  _getRowKey(rowId, level) {
    let key = rowId;
    if (typeof level === 'number') {
      key += "_" + level;
    }
    return key;
  }

  _handleOnTdClick(row, fieldName, level, columnInfo, event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    columnInfo =
      this.data.columnInfo_List.find((c) => c.fieldName === fieldName) ||
      columnInfo;

    const idColName = this.dataSource.idColName;
    const buttonFieldInfo = this.data.componentFields[row[idColName]][
      columnInfo.fieldName
    ];
    buttonFieldInfo.click();
    //this.clickOnItem(row, fieldName, level)
  }

  _handleTrDropMove(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }

  _handleTrOnDrop = (dropRow) => {
    try {
      const { columnInfo, row } = this.data.dragData;

      const dropColumn = this.data.columnInfo_List.find(
        (col) => col.drag_AcceptDrag_FieldName === columnInfo.fieldName
      );

      const idColName = this.dataSource.idColName;

      const buttonFieldInfo =
        this.data.componentFields[dropRow[idColName]] &&
        this.data.componentFields[dropRow[idColName]][dropColumn.fieldName];

      buttonFieldInfo.click("", row[columnInfo.fieldName].drag_ParamList);
    } catch (e) {}
  };

  _handleTdDragStart = (columnInfo, row) => {
    this.data.dragData = {
      columnInfo,
      row,
    };
  };

  //endregion

  //------------------------------------------------
  //endregion private methods
  //------------------------------------------------
}

export default GridInfo_Core;
