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
    return { hasError: true };
  }

  // ۱. تغییر در سازنده (Constructor)
  // سازنده حالا بسیار ساده است و فقط state اولیه را تنظیم می‌کند.
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      fieldList: [], // state مربوط به فیلدها به اینجا منتقل شد
      styleList: [],
      showFormMenu: props.fieldInfo.formMenu_Default_IsVisible,
    };

    this.data = {
      components: {},
      currentComponentTerm: 0,
      parameterControl: [],
      parameterControl_IsActive:
        Array.isArray(props.fieldInfo.fieldInfo_List) &&
        props.fieldInfo.fieldInfo_List.some(
          (f) =>
            String(f.fieldType).toUpperCase() ===
            String(FieldType.ParameterControl).toUpperCase()
        ),
      externalData: {},
      cardViewDefinition: props.fieldInfo.row_CardView_Definition !== undefined,
    };

    // dataSource را یکبار اینجا مقداردهی می‌کنیم
    this.dataSource = this._dataGetDataSource();
  }

  // ۲. منطق اصلی به componentDidMount منتقل شد
  // این متد فقط یک بار پس از اینکه کامپوننت برای اولین بار رندر شد، اجرا می‌شود
  componentDidMount() {
    // this.rebind();
  }

  // ۳. اضافه کردن componentDidUpdate برای مدیریت تغییرات props
  // این متد زمانی اجرا می‌شود که props تغییر کند (مثلاً از یک فرم به فرم دیگر بروید)
  componentDidUpdate(prevProps) {
    if (prevProps.fieldInfo !== this.props.fieldInfo) {
      this.dataSource = this._dataGetDataSource();
      // this.rebind();
    }
  }


  // متد initialize حذف شد چون منطق آن در بالا توزیع شد.

  rebind() {
    // دیگر نیازی به مقداردهی اولیه state در اینجا نیست
    this.data.components = {};
    const { fieldList, menuFieldList, styleList } = this._createFieldInfoList();

    this.data.currentComponentTerm++;

    // از setState برای بروزرسانی استفاده می‌کنیم تا ری‌اکت رندر مجدد را مدیریت کند
    // this.setState({
    //   fieldList,
    //   menuFieldList,
    //   styleList,
    //   hasError: false
    // });
  }

  rebindOnlyComponentsThatNotHaveDatasource() {
    this.dataSource = this._dataGetDataSource();

    Object.keys(this.data.components).forEach((componentKey) => {
      const fieldInfo = this.getFieldInfo(componentKey);
      if (
        fieldInfo.fieldType === FieldType.Grid ||
        fieldInfo.fieldType === FieldType.ComboFix ||
        fieldInfo.fieldType === FieldType.ComboOpen
      )
        return;

      this.data.components[componentKey] = null;
    });

    const { fieldList, menuFieldList, styleList } = this._createFieldInfoList();
    this.data.currentComponentTerm++;

    // this.setState({
    //   fieldList,
    //   menuFieldList,
    //   styleList,
    //   hasError: false
    // });
  }

  _createFieldInfoList() {
    const defaultValues = this.dataSource.dataArray[0] || {};
    const formSetting_Json = defaultValues.formSetting_Json;
    const formSetting = formSetting_Json && formSetting_Json[this.fieldInfo.fieldName];

    if (formSetting) {
      Object.assign(this.fieldInfo, formSetting);
    }

    const allFields = this.fieldInfo.fieldInfo_List
      .filter(f => ComponentUtils.getComponentTag(f))
      .map(fieldInfo => {
        // ... (تمام منطق داخل map بدون تغییر باقی می‌ماند)
        const defaultValue = defaultValues[fieldInfo.fieldName];
        fieldInfo.initialValue = fieldInfo.initialValue || defaultValues[fieldInfo.fieldName];
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
          // ... منطق این بخش هم بدون تغییر است ...
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
      });

    const fieldList = allFields
      .filter((fieldInfo) => {
        const menuKeys = Object.keys(fieldInfo).filter((i) => i.includes("_ShowOnFormMenu"));
        return !menuKeys.find((key) => fieldInfo[key]);
      })
      .sort((a, b) => a.tartib - b.tartib);

    const menuFieldList = allFields
      .filter((fieldInfo) => {
        const menuKeys = Object.keys(fieldInfo).filter((i) => i.includes("_ShowOnFormMenu"));
        return menuKeys.find((key) => fieldInfo[key]);
      })
      .sort((a, b) => a.tartib - b.tartib);

    const styleList = [];
    if (!Utils.isMobile()) {
      const fieldInfoTable = [];
      let currentSize = 0;

      fieldList
        .filter((f) => f.visible)
        .forEach((fieldInfo, index, list) => {
          // ... (تمام منطق محاسبه استایل بدون تغییر باقی می‌ماند)
          let size = this._getComponentTotalWidth(fieldInfo);
          if (fieldInfo.align == HorizontalAlign.center) {
            styleList.push({ fieldInfo, marginRight: (100 - size) / 2 + "%", marginLeft: (100 - size) / 2 + "%", marginTop: 0, marginBottom: 0 });
            size = 100;
          }
          let totalSize = currentSize + size;
          const beforeThisItem = list[index - 1];
          if (fieldInfo.align != HorizontalAlign.left && beforeThisItem && beforeThisItem.align == HorizontalAlign.left) {
            totalSize = 101;
          }
          if (fieldInfo.lineBreak_Before || (beforeThisItem && beforeThisItem.lineBreak_After)) {
            totalSize = 101;
            const style = styleList.find((s) => s.fieldInfo == beforeThisItem);
            if (style) {
              style.marginLeft = "100%";
            } else {
              styleList.push({ beforeThisItem, marginRight: 0, marginLeft: "100%", marginTop: 0, marginBottom: 0, });
            }
          }
          if (totalSize > 100) {
            fieldInfoTable.push([fieldInfo]);
            currentSize = size;
          } else {
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
        styleList.push({ fieldInfo: leftField, marginRight: 100 - lineSize + "%", marginLeft: 0, marginTop: 0, marginBottom: 0, });
      });
    }

    this.data.formMenu = this.fieldInfo.fieldInfo_List.find(fi => fi.fieldType == FieldType.FormMenu);

    return { fieldList, menuFieldList, styleList };
  }

  showMenu(show) {
    if (show === this.state.showFormMenu) return;
    // this.setState({ showFormMenu: show });
  }

  getValue() {
    // ... (این متد بدون تغییر باقی می‌ماند)
    const temp = {};
    let noValue_FieldTypeList = [FieldType.Button, FieldType.Chart, FieldType.DataSource, FieldType.Form, FieldType.FormMenu, FieldType.Image, FieldType.ImageViewer, FieldType.Label, FieldType.Map, FieldType.ProgressBar, FieldType.WebService_Update,];

    this.state.fieldList
      .filter((fieldInfo) => true)
      .forEach((fieldInfo) => {
        if (!noValue_FieldTypeList.includes(fieldInfo.fieldType))
          temp[fieldInfo.fieldName] = fieldInfo.getValue();

        if (fieldInfo.fieldType == FieldType.Combo || fieldInfo.fieldType == FieldType.ComboFix || fieldInfo.fieldType == FieldType.ComboOpen || fieldInfo.fieldType == FieldType.ComboSearch) {
          if (fieldInfo.combo_SelectedValueColName) {
            temp[fieldInfo.fieldName + "_SelectedValue"] = fieldInfo.component.getSelectedValue();
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

  // ... (سایر متدها مانند getHasBtnFileUpload, rebindDataSource و ... بدون تغییر باقی می‌مانند)
  // فقط getFieldList و getMenuFieldInfoList باید از state بخوانند

  getFieldList() {
    return this.state.fieldList || [];
  }

  _getMenuFieldInfoList() {
    return this.state.menuFieldList || [];
  }

  // ... بقیه متدهای فایل را بدون تغییر کپی کنید ...
  getHasBtnFileUpload() {
    return this.fieldInfo.fieldInfo_List.some(
      (field) => field.fieldName === "btnFileUpload"
    );
  }

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
        // this.rebind();
      })
      .catch((error) => { })
      .finally(() => {
        SystemClass.setLoading(false);
      });
  }

  isValid() {
    const invalid = this.state.fieldList.find(
      (fieldInfo) => !fieldInfo.isValid()
    );
    return !invalid;
  }

  getInvalidFields() {
    return this.state.fieldList.filter(
      (fieldInfo) => fieldInfo.visible && !fieldInfo.isValid()
    );
  }

  getFieldInfo(fieldName) {
    return this.getFieldList().find(
      (fieldInfo) => fieldInfo.fieldName == fieldName
    );
  }

  getFieldInfoByDSName(dataSourceName) {
    return this.getFieldList().find(
      (fieldInfo) => fieldInfo.dataSourceName == dataSourceName
    );
  }

  setExternalData(externalData) {
    this.data.externalData = externalData;
  }

  async selectFile(file) {
    if (!file) {
      SystemClass.showErrorMsg("فایلی یافت نشد !");
      return;
    }
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
    this._insertFile(file);
  }

  _insertFile(file) {
    const fileSize = this.getFieldInfo("fileSize");
    const fileName = this.getFieldInfo("txtFileName");

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
    if (!file) return;

    const buttonFileUpload = this.state.fieldList.find(
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
    const fieldList = this.state.fieldList || [];
    const menuFieldList = this.state.menuFieldList || [];
    return (
      fieldList.find((f) => f.button_FileUpload_IsFileUpload) ||
      menuFieldList.find((f) => f.button_FileUpload_IsFileUpload)
    );
  }

  _getComponentTotalWidth(fieldInfo) {
    const menuKeys = Object.keys(fieldInfo).filter((i) =>
      i.includes("_ShowOnFormMenu")
    );
    const onMenu = menuKeys.find((key) => fieldInfo[key]);

    if (onMenu) return "";

    if (fieldInfo.width_Total) return Math.min(fieldInfo.width_Total, 100);

    if (
      fieldInfo.fieldType == FieldType.Grid ||
      fieldInfo.fieldType == FieldType.Chart ||
      fieldInfo.fieldType == FieldType.Map
    ) {
      return 100;
    }

    return 50;
  }

  componentDidCatch(error, errorInfo) {
    // console.log(error, errorInfo)
  }
}

export default FormInfo_Core;