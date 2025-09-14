import Class_Base from "./Class_Base";
import SystemClass from "../SystemClass";

/** FieldInfo Class */
class FieldInfo extends Class_Base {
  constructor(jsFieldInfo) {
    super(jsFieldInfo);
    this._initPropertyGetter(jsFieldInfo);
    this._load();

    //TODO check later
    //error formInfo
    // const Type = ComponentUtils.getComponentTag(this.fieldType)
    // this.component = new Type({fieldInfo: this})
  }

  //------------------------------------------------
  //region private properties
  //------------------------------------------------

  //set from grid
  _grid;
  _row;
  _value;

  _parentFieldInfo;
  _formId;
  _paramList;

  //custom error
  _error;

  //------------------------------------------------
  //endregion private properties
  //------------------------------------------------

  //------------------------------------------------
  //region public properties
  //------------------------------------------------

  combo_SelectedValueColName;

  fontColor;

  onChange_SelectGridRow;
  menuItem_OpenDialog;
  menuItem_ShowOnUserMenu;

  fieldCid;
  button_ConfirmMsg;
  button_ConfirmMsg_CanPostpone;
  button_ConfirmMsg_DoubleConfirm;

  // combo leveling in for now mobile

  combo_Leveling_Parent_DefaultValue;
  combo_Leveling_Parent_ColName;
  combo_Leveling_TextColName;
  combo_Leveling_IsLeveled;

  text_RegExp_Error;

  button_DataSource_FieldName_ToAdd_InParamList;

  //------------------------------------------------
  //cardView
  row_CardView_Definition;
  //------------------------------------------------

  gridColumn_HideTitle;

  defaultWidthInPixel;

  //date
  date_IsGregorian;
  date_EnableTimePick;
  date_IsPersianDate;

  button_FormCid_ToOpen;
  button_ParamList;
  button_OpenDialog_CloseCurrentForm;
  button_DataSourceName_ToUpdate_After_FormClose;
  form_WebService_Update_Root;
  tblFieldInfoId; //tblFieldInfoId hard code for id

  tartib2_FieldName;
  tartib2_IsSortedByText;
  tartib2_IsDescending;

  checkBox_HideToggleControl;
  button_ShowNumber_FieldName;

  row_BackColor_0;
  row_BackColor_1;
  row_BackColor_2;
  row_BackColor_3;
  row_BackColor_FieldName;

  button_OpenDialog_InMainWindow;

  dataSource_Icon_FieldName;
  dataSource_TarikheEijad_FieldName;

  dataSource_BtnDownload_FieldName;
  dataSource_BtnDelete_FieldName;

  dataSource_btnDownload_FieldName;
  dataSource_btnDelete_FieldName;
  // TODO
  dataSource_documentHyperlink_FieldName;
  dataSource_DocumentHyperLink_FieldName;

  imageViewer_Grid_FieldName;

  button_SendIdList_ComboName;
  dataSource_OnClick_Button_FieldName;

  dataSource_FileName_FieldName;
  dataSource_FileSize_FieldName;
  dataSource_Link_FieldName;

  mobileGrid_ProgressBar_Color_1;
  mobileGrid_ProgressBar_Color_2;
  mobileGrid_ProgressBar_Color_3;
  mobileGrid_ProgressBar_FieldName_1;
  mobileGrid_ProgressBar_FieldName_2;
  mobileGrid_ProgressBar_ShowProgressBar;
  mobileGrid_ProgressBar_Visible_FieldName;

  image_MaxWidth;
  image_MaxHeight;

  button_FileUpload_IsFileUpload;
  button_WebService_Update_2;

  combo_Parent_Value_GetFromThis_FieldName;

  onChange_Callee_1;
  onChange_Callee_2;
  onChange_Callee_3;

  text_MultiLine_IsMultiLine;
  text_MultiLine_NumberOfLines;

  showLabelOnTop;
  showLabelAfter_OnBottom;

  number_Slider_ShowSlider;
  number_Slider_Steps_ShowSteps;
  number_Slider_Steps_ShowStepLabels;
  number_Slider_ShowLabels;
  number_Slider_Steps_Number;

