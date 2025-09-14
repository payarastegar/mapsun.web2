import React, { useState, useEffect } from "react";
import FormInfo from "./FormInfo/FormInfo";
import SystemClass from "../SystemClass";
import FontAwesome from "react-fontawesome";
import { Button } from "reactstrap";
import { useParams } from "react-router-dom";

// کامپوننت به حالت تابعی بازنویسی شد
function FormContainer() {
  // ۱. مدیریت state با هوک useState
  const [hasError, setHasError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [formFieldInfo, setFormFieldInfo] = useState(null);

  // ۲. دریافت پارامترهای URL با هوک useParams
  const { formId } = useParams();

  // ۳. مدیریت واکشی داده با هوک useEffect
  // این کد فقط زمانی اجرا می‌شود که formId از URL تغییر کند
  useEffect(() => {
    // یک تابع async برای واکشی داده تعریف می‌کنیم
    const initialize = async (currentFormId) => {
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
    };

    if (formId) {
      initialize(formId);
    }
  }, [formId]); // <<--- این وابستگی باعث می‌شود تابع فقط با تغییر formId اجرا شود

  const handleReloadClick = () => {
    if (formId) {
      // برای بارگذاری مجدد، کافیست دوباره initialize را صدا بزنیم
      const initializeOnReload = async () => {
        setLoaded(false);
        setHasError(false);
        await SystemClass.setLoading(true);
        const paramList = SystemClass.getFormParam(formId);
        try {
          const formModel = await SystemClass.webService_GetForm(formId, paramList, null);
          if (formModel) {
            const newFormFieldInfo = SystemClass.createFormInfo(null, formModel, formId, paramList);
            formModel.formFieldInfo = newFormFieldInfo;
            setFormFieldInfo(newFormFieldInfo);
            setLoaded(true);
          } else { setHasError(true); }
        } catch (error) { setHasError(true); } 
        finally { SystemClass.setLoading(false); }
      };
      initializeOnReload();
    }
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
}

export default FormContainer;