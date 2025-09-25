import WebService from "./WebService";
import FieldType from "./class/enums/FieldType";
import FieldInfo from "./class/FieldInfo";
import Utils from "./Utils";
import SystemClass from "./SystemClass";
import moment from "moment-jalaali";

class SystemClass_Core {
  static SystemConfig = {
    address_imageFolder: "",
    address_imageUserFolder: "",
    address_iconFolder: "",
    offlineMode: false, //local,
  };

  //instance of components
  static AppComponent;
  static ProfileDialog;
  static FormContainer;
  //for current for id in form Container use in menu
  static FormId;
  static tblMenuItemId_Selected;
  static tblMenuItemId_Opened;

  //initilize in app component
  static initialize() {
    //TODo
  }

  //------------------------------------------------
  //region upload for upload progress in forms
  //------------------------------------------------

  static Uploads = {
    current: "", // current form id
    list: {},
  };

  static setUpload(documentCid, status = "upload", percent = 0) {
    SystemClass.Uploads.list[documentCid] = {
      status: status,
      percent: percent,
    };

    //update forms
    Object.values(SystemClass.Forms.data).forEach((formId) =>
      formId.forEach((formModel) => {
        const formComponent = formModel.formFieldInfo.component;
        if (formComponent && typeof formComponent.getFieldList === 'function') {
          formComponent.getFieldList().forEach((fieldInfo) => {
            const ds = fieldInfo.component && fieldInfo.component.dataSource;
            if (!ds || ds.idColName !== "documentCid") return;
            if (!ds.dataArray.find((row) => row.documentCid == documentCid))
              return;
            fieldInfo.update();
          });
        }
      })
    );
  }

  static getUpload(documentCid) {
    return SystemClass.Uploads.list[documentCid];
  }

  //------------------------------------------------
  //endregion
  //------------------------------------------------

  //------------------------------------------------
  //region form and datasource
  //------------------------------------------------
  static updateDataSource(dataSourceName) {
    const tempFormModelList = Object.values(SystemClass.Forms.data)
      .flat()
      .filter((formModel) => formModel.dataSources[dataSourceName]);

    const formModel = tempFormModelList[0];
    if (!formModel) return;

    formModel.formFieldInfo.rebindDataSource();
    formModel.formFieldInfo.update();

    // tempFormModelList.forEach(formModel => {
    //     formModel.formFieldInfo.rebindDataSource()
    //     formModel.formFieldInfo.update()
    // })
  }

  static getDataSource(dataSourceName, formId, paramList) {
    return SystemClass.getFormModel(formId, paramList).dataSources[
      dataSourceName
    ];
  }

  static webService_GetForm(formId, paramList, formModel, idListParams) {
    // formModel can be null
    let mergeParam = formModel ? SystemClass.getFormParams(formModel) : {};
    mergeParam = Utils.mergeObject(mergeParam, paramList);

    return new WebService(WebService.URL.webService_GetForm_Name, {
      formCid: formId,
      paramList: mergeParam,
    }).then((json) => {
      //error in get form such not access to form
      if (json.error || json.errorCode || json.errorMsg) {
        SystemClass.showErrorMsg(json.error || json.errorMsg);
        return;
      }

      const newFormModel = SystemClass.addFormData(
        formId,
        paramList,
        formModel,
        json,
        idListParams
      );
      if (newFormModel) {
        SystemClass.Forms.current = formId;
      }

      return newFormModel;
    });
  }

  static createFormInfo(parentFieldInfo, formModel, formId, paramList) {
    const dataSource = SystemClass.getDataSource(
      formModel.jsFormInfo.dataSourceName,
      formId,
      paramList
    );
    const defaultValues = dataSource.dataArray[0];

    //change fieldInfo of Form from data source
    if (defaultValues) {
      Object.keys(defaultValues)
        .filter((key) => key.startsWith(formModel.jsFormInfo.fieldName + "_"))
        .forEach((fieldInfoKey) => {
          let key = fieldInfoKey.replace(
            formModel.jsFormInfo.fieldName + "_",
            ""
          );
          key = key[0].toLowerCase() + key.substring(1);
          formModel.jsFormInfo[key] = defaultValues[fieldInfoKey];
        });
    }

    return FieldInfo.create(
      parentFieldInfo,
      formModel.jsFormInfo,
      formId,
      paramList
    );
  }