  label_HideLabel;
  checkBox_SelectGridRow_OnSelect;

  button_Require_FormValidation;
  button_SendIdList_CanSelectMultiple;
  button_SendIdList_CanSelectNoItem;
  button_SendIdList_GridName;

  date_IsShamsi;
  date_ShowTime;

  checkBox_ShowFormMenu_OnSelect;

  formMenu_BackColor;
  formMenu_Default_IsVisible;

  canEdit = true;
  sendToServer = false;

  idColName;
  /** @type {(LabelFieldInfo)} */

  component;

  /** @type {(string)} */
  placeholder;
  /** @type {(string)} */
  tooltip;
  /** @type {(boolean)} */
  allowFixValidation = true;
  /** @type {(boolean)} */
  require = false;
  visible = true;

  /** @type {(FieldType)} */
  fieldType;
  fieldName = "";
  isValid_ErrorMsg;

  /** @type {string}  */
  iconName;
  /** @type {string}  */
  dataSourceName = "dsMoshakhasat";
  idValue;
  label;
  label_After;
  onChange_Callees;
  /** @type {(LabelPosition)} */
  labelPosition;
  value;
  initialValue;
  className_Label;
  className_Field;
  width_Total;
  width_Slice1 = "";
  width_Slice2 = "";
  width_Slice3 = "";
  /** @type {(HorizontalAlign)} */
  align = "Right";
  image_Url;
  /** @type {(FormInfo)} */
  container_Form;
  /** @type {(FormInfo)} */
  container_ParentForm;
  /** @type {(Element)} */
  container_Div;

  // region grid
  /** @type {array<ColumnInfo>} */
  columnInfo_List;
  tartib_FieldName;
  tartib_IsSortedByText = true;
  tartib_IsDescending;
  paging_IsPaged;
  paging_pageSize;
  filter_IsFiltered;
  filter_FieldName;
  filter_FieldName_IsNumber;
  filter_FieldName_IsDate;
  filter_FieldName_IsBoolean;
  filter_Value;
  /** @type {FilterCondition} */
  filter_Condition = "contains";
  leveling_IsLeveled;
  leveling_LevelNumberFieldName;
  leveling_ApplyToField;
  leveling_PercentIndentedForEachLevel;
  /** @type { array<string>} */
  leveling_ClassName_Array = [];

  grouping_IsGrouped;
  grouping_PercentIndentedForEachLevel;
  grouping_GroupInfo_Array;
  grouping_IconName_Collapsed = "caret-down";
  grouping_IconName_Expanded = "caret-left";

  grouping_StartFieldName;
  grouping_FieldName_1;
  grouping_FieldName_2;
  grouping_FieldName_3;
  grouping_FieldName_4;

  header_ClassName;
  row_ClassName_Default;
  row_ClassName_Odd;
  row_ClassName_Even;
  row_ClassName_FieldName;
  // endregion

  //region components fields
  fieldInfo_List;

  number_MinValue;
  number_MaxValue;
  /** @type {boolean} */
  number_FloatAllowed;
  number_FloatMaxPrecision;
  /** @type {boolean} */
  number_CommaGozari;
  number_MaxDigit;
  number_MinDigit;

  text_MinLength;
  text_MaxLength;
  text_AllowedChars;
  text_notAllowedChars;
  text_RegExp;
  /** @type {array} */
  combo_ValueList;
  combo_IdColName;
  combo_IsOpenCombo;
  combo_TextColName;
  combo_DataSourceName;
  /** @type {boolean} */
  combo_AutoComplete;
  /** @type {boolean} */
  combo_MultipleSelect;
  combo_WebSvcAddr;

  combo_Parent_FieldName;
  combo_Parent_ColName;
  combo_Parent_Value;

  checkBox_TrueText;
  checkBox_TrueColor = "#007bff";
  checkBox_FalseText;
  checkBox_FalseColor = "#dc3545";
  checkBox_SwitchMode = false;

  button_IsImageButton;
  button_WebSvcAddr;
  /** @type {ButtonActionTypes} */
  button_ActionType;
  button_ActionAfterSuccesfulWsc;
  /** @type {UpdateWhichForm} */
  button_UpdateWhichForm;
  button_FormName_ToOpen;
  button_FormName_ToClose;
  button_WebService_Update;

