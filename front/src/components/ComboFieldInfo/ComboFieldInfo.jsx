import "./ComboFieldInfo.css";
import React from "react";
import CheckBoxFieldInfo from "../CheckBoxFieldInfo/CheckBoxFieldInfo";
import Utils from "../../Utils";
import * as ReactDOM from "react-dom";
import Spinner from "reactstrap/es/Spinner";
import FieldInfo from "../../class/FieldInfo";
import FieldType from "../../class/enums/FieldType";
import LabelPosition from "../../class/enums/LabelPosition";
import { UncontrolledTooltip } from "reactstrap";
import ComboFieldInfo_Core from "./ComboFieldInfo_Core";
import UiSetting from "../../UiSetting";

//https://codepen.io/MoorLex/pen/XeNzoK
class ComboFieldInfo extends ComboFieldInfo_Core {
  //------------------------------------------------
  //region component public method
  //------------------------------------------------

  componentDidMount() {
    this.changeValue(this.fieldInfo.initialValue);
    this.data.node = ReactDOM.findDOMNode(this);
  }

  componentWillUnmount() {
    this.data._validationEffectTimeoutId &&
      clearTimeout(this.data._validationEffectTimeoutId);
  }

  //------------------------------------------------
  //endregion component public method
  //------------------------------------------------

  //------------------------------------------------
  //region component private method
  //------------------------------------------------

  _openDropdownMenu(open) {
    const readOnly = !this.fieldInfo.canEdit;
    if (readOnly) return;

    if ((open == "") != (this.state.classShowMenu == "")) {
      if (open) {
        ReactDOM.findDOMNode(this)
          .querySelector("input")
          .focus();
      }

      // در هنگام بسته شدن باید مقدار فیلد فیلتر مربوط به مالتی سلکت خالی شود
      let inputText_MultiSelectFilter_Current = this.state
        .inputText_MultiSelectFilter;

      this.setState({
        classShowMenu: open ? "ComboFieldInfo__dropdown-menu--open" : "",
        inputText_MultiSelectFilter: open
          ? inputText_MultiSelectFilter_Current
          : "",
      });
    }
  }

  _setInputTextFromSelected() {
    const multiSelect = this.fieldInfo.combo_MultipleSelect;
    let text;

    if (this.data.selectedDataRow.length === 0) {
      text = "";
    } else if (this._isOpenCombo()) {
      text = this.data.selectedDataRow[0];
    } else if (multiSelect) {
      text = this.data.selectedDataRow
        .map(this._getDataRowText.bind(this))
        .join(" - ");

      if (this.data.selectedDataRow.length > 1) {
        if (this.data.selectedDataRow.length > 3) {
          text =
            this.data.selectedDataRow.length +
              "  " +
              UiSetting.GetSetting("language") ===
              "fa"
              ? " آیتم انتخاب شده"
              : "Items were selected";
        } else {
          const input = ReactDOM.findDOMNode(this).querySelector("input");
          input.value = text;

          if (input.clientWidth < input.scrollWidth) {
            text =
              this.data.selectedDataRow.length +
                UiSetting.GetSetting("language") ===
                "fa"
                ? " آیتم انتخاب شده"
                : "Items were selected";
          }
        }
      }
    } else {
      text = this._getDataRowText(this.data.selectedDataRow[0]);
    }

    this._setInputText(text);
  }

  _handleInputKeyPress(event) {
    if (event.key === "Enter") {
      event.target.blur();
      this.data.node && this.data.node.blur();
    }
  }

  _handleInputKeyDown = (event) => {
    if (event.keyCode === 40) {
      // Pass this way: input->div.invalid-feedback->svg.ComboFieldInfo__icon->div.ComboFieldInfo__dropdown-menu->div.ComboFieldInfo__dropdown-menu`s first child(button)
      event.target.nextElementSibling.nextElementSibling.nextElementSibling.firstChild.focus();
    }
  };

