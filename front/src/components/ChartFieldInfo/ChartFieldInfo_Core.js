import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import Utils from "../../Utils";
import ButtonActionTypes from "../../class/enums/ButtonActionTypes";
import SystemClass from "../../SystemClass";
import WebService from "../../WebService";
import FieldType from "../../class/enums/FieldType";
import FileUtils from "../../file/FileUtils";

import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import * as am4charts from "@amcharts/amcharts4/charts";
import UiSetting from "../../UiSetting";

am4core.useTheme(am4themes_animated);

class ChartFieldInfo_Core extends TextFieldInfo {
  //------------------------------------------------
  //region component public method
  //------------------------------------------------
  // initialize() {
  //   //for binding
  //   this.state = {
  //     error: "",
  //     value: "",
  //     inputType: "text",
  //     validationEffect: false,
  //   };
  //   this.data = {
  //     isValid: true,
  //     isTouched: false,
  //     isDirty: false,
  //     _validationEffectTimeoutId: "",
  //     node: "",
  //   };
  // }
  // getValue() {
  //   //no value component
  // }
  // /**
  //    press button from js code
  //    */
  // click(actionType, extraParam) {
  //   this._buttonAction(actionType, extraParam);
  //   //this.data.node.firstElementChild.click()
  // }
  // //------------------------------------------------
  // //endregion component public method
  // //------------------------------------------------
  // //------------------------------------------------
  // //region component private method
  // //------------------------------------------------
  // _getComboValue = () => {
  //   const enableIdList = this.fieldInfo.button_SendIdList_ComboName;
  //   if (!enableIdList) {
  //     return;
  //   }
  //   const button_SendIdList_ComboName = this.fieldInfo
  //     .button_SendIdList_ComboName;
  //   const comboFieldInfo = this.getFieldInfo(button_SendIdList_ComboName);
  //   const dataSource = comboFieldInfo.getDataSource();
  //   const idColName = comboFieldInfo.combo_IdColName || dataSource.idColName;
  //   if (!idColName) {
  //     SystemClass.showErrorMsg(
  //       "دیتاسورس " + dataSource.dataSourceName + " فیلد idColName ندارد !! "
  //     );
  //     return;
  //   }
  //   const comboValue = comboFieldInfo.getValue();
  //   const name = comboFieldInfo.label || comboFieldInfo.fieldName;
  //   const canSelectNoItem = this.fieldInfo.button_SendIdList_CanSelectNoItem;
  //   if (!canSelectNoItem && !Utils.isDefine(comboValue)) {
  //     SystemClass.showErrorMsg(
  //       `حداقل باید یک مورد از ${name} را انتخاب نمایید!`
  //     );
  //     return;
  //   }
  //   return { [idColName]: comboValue };
  // };
  // _getIdListValue = (formFieldInfo) => {
  //   const enableIdList = this.fieldInfo.button_SendIdList_GridName;
  //   const formValue = formFieldInfo.getValue();
  //   if (!enableIdList) {
  //     return formValue;
  //   }
  //   //
  //   // if (!this.fieldInfo._grid) {
  //   //     SystemClass.showErrorMsg("باید داخل Gird باشد!")
  //   //     return
  //   // }
  //   const button_SendIdList_GridName = this.fieldInfo
  //     .button_SendIdList_GridName;
  //   const canSelectMultiple = this.fieldInfo
  //     .button_SendIdList_CanSelectMultiple;
  //   const canSelectNoItem = this.fieldInfo.button_SendIdList_CanSelectNoItem;
  //   const gridFieldInfo = this.getFieldInfo(button_SendIdList_GridName);
  //   const gridDataSource = gridFieldInfo.getDataSource();
  //   const gridIdColName = gridDataSource.idColName;
  //   if (!gridIdColName) {
  //     SystemClass.showErrorMsg(
  //       "دیتاسورس " + gridFieldInfo.dataSourceName + " فیلد idColName ندارد !! "
  //     );
  //     return;
  //   }
  //   const selectColumn = gridFieldInfo.columnInfo_List.find(
  //     (info) => info.checkBox_SelectGridRow_OnSelect
  //   );
  //   if (!selectColumn) {
  //     SystemClass.showErrorMsg(
  //       "فیلد انتخابی برای " + button_SendIdList_GridName + " یافت نشد !! "
  //     );
  //     return;
  //   }
  //   const selectName = selectColumn.fieldName;
  //   const gridValueList = formValue[button_SendIdList_GridName];
  //   if (!gridValueList) {
  //     //error grid not exist
  //     SystemClass.showErrorMsg(
  //       "grid with name " + button_SendIdList_GridName + " not Exist!"
  //     );
  //     return;
  //   }
  //   //selected row off grid without check box
  //   //for now only in mobile
  //   const selectedRowList = gridFieldInfo.component.data.selectedDataRow || [];
  //   const selectedGridValued = gridValueList
  //     .filter(
  //       (item) =>
  //         item[selectName] ||
  //         selectedRowList.find(
  //           (row) => item[gridIdColName] == row[gridIdColName]
  //         )
  //     )
  //     .map((item) => item[gridIdColName]);
  //   if (selectedGridValued.length === 0 && !canSelectNoItem) {
  //     SystemClass.showErrorMsg("حداقل باید یک مورد را انتخاب نمایید!");
  //     return;
  //   }
  //   if (selectedGridValued.length > 1 && !canSelectMultiple) {
  //     SystemClass.showErrorMsg("حداکثر یک مورد بیشتر نمی تواند انتخاب شود! ");
  //     return;
  //   }
  //   let fieldValues = {};
  //   if (canSelectMultiple) {
  //     fieldValues[gridIdColName + "_List"] = Utils.toTildaList(
  //       selectedGridValued
  //     );
  //   } else {
  //     fieldValues[gridIdColName] = selectedGridValued[0];
  //   }
  //   fieldValues = Utils.mergeObject(fieldValues, formValue || {});
  //   return fieldValues;
  // };
  // /***
  //  * for perform action of button
  //  * @param actionType action type for switch
  //  * @param addExtraOpenFormParam extra params to open form
  //  */
  // async _buttonAction(actionType, addExtraOpenFormParam) {
  //   //init variables...
  //   const require_FormValidation = this.fieldInfo.button_Require_FormValidation;
  //   const buttonFormId = this.fieldInfo.button_FormCid_ToOpen;
  //   const buttonFormParams = this.fieldInfo.button_ParamList;
  //   const { formId, paramList } = this.fieldInfo._getForm();
  //   const formModel = SystemClass.getFormModel(formId, paramList);
  //   const isFileUpload = this.fieldInfo.button_FileUpload_IsFileUpload;
  //   const button_WebService_Update2 = this.fieldInfo.button_WebService_Update_2;
  //   const formFieldInfo = this.getFormInfo();
  //   //check form validation
  //   //mean check all component in form to be valid
  //   if (require_FormValidation) {
  //     const invalidFields = formFieldInfo.component.getInvalidFields();
  //     if (invalidFields.length !== 0) {
  //       let msg =
  //         UiSetting.GetSetting("language") === "fa"
  //           ? "فرم دارای خطای می باشد. موارد خطا را رفع کنید!"
  //           : "This form has error...";
  //       msg += "\n";
  //       msg +=
  //         UiSetting.GetSetting("language") === "fa"
  //           ? " فیلد مورد نیاز: "
  //           : "This field:";
  //       msg += "\n";
  //       invalidFields.forEach((f) => {
  //         msg += f.label + " (" + f.fieldName + ")";
  //       });
  //       SystemClass.showErrorMsg(msg);
  //       return;
  //     }
  //   }
  //   const button_ConfirmMsg = this.fieldInfo.button_ConfirmMsg;
  //   const button_ConfirmMsg_CanPostpone = this.fieldInfo
  //     .button_ConfirmMsg_CanPostpone;
  //   const button_ConfirmMsg_DoubleConfirm = this.fieldInfo
  //     .button_ConfirmMsg_DoubleConfirm;
  //   if (button_ConfirmMsg) {
  //     if (button_ConfirmMsg_CanPostpone) {
  //     }
  //     const confirm = await SystemClass.showConfirm(
  //       button_ConfirmMsg,
  //       button_ConfirmMsg_CanPostpone,
  //       this.fieldInfo.fieldCid
  //     );
  //     if (!confirm) {
  //       return;
  //     }
  //     if (button_ConfirmMsg_DoubleConfirm) {
  //       const confirm2 = await SystemClass.showConfirm(
  //         button_ConfirmMsg_DoubleConfirm,
  //         button_ConfirmMsg_CanPostpone,
  //         this.fieldInfo.fieldCid
  //       );
  //       if (!confirm2) {
  //         return;
  //       }
  //     }
  //   }
  //   let fieldValues;
  //   switch (actionType || this.fieldInfo.button_ActionType) {
  //     case ButtonActionTypes.CopyToClipBoard:
  //       //if button is in grid then prop _grid point to grid component
  //       if (!this.fieldInfo._grid) {
  //         SystemClass.showErrorMsg("باید داخل Gird باشد!");
  //         return;
  //       }
  //       //if button is in grid then prop _row point to button row in data source of grid
  //       if (!this.fieldInfo._row) {
  //         SystemClass.showErrorMsg("سطر متناظر با دکمه داخل گرید پیدا نشد!");
  //         return;
  //       }
  //       //if button is in grid then prop _row point to button row in data source of grid
  //       if (!this.fieldInfo._row[this.fieldInfo.fieldName]) {
  //         SystemClass.showErrorMsg(
  //           " مقدار دکمه در سطر متناظر با دکمه داخل گرید پیدا نشد! "
  //         );
  //         return;
  //       }
  //       const text = this.fieldInfo._row[this.fieldInfo.fieldName]
  //         .copyToClipBoard_Text;
  //       if (!text) {
  //         return SystemClass.showErrorMsg("متنی برای کپی یافت نشد!");
  //       }
  //       Utils.CopyTextToClipBoard(text);
  //       if (text.length > 20) {
  //         return SystemClass.showMsg(
  //           text.substr(0, 20) + "... به حافظه کپی شد.",
  //           1300
  //         );
  //       }
  //       return SystemClass.showMsg(text + " به حافظه کپی شد.", 1300);
  //     case ButtonActionTypes.PrintByTemplate:
  //       //if button is in grid then prop _grid point to grid component
  //       if (!this.fieldInfo._grid) {
  //         SystemClass.showErrorMsg("باید داخل Gird باشد!");
  //         return;
  //       }
  //       //if button is in grid then prop _row point to button row in data source of grid
  //       if (!this.fieldInfo._row) {
  //         SystemClass.showErrorMsg("سطر متناظر با دکمه داخل گرید پیدا نشد!");
  //         return;
  //       }
  //       // dataSource_Link_FieldName: "documentHyperLink"
  //       // dataSource_FileName_FieldName: "fileName"
  //       // dataSource_FileSize_FieldName: "upload_FileSize"
  //       //
  //       const mrtFileNameForView = this.fieldInfo._row[
  //         this.fieldInfo.dataSource_FileName_FieldName || "fileName"
  //       ];
  //       const mrtFileUrlForView = WebService.getFileUrl(
  //         this.fieldInfo._row[
  //           this.fieldInfo.dataSource_Link_FieldName || "documentHyperLink"
  //         ]
  //       );
  //       //download file with name and url
  //       //must implement separately for web and native
  //       if (!Utils.getFileExtension(mrtFileNameForView).includes("mrt")) {
  //         SystemClass.showErrorMsg(
  //           "فایل گزارش صحیح نمی باشد. (پسوند فایل باید mrt باشد!)"
  //         );
  //         return;
  //       }
  //       SystemClass.showReportViewerDialog(mrtFileUrlForView, formModel);
  //       break;
  //     case ButtonActionTypes.DesignPrintTemplate:
  //       //if button is in grid then prop _grid point to grid component
  //       if (!this.fieldInfo._grid) {
  //         SystemClass.showErrorMsg("باید داخل Gird باشد!");
  //         return;
  //       }
  //       //if button is in grid then prop _row point to button row in data source of grid
  //       if (!this.fieldInfo._row) {
  //         SystemClass.showErrorMsg("سطر متناظر با دکمه داخل گرید پیدا نشد!");
  //         return;
  //       }
  //       // dataSource_Link_FieldName: "documentHyperLink"
  //       // dataSource_FileName_FieldName: "fileName"
  //       // dataSource_FileSize_FieldName: "upload_FileSize"
  //       //
  //       const mrtFileName = this.fieldInfo._row[
  //         this.fieldInfo.dataSource_FileName_FieldName || "fileName"
  //       ];
  //       const mrtFileUrl = WebService.getFileUrl(
  //         this.fieldInfo._row[
  //           this.fieldInfo.dataSource_Link_FieldName || "documentHyperLink"
  //         ]
  //       );
  //       //download file with name and url
  //       //must implement separately for web and native
  //       if (!Utils.getFileExtension(mrtFileName).includes("mrt")) {
  //         SystemClass.showErrorMsg(
  //           "فایل گزارش صحیح نمی باشد. (پسوند فایل باید mrt باشد!)"
  //         );
  //         return;
  //       }
  //       SystemClass.showReportDesignerDialog(mrtFileUrl, formModel);
  //       break;
  //     //image viewer in upload grid form
  //     case ButtonActionTypes.OpenImageViewer:
  //       //if button is in grid then prop _grid point to grid component
  //       if (!this.fieldInfo._grid) {
  //         SystemClass.showErrorMsg("باید داخل Gird باشد!");
  //         return;
  //       }
  //       const imageViewerFieldInfo = formFieldInfo
  //         .getFieldList()
  //         .find((f) => f.fieldType === FieldType.ImageViewer);
  //       if (!imageViewerFieldInfo) {
  //         SystemClass.showErrorMsg("فیلد ImageViewer یافت نشد!");
  //         return;
  //       }
  //       imageViewerFieldInfo.component.open(this.fieldInfo._row);
  //       break;
  //     //image viewer in upload grid form
  //     case ButtonActionTypes.DownloadHyperlink:
  //       //if button is in grid then prop _grid point to grid component
  //       if (!this.fieldInfo._grid) {
  //         SystemClass.showErrorMsg("باید داخل Gird باشد!");
  //         return;
  //       }
  //       //if button is in grid then prop _row point to button row in data source of grid
  //       if (!this.fieldInfo._row) {
  //         SystemClass.showErrorMsg("سطر متناظر با دکمه داخل گرید پیدا نشد!");
  //         return;
  //       }
  //       const fileName = this.fieldInfo._row[
  //         this.fieldInfo.dataSource_FileName_FieldName
  //       ];
  //       const fileUrl = WebService.getFileUrl(
  //         this.fieldInfo._row[this.fieldInfo.dataSource_Link_FieldName]
  //       );
  //       //download file with name and url
  //       //must implement separately for web and native
  //       FileUtils.DownloadFile(fileUrl, fileName);
  //       break;
  //     case ButtonActionTypes.OpenDialog:
  //       //close current dialog
  //       if (this.fieldInfo.button_OpenDialog_CloseCurrentForm) {
  //         SystemClass.cancelDialog(formId, paramList);
  //       }
  //       //refresh form after close next dialog
  //       //callback to pass to dialog to run when closed
  //       let closeDialogCallback = () => {};
  //       if (this.fieldInfo.button_DataSourceName_ToUpdate_After_FormClose) {
  //         //to check after this time call update webservice then update form
  //         const currentDataTime = Utils.getCurrentDataTime();
  //         closeDialogCallback = () => {
  //           //update only if an update call after open form
  //           if (
  //             WebService.logs.find(
  //               (log) =>
  //                 log.name.includes(WebService.URL.webService_Update) &&
  //                 currentDataTime < log.datetime
  //             )
  //           ) {
  //             SystemClass.updateDataSource(
  //               this.fieldInfo.button_DataSourceName_ToUpdate_After_FormClose
  //             );
  //           }
  //         };
  //       }
  //       //need send grid data as param
  //       const enableIdList = this.fieldInfo.button_SendIdList_GridName;
  //       if (enableIdList) {
  //         fieldValues = this._getIdListValue(formFieldInfo);
  //         if (!fieldValues) return;
  //       }
  //       //need send combo data as param
  //       if (this.fieldInfo.button_SendIdList_ComboName) {
  //         const comboParam = this._getComboValue(formFieldInfo);
  //         if (!comboParam) return;
  //         fieldValues = Utils.mergeObject(comboParam, fieldValues || {});
  //       }
  //       //final param from merge buttonFormParams self and values from other components
  //       let openDialogParams = Utils.mergeObject(
  //         { formParams: fieldValues || {} },
  //         buttonFormParams
  //       );
  //       if (addExtraOpenFormParam) {
  //         openDialogParams = Utils.mergeObject(
  //           openDialogParams,
  //           addExtraOpenFormParam
  //         );
  //       }
  //       if (this.fieldInfo.button_OpenDialog_InMainWindow) {
  //         SystemClass.openForm(buttonFormId, openDialogParams);
  //         return;
  //       }
  //       //call webservice to get data and then open dialog
  //       await SystemClass.setLoading(true);
  //       SystemClass.webService_GetForm(
  //         buttonFormId,
  //         openDialogParams,
  //         formModel
  //       )
  //         .then((jsFormFieldInfo) => {
  //           if (!jsFormFieldInfo) return;
  //           SystemClass.openDialog(
  //             buttonFormId,
  //             openDialogParams,
  //             formFieldInfo,
  //             closeDialogCallback
  //           );
  //         })
  //         .finally(() => SystemClass.setLoading(false));
  //       break;
  //     case ButtonActionTypes.CallWebSvcAndCloseDialog:
  //     case ButtonActionTypes.CallWebSvc:
  //       //get value of form to update
  //       fieldValues = this._getIdListValue(formFieldInfo);
  //       if (!fieldValues) {
  //         //Error
  //         return;
  //       }
  //       //get update name
  //       let form_WebService_Update_Root =
  //         formFieldInfo.form_WebService_Update_Root;
  //       //get name from parent of form
  //       let rootFormFieldInfo = formFieldInfo;
  //       while (!form_WebService_Update_Root) {
  //         rootFormFieldInfo = rootFormFieldInfo._parentFieldInfo;
  //         if (!rootFormFieldInfo) {
  //           SystemClass.showErrorMsg(
  //             "مقدار form_WebService_Update_Root پیدا نشد!"
  //           );
  //           return;
  //         }
  //         form_WebService_Update_Root =
  //           rootFormFieldInfo.form_WebService_Update_Root;
  //       }
  //       //upload file section
  //       let thumbnail;
  //       let file;
  //       if (isFileUpload) {
  //         thumbnail = formFieldInfo.component._thumbnail;
  //         file = formFieldInfo.component._file;
  //         const handleGetFile = (files) => {
  //           if (files[0]) {
  //             formFieldInfo.component.selectFile(files[0]);
  //           }
  //         };
  //         //if no file found select file
  //         if (!file) {
  //           SystemClass.showErrorMsg(
  //             UiSetting.GetSetting("language") === "fa"
  //               ? "یک فایل انتخاب کنید"
  //               : "Select a file..."
  //           );
  //           //open get file
  //           FileUtils.GetFile(handleGetFile);
  //           return;
  //         }
  //         //below files must set
  //         const requireFields = [
  //           "subjectId_1",
  //           "fileSize",
  //           "txtFileName",
  //           "documentSubjectMsId",
  //         ];
  //         let emptyKeyList = requireFields.filter(
  //           (key) => fieldValues[key] === "" || fieldValues[key] === null
  //         );
  //         if (emptyKeyList.length !== 0) {
  //           SystemClass.showErrorMsg(
  //             "فیلد " + emptyKeyList.join(",") + " مقدار ندارد!"
  //           );
  //           //open get file
  //           FileUtils.GetFile(handleGetFile);
  //           return;
  //         }
  //       }
  //       //call update form...
  //       //thumbnail set for upload only can be null
  //       await SystemClass.setLoading(true);
  //       SystemClass.webService_UpdateForms(
  //         form_WebService_Update_Root,
  //         formModel,
  //         {
  //           webService_Update: this.fieldInfo.button_WebService_Update,
  //           buttonCid:
  //             this.fieldInfo["fieldCid"] || this.fieldInfo.tblFieldInfoId, //tblFieldInfoId hard code for id
  //           paramList: Utils.mergeObject(
  //             SystemClass.getFormParams(formModel),
  //             buttonFormParams
  //           ),
  //           fieldValues: fieldValues,
  //         },
  //         { binary_1: thumbnail }
  //       )
  //         .then((js) => {
  //           //do
  //           //if was update Successful call button_ActionAfterSuccessfulWsc
  //           if (js.errorCode == 0 && !js.errorMsg) {
  //             this._onActionAfterSuccessfulWsc(js);
  //           }
  //           //if need update file...
  //           if (isFileUpload && button_WebService_Update2 && file) {
  //             const fileName = fieldValues.txtFileName;
  //             const updateRow =
  //               js.webSvcResult_List &&
  //               js.webSvcResult_List[0].updatedItems[0].dataArray.find(
  //                 (row) => row.fileName === fileName
  //               );
  //             if (!updateRow) {
  //               //SystemClass.showErrorMsg("مقدار  documentCid در updateRow پیدا نشد")
  //               return;
  //             }
  //             const documentCid = updateRow.documentCid;
  //             if (!documentCid) {
  //               SystemClass.showErrorMsg("مقدار documentCid پیدا نشد");
  //               return;
  //             }
  //             //upload file ...
  //             //enable progress bar
  //             SystemClass.webService_UpdateForms(
  //               form_WebService_Update_Root,
  //               formModel,
  //               {
  //                 webService_Update: button_WebService_Update2,
  //                 buttonCid:
  //                   this.fieldInfo["fieldCid"] || this.fieldInfo.tblFieldInfoId, //tblFieldInfoId hard code for id
  //                 paramList: Utils.mergeObject(
  //                   SystemClass.getFormParams(formModel),
  //                   buttonFormParams
  //                 ),
  //                 fieldValues: { documentCid },
  //               },
  //               { binary_1: file },
  //               true
  //             ).then((js) => {
  //               formFieldInfo.component._thumbnail = null;
  //               formFieldInfo.component._file = null;
  //               formFieldInfo.component._insertFile();
  //               //ignore
  //             });
  //           }
  //         })
  //         .catch((error) => {})
  //         .finally(() => SystemClass.setLoading(false));
  //       if (
  //         this.fieldInfo.button_ActionType ===
  //         ButtonActionTypes.CallWebSvcAndCloseDialog
  //       )
  //         SystemClass.cancelDialog(formId, paramList);
  //       //first close dialog then call web service
  //       break;
  //     case ButtonActionTypes.CancelDialog:
  //     case ButtonActionTypes.CloseForm:
  //       SystemClass.cancelDialog(formId, paramList);
  //       break;
  //     default:
  //     case ButtonActionTypes.Nothing:
  //     //nothing
  //   }
  // }
  // /***
  //  * for onchange event handle
  //  * @param event
  //  * @param actionType action type for switch
  //  * @param addExtraOpenFormParam extra params to open form
  //  */
  // _handleClick(event, actionType, addExtraOpenFormParam) {
  //   if (event) {
  //     event.stopPropagation();
  //     event.preventDefault();
  //   }
  //   this._buttonAction(actionType, addExtraOpenFormParam);
  // }
  // _onActionAfterSuccessfulWsc = (updateFormsJsonResult) => {
  //   const { formId, paramList } = this.fieldInfo._getForm();
  //   switch (this.fieldInfo.button_ActionAfterSuccessfulWsc) {
  //     case ButtonActionTypes.CancelDialog:
  //     case ButtonActionTypes.CloseForm:
  //       SystemClass.cancelDialog(formId, paramList);
  //       break;
  //     case ButtonActionTypes.CloseFormAndOpenDialog:
  //       SystemClass.cancelDialog(formId, paramList);
  //     //then open
  //     case ButtonActionTypes.OpenDialog:
  //       const addParamFieldName = this.fieldInfo
  //         .button_DataSource_FieldName_ToAdd_InParamList;
  //       let addParam = null;
  //       if (addParamFieldName) {
  //         updateFormsJsonResult.webSvcResult_List.forEach((result) => {
  //           result.updatedItems.forEach((updateItem) => {
  //             updateItem.dataArray.forEach((row) => {
  //               if (
  //                 addParam === null &&
  //                 Utils.isDefine(row[addParamFieldName])
  //               ) {
  //                 addParam = {
  //                   formParams: { [addParamFieldName]: row[addParamFieldName] },
  //                 };
  //               }
  //             });
  //           });
  //         });
  //         if (addParam === null) {
  //           SystemClass.showErrorMsg(
  //             "پارامتر در دیتا سورس خروجی " + addParamFieldName + " یافت نشد ! "
  //           );
  //           return;
  //         }
  //       }
  //       //open dialog with addParam
  //       this._buttonAction(ButtonActionTypes.OpenDialog, addParam);
  //       break;
  //     case ButtonActionTypes.CallWebSvc:
  //       break;
  //     case ButtonActionTypes.CallWebSvcAndCloseDialog:
  //       break;
  //     default:
  //     case ButtonActionTypes.Nothing:
  //     //nothing
  //   }
  // };
  //------------------------------------------------
  //endregion component private method
  //------------------------------------------------
}

export default ChartFieldInfo_Core;
