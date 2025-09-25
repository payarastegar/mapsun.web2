import React, { useState, useEffect, useRef, useCallback, useImperativeHandle, forwardRef, useMemo } from "react";
import "./FormInfo.css";
import ComponentUtils from "../ComponentUtils";
import FontAwesome from "react-fontawesome";
import { Button } from "reactstrap";
import { useDropzone } from 'react-dropzone';
import SystemClass from "../../SystemClass";
import FieldInfo from "../../class/FieldInfo";
import Utils from "../../Utils";
import HorizontalAlign from "../../class/enums/HorizontalAlign";
import FieldType from "../../class/enums/FieldType";
import FileCompressor from "../../file/FileCompressor";
import SectionBlock from "../SectionBlock/SectionBlock";
import DashboardButton from "../DashboardButton/DashboardButton";
import UiSetting from "../../UiSetting";

const _deepCopy = (obj) => {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  let copy;
  if (Array.isArray(obj)) {
    copy = [];
    for (let i = 0; i < obj.length; i++) {
      copy[i] = _deepCopy(obj[i]);
    }
  } else {
    copy = {};
    for (let key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        copy[key] = _deepCopy(obj[key]);
      }
    }
  }
  return copy;
};

const deepEqual = (obj1, obj2) => {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== "object" || obj1 === null || typeof obj2 !== "object" || obj2 === null) {
    return false;
  }

  let keys1 = Object.keys(obj1);
  let keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  for (let key of keys1) {
    if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
      return false;
    }
  }
  return true;
};

/**
 * @file FormInfo.jsx
 * @description This is the final, fully refactored and unabridged functional component for FormInfo.
 * It merges all logic from the original class-based FormInfo.jsx and FormInfo_Core.js.
 * It correctly provides methods like `getFieldInfo` to its legacy class-based children components
 * by creating a stable "instance" object (`componentRef`) and passing it down to each child
 * FieldInfo object via the `_parentComponent` property, thus solving all related errors.
 */
