import React, { useState, useEffect, forwardRef, useImperativeHandle, useCallback } from "react";
import FormInfo from "./FormInfo/FormInfo";
import SystemClass from "../SystemClass";
import FontAwesome from "react-fontawesome";
import { Button } from "reactstrap";
import { useParams } from "react-router-dom";

const FormContainer = forwardRef((props, ref) => {
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [formFieldInfo, setFormFieldInfo] = useState(null);

  const { formId } = useParams();


  const initialize = useCallback(async (currentFormId) => {
    if (!currentFormId) return;

    SystemClass.FormId = currentFormId;
    SystemClass.tblMenuItemId_Opened = SystemClass.tblMenuItemId_Selected;

    setLoaded(false);
    setHasError(false);
    await SystemClass.setLoading(true);

    const paramList = SystemClass.getFormParam(currentFormId);

    try {
      const formModel = await SystemClass.webService_GetForm(currentFormId, paramList, null);
      
      if (!formModel) {
        setHasError(true);
        SystemClass.setLoading(false);
        return;
      }

      const newFormFieldInfo = SystemClass.createFormInfo(
        null,
        formModel,
        currentFormId,
        paramList
      );
      
      formModel.formFieldInfo = newFormFieldInfo;
      setFormFieldInfo(newFormFieldInfo);
      setLoaded(true);

    } catch (error) {
      console.error("Failed to load form:", error);
      setHasError(true);
    } finally {
      SystemClass.setLoading(false);
    }
  }, []); 

  useImperativeHandle(ref, () => ({
    reload: () => {
      initialize(formId);
    },
  }));

  useEffect(() => {
    SystemClass.FormContainer = {
      reload: () => initialize(formId),
    };
    return () => {
      SystemClass.FormContainer = null;
    };
  }, [formId, initialize]);

  useEffect(() => {
    initialize(formId);
  }, [formId, initialize]);

  const handleReloadClick = () => {
    initialize(formId);
  };

  if (hasError) {
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
          onClick={handleReloadClick}
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

   if (!loaded) {
    return <div className="Form__container scroll__container"></div>;
  }

  return (
    <div className="Form__container scroll__container">
      {formFieldInfo && <FormInfo fieldInfo={formFieldInfo} />}
    </div>
  );
}); 

export default FormContainer;