  // Used to move the focus to the input element after selection done.
  _handleComboItemsKeyPress = (event) => {
    // If enter key pressed.
    if (event.key === "Enter") {
      event.target.parentNode.previousElementSibling.previousElementSibling.previousElementSibling.focus();
    }
  };

  _handleInputBlur(event) {
    if (!ReactDOM.findDOMNode(this).contains(event.relatedTarget)) {
      this._openDropdownMenu(false);
    }

    const multiSelect = this.fieldInfo.combo_MultipleSelect;
    if (!this._isOpenCombo() && !multiSelect) {
      let inputText = this.state.inputText;
      let dataRowList = this._dataGetRowListForMenu();
      let dataRow = dataRowList.find((dataRow) => {
        let title = this._getDataRowText(dataRow);
        return title.toUpperCase() == inputText.toUpperCase();
      });

      if (dataRow) {
        this._setInputText(this._getDataRowText(dataRow));
        this._setValue(dataRow);
      }
    }
  }

  _handleMenuItemCheckChange(dataRow, title, component, isChecked) {
    let list = [].concat(this.data.selectedDataRow);
    const idColName =
      this.fieldInfo.combo_IdColName || this.dataSource.combo_IdColName;

    if (isChecked) {
      //if was not in list then push...
      !list.find((i) => i[idColName] == dataRow[idColName]) &&
        list.push(dataRow);
    } else {
      list = list.filter((i) => i[idColName] != dataRow[idColName]);
    }


    const fieldName = this.fieldInfo.fieldName;
    if (this.props.parameterControl_IsActive) {
      const currentparameterControl =
        this.props.parameterControl &&
        this.props.parameterControl[idColName] &&
        this.props.parameterControl[idColName][fieldName];

      const listIds = list.map(item => item[idColName]);
      if (
        !Array.isArray(currentparameterControl) ||
        listIds.length !== currentparameterControl.length ||
        listIds.some((id, idx) => id !== currentparameterControl[idx])
      ) {
        this.props.setParameterControl(fieldName, idColName, list);
      }
    }


    let text = list.map(this._getDataRowText.bind(this)).join(" - ");

    function setTextAsValueNumber() {
      text =
        "  " + list.length + UiSetting.GetSetting("language") === "fa"
          ? " آیتم انتخاب شده"
          : "Items were selected";
    }

    if (list.length > 1) {
      if (list.length > 3) {
        setTextAsValueNumber();
      } else {
        const input = ReactDOM.findDOMNode(this).querySelector("input");
        input.value = text;

        if (input.clientWidth < input.scrollWidth) {
          setTextAsValueNumber();
        }
      }
    }

    this._setInputText(text);
    this._setValue(list);
  }