const FormInfo = forwardRef((props, ref) => {
  const { fieldInfo } = props;

  // ------------------------------------------------
  // region Data Initialization
  // ------------------------------------------------

  const _dataGetDataSource = useCallback(() => {
    if (!fieldInfo || !fieldInfo.dataSourceName) return { dataArray: [] };
    return SystemClass.getDataSource(fieldInfo.dataSourceName, fieldInfo._formId, fieldInfo._paramList) || { dataArray: [] };
  }, [fieldInfo]);

  // ------------------------------------------------
  // region State and Refs
  // ------------------------------------------------

  const [hasError, setHasError] = useState(false);
  const [fieldList, setFieldList] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [menuFieldList, setMenuFieldList] = useState([]);
  const [styleList, setStyleList] = useState([]);
  const [showFormMenu, setShowFormMenu] = useState(fieldInfo.formMenu_Default_IsVisible);
  const [highlightedFieldName, setHighlightedFieldName] = useState([]);
  const [componentKeys, setComponentKeys] = useState({});




  const dataRef = useRef({
    components: {},
    currentComponentTerm: 0,
    cardViewDefinition: fieldInfo.row_CardView_Definition !== undefined,
    formMenu: null,
    parameterControl: {},
    _thumbnail: null,
    _file: null,
  });


  const getFieldList = useCallback(() => {
    return fieldList;
  }, [fieldList]);

  const getFieldInfo = useCallback((fieldName) => {
    return getFieldList().find((f) => f.fieldName === fieldName);
  }, [fieldList, getFieldList]);

  const getFieldInfoByDSName = useCallback((dsName) => {
    return getFieldList().find((f) => f.dataSourceName === dsName);
  }, [fieldList, getFieldList]);

  const getValue = useCallback(() => {
    const temp = {};
    const noValue_FieldTypeList = [
      FieldType.Button, FieldType.Chart, FieldType.DataSource, FieldType.Form,
      FieldType.FormMenu, FieldType.Image, FieldType.ImageViewer, FieldType.Label,
      FieldType.Map, FieldType.ProgressBar, FieldType.WebService_Update,
    ];

    fieldList.forEach((fInfo) => {
      if (noValue_FieldTypeList.includes(fInfo.fieldType)) return;

      const componentInstance = dataRef.current.components[fInfo.fieldName];
      if (componentInstance && typeof componentInstance.getValue === 'function') {
        temp[fInfo.fieldName] = componentInstance.getValue();

        // منطق مخصوص کامبوها برای گرفتن مقدار متنی
        if (
          fInfo.fieldType === FieldType.Combo ||
          fInfo.fieldType === FieldType.ComboFix ||
          fInfo.fieldType === FieldType.ComboOpen ||
          fInfo.fieldType === FieldType.ComboSearch
        ) {
          if (fInfo.combo_SelectedValueColName && typeof componentInstance.getSelectedValue === 'function') {
            temp[fInfo.fieldName + "_SelectedValue"] = componentInstance.getSelectedValue();
          }
        }
      } else {
        // اگر کامپوننت رندر نشده یا مقدار اولیه دارد
        temp[fInfo.fieldName] = fInfo.initialValue;
      }
    });

    return temp;
  }, [fieldList, dataRef]);

  const getInvalidFields = useCallback(() => {
    return fieldList.filter(
      (fInfo) => fInfo.visible && !fInfo.isValid()
    );
  }, [fieldList]);

  const getComponentTotalWidth = useCallback((fInfo) => {
    const onMenu = Object.keys(fInfo).some((k) => k.includes("_ShowOnFormMenu") && fInfo[k]);
    if (onMenu) return "";
    if (fInfo.width_Total) return Math.min(fInfo.width_Total, 100);
    if ([FieldType.Grid, FieldType.Chart, FieldType.Map].includes(fInfo.fieldType)) return 100;
    return 50;
  }, []);


  const formContainerRef = useRef(null);
  const componentRef = useRef({}); // This will hold the "instance" methods for children

  const dataSource = _dataGetDataSource();

  const parameterControl_IsActive = useMemo(() =>
    (fieldInfo.fieldInfo_List || []).some(
      (f) => f.listenTo_ParameterControl || f.fieldType === FieldType.ParameterControl
    ), [fieldInfo.fieldInfo_List]);

  // ------------------------------------------------
  // region Core Logic (Methods exposed to children)
  // ------------------------------------------------

  const rebind = useCallback(() => {
    const defaultValues = dataSource.dataArray[0] || {};
    const formSetting_Json = defaultValues.formSetting_Json;
    const formSetting = formSetting_Json && formSetting_Json[fieldInfo.fieldName];
    if (formSetting) Object.assign(fieldInfo, formSetting);

    const allFields = (fieldInfo.fieldInfo_List || [])
      .filter((f) => ComponentUtils.getComponentTag(f))
      .map((fi) => {
        let newFieldInfoData = { ...fi };
        const defaultValue = defaultValues[newFieldInfoData.fieldName];
        newFieldInfoData.initialValue = newFieldInfoData.initialValue ?? defaultValue;
        if (Utils.isObjectAndNotEmpty(defaultValue)) {
          newFieldInfoData = Utils.mergeObject(newFieldInfoData, defaultValue);
        }
        Object.keys(defaultValues)
          .filter((key) => key.startsWith(newFieldInfoData.fieldName + "_"))
          .forEach((fieldInfoKey) => {
            let key = fieldInfoKey.replace(newFieldInfoData.fieldName + "_", "");
            key = key[0].toLowerCase() + key.substring(1);
            newFieldInfoData[key] = defaultValues[fieldInfoKey];
          });

        if (formSetting_Json && formSetting_Json[newFieldInfoData.fieldName]) {
          const newInfo = formSetting_Json[newFieldInfoData.fieldName];
          if (Utils.isObject(newInfo) && newFieldInfoData.columnInfo_List) {
            Object.keys(newInfo).forEach((columnInfoName) => {
              if (
                typeof formSetting_Json[newFieldInfoData.fieldName][columnInfoName] ===
                "object"
              ) {
                if (newFieldInfoData.grid_IsGallery) {
                  newFieldInfoData = Utils.mergeObject(
                    newFieldInfoData,
                    formSetting_Json[newFieldInfoData.fieldName]
                  );
                }

                const columnInfo = newFieldInfoData.columnInfo_List.find(
                  (c) => c.fieldName == columnInfoName
                );

                if (columnInfo)
                  Object.assign(columnInfo, newInfo[columnInfoName]);
              } else {
                // const columnInfo = fieldInfo.find(c => c.fieldName == columnInfoName)
                // Object.assign(columnInfo, newInfo[columnInfoName])
                newFieldInfoData = Utils.mergeObject(newFieldInfoData, newInfo);
              }
            });
          } else {
            newFieldInfoData = Utils.mergeObject(newFieldInfoData, newInfo);
          }
        }

        const finalFieldInfo = new FieldInfo(newFieldInfoData);
        finalFieldInfo._parentFieldInfo = fieldInfo;
        finalFieldInfo._parentComponent = componentRef.current;
        return finalFieldInfo;
      });

    const newFieldList = allFields
      .filter((f) => !Object.keys(f).some(k => k.includes("_ShowOnFormMenu") && f[k]))
      .sort((a, b) => a.tartib - b.tartib);

    const newMenuFieldList = allFields
      .filter((f) => Object.keys(f).some(k => k.includes("_ShowOnFormMenu") && f[k]))
      .sort((a, b) => a.tartib - b.tartib);

    setFieldList(newFieldList);
    setMenuFieldList(newMenuFieldList);

    const newStyleList = [];
    if (!Utils.isMobile()) {
      let currentSize = 0;
      const fieldInfoTable = [];

      newFieldList
        .filter((f) => f.visible)
        .forEach((fieldInfo, index, list) => {
          let size = getComponentTotalWidth(fieldInfo);
          if (fieldInfo.align == HorizontalAlign.center) {
            newStyleList.push({
              fieldInfo,

              marginRight: (100 - size) / 2 + "%",
              marginLeft: (100 - size) / 2 + "%",
              marginTop: 0,
              marginBottom: 0,
            });
            size = 100;
          }

          let totalSize = currentSize + size;

          const beforeThisItem = list[index - 1];
          if (
            fieldInfo.align != HorizontalAlign.left &&
            beforeThisItem &&
            beforeThisItem.align == HorizontalAlign.left
          ) {
            //force new line
            totalSize = 101;
          }

          if (
            fieldInfo.lineBreak_Before ||
            (beforeThisItem && beforeThisItem.lineBreak_After)
          ) {
            //force new line
            totalSize = 101;

            const style = newStyleList.find((s) => s.fieldInfo == beforeThisItem);
            if (style) {
              style.marginLeft = "100%";
            } else {
              newStyleList.push({
                beforeThisItem,

                marginRight: 0,
                marginLeft: "100%",
                marginTop: 0,
                marginBottom: 0,
              });
            }
          }

          if (totalSize > 100) {
            //new line
            fieldInfoTable.push([fieldInfo]);
            currentSize = size;
          } else {
            //last line
            const lastItem = fieldInfoTable.slice(-1)[0] || [];
            lastItem.push(fieldInfo);
            currentSize = totalSize;
          }
        });

      fieldInfoTable.forEach((line) => {
        const leftField = line.find((f) => f.align == HorizontalAlign.left);
        if (!leftField) return;
        let lineSize = 0;
        line.forEach((f) => (lineSize += getComponentTotalWidth(f)));
        if (lineSize == 100) return;

        newStyleList.push({
          fieldInfo: leftField,

          marginRight: 100 - lineSize + "%",
          marginLeft: 0,
          marginTop: 0,
          marginBottom: 0,
        });
      });
    }
    setStyleList(newStyleList);

    dataRef.current.formMenu = (fieldInfo.fieldInfo_List || []).find(f => f.fieldType === FieldType.FormMenu);
    dataRef.current.components = {};
    dataRef.current.currentComponentTerm++;
    setHasError(false);
    setIsReady(true);

  }, [dataSource, fieldInfo, getComponentTotalWidth]);


  const handleChangeParameters = useCallback((fieldName, IdColName, filterParameterList) => {
    const parameterList = filterParameterList.map((item) => item[IdColName]);
    if (!dataRef.current.parameterControl[IdColName]) {
      dataRef.current.parameterControl[IdColName] = {};
    }
    if (!Array.isArray(dataRef.current.parameterControl[IdColName][fieldName])) {
      dataRef.current.parameterControl[IdColName][fieldName] = [];
    }


    if (parameterList.length === 0) {
      delete dataRef.current.parameterControl[IdColName][fieldName];
      if (Object.keys(dataRef.current.parameterControl[IdColName]).length === 0) {
        delete dataRef.current.parameterControl[IdColName];
      }
    } else {
      dataRef.current.parameterControl[IdColName][fieldName] = parameterList;
    }


    const convertToMerge = (input) => {
      const result = {};
      for (const [key, fields] of Object.entries(input)) {
        const merged = Object.entries(fields).reduce(
          (acc, [, arr]) => acc.concat(arr),
          []
        );
        if (merged.length > 0) result[key] = merged;
      }
      return result;
    };

    const convertFilters = (input, fieldName) => {
      const result = {};
      for (const [key, fields] of Object.entries(input)) {
        const merged = Object.entries(fields)
          .filter(([fname]) => fname !== fieldName)
          .reduce((acc, [, arr]) => acc.concat(arr), []);
        if (merged.length > 0) result[key] = merged;
      }
      return result;
    }

    const applyParameterControl = () => {
      const parameterControl = { ...dataRef.current.parameterControl };
      const newParameterControl = convertToMerge(
        dataRef.current.parameterControl
      );
      if (!dataRef.current.lastAppliedParameterControl) {
        dataRef.current.lastAppliedParameterControl = {};
      }
      if (!deepEqual(dataRef.current.lastAppliedParameterControl, newParameterControl)) {
        dataRef.current.lastAppliedParameterControl = newParameterControl;
        Object.keys(dataRef.current.components).forEach(fieldName => {
          const componentInstance = dataRef.current.components[fieldName];
          if (componentInstance && typeof componentInstance.applyCrossComponentFilters === 'function') {
            const otherFilters = convertFilters(
              parameterControl,
              fieldName
            );
            if (!dataRef.current.lastAppliedParameterControl_OtherFilters) {
              dataRef.current.lastAppliedParameterControl_OtherFilters = {};
            }
            if (!dataRef.current.lastAppliedParameterControl_OtherFilters[fieldName]) {
              dataRef.current.lastAppliedParameterControl_OtherFilters[fieldName] = {};
            }

            if (
              Object.keys(otherFilters).length > 0 ||
              Object.keys(parameterControl).length === 0 ||
              Object.keys(dataRef.current.lastAppliedParameterControl_OtherFilters[fieldName]).length > 0
            ) {
              componentInstance.applyCrossComponentFilters(otherFilters);
              dataRef.current.lastAppliedParameterControl_OtherFilters[fieldName] = otherFilters;
            }
          }
        }
        );
      }
    };


    applyParameterControl();

    const allFieldNames = Object.values(dataRef.current.parameterControl).flatMap(
      (obj) => Object.keys(obj)
    );
    setHighlightedFieldName(allFieldNames);
  }, [getFieldInfo]);

  const getFiles = useCallback(() => {
    return {
      file: dataRef.current._file,
      thumbnail: dataRef.current._thumbnail,
    };
  }, []);

  const clearFiles = useCallback(() => {
    dataRef.current._thumbnail = null;
    dataRef.current._file = null;

    const fileSizeField = fieldList.find((f) => f.fieldName === "fileSize");
    const fileNameField = fieldList.find((f) => f.fieldName === "txtFileName");

    if (fileNameField) {
      dataRef.current.components[fileNameField.fieldName]?.changeValue("");
    }
    if (fileSizeField) {
      dataRef.current.components[fileSizeField.fieldName]?.changeValue("");
    }
  }, [fieldList]);

  const _insertFile = useCallback((file) => {
    const fileSizeField = fieldList.find((f) => f.fieldName === "fileSize");
    const fileNameField = fieldList.find((f) => f.fieldName === "txtFileName");

    if (!fileSizeField || !fileNameField) {
      return SystemClass.showErrorMsg("فیلد های FileName یا FileSize یافت نشد!");
    }

    const uploadFile = file || {};
    const uploadFileName = uploadFile.name.toLowerCase().startsWith("image.jp") ? new Date().toISOString() + ".jpeg" : uploadFile.name;

    dataRef.current.components[fileNameField.fieldName]?.changeValue(uploadFileName || "");
    dataRef.current.components[fileSizeField.fieldName]?.changeValue(uploadFile.size || "");

    if (!file) return;

    const buttonFileUpload = fieldList.find((f) => f.button_FileUpload_IsFileUpload);
    if (buttonFileUpload) {
      dataRef.current.components[buttonFileUpload.fieldName]?.click();
    }
  }, [fieldList]);

  const selectFile = useCallback(async (file) => {
    if (!file) {
      return SystemClass.showErrorMsg("فایلی یافت نشد !");
    }

    if (file.type !== "image/tiff") {
      dataRef.current._thumbnail = await FileCompressor.CreateThumbnail(file);
      dataRef.current._file = await FileCompressor.CompressFile(file);
    } else {
      dataRef.current._thumbnail = file;
      dataRef.current._file = file;
    }

    _insertFile(file);
  }, [_insertFile]);

  const refreshComponent = useCallback((fieldName) => {
        setComponentKeys(keys => ({
            ...keys,
            [fieldName]: (keys[fieldName] || 0) + 1,
        }));
    }, []);


  // Expose methods to parent components (like FormContainer) using the main `ref`
  const formInstance = useMemo(() => ({
    getFieldInfo,
    getFieldInfoByDSName,
    rebind,
    showMenu: (show) => setShowFormMenu(show),
    getInvalidFields,
    getValue,
    getFieldList,
    selectFile,
    clearFiles,
    getFiles,
    refreshComponent
  }), [
    getFieldInfo, getFieldInfoByDSName, rebind, getInvalidFields, getValue, getFieldList,
    dataRef.current._file, dataRef.current._thumbnail, selectFile, clearFiles, getFiles
  ]);

  useImperativeHandle(ref, () => formInstance);

  useEffect(() => {
    if (fieldInfo) {
      fieldInfo.component = formInstance;
    }
    return () => {
      if (fieldInfo) {
        fieldInfo.component = null;
      }
    };
  }, [fieldInfo, formInstance]);

  // Keep the `componentRef` for children up-to-date with the latest functions
  useEffect(() => {
    componentRef.current.getFieldInfo = getFieldInfo;
    componentRef.current.getFieldInfoByDSName = getFieldInfoByDSName;
  });

  // ------------------------------------------------
  // region Lifecycle and Effects
  // ------------------------------------------------

  useEffect(() => {
    rebind();
  }, [rebind]);

  useEffect(() => {
    const handleWindowResize = () => rebind();
    window.addEventListener("resize", handleWindowResize);

    const formContainer = formContainerRef.current;
    if (formContainer) {
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


      formInputsArray.forEach((item, index) => {
        item.onfocus = () => item.select();
        item.onkeypress = (e) => { if (e.key === 'Enter') formInputsArray[index + 1]?.focus(); };
        item.onkeyup = (e) => {
          if (e.ctrlKey) {
            if (e.key === 'ArrowUp') formInputsArray[index - 1]?.focus();
            if (e.key === 'ArrowDown') formInputsArray[index + 1]?.focus();
          }
        };
      });
    }

    return () => {
      window.removeEventListener("resize", handleWindowResize);
    };
  }, [rebind, fieldList]);

  // ------------------------------------------------
  // region Event Handlers and Other Methods
  // ------------------------------------------------

  const handleDrop = async (files) => {
    selectFile(files[0]);
  };

  const handleReloadClick = () => {
    setHasError(false);
    rebind();
  }

  const handleChangeComponent = (newComp) => {
    if (props.setActiveComponent) props.setActiveComponent(newComp);
    rebind();
  }

  const handleChangeDirtyChildren = () => {
    if (props.setDirtyModal) props.setDirtyModal(props.modelItem);
  }

  // ------------------------------------------------
  // region Render Logic (including all original render helpers)
  // ------------------------------------------------

  const elementGetFieldInfo = useCallback((fInfo) => {
    const Tag = ComponentUtils.getComponentTag(fInfo);
    if (!Tag) {
      console.error("Error: Component type not found for this fieldInfo object:", fInfo);
    }
    if (!Tag) return null;
    return (
      <Tag
        key={`${fInfo.fieldName}-${componentKeys[fInfo.fieldName] || 0}`}
        fieldInfo={fInfo}
        activeComponent={props.activeComponent}
        setActiveComponent={handleChangeComponent}
        setDirtyChildren={handleChangeDirtyChildren}
        parameterControl_IsActive={parameterControl_IsActive}
        setParameterControl={handleChangeParameters}
        ref={(el) => {
          if (el) {
            dataRef.current.components[fInfo.fieldName] = el;
            fInfo.component = el;
          }
        }}
      />
    );
  }, [props.activeComponent,componentKeys]);

  const elementGetFormItem = useCallback((fInfo, index) => {
    const idColName = fieldInfo.idColName || "fieldName";
    const width_Total = (dataRef.current.cardViewDefinition && 100) || getComponentTotalWidth(fInfo);

    const style = {
      minWidth: width_Total && `${width_Total}%`,
      maxWidth: width_Total && `${width_Total}%`,
      flex: !width_Total ? 1 : '',
      padding: ".5rem 0",
      display: !fInfo.visible && "none",
    };

    const styleLine = styleList.find((item) => item.fieldInfo === fInfo);

    if (styleLine) {
      style.marginRight = styleLine.marginRight;
      style.marginLeft = styleLine.marginLeft;
      style.marginBottom = styleLine.marginBottom;
      style.marginTop = styleLine.marginTop;
    }

    return (
      <div className="FormInfo__fieldInfo" key={`${fInfo[idColName]}-${index}`} style={style}>
        {elementGetFieldInfo(fInfo)}
      </div>
    );
  }, [fieldInfo.idColName, getComponentTotalWidth, styleList, elementGetFieldInfo]);

  const getHtmlBlockButtons = useCallback((item_definition, root_definition) => {
    if (!root_definition?.buttenList || !Array.isArray(fieldList)) return null;

    const customSetting = item_definition.button_CustomSetting || {};
    const buttonList = root_definition.buttenList.filter(item => {
      if (!item) return false;
      const setting = customSetting[item] || {};
      return !setting.visible || setting.visible === 1;
    });
    const buttonFields = fieldList.filter(fInfo => fInfo && buttonList.includes(fInfo.fieldName));

    if (buttonFields.length === 0) return null;

    const button_ParamList = item_definition.button_ParamList
      ? (item_definition.button_ParamList.formParams ? item_definition.button_ParamList : { "formParams": item_definition.button_ParamList })
      : {};

    return buttonFields.map(fInfo => {
      const setting = customSetting[fInfo.fieldName] || {};
      if (setting.icon) fInfo.button_IconName = setting.icon;
      else if (!fInfo.button_IconName) {
        const fname = fInfo.fieldName.toLowerCase();
        if (fname.includes('setting')) fInfo.button_IconName = 'gear';
        else if (fname.includes('remove')) fInfo.button_IconName = 'dash-square';
        else if (fname.includes('add')) fInfo.button_IconName = 'plus-square';
        else if (fname.includes('save')) fInfo.button_IconName = 'floppy';
      }
      if (fInfo.button_IconName) fInfo.label = "";

      return (
        <DashboardButton
          key={`${dataRef.current.currentComponentTerm}_${fInfo.fieldName}`}
          fieldInfo={fInfo}
          activeComponent={props.activeComponent}
          setActiveComponent={handleChangeComponent}
          setDirtyChildren={handleChangeDirtyChildren}
          extraParams={button_ParamList}
        />
      );
    });
  }, [fieldList, props.activeComponent]);

  const createHtmlBlock = useCallback((item_definition, childElement, root_definition = null) => {
    const baseStyle = {
      padding: item_definition.padding,
      position: "relative",
      display: "flex",
      flexDirection: item_definition.layout === "horizontal" ? "row" : "column",
      borderRadius: item_definition.borderRadius,
      margin: item_definition.margin,
      alignItems: item_definition.alignItems,
      justifyContent: item_definition.justifyContent,
    };
    const isMainDiv = !root_definition;
    const root_BgColor = root_definition?.backgroundColor || null;
    const layoutStyles = {
      horizontal: { height: item_definition.height || "100%", width: item_definition.width || (isMainDiv ? "100vw" : "100%") },
      vertical: { height: item_definition.height || (isMainDiv ? "auto" : "100%"), width: item_definition.width || "100%" },
      single: { backgroundColor: item_definition.backgroundColor || root_BgColor || "whiteSmoke", borderRadius: "8px", margin: "0.25rem", alignItems: "center", justifyContent: "end", width: item_definition.width, height: item_definition.height }
    };
    const style = { ...baseStyle, ...(layoutStyles[item_definition.layout] || {}) };

    if (item_definition.layout === "single" && item_definition.fieldName && highlightedFieldName.includes(item_definition.fieldName)) {
      style.backgroundColor = "#fff1cd";
    }

    if (item_definition.layout === "single") {
      const fInfo = fieldList.find(item => item.fieldName === item_definition.fieldName);
      let singleChildElement = fInfo ? elementGetFormItem(fInfo) : null;

      if (!fInfo && item_definition.fieldName === "iconSite") {
        const iconStyle = { position: "relative", width: "100%", height: "100%", borderRadius: "8px" };
        const imgName = item_definition.imgName || (UiSetting.serverName === "Mapsun" ? "first-page-logo" : "TCILogo");
        const images = {};
        try {
          const req = require.context("./../../content", false, /\.(png|jpg)$/);
          req.keys().forEach(key => { images[key.replace("./", "")] = req(key); });
          let imgSrc = /\.(png|jpg)$/i.test(imgName) ? images[imgName] : (images[imgName + ".png"] || images[imgName + ".jpg"]);
          singleChildElement = <img style={iconStyle} src={imgSrc || ""} alt={imgName || "site icon"} />;
        } catch (e) {
          console.error("Error loading image assets for SectionBlock:", e);
          singleChildElement = <div>Image Error</div>;
        }
      }
      return (
        <SectionBlock style={style} children={singleChildElement} item_definition={item_definition} dashboardButtons={getHtmlBlockButtons(item_definition, root_definition)} fieldInfo={fInfo} />
      );
    }

    return <SectionBlock style={style} children={childElement} item_definition={item_definition} />;
  }, [fieldList, highlightedFieldName, elementGetFormItem, getHtmlBlockButtons]);

  const createHtmlTree = useCallback((pageLayoutSource) => {
    if (!pageLayoutSource || !pageLayoutSource.items) {
      return createHtmlBlock(pageLayoutSource, []);
    }
    const createNestedBlocks = (items) =>
      items.map((item, index) => {
        const children = item.items ? createNestedBlocks(item.items) : [];
        return <React.Fragment key={index}>{createHtmlBlock(item, children, pageLayoutSource)}</React.Fragment>;
      });
    const firstChild = createNestedBlocks(pageLayoutSource.items);
    return createHtmlBlock(pageLayoutSource, firstChild);
  }, [createHtmlBlock]);

  const onDrop = useCallback((acceptedFiles) => {
    handleDrop(acceptedFiles);
  }, [handleDrop]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
  });

  if (hasError) {
    return (
      <div className="Form__container__error">
        <FontAwesome className="Form__container__error__icon" name="exclamation-triangle" />
        <span className="Form__container__error__text">خطایی روی داده است!</span>
        <Button onClick={handleReloadClick} outline className="Form__container__error__button">
          <FontAwesome className="Form__container__error__button__icon" name="sync-alt" />
          بارگذاری مجدد
        </Button>
      </div>
    );
  }

  if (!isReady) {
    return null;
  }

  const formContent = dataRef.current.cardViewDefinition ?
    createHtmlTree(fieldInfo.row_CardView_Definition) :
    fieldList.map(elementGetFormItem);

  const formMenuContent = (
    <div className={["FormInfo__menu", !showFormMenu && "FormInfo__menu--hide"].filter(Boolean).join(" ")}
      style={{ backgroundColor: dataRef.current.formMenu?.formMenu_BackColor }}>
      <div className={"FormInfo__menuIconContainer"}>
        <Button className={"Menu__icon FormInfo__menuIcon"} outline color="light" onClick={() => setShowFormMenu(false)}>
          <FontAwesome className={""} name="times-circle" />
        </Button>
      </div>
      {menuFieldList.map(elementGetFormItem)}
    </div>
  );

  const formElement = (
    <div className={"FormInfo"} key={1}>
      {dataRef.current.formMenu && formMenuContent}
      <div ref={formContainerRef} className={`FormInfo__container ${window.screen.width < 480 ? "mb-5" : ""}`}>
        {formContent}
      </div>
    </div>
  );

  const isUploadContainer = [...fieldList, ...menuFieldList].some((f) => f.button_FileUpload_IsFileUpload);

  const BtnFileUpload = (fieldInfo.fieldInfo_List || []).find((f) => f.fieldName === "btnFileUpload");
  let acceptFile = dataSource?.dataArray[0]?.acceptFileExtension ? dataSource?.dataArray[0]?.acceptFileExtension : "";

  if (BtnFileUpload?.acceptFileExtension_Default && acceptFile === "") {
    acceptFile = BtnFileUpload?.acceptFileExtension_Default;
  }


  if (isUploadContainer) {
    return (
      <div {...getRootProps()} className="file-drop-container">
        <input {...getInputProps()} id={"FormInfo__fileUpload"} style={{ display: 'none' }} accept={acceptFile} />
        {isDragActive ? <p className="file-drop-active-overlay">فایل را اینجا رها کنید...</p> : null}
        {formElement}
      </div>
    );
  } else {
    if (BtnFileUpload) {
      return <>
        {formElement}
        <input type="file" id={"FormInfo__fileUpload"} style={{ display: 'none' }} accept={acceptFile} />
      </>
    }
    return formElement;
  }
});

export default FormInfo;