  //error that come from web service
  //handle with fieldInfo._error
  static showErrorComponentError = (formModel, errorMsg) => {
    const requireFields = (errorMsg.match(/\(\(.*?\)\)/g) || []).map((s) =>
      s.substring(2, s.length - 2)
    );
    requireFields.forEach((fieldName) => {
      const fieldInfo = formModel.formFieldInfo.getFieldInfo(fieldName);
      if (!fieldInfo.visible) return;
      fieldInfo._error = "updateError";
      fieldInfo.update();
    });
  };

  //Update_Forms Result Model
  // model instance (only for see types)
  updateResult = {
    timeLog: [
      {
        t:
          "spUpdate_Forms----------------*-------------------------Start-11:33.778",
      },
    ],
    errorCode: 0,
    errorMsg: "",
    successMsg: "تنظیمات با موفقیت به روزرسانی شد",
    webSvcResult_List: [
      {
        dataSourceName_ToUpdate: "dsTaskList_ListeTaskha",
        eventId: 188202,
        updatedItems: [
          {
            fieldName: "dsTaskList_ListeTaskha",
            tblFieldInfoId: 1219,
            fieldCid: "46cad6faf7ac20688eeed214",
            fieldType: "DataSource",
            idColName: "tblTaskId",
            formName: "taskList_TaskList",
            timeLog: [
              {
                t:
                  "DS:dsTaskList_ListeTaskha-----*-------------------------START-11:33.826",
              },
            ],
            dataArray: [],
            dataSource_ReloadAll: true,
          },
        ],
      },
    ],
  };

  static webService_UpdateForms(
    address,
    formModel,
    params,
    uploadFiles,
    needProgressBar
  ) {
    return new WebService(address, params, {
      uploadFiles,
      needProgressBar,
    }).then((json) => {
      json.successMsg && SystemClass.showMsg(json.successMsg);

      let errMsg = json.errorMsg || json.error;
      if (errMsg) {
        if (
          Utils.isDefine(json.errorCode) &&
          errMsg.indexOf(json.errorCode) === -1
        ) {
          errMsg = json.errorCode + json.errorMsg;
        }
        SystemClass.showErrorMsg(errMsg);
        SystemClass.showErrorComponentError(formModel, errMsg);
      }

      json.webSvcResult_List &&
        SystemClass.updateFormData(formModel, json.webSvcResult_List);
      return json;
    });
  }

  //------------------------------------------------
  //endregion form and datasource
  //------------------------------------------------

  //------------------------------------------------
  //region formModel
  //------------------------------------------------

  //form model save in here
  //form model instance (only for see types)
  FormModel = {
    paramList: [],
    parentFormModel: {},
    jsFormInfo: {},
    idListParams: {},
    dataSources: {}, //such SystemClass.getDataSourceModel(jsFormInfo)
    formFieldInfo: {},
  };

  static Forms = {
    current: "", // current form id
    data: {},
  };

  //form params from formModel
  static getFormParams(formModel) {
    let params = {};
    let paramList = [];
    paramList.unshift(formModel.paramList);
    paramList.unshift(formModel.idListParams);

    while (formModel.parentFormModel) {
      formModel = formModel.parentFormModel;
      paramList.unshift(formModel.paramList);
      paramList.unshift(formModel.idListParams);
    }

    paramList.forEach((p) => (params = Utils.mergeObject(params, p)));
    return params;
  }

  //find FormModel params from formModel
  static getFormModel(formId, paramList) {
    return (
      SystemClass.Forms.data[formId] &&
      SystemClass.Forms.data[formId].find((formModel) =>
        Utils.deepCompare(formModel.paramList, paramList)
      )
    );
  }

  //find FormModel by formName may formModel is in parent forms...
  static getFormModelByFormName(formModel, formName) {
    //end with find form or error
    while (formModel.jsFormInfo.fieldName != formName) {
      formModel = formModel.parentFormModel;
      if (formModel === null) {
        formModel = undefined;
        break;
      }
    }

    return formModel;
  }

