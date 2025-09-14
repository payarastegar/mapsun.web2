import ComponentUtils from "../ComponentUtils";
import LabelFieldInfo from "../LabelFieldInfo/LabelFieldInfo";
import FieldInfo from "../../class/FieldInfo";
import SystemClass from "../../SystemClass";
import FieldType from "../../class/enums/FieldType";
import Utils from "../../Utils";
import HorizontalAlign from "../../class/enums/HorizontalAlign";
import FileCompressor from "../../file/FileCompressor";
import { v4 as uuidv4 } from "uuid";

class FormInfo_Core extends LabelFieldInfo {
  //for upload
  _thumbnail;
  _file;

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    // console.log(error)
    return { hasError: true };
  }

  //------------------------------------------------
  //region public methods
  //------------------------------------------------

  initialize() {
    const parameterControl_IsActive =
      Array.isArray(this.fieldInfo.fieldInfo_List) &&
      this.fieldInfo.fieldInfo_List.some(
        (f) =>
          String(f.fieldType).toUpperCase() ===
          String(FieldType.ParameterControl).toUpperCase()
      );

    this.state = { hasError: true };
    this.data = {
      fieldList: [],
      components: {},
      styleList: [],
      currentComponentTerm: 0, //for re create components

      parameterControl: [],
      parameterControl_IsActive, 

      menuFieldList: [],
      menuForm: {},
      showFormMenu: this.fieldInfo.formMenu_Default_IsVisible,
      externalData: {}, //for fintrac transaction components by Mohammadreza Rastegar
      cardViewDefinition:
        this.fieldInfo.row_CardView_Definition == undefined ? false : true,
    };

    this.rebind(true);
  }

  /**
   * rebind form info
   * recreate components and datasource binding
   */
  rebind(notUpdate) {
    this.dataSource = this._dataGetDataSource();

    //clear old data to replace with new
    this.data.components = {};

    this._createFieldInfoList();

    this.state.hasError = false;
    this.data.currentComponentTerm++; //increase current to re create components

    this.updateUI();

    !notUpdate && this.forceUpdate();
  }

  rebindOnlyComponentsThatNotHaveDatasource() {
    this.dataSource = this._dataGetDataSource();

    //clear old data to replace with new
    // this.data.components = {}

    Object.keys(this.data.components).forEach((componentKey) => {
      const fieldInfo = this.getFieldInfo(componentKey);
      if (
        fieldInfo.fieldType == FieldType.Grid ||
        fieldInfo.fieldType == FieldType.ComboFix ||
        fieldInfo.fieldType == FieldType.ComboOpen
      )
        return;

      this.data.components[componentKey] = null;
    });

    this._createFieldInfoList();

    this.state.hasError = false;
    this.data.currentComponentTerm++; //increase current to re create components

    this.forceUpdate();
  }

  /**
   * create form components form info
   * create menu
   * calculate component styles
   */
  _createFieldInfoList() {
    const defaultValues = this.dataSource.dataArray[0] || {};

    this.data.formMenu = this.fieldInfo.fieldInfo_List.find(
      (fieldInfo) => fieldInfo.fieldType == FieldType.FormMenu
    );

    const formSetting_Json = defaultValues.formSetting_Json;

    //set form setting from formSetting_Json
    const formSetting =
      formSetting_Json && formSetting_Json[this.fieldInfo.fieldName];
    if (formSetting) {
      Object.assign(this.fieldInfo, formSetting);
    }

    //create field info
    this.data.fieldList = this.fieldInfo.fieldInfo_List
      .filter((f) => ComponentUtils.getComponentTag(f))
      .filter((fieldInfo) => {
        const menuKeys = Object.keys(fieldInfo).filter((i) =>
          i.includes("_ShowOnFormMenu")
        );
        return !menuKeys.find((key) => fieldInfo[key]);
      })
      .map((fieldInfo) => {
        const defaultValue = defaultValues[fieldInfo.fieldName];
        fieldInfo.initialValue =
          fieldInfo.initialValue || defaultValues[fieldInfo.fieldName];
        if (Utils.isObjectAndNotEmpty(defaultValue)) {
          fieldInfo = Utils.mergeObject(fieldInfo, defaultValue);
        }

        Object.keys(defaultValues)
          .filter((key) => key.startsWith(fieldInfo.fieldName + "_"))
          .forEach((fieldInfoKey) => {
            let key = fieldInfoKey.replace(fieldInfo.fieldName + "_", "");
            key = key[0].toLowerCase() + key.substring(1);
            fieldInfo[key] = defaultValues[fieldInfoKey];
          });

        if (formSetting_Json && formSetting_Json[fieldInfo.fieldName]) {
          const newInfo = formSetting_Json[fieldInfo.fieldName];
          if (Utils.isObject(newInfo) && fieldInfo.columnInfo_List) {
            Object.keys(newInfo).forEach((columnInfoName) => {
              if (
                typeof formSetting_Json[fieldInfo.fieldName][columnInfoName] ===
                "object"
              ) {
                if (fieldInfo.grid_IsGallery) {
                  fieldInfo = Utils.mergeObject(
                    fieldInfo,
                    formSetting_Json[fieldInfo.fieldName]
                  );
                }

                const columnInfo = fieldInfo.columnInfo_List.find(
                  (c) => c.fieldName == columnInfoName
                );

                if (columnInfo)
                  Object.assign(columnInfo, newInfo[columnInfoName]);
              } else {
                // const columnInfo = fieldInfo.find(c => c.fieldName == columnInfoName)
                // Object.assign(columnInfo, newInfo[columnInfoName])
                fieldInfo = Utils.mergeObject(fieldInfo, newInfo);
              }
            });
          } else {
            fieldInfo = Utils.mergeObject(fieldInfo, newInfo);
          }
        }

        fieldInfo = new FieldInfo(fieldInfo);
        fieldInfo._parentFieldInfo = this.fieldInfo;
        return fieldInfo;
      })
      .sort((itemA, itemB) => {
        return itemA.tartib > itemB.tartib
          ? 1
          : itemA.tartib < itemB.tartib
          ? -1
          : 0;
      });

    // برای منو
    this.data.menuFieldList = this.fieldInfo.fieldInfo_List
      .filter((fieldInfo) => {
        const menuKeys = Object.keys(fieldInfo).filter((i) =>
          i.includes("_ShowOnFormMenu")
        );
        return menuKeys.find((key) => fieldInfo[key]);
      })
      .sort((itemA, itemB) => {
        return itemA.tartib > itemB.tartib
          ? 1
          : itemA.tartib < itemB.tartib
          ? -1
          : 0;
      })
      .map((fieldInfo) => {
        const defaultValue = defaultValues[fieldInfo.fieldName];
        fieldInfo.initialValue = fieldInfo.initialValue || defaultValue;
        if (Utils.isObjectAndNotEmpty(defaultValue)) {
          fieldInfo = Utils.mergeObject(fieldInfo, defaultValue);
        }
        fieldInfo = new FieldInfo(fieldInfo);
        fieldInfo._parentFieldInfo = this.fieldInfo;
        if (
          fieldInfo !== undefined &&
          formSetting_Json !== undefined &&
          formSetting_Json.hasOwnProperty(fieldInfo.fieldName)
        ) {
          if (
            formSetting_Json[fieldInfo.fieldName].hasOwnProperty(
              "button_ActionAfterSuccessfulWsc"
            )
          )
            fieldInfo.button_ActionAfterSuccessfulWsc =
              formSetting_Json[
                fieldInfo.fieldName
              ].button_ActionAfterSuccessfulWsc;
          if (formSetting_Json[fieldInfo.fieldName].hasOwnProperty("visible"))
            fieldInfo.visible = formSetting_Json[fieldInfo.fieldName].visible;
        }
        return fieldInfo;
      });

    //style not need for mobile
    //check mobile size screen
    if (Utils.isMobile()) return;

    //create table for fields
    const fieldInfoTable = [];
    let currentSize = 0;
    const styleList = [];

    //lineBreak_Before
    //lineBreak_After

    this.data.fieldList
      .filter((f) => f.visible)
      .forEach((fieldInfo, index, list) => {
        let size = this._getComponentTotalWidth(fieldInfo);
        if (fieldInfo.align == HorizontalAlign.center) {
          styleList.push({
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

          const style = styleList.find((s) => s.fieldInfo == beforeThisItem);
          if (style) {
            style.marginLeft = "100%";
          } else {
            styleList.push({
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
      line.forEach((f) => (lineSize += this._getComponentTotalWidth(f)));
      if (lineSize == 100) return;

      styleList.push({
        fieldInfo: leftField,

        marginRight: 100 - lineSize + "%",
        marginLeft: 0,
        marginTop: 0,
        marginBottom: 0,
      });
    });

    this.data.styleList = styleList;

    // console.table(fieldInfoTable)
    // console.table(styleList)
  }

  /**
   * show menu of form
   */
  showMenu(show) {
    if (show == this.data.showFormMenu) {
      return;
    }
    this.data.showFormMenu = show;
    this.forceUpdate();
  }

  /**
   * get value of all component in form
   */
  getValue() {
    const temp = {};
    let noValue_FieldTypeList = [
      FieldType.Button,
      FieldType.Chart,
      FieldType.DataSource,
      FieldType.Form,
      FieldType.FormMenu,
      FieldType.Image,
      FieldType.ImageViewer,
      FieldType.Label,
      FieldType.Map,
      FieldType.ProgressBar,
      FieldType.WebService_Update,
    ];
    // Pervious value before true was fieldInfo.sendToServer changed by Majid Koohjani.

    this.data.fieldList
      .filter((fieldInfo) => true)
      .forEach((fieldInfo) => {
        if (!noValue_FieldTypeList.includes(fieldInfo.fieldType))
          temp[fieldInfo.fieldName] = fieldInfo.getValue();

        //only for combo
        if (
          fieldInfo.fieldType == FieldType.Combo ||
          fieldInfo.fieldType == FieldType.ComboFix ||
          fieldInfo.fieldType == FieldType.ComboOpen ||
          fieldInfo.fieldType == FieldType.ComboSearch
        ) {
          //add selected Value if exist
          if (fieldInfo.combo_SelectedValueColName) {
            temp[
              fieldInfo.fieldName + "_SelectedValue"
            ] = fieldInfo.component.getSelectedValue();
          }
        }
      });

    this.fieldInfo.fieldInfo_List.forEach((jsFieldInfo) => {
      if (
        temp[jsFieldInfo.fieldName] === undefined &&
        !noValue_FieldTypeList.includes(jsFieldInfo.fieldType)
      ) {
        temp[jsFieldInfo.fieldName] = jsFieldInfo.initialValue;
      }
    });

    return temp;
  }

  getHasBtnFileUpload() {
    return this.fieldInfo.fieldInfo_List.some(
      (field) => field.fieldName === "btnFileUpload"
    );
  }

  /**
   * re get form and re create form
   * when update datasource must get again
   */
  async rebindDataSource() {
    const formModel = SystemClass.getFormModel(
      this.fieldInfo._formId,
      this.fieldInfo._paramList
    );
    await SystemClass.setLoading(true);

    return SystemClass.webService_GetForm(
      this.fieldInfo._formId,
      this.fieldInfo._paramList,
      formModel
    )
      .then((formModel) => {
        if (!formModel) return;
        const newFieldInfo = SystemClass.createFormInfo(
          null,
          formModel,
          this.fieldInfo._formId,
          this.fieldInfo._paramList
        );
        formModel.formFieldInfo = this.fieldInfo = Object.assign(
          this.fieldInfo,
          newFieldInfo
        );
        this.rebind();
        this.update();
        this.forceUpdate();
      })
      .catch((error) => {})
      .finally(() => {
        SystemClass.setLoading(false);
      });
  }

  isValid() {
    const invalid = this.data.fieldList.find(
      (fieldInfo) => !fieldInfo.isValid()
    );
    return !invalid;
  }

  getInvalidFields() {
    return this.data.fieldList.filter(
      (fieldInfo) => fieldInfo.visible && !fieldInfo.isValid()
    );
  }

  /**
   * return all fieldInfo in form
   */
  getFieldList() {
    return this.data.fieldList;
  }

  /**
   * find fieldInfo by fieldName
   */
  getFieldInfo(fieldName) {
    return this.getFieldList().find(
      (fieldInfo) => fieldInfo.fieldName == fieldName
    );
  }

  /**
   * find fieldInfo by dataSource name
   */
  getFieldInfoByDSName(dataSourceName) {
    return this.getFieldList().find(
      (fieldInfo) => fieldInfo.dataSourceName == dataSourceName
    );
  }

  // Function created for getting external data from fintrac components
  // By Mohammadreza Rastegar
  setExternalData(externalData) {
    this.data.externalData = externalData;
  }
  /**
   * methods call when file added to form
   * from drag or select
   */
  async selectFile(file) {
    if (!file) {
      SystemClass.showErrorMsg("فایلی یافت نشد !");
      return;
    }
    // this.file = file

    console.log(file);

    if (file.type !== "image/tiff") {
      const thumbnail = await FileCompressor.CreateThumbnail(file);
      this._thumbnail = thumbnail;

      const compressFile = await FileCompressor.CompressFile(file);
      this._file = compressFile;
    } else {
      this._thumbnail = file;
      this._file = file;
    }

    //handle inserted file
    this._insertFile(file);
  }

  /**
   * set information of file in form
   * call update button
   */
  _insertFile(file) {
    const fileSize = this.data.fieldList.find(
      (f) => f.fieldName === "fileSize"
    );
    const fileName = this.data.fieldList.find(
      (f) => f.fieldName === "txtFileName"
    );
    // const fileNameAndPath = this.data.fieldList.find(f => f.fieldName === "fileNameAndPath")

    if (!fileSize || !fileName) {
      SystemClass.showErrorMsg("فیلد های file Name Size  یافت نشد!");
      return;
    }

    const uploadFile = file || {};

    const alternateFileName = new Date();

    if (
      (uploadFile.type === "image/jpeg" || uploadFile.type === "image/jpg") &&
      (uploadFile.name.toLowerCase() === "image.jpeg" ||
        uploadFile.name.toLowerCase() === "image.jpg")
    ) {
      fileName.changeValue(alternateFileName + ".jpeg");
    } else {
      fileName.changeValue(uploadFile.name || "");
    }

    fileSize.changeValue(uploadFile.size || "");
    // fileNameAndPath.changeValue(file.name)

    if (!file) return;

    const buttonFileUpload = this.data.fieldList.find(
      (f) => f.button_FileUpload_IsFileUpload
    );
    buttonFileUpload.component.click();
  }

  _handleReloadClick = (event) => {
    this.rebindDataSource();
  };

  _handleOnCloseMenuClick = () => {
    this.showMenu(false);
  };

  _handleDrop = async (files, event) => {
    event.preventDefault();
    event.stopPropagation();

    const file = files[0];
    this.selectFile(file);
  };

  _isUploadContainer() {
    return (
      this.data.fieldList.find((f) => f.button_FileUpload_IsFileUpload) ||
      this.data.menuFieldList.find((f) => f.button_FileUpload_IsFileUpload)
    );
  }

  _getMenuFieldInfoList() {
    return this.data.menuFieldList;
  }

  //------------------------------------------------
  //endregion public methods
  //------------------------------------------------

  //------------------------------------------------
  //region component error handling
  //------------------------------------------------

  /**
   * width of fieldInfo in Form (for create it)
   */

  _getComponentTotalWidth(fieldInfo) {
    const menuKeys = Object.keys(fieldInfo).filter((i) =>
      i.includes("_ShowOnFormMenu")
    );
    const onMenu = menuKeys.find((key) => fieldInfo[key]);

    if (onMenu) return "";

    // if (!onMenu && Utils.isMobile()) return 100;

    if (fieldInfo.width_Total) return Math.min(fieldInfo.width_Total, 100);

    if (
      fieldInfo.fieldType == FieldType.Grid ||
      fieldInfo.fieldType == FieldType.Chart ||
      fieldInfo.fieldType == FieldType.Map
    ) {
      return 100;
    }

    // if (fieldInfo.fieldType == FieldType.Button) {
    //     return 20
    // }
    //
    // if (fieldInfo.fieldType == FieldType.CheckBox) {
    //     return 20
    // }

    return 50;
  }

  componentDidCatch(error, errorInfo) {
    // console.log(error, errorInfo)
  }

  //------------------------------------------------
  //endregion component error handling
  //------------------------------------------------
}

export default FormInfo_Core;
