import React, { createElement } from "react";
import "./FormInfo.css";
import ComponentUtils from "../ComponentUtils";
import FontAwesome from "react-fontawesome";
import { Button } from "reactstrap";
import FileDrop from "react-file-drop";
import FormInfo_Core from "./FormInfo_Core";
import SystemClass from "../../SystemClass";
import SectionBlock from "../SectionBlock/SectionBlock";
import UiSetting from "../../UiSetting";
import DashboardButton from "../DashboardButton/DashboardButton";

class FormInfo extends FormInfo_Core {
  constructor(props) {
    super(props);
    this.state = {
      ...this.state,
      highlightedFieldName: [],
    };
  }

  componentDidMount() {
    super.componentDidMount();
    window.addEventListener("resize", this._handleWindowResize);
    let formContainer = document.getElementsByClassName("FormInfo__container");
    formContainer = formContainer[formContainer.length - 1];
    const inputElms = formContainer.querySelectorAll(
      "input:not([disabled]):not([readonly]):not([type=hidden]),textarea:not([disabled]):not([readonly]):not([type=hidden])"
    );

    let formInputsArray = [...inputElms];

    for (const item of formInputsArray) {
      const index = formInputsArray.indexOf(item);
      let parent = item.parentNode;
      let foundedParent = null;

      while (true) {
        let classes = parent.classList.value;
        if (!classes.includes("FormInfo__fieldInfo")) {
          parent = parent.parentNode;
        } else {
          foundedParent = parent;
          break;
        }
      }
      if (foundedParent && foundedParent.style.display === "none") {
        formInputsArray.splice(index, 1);
      }
    }

    for (const item of formInputsArray) {
      const index = formInputsArray.indexOf(item);

      item.onfocus = () => {
        item.select();
      };

      item.onkeypress = (e) => {
        if (e.keyCode === 13) {
          formInputsArray[index + 1] && formInputsArray[index + 1].focus();
        }
      };

      item.onkeyup = (e) => {
        if (e.ctrlKey) {
          switch (e.keyCode) {
            // Arrow up
            case 38:
              formInputsArray[index - 1] && formInputsArray[index - 1].focus();
              break;
            // Arrow down
            case 40:
              formInputsArray[index + 1] && formInputsArray[index + 1].focus();
              break;
            default:
              break;
          }
        }
      };
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    window.removeEventListener("resize", this._handleWindowResize);
    if (this.props.setActiveComponent) {
      this.props.setActiveComponent("Transaction");
    }
  }

  _handleWindowResize = (event) => {
    this.forceUpdate();
  };

  //for update ui component such label
  updateUI() {
    SystemClass.DialogComponent && SystemClass.DialogComponent.forceUpdate();
  }

  handleChangeComponent = (newComp) => {
    this.props.setActiveComponent(newComp);
    this.forceUpdate();
    this.rebind();
  };

  handleChangeDirtyChildren = () => {
    this.props.setDirtyModal(this.props.modelItem);
  };

  _convertFilters(input, fieldName) {
    const result = {};
    for (const [key, fields] of Object.entries(input)) {
      const merged = Object.entries(fields)
        .filter(([fname]) => fname !== fieldName)
        .reduce((acc, [, arr]) => acc.concat(arr), []);
      if (merged.length > 0) result[key] = merged;
    }
    return result;
  }

  _convertToMerge(input) {
    const result = {};
    for (const [key, fields] of Object.entries(input)) {
      const merged = Object.entries(fields).reduce(
        (acc, [, arr]) => acc.concat(arr),
        []
      );
      if (merged.length > 0) result[key] = merged;
    }
    return result;
  }

  _deepCopy(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj; // Return primitive values directly
    }

    let copy;
    if (Array.isArray(obj)) {
      copy = [];
      for (let i = 0; i < obj.length; i++) {
        copy[i] = this._deepCopy(obj[i]);
      }
    } else {
      copy = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = this._deepCopy(obj[key]);
        }
      }
    }
    return copy;
  }

  handleChangeParameters = (
    fieldName,
    IdColName,
    filterParameterList,
    forceUpdateNow = false
  ) => {
    const parameterList = filterParameterList.map((item) => item[IdColName]);
    if (!this.data.parameterControl[IdColName]) {
      this.data.parameterControl[IdColName] = {};
    }
    if (!Array.isArray(this.data.parameterControl[IdColName][fieldName])) {
      this.data.parameterControl[IdColName][fieldName] = [];
    }

    if (parameterList.length === 0) {
      delete this.data.parameterControl[IdColName][fieldName];
      if (Object.keys(this.data.parameterControl[IdColName]).length === 0) {
        delete this.data.parameterControl[IdColName];
      }
    } else {
      this.data.parameterControl[IdColName][fieldName] = parameterList;
    }

    const deepEqual = (a, b) => {
      if (a === b) return true;
      if (typeof a !== typeof b) return false;
      if (typeof a !== "object" || a === null || b === null) return false;
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      if (aKeys.length !== bKeys.length) return false;
      for (let key of aKeys) {
        if (!b.hasOwnProperty(key) || !deepEqual(a[key], b[key])) return false;
      }
      return true;
    };

    clearTimeout(this._parameterControlTimeout);
    const applyParameterControl = () => {
      const parameterControl = { ...this.data.parameterControl };
      const newParameterControl = this._convertToMerge(
        this.data.parameterControl
      );
      if (!this.lastAppliedParameterControl) {
        this.lastAppliedParameterControl = {};
      }
      if (!deepEqual(this.lastAppliedParameterControl, newParameterControl)) {
        this.lastAppliedParameterControl = newParameterControl;
        Object.entries(this.data.components).forEach(
          ([fieldName, compInstance]) => {
            if (compInstance && compInstance.applyCrossComponentFilters) {
              const otherFilters = this._convertFilters(
                parameterControl,
                fieldName
              );
              if (!this.lastAppliedParameterControl_OtherFilters) {
                this.lastAppliedParameterControl_OtherFilters = {};
              }
              if (!this.lastAppliedParameterControl_OtherFilters[fieldName]) {
                this.lastAppliedParameterControl_OtherFilters[fieldName] = {};
              }

              if (
                Object.keys(otherFilters).length > 0 ||
                Object.keys(parameterControl).length === 0 ||
                Object.keys(this.lastAppliedParameterControl_OtherFilters[fieldName]).length > 0
              ) {
                compInstance.applyCrossComponentFilters(otherFilters);
                this.lastAppliedParameterControl_OtherFilters[fieldName] = otherFilters;
              }
            }
          }
        );
      }
    };

    // if (forceUpdateNow) {
    applyParameterControl();
    // } else {
    //   this._parameterControlTimeout = setTimeout(() => {
    //     applyParameterControl();
    //   }, 2000);
    // }

    const allFieldNames = Object.values(this.data.parameterControl).flatMap(
      (obj) => Object.keys(obj)
    );
    this.setState({ highlightedFieldName: allFieldNames });
  };

  //------------------------------------------------
  //region render
  //------------------------------------------------
  _elementGetFieldInfo(fieldInfo) {
    // Always return a React element, not a component instance
    let Tag = ComponentUtils.getComponentTag(fieldInfo);
    return (
      <Tag
        key={this.data.currentComponentTerm}
        fieldInfo={fieldInfo}
        setExternalData={(data) => this.setExternalData(data)}
        activeComponent={this.props.activeComponent}
        setActiveComponent={this.handleChangeComponent}
        setDirtyChildren={this.handleChangeDirtyChildren}
        setParameterControl={this.handleChangeParameters}
        parameterControl={this.data.parameterControl}
        parameterControl_IsActive={this.data.parameterControl_IsActive}
        ref={(ref) => ref && (this.data.components[fieldInfo.fieldName] = ref)}
      />
    );
  }

  _elementGetFormItem(fieldInfo, index) {
    const idColName = this.fieldInfo.idColName || "fieldName";

    const width_Total =
      (this.data.cardViewDefinition == true && 100) ||
      this._getComponentTotalWidth(fieldInfo);

    const style = {
      minWidth: width_Total + "%",
      maxWidth: width_Total + "%",
      flex: !width_Total ? 1 : "",
      padding: ".5rem 0",
      display: !fieldInfo.visible && "none",
    };

    const styleLine = this.data.styleList.find(
      (item) => item.fieldInfo === fieldInfo
    );
    if (styleLine) {
      style.marginRight = styleLine.marginRight;
      style.marginLeft = styleLine.marginLeft;
      style.marginBottom = styleLine.marginBottom;
      style.marginTop = styleLine.marginTop;
    }

    return (
      <div
        className="FormInfo__fieldInfo"
        key={fieldInfo[idColName]}
        style={style}
      >
        {this._elementGetFieldInfo(fieldInfo)}
      </div>
    );
  }

  _getHtmlBlockButtons(fieldList, item_definition, root_definition) {
    if (!root_definition || !root_definition.buttenList || !Array.isArray(fieldList)) {
      return null;
    }

    const fieldName = item_definition.fieldName || "none";
    const customSetting = item_definition.button_CustomSetting || {};

    const buttenList = root_definition.buttenList.filter(item => {
      if (!item) return false;
      const setting = customSetting[item] || {};
      return (!setting.visible || setting.visible === 1);
    });

    const buttonFields = fieldList.filter(fieldInfo => {
      return fieldInfo &&
        typeof fieldInfo.fieldName === 'string' &&
        buttenList.some(buttenName => fieldInfo.fieldName === buttenName);
    });

    if (!buttonFields || buttonFields.length === 0) {
      return null;
    }

    var button_ParamList = {};
    if (item_definition.button_ParamList)
      button_ParamList = item_definition.button_ParamList.formParams ? item_definition.button_ParamList : { "formParams": item_definition.button_ParamList };

    return buttonFields.map(fieldInfo => {
      // Set button_IconName from button_CustomSetting if icon is present
      const setting = customSetting[fieldInfo.fieldName] || {};
      if (setting.icon) {
        fieldInfo.button_IconName = setting.icon;
      } else if (!fieldInfo.button_IconName) {
        const fname = fieldInfo.fieldName.toLowerCase();
        if (fname.includes('setting')) {
          fieldInfo.button_IconName = 'gear';
        } else if (fname.includes('remove')) {
          fieldInfo.button_IconName = 'dash-square';
        } else if (fname.includes('add')) {
          fieldInfo.button_IconName = 'plus-square';
        } else if (fname.includes('save')) {
          fieldInfo.button_IconName = 'floppy';
        }
      }
      if (fieldInfo.button_IconName)
        fieldInfo.label = "";
      return (
        <DashboardButton
          key={this.data.currentComponentTerm}
          fieldInfo={fieldInfo}
          setExternalData={(data) => this.setExternalData(data)}
          activeComponent={this.props.activeComponent}
          setActiveComponent={this.handleChangeComponent}
          setDirtyChildren={this.handleChangeDirtyChildren}
          extraParams={button_ParamList}
        />
      );
    });
  }

  _createHtmlBlock(item_definition, childElement, root_definition = null) {
    // Base styles
    const baseStyle = {
      padding: item_definition.padding,
      position: "relative",
      display: "flex",
      flexDirection: item_definition.layout === "horizontal" ? "row" : "column",
      // backgroundColor: item_definition.backgroundColor,
      borderRadius: item_definition.borderRadius,
      margin: item_definition.margin,
      alignItems: item_definition.alignItems,
      justifyContent: item_definition.justifyContent,
    };
    const isMainDiv = !root_definition;
    var root_BgColor = null;
    if (root_definition && root_definition.backgroundColor)
      root_BgColor = root_definition.backgroundColor;

    // Layout-specific styles
    const layoutStyles = {
      horizontal: {
        height: item_definition.height || "100%",
        width: item_definition.width || (isMainDiv ? "100vw" : "100%"),
      },
      vertical: {
        height: item_definition.height || (isMainDiv ? "auto" : "100%"),
        width: item_definition.width || "100%",
      },
      single: {
        backgroundColor: item_definition.backgroundColor || root_BgColor || "whiteSmoke",
        borderRadius: "8px",
        margin: "0.25rem",
        alignItems: "center",
        justifyContent: "end",
        width: item_definition.width,
        height: item_definition.height,
      }
    };

    // Merge styles
    const style = {
      ...baseStyle,
      ...(layoutStyles[item_definition.layout] || {}),
    };

    // Highlight logic
    if (
      item_definition.layout === "single" &&
      item_definition.fieldName &&
      item_definition.fieldName !== "none" &&
      Array.isArray(this.state.highlightedFieldName) &&
      this.state.highlightedFieldName.includes(item_definition.fieldName)
    ) {
      style.backgroundColor = "#fff1cd";
    }

    // item_definition creation
    if (item_definition.layout === "single") {
      const fieldList = this.getFieldList();
      const fieldInfo = fieldList.find(item => item.fieldName === item_definition.fieldName);
      var singleChildElement = null
      if (fieldInfo) {
        singleChildElement = this._elementGetFormItem(fieldInfo);
      } else if (item_definition.fieldName === "iconSite") {
        const iconStyle = {
          position: "relative",
          width: "100%",
          height: "100%",
          borderRadius: "8px"
        };
        let imgName = item_definition.imgName || (UiSetting.serverName === "Mapsun" ? "first-page-logo" : "TCILogo");
        const images = {};
        const req = require.context("./../../content", false, /\.(png|jpg)$/);
        req.keys().forEach((key) => {
          const fileName = key.replace("./", "");
          images[fileName] = req(key);
        });

        let imgSrc;
        if (/\.(png|jpg)$/i.test(imgName)) {
          imgSrc = images[imgName] || "";
        } else {
          if (images[imgName + ".png"]) {
            imgSrc = images[imgName + ".png"];
          } else if (images[imgName + ".jpg"]) {
            imgSrc = images[imgName + ".jpg"];
          }
        }
        singleChildElement = (
          <img
            style={iconStyle}
            src={imgSrc || ""}
            alt={item_definition.imgName || "site icon"}
          />
        );
      }

      return (
        <SectionBlock
          style={style}
          children={singleChildElement}
          item_definition={item_definition}
          dashboardButtons={this._getHtmlBlockButtons(fieldList, item_definition, root_definition)}و
          fieldInfo={fieldInfo}
        />
      );
    }

    return <SectionBlock style={style} children={childElement} item_definition={item_definition} />;
  }

  _createHtmlTree(pageLayoutSource) {
    if (!pageLayoutSource.items) {
      return this._createHtmlBlock(pageLayoutSource, []);
    }

    const root_definition = pageLayoutSource;

    const createNestedBlocks = (items) =>
      items.map(item => {
        const children = item.items ? createNestedBlocks(item.items) : [];
        return this._createHtmlBlock(item, children, root_definition);
      });

    const firstChild = createNestedBlocks(pageLayoutSource.items);
    return this._createHtmlBlock(root_definition, firstChild);
  }

  _elementGetAllField() {
    const fieldList = this.getFieldList();
    // .filter(i => i.visible)

    if (this.data.cardViewDefinition === true) {
      const pageLayoutSource = this.fieldInfo.row_CardView_Definition;

      return (
        <div
          className={`FormInfo__container ${window.screen.width < 480 ? "mb-5" : ""
            }`}
        >
          {this._createHtmlTree(pageLayoutSource)}
        </div>
      );
    } else {
      return (
        <div
          className={`FormInfo__container ${window.screen.width < 480 ? "mb-5" : ""
            }`}
        >
          {fieldList.map(this._elementGetFormItem.bind(this))}
        </div>
      );
    }
  }

  _elementGetFormMenu() {
    if (!this.data.formMenu) {
      return <div style={{ height: "1rem" }} />;
    }

    // if (!this.data.formMenu.formMenu_Default_IsVisible && !this.data.showFormMenu) return
    // if (!this.data.showFormMenu) return

    const menuFieldList = this._getMenuFieldInfoList();
    const width_Total = 10;
    const style = {
      backgroundColor: this.data.formMenu.formMenu_BackColor,
    };

    return (
      <div
        className={[
          "FormInfo__menu",
          !this.data.showFormMenu && "FormInfo__menu--hide",
        ]
          .filter((c) => c)
          .join(" ")}
        style={style}
      >
        <div className={"FormInfo__menuIconContainer"}>
          <Button
            className={"Menu__icon FormInfo__menuIcon"}
            outline
            color="light"
            onClick={this._handleOnCloseMenuClick}
          >
            <FontAwesome className={""} name="times-circle" />
          </Button>
        </div>

        {menuFieldList.map(this._elementGetFormItem.bind(this))}
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="Form__container__error">
          <FontAwesome
            className="Form__container__error__icon"
            name="exclamation-triangle"
          />
          <span className="Form__container__error__text">
            خطایی روی داده است!
          </span>
          <Button
            onClick={this._handleReloadClick}
            outline
            className="Form__container__error__button"
          >
            <FontAwesome
              className="Form__container__error__button__icon"
              name="sync-alt"
            />
            بارگذاری مجدد
          </Button>
        </div>
      );
    }

    const formElement = (
      <div className={"FormInfo"} key={1}>
        {/* <h5 className={"FormInfo__header"}>{this.fieldInfo.label}</h5> */}
        {this._elementGetFormMenu()}
        {this._elementGetAllField()}
        <div className={"FormInfo__fileDrop"} key={2} />
        {this.getHasBtnFileUpload() && (
          <input
            type="file"
            className={"FormInfo__fileDrop"}
            id={"FormInfo__fileUpload"}
          />
        )}
      </div>
    );

    const isUploadContainer = this._isUploadContainer();

    if (isUploadContainer) {
      return <FileDrop onDrop={this._handleDrop}>{formElement}</FileDrop>;
    } else {
      return formElement;
    }
  }

  //------------------------------------------------
  //endregion render
  //------------------------------------------------
}

export default FormInfo;