  button_DataSourceId_ToUpdate;
  button_IconName;
  button_ImageName;
  button_ShowText;
  button_ActionAfterSuccessfulWsc;
  button_ShowOnFormMenu;
  //endregion components fields

  //------------------------------------------------
  //endregion public properties
  //------------------------------------------------

  //------------------------------------------------
  //region methods
  //------------------------------------------------

  update() {
    this._load();
    //TODO isMounted not need now

    if (this.component) {
      try {
        this.component.update();
      } catch (e) {}

      this.component.forceUpdate();
    }
  }

  _getForm() {
    let formId = this._formId;
    let paramList = this._paramList;

    let fieldInfo = this;

    let getForm = () => {
      if (formId) return;
      fieldInfo = fieldInfo._parentFieldInfo;
      formId = fieldInfo._formId;
      paramList = fieldInfo._paramList;
      getForm();
    };

    getForm();

    return { formId, paramList };
  }

  // constructor(in systemObject, in jsFieldInfo, in divContainer : Element, in formInfo : FormInfo, in idValue, in dataSourceName)
  isValid() {
    return this.component.isValid();
  }

  asInt() {
    return this.component.asInt();
  }

  asFloat() {
    return this.component.asFloat();
  }

  asText() {
    return this.component.asText();
  }

  asDate() {
    return this.component.asDate();
  }

  getValue() {
    return this.component ? this.component.getValue() : this.initialValue;
  }

  rebind() {
    return this.component.rebind();
  }

  rebindCombo() {
    return this.component.rebindCombo();
  }

  rebindField() {
    return this.component.rebindField();
  }

  rebindGrid() {
    return this.component.rebindGrid();
  }

  /** @param {number} newParentId */
  changeParent_Combo(newParentId) {
    return this.component.changeParent_Combo(newParentId);
  }

  onSearchClick() {
    return this.component.onSearchClick();
  }

  /** @param {function} callee */
  addOnChange_Callee(callee) {
    return this.component.addOnChange_Callee(callee);
  }

  /** @param  newValue */
  changeValue(newValue) {
    //TODO check component
    return this.component.changeValue(newValue);
  }

  /** @return  array[NameValueObject] */
  getFieldValues() {
    return this.component.getFieldValues();
  }

  button_CallWebSvc_AndRefreshForm() {
    return this.component.button_CallWebSvc_AndRefreshForm();
  }

  button_OpenDialog_AndInitF() {
    return this.component.button_OpenDialog_AndInitF();
  }

  getDataSource(dataSourceName) {
    const { formId, paramList } = this._getForm();
    const ds = SystemClass.getDataSource(
      dataSourceName || this.dataSourceName,
      formId,
      paramList
    );
    if (!ds) {
      const dataSourceNameText = dataSourceName || this.dataSourceName
      SystemClass.showErrorMsg("دیتاسورس " + dataSourceNameText + " یافت نشد !!! ");
      throw "Data Source Not Found !!!";
    }
    return ds;
  }

  getFieldInfo(name) {
    console.log(name)
    return this.component.getFieldInfo(name);
  }

  getFieldList(name) {
    return this.component.getFieldList(name);
  }

  getFieldInfoByDSName(name) {
    return this.component.getFieldInfoByDSName(name);
  }

  /** react component method*/
  componentWillUnmount() {
    return this.component.componentWillUnmount();
  }

  _rebindFromParent() {
    return this.component._rebindFromParent();
  }

  rebindDataSource() {
    return this.component.rebindDataSource();
  }

  click(actionType, extraParam) {
    return this.component.click(actionType, extraParam);
  }

  static create(parentFieldInfo, jsFieldInfo, formId, paramList) {
    const f = new FieldInfo(jsFieldInfo);
    f._parentFieldInfo = parentFieldInfo;
    f._formId = formId;
    f._paramList = paramList;
    return f;
  }

  //------------------------------------------------
  //endregion methods
  //------------------------------------------------
}

export default FieldInfo;
