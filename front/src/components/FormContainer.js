import React, { Component, Fragment, PureComponent } from "react";
import BaseComponent from "./BaseComponent";
import FormInfo from "./FormInfo/FormInfo";
import SystemClass from "../SystemClass";
import FieldInfo from "../class/FieldInfo";
import Logger from "../Logger";
import FontAwesome from "react-fontawesome";
import { Button } from "reactstrap";
import { Switch } from "react-router";
import Dialog from "./Dialog/Dialog";
import Utils from "../Utils";

class FormContainer extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      loaded: false,
    };
    this.data = {
      formId: props.match.params.formId,
    };

    SystemClass.FormContainer = this;
    this.initialize();
  }

  initialize = async () => {
    //delete all Form
    SystemClass.FormId = this.data.formId;
    SystemClass.tblMenuItemId_Opened =  SystemClass.tblMenuItemId_Selected;

    this.state.loaded = false;
    await SystemClass.setLoading(true);

    const formId = this.data.formId;
    // this.data.menuItem = window._data._mainMenu && window._data._mainMenu.menuItem_Array.find(item => item.menuItem_FormId == formId)
    // if (!this.data.menuItem) {
    //     return this.setState({hasError: true})
    // }

    // const paramList = this.data.menuItem.menuItem_Form_ParamList

    const paramList = SystemClass.getFormParam(formId);

    SystemClass.webService_GetForm(formId, paramList, null)
      .then((formModel) => {
        if (!formModel) return;
        //first we have'nt any form parent (mean null) and _formId &  _paramList undefined
        this.formFieldInfo = SystemClass.createFormInfo(
          null,
          formModel,
          formId,
          paramList
        );
        // this.formFieldInfo = FieldInfo.create(null, formModel.jsFormInfo, formId, paramList)
        formModel.formFieldInfo = this.formFieldInfo;
        this.state.loaded = true;
        this.setState({ hasError: false });
      })
      .catch((error) => {
        console.log(error);
        this.setState({ hasError: true });
      })
      .finally(() => SystemClass.setLoading(false));
  };

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    console.log(error);
    return { hasError: true };
  }

  _handleReloadClick = (event) => {
    this.initialize();
  };

  componentDidCatch(error, errorInfo) {
    console.log(error, errorInfo);
    Logger.log("error", {
      error: error.toString(),
      componentStack: errorInfo.componentStack,
    });
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      !SystemClass.loading &&
      SystemClass.FormContainer &&
      (nextProps.location.state.reload ||
        nextProps.match.params.formId !== SystemClass.FormContainer.data.formId)
    ) {
      nextProps.location.state.reload = false;
      SystemClass.FormContainer.data.formId = nextProps.match.params.formId;
      SystemClass.FormContainer.initialize();

      return {
        hasError: false,
        loaded: false,
      };
    }
    return null;
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

    return (
      <div className="Form__container scroll__container">
        {this.state.loaded && <FormInfo fieldInfo={this.formFieldInfo} />}
      </div>
    );
  }
}

export default FormContainer;