  _handleKeyDown(event) {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      event.target.previousElementSibling &&
        event.target.previousElementSibling.focus();
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      event.target.nextElementSibling &&
        event.target.nextElementSibling.focus();
    }
  }

  //------------------------------------------------
  //endregion component private method
  //------------------------------------------------

  //------------------------------------------------
  //region :فیلتر روی مالتی سلکت
  //------------------------------------------------

  _elementGetMenuFilter_ForMultiSelect() {
    if (!this._elementGetMenuFilter_ForMultiSelect_ShowFilter()) return "";

    let filterField = (
      <div>
        <input
          type="text"
          className="comboFieldInfo__filter__field"
          placeholder="......"
          value={this.state.inputText_MultiSelectFilter}
          onChange={this._handleInputChange_MultiSelectFilter.bind(this)}
        />
      </div>
    );

    return filterField;
  }

  //------------------------------------------------
  //endregion :فیلتر روی مالتی سلکت
  //------------------------------------------------

  //------------------------------------------------
  //region render and element
  //------------------------------------------------
  _elementGetMenuList() {
    let dataRowList = this._dataGetRowListForMenu();
    if (dataRowList.length === 0) {
      //#EmptyMode empty item for menu
      return this._elementGetEmptyModeItem();
    }

    return dataRowList.map(this._elementGetMenuItem.bind(this));
  }

  /* ##### */

  /* style={{ color: fontColor }} */
  /* placeholder={this.fieldInfo.placeholder} */
  /* onClick={this._handleInputClick.bind(this)} */
  /* onKeyPress={this._handleInputKeyPress.bind(this)} */

  _elementGetEmptyModeItem() {
    return (
      <h6 tabIndex="-1" className="dropdown-header">
        {" "}
        موردی یافت نشد{" "}
      </h6>
    );
  }

  _elementGetMenuItem(dataRow, dataRowIndex) {
    const multiSelect = this.fieldInfo.combo_MultipleSelect;
    let element;
    let title = this._getDataRowText(dataRow);
    const idColName =
      this.fieldInfo.combo_IdColName || this.dataSource.combo_IdColName;
    const idValue = dataRow[idColName];
    let isDisable = !Utils.isDefine(idValue);
    const style = {
      textAlign: UiSetting.GetSetting("textAlign"),
    };

    // Check for row_Disabled_FieldName logic
    const row_Disabled_FieldName = this.fieldInfo.row_Disabled_FieldName;
    if (row_Disabled_FieldName && dataRow.hasOwnProperty(row_Disabled_FieldName)) {
      if (dataRow[row_Disabled_FieldName] === true) {
        isDisable = true;
      }
    }

    const row_BackColor_FieldName = this.fieldInfo.row_BackColor_FieldName;
    if (row_BackColor_FieldName) {
      const level = dataRow[row_BackColor_FieldName];
      const backgroundColor = this.fieldInfo["row_BackColor_" + +level];
      style.backgroundColor = backgroundColor;
    }

    if (multiSelect) {
      this.data.checkBoxFields[idValue] =
        this.data.checkBoxFields[idValue] ||
        FieldInfo.create(this.fieldInfo, {
          checkBox_FalseColor: "#212529",
          checkBox_TrueColor: "#212529",
          fieldType: FieldType.CheckBox,
        });

      this.data.checkBoxFields[idValue].checkBox_TrueText = title;
      this.data.checkBoxFields[idValue].checkBox_FalseText = title;
      this.data.checkBoxFields[
        idValue
      ].initialValue = this.data.selectedDataRow.includes(dataRow);

      element = (
        <CheckBoxFieldInfo
          style={style}
          disabled={isDisable}
          key={idValue}
          className="ComboFieldInfo__item"
          fieldInfo={this.data.checkBoxFields[idValue]}
          onChange={this._handleMenuItemCheckChange.bind(this, dataRow, title)}
        />
      );
    } else {
      element = (
        <button
          style={style}
          disabled={isDisable}
          key={idValue}
          className="ComboFieldInfo__item"
          onClick={this._handleMenuItemClick.bind(this, dataRow, title)}
          onKeyPress={this._handleComboItemsKeyPress}
        >
          {" "}
          {title}{" "}
        </button>
      );
    }

    return element;
  }

  _elementGetMenu() {
    const className = [
      "ComboFieldInfo__dropdown-menu",
      this.state.classShowMenu,
      this.state.error && "ComboFieldInfo__dropdown-menu--with-error",
    ];

    let height;
    let style;
    if (this.state.classShowMenu) {
      if (!this.data._styleMenu) {
        let rect = this.data.node.getBoundingClientRect();
        let clientHeight = document.documentElement.clientHeight;
        let offsetBottom = clientHeight - rect.bottom;
        height = offsetBottom;
        if (offsetBottom < 50) {
          className.push("ComboFieldInfo__dropdown-menu--top");
          height = rect.top;
        } else {
          height = offsetBottom;
        }

        this.data._styleMenu = style = { maxHeight: height - 12 + "px" };
      } else {
        style = this.data._styleMenu;
      }
    } else {
      this.data._styleMenu = "";
    }

    return (
      <div
        tabIndex="-1"
        role="menu"
        aria-hidden="false"
        className={className.filter((c) => c).join(" ")}
        style={style}
        onKeyDown={this._handleKeyDown.bind(this)}
      >
        {this._elementGetMenuFilter_ForMultiSelect()}
        {this._elementGetMenuList()}
      </div>
    );
  }

  render() {
    const labelPositionClass =
      this.fieldInfo.labelPosition === LabelPosition.LabelOnTop &&
      "TextFieldInfo--column";
    const sliceWidths = this._getLabelWidthStyles();
    const styleLabel = {
      maxWidth: sliceWidths.slice1,
      minWidth: sliceWidths.slice1,
      dir: UiSetting.GetSetting("DefaultPageDirection"),
      textAlign: UiSetting.GetSetting("textAlign"),
    };
    const styleInput = {
      maxWidth: sliceWidths.slice2,
      minWidth: sliceWidths.slice2,
    };
    const styleLabelAfter = {
      maxWidth: sliceWidths.slice3,
      minWidth: sliceWidths.slice3,
    };

    const canEdit = this.fieldInfo.canEdit || "";

    const hideLabel = this.fieldInfo.label_HideLabel;

    const fontColor = this.fieldInfo.fontColor;

    return (
      <div
        className={["ComboFieldInfo", labelPositionClass]
          .filter((c) => c)
          .join(" ")}
        onFocus={this._handleInputFocus.bind(this)}
        onBlur={this._handleInputBlur.bind(this)}
      >
        {this.fieldInfo.label && (
          <label className={"ComboFieldInfo__label"} style={styleLabel}>
            {!hideLabel && this.fieldInfo.label}
          </label>
        )}

        <div className="ComboFieldInfo__container" style={styleInput}>
          {!this.state.loading && canEdit && (
            <svg
              onClick={this._handleArrowIconClick.bind(this)}
              onMouseDown={(event) => event.preventDefault()}
              onTouchStart={(event) => event.preventDefault()}
              className={
                "ComboFieldInfo__icon " +
                (this.state.classShowMenu && "ComboFieldInfo__icon--open")
              }
              viewBox="0 0 24 24"
            >
              <path fill="#666666" d="M14,7L9,12L14,17V7Z" />
            </svg>
          )}

          {this.state.loading && (
            <Spinner color="primary" className="ComboFieldInfo__loading" />
          )}

          <input
            className={[
              "form-control",
              "ComboFieldInfo__input",
              (this.state.selected || this.isReadOnly()) &&
              "ComboFieldInfo__input--readonly",
              !this.isValid() && "is-invalid",
              this.state.validationEffect && "is-valid",
            ]
              .filter((c) => c)
              .join(" ")}
            dir={UiSetting.GetSetting("DefaultPageDirection")}
            type="text"
            style={{ color: fontColor }}
            readOnly={this.isReadOnly()}
            value={this.state.inputText}
            placeholder={this.fieldInfo.placeholder}
            onChange={this._handleInputChange.bind(this)}
            onClick={this._handleInputClick.bind(this)}
            onKeyPress={this._handleInputKeyPress.bind(this)}
            onKeyDown={this._handleInputKeyDown}
          />
          <div className="invalid-feedback"> {this.state.error} </div>

          {canEdit && (
            <svg
              onClick={this._handleCloseIconClick.bind(this)}
              onMouseDown={(event) => event.preventDefault()}
              onTouchStart={(event) => event.preventDefault()}
              className={
                "ComboFieldInfo__icon ComboFieldInfo__icon__close " +
                (!this.state.inputText && "ComboFieldInfo__icon__close--hide")
              }
              viewBox="0 0 24 24"
            >
              <path
                fill="#666666"
                d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
              />
            </svg>
          )}

          {this._elementGetMenu()}
        </div>

        {this.fieldInfo.label_After && (
          <label style={styleLabelAfter} className={""}>
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
  //endregion render and element
  //------------------------------------------------
}

export default ComboFieldInfo;