  //update form model handler
  static updateFormData(formModel, webSvcResult_list) {
    webSvcResult_list.forEach((ds) => {
      const dataSourceName_ToUpdate = ds.dataSourceName_ToUpdate;
      // ds.eventId

      ds.updatedItems.forEach((updateItem) => {
        const formName = updateItem.formName;
        const formModelToUpdate = SystemClass.getFormModelByFormName(
          formModel,
          formName
        );

        if (!formModelToUpdate) return true;
        const dsName = updateItem.fieldName;
        const idColName = updateItem.idColName;

        const dataSource = formModelToUpdate.jsFormInfo.fieldInfo_List.find(
          (f) => f.fieldName == dsName
        );

        if (updateItem.dataSource_ReloadAll) {
          dataSource.dataArray = updateItem.dataArray;
        } else {
          updateItem.dataArray.forEach((item) => {
            //item to change
            //if not found then must add mean (update and insert)
            Utils.pushDistinc(dataSource.dataArray, item, idColName);
          });
        }

        formModelToUpdate.dataSources = SystemClass.getDataSourceModel(
          formModelToUpdate.jsFormInfo
        );
        setTimeout(() => {
          if (!formModelToUpdate.formFieldInfo.component) return;
          // if (formModelToUpdate.formFieldInfo.dataSourceName == updateItem.fieldName) {
          //     formModelToUpdate.formFieldInfo.component.rebindOnlyComponentsThatNotHaveDatasource()
          // }

          const fieldsToRefresh = formModelToUpdate.formFieldInfo.component
            .getFieldList()
            .filter(
              (fieldInfo) => fieldInfo.dataSourceName == updateItem.fieldName
            );

          if (fieldsToRefresh.length > 0) {
            fieldsToRefresh.forEach(fieldInfo => {
              formModelToUpdate.formFieldInfo.component.refreshComponent(fieldInfo.fieldName);
            });
          }

          // formModelToUpdate.formFieldInfo.component
          //   .getFieldList()
          //   .filter(
          //     (fieldInfo) => fieldInfo.dataSourceName == updateItem.fieldName
          //   )
          //   .forEach((fieldInfo) => {
          //     fieldInfo.update();
          //   });
        });
        // setTimeout(() => SystemClass.getFieldInfo(formModelToUpdate.jsFormInfo.fieldName).rebind())
      });
    });
  }

  //create data sources object from jsFormInfo with fieldName keys
  static getDataSourceModel(jsFormInfo) {
    //slice for clone
    const dataSourceList = jsFormInfo.fieldInfo_List
      .filter((f) => f.fieldType == FieldType.DataSource)
      .slice();

    let error = "";
    let warning = "";

    dataSourceList.forEach((dataSource) => {
      //TODO
      dataSource.dataArray.filter((row) => {
        Object.keys(row).forEach((key) => {
          if (key.endsWith("_Shamsi")) return;

          let v = row[key];

          if (typeof v === "string" && (v.includes('/') || v.includes('-'))) {
            try {
              const mom = moment(v);

              if (mom && mom.isValid()) {
                //shamsi date
                row[key + "_Shamsi"] = mom.format("jYYYY/jMM/jDD");
              }
            } catch (e) { }
          }
        });

        if (row.warningMsg) {
          warning +=
            (row.warningCode ? row.warningCode + " " : "") +
            row.warningMsg +
            "\n\n";
        }

        if (row.errorMsg) {
          error +=
            (row.errorCode ? row.errorCode + " " : "") + row.errorMsg + "\n\n";
          return false;
        }
        return true;
      });
    });

    if (warning) {
      SystemClass.showWarningMsg(warning);
    }

    if (error) {
      SystemClass.showErrorMsg(error);
      return null;
    }

    //fetch json
    //change data
    //merge column info to data source
    jsFormInfo.fieldInfo_List.forEach((fieldInfo) => {
      if (fieldInfo.fieldType == FieldType.Grid) {
        // const gridDataSource = SystemClass.getDataSource(formId, fieldInfo.dataSourceName)
        const gridDataSource = dataSourceList.find(
          (f) => f.fieldName == fieldInfo.dataSourceName
        );
        fieldInfo.columnInfo_List.forEach((columnInfo) => {
          if (columnInfo.gridColumn_IsFieldInfo) {
            //must merge
            gridDataSource.dataArray.forEach((dataRow) => {
              if (Utils.isObject(dataRow[columnInfo.fieldName])) {
                dataRow[columnInfo.fieldName] = Object.assign(
                  {},
                  columnInfo,
                  dataRow[columnInfo.fieldName]
                );
              }
            });
          }
        });
      }
    });

    return Utils.listToObjectByProp(dataSourceList, "fieldName");
  }

  static addFormData = (
    formId,
    paramList,
    parentFormModel,
    jsFormInfo,
    idListParams
  ) => {
    SystemClass.Forms.data[formId] = SystemClass.Forms.data[formId] || [];
    const ds = SystemClass.getDataSourceModel(jsFormInfo);
    if (!ds) return null;

    //add FormModel Instance
    return Utils.pushDistinc(
      SystemClass.Forms.data[formId],
      {
        paramList: paramList,
        parentFormModel: parentFormModel,
        jsFormInfo: jsFormInfo,
        idListParams: idListParams,
        dataSources: ds,
      },
      "paramList"
    );
  };

  //------------------------------------------------
  //endregion formModel
  //------------------------------------------------
}

export default SystemClass_Core;
