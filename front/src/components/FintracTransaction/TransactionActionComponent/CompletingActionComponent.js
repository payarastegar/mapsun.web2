import InputField from "../UtilityComponents/InputFieldComponent";
import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import { NumericFormat } from "react-number-format";
import MandatoryIndicator from "../UtilityComponents/MandatoryIndicator";
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

function CompletingActionComponent({
  dataSource,
  props,
  tblTransactionId,
  tblTransaction_ActionId,
  reportTypeMsId,
  strRelatedTransactionMsId,
  onShowInvolvement,
  onShowBeneficiary,
  onShowSender,
  onShowReciever,
  onShowCompletingAction,
}) {
  const [data, setData] = useState({});

  useEffect(function() {
    onShowCompletingAction(true);
    if (!tblTransactionId || !tblTransaction_ActionId) {
      setData({
        tblTransaction_ActionId,
        tblTransactionId,
        completing_isCompletingAction: true,
        starting_isStartingAction: false,
        completing_isOtherPersonInvolvedInCompleting: false,
        completing_detailsOfDispositionMsId: 206003,
        startingOrCompleting_tblCurrencyId:
          reportTypeMsId === 211146 ? 104 : 45,
        startingOrCompleting_amount: "",
        completing_valueInCad: "",
        completing_exchangeRate: "",
        completing_referenceNumber: "",
        completing_otherReferenceNumber: "",
        completing_Account_financialInstitutionNumber: "",
        completing_Account_dateAccountOpened: "",
        completing_Account_accountNumber: "",
        completing_Account_branchNumber: "",
        completing_Account_accountTypeMsId: 213001,
        completing_Account_accountCurrency_tblCurrencyId: 45,
        isVirtualCurrency: false,
        str_startingOrCompleting_fundAssetVirtualCurrencyTypeMsId: 0,
        currencyOther: "",
        completing_beneficiaryIndicator: null,
        completing_detailsOfDisposition_Text_Other: "",
        completing_receivingAddresses: reportTypeMsId === 211014 ? "" : null,
      });
    } else {
      setData(dataSource);
      if (dataSource.completing_beneficiaryIndicator) {
        onShowBeneficiary(true);
      }
      if (dataSource.completing_isOtherPersonInvolvedInCompleting) {
        onShowInvolvement(true);
      }
    }
  }, []);

  function handleChangeInput(e, targetName) {
    if (e === undefined) return;
    if (
      targetName === "startingOrCompleting_amount" ||
      targetName === "completing_valueInCad" ||
      targetName === "completing_exchangeRate"
    ) {
      setData((data) => ({
        ...data,
        [targetName]: e,
      }));
    } else if (targetName !== "startingOrCompleting_amount") {
      setData((data) => ({ ...data, [targetName]: e.target.value }));
    } else return;
  }

  const btnSaveTransaction =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnTransaction_ActionSave;

  function getComboData(dsName) {
    let ds = props.fieldInfo.getDataSource(dsName).dataArray;

    return ds;
  }

  const InputProps = {
    type: "text",
    placeholder: "X,XXX.XX",
  };
  return (
    <div className="col-9">
      <h2>Completing action</h2>
      <h5 style={{ color: "#5FBDFF" }}>
        information about the completing action
      </h5>
      <div className="row">
        <div className="col-6">
          <p className="mb-0">Currency type</p>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="currencyType"
              id="flexRadioDefault1"
              checked={data.isVirtualCurrency === false}
              onChange={() =>
                setData({
                  ...data,
                  isVirtualCurrency: false,
                })
              }
            />
            <label class="form-check-label" for="flexRadioDefault1">
              Fiat Currency
            </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="currencyType"
              id="flexRadioDefault2"
              checked={data.isVirtualCurrency === true}
              onChange={() =>
                setData({
                  ...data,
                  isVirtualCurrency: true,
                })
              }
            />
            <label class="form-check-label" for="flexRadioDefault2">
              Virtual Currency
            </label>
          </div>
        </div>
      </div>
      <div className="row mt-3">
        <div className="col-6">
          <FormGroup>
            <Label for="exampleSelect">Details of disposition:</Label>
            <Input
              id="exampleSelect"
              name="completing_detailsOfDispositionMsId"
              type="select"
              value={data.completing_detailsOfDispositionMsId}
              onChange={(e) =>
                handleChangeInput(e, "completing_detailsOfDispositionMsId")
              }
            >
              {getComboData(
                "dsFintrac_Transaction_Action_DetailsOfDispositionMsId_ForCombo"
              ).map((item, inx) => (
                <option key={inx} value={item.detailsOfDispositionMsId}>
                  {item.name}
                </option>
              ))}
            </Input>
          </FormGroup>
        </div>
        {data.completing_detailsOfDispositionMsId == 206011 ? (
          <div className="col-6">
            <Label for="exampleSelect">Other datails of disposition:</Label>
            <Input
              id="exampleSelect"
              name="completing_detailsOfDisposition_Text_Other"
              type="text"
              value={data.completing_detailsOfDisposition_Text_Other}
              onChange={(e) =>
                handleChangeInput(
                  e,
                  "completing_detailsOfDisposition_Text_Other"
                )
              }
            />
          </div>
        ) : null}
        <div className="col-12">
          <div className="row flex-column mt-3">
            <div className="col-6">
              <p>Amount:</p>
            </div>
            <div className="col-6" />
            <div className="col-6">
              <NumericFormat
                value={data.startingOrCompleting_amount}
                // prefix="$"
                thousandSeparator
                customInput={Input}
                displayType="input"
                onValueChange={(values, sourceInfo) =>
                  handleChangeInput(
                    values.floatValue,
                    "startingOrCompleting_amount"
                  )
                }
                {...InputProps}
              />
            </div>
            <div className="col-6" />
          </div>
        </div>
      </div>
      <div className="d-flex mt-3">
        <div style={{ maxWidth: "50%" }}>
          <FormGroup>
            <Label for="exampleSelect">Currency:</Label>
            {data.isVirtualCurrency ? (
              <Input
                id="exampleSelect"
                name="startingOrCompleting_tblCurrencyId"
                type="select"
                value={data.startingOrCompleting_tblCurrencyId}
                onChange={(e) =>
                  handleChangeInput(e, "startingOrCompleting_tblCurrencyId")
                }
              >
                {getComboData(
                  "dsFintrac_Currency_VirtualCurrencyList_ForCombo"
                ).map((item, inx) => (
                  <option
                    key={inx}
                    value={item.startingOrCompleting_tblCurrencyId}
                  >
                    {item.name}
                  </option>
                ))}
              </Input>
            ) : (
              <Input
                id="exampleSelect"
                name="startingOrCompleting_tblCurrencyId"
                type="select"
                value={data.startingOrCompleting_tblCurrencyId}
                onChange={(e) =>
                  handleChangeInput(e, "startingOrCompleting_tblCurrencyId")
                }
              >
                {getComboData("dsFintrac_Currency_CurrencyList_ForCombo").map(
                  (item, inx) => (
                    <option
                      key={inx}
                      value={item.startingOrCompleting_tblCurrencyId}
                    >
                      {item.name}
                    </option>
                  )
                )}
              </Input>
            )}
          </FormGroup>
        </div>

        <div className="row flex-column m-1" style={{ maxWidth: "50%" }}>
          <div>
            <p>Value in CAD:</p>
          </div>
          <div className="mt-1">
            <NumericFormat
              value={data.completing_valueInCad}
              // prefix="$"
              thousandSeparator
              customInput={Input}
              displayType="input"
              onValueChange={(values, sourceInfo) =>
                handleChangeInput(values.floatValue, "completing_valueInCad")
              }
              {...InputProps}
            />
          </div>
        </div>
        <div className="row flex-column m-1" style={{ maxWidth: "50%" }}>
          <div>
            <p>Exchange Rate:</p>
          </div>
          <div className="mt-1">
            <NumericFormat
              value={data.completing_exchangeRate}
              // prefix="$"
              thousandSeparator
              customInput={Input}
              displayType="input"
              onValueChange={(values, sourceInfo) =>
                handleChangeInput(values.floatValue, "completing_exchangeRate")
              }
              {...InputProps}
            />
          </div>
        </div>
      </div>
      {data.isVirtualCurrency &&
        data.startingOrCompleting_tblCurrencyId == 1142 && (
          <div>
            <FormGroup>
              <Label for="exampleSelect">Other virtual currency:</Label>
              <Input
                id="exampleSelect"
                name="currencyOther"
                type="text"
                value={data.currencyOther}
                onChange={(e) => handleChangeInput(e, "currencyOther")}
              />
            </FormGroup>
          </div>
        )}
      {data.isVirtualCurrency && (
        <div>
          <Label for="exampleText">Receiving virtual currency address:</Label>
          <Input
            id="exampleText"
            name="completing_receivingAddresses"
            type="text"
            value={data.completing_receivingAddresses}
            onChange={(e) => handleChangeInput(e, e.target.name)}
          />
        </div>
      )}
      {(reportTypeMsId === 211106 || reportTypeMsId === 211014) && (
        <div className="row mt-3 mb-2">
          <div className="col-12 mb-2">
            <Label for="exampleText">Reference number:</Label>
            <Input
              id="exampleText"
              name="completing_referenceNumber"
              type="textarea"
              rows={1}
              columns={65}
              value={data.completing_referenceNumber}
              onChange={(e) => handleChangeInput(e, e.target.name)}
            />
          </div>
          <div className="col-12 mb-2">
            <Label for="exampleText">
              Other number related to reference number:
            </Label>
            <Input
              id="exampleText"
              name="completing_otherReferenceNumber"
              type="textarea"
              rows={1}
              columns={65}
              value={data.completing_otherReferenceNumber}
              onChange={(e) => handleChangeInput(e, e.target.name)}
            />
          </div>
        </div>
      )}
      {reportTypeMsId === 211106 && (
        <div className="d-flex row mb-2">
          <InputField
            lableTxt="Financial institution number:"
            type={"text"}
            maxWidth={"50%"}
            value={data.completing_Account_financialInstitutionNumber}
            name={"completing_Account_financialInstitutionNumber"}
            handleChangeInput={handleChangeInput}
            className={"col-6"}
          />
          <InputField
            lableTxt="Branch number:"
            type={"text"}
            maxWidth={"50%"}
            value={data.completing_Account_branchNumber}
            name={"completing_Account_branchNumber"}
            handleChangeInput={handleChangeInput}
            className={"col-6"}
          />
        </div>
      )}
      {reportTypeMsId === 211106 && (
        <div className="d-flex row  mb-2">
          <InputField
            lableTxt="Account number:"
            type={"text"}
            maxWidth={"50%"}
            value={data.completing_Account_accountNumber}
            name={"completing_Account_accountNumber"}
            handleChangeInput={handleChangeInput}
            className={"col-6"}
          />
          <InputField
            lableTxt="Date account opened:"
            type={"date"}
            maxWidth={"50%"}
            value={data.completing_Account_dateAccountOpened}
            name={"completing_Account_dateAccountOpened"}
            handleChangeInput={handleChangeInput}
            className={"col-6"}
            max={"2999-12-31"}
          />
        </div>
      )}
      {(reportTypeMsId === 211106 || reportTypeMsId === 211014) &&
        !data.isVirtualCurrency && (
          <div className="d-flex row mb-2">
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect">Account type:</Label>
                <Input
                  id="exampleSelect"
                  name="completing_Account_accountTypeMsId"
                  type="select"
                  value={data.completing_Account_accountTypeMsId}
                  onChange={(e) =>
                    handleChangeInput(e, "completing_Account_accountTypeMsId")
                  }
                >
                  {getComboData(
                    "dsFintrac_Transaction_Action_AccountTypeMsId_ForCombo"
                  ).map((item, inx) => (
                    <option key={inx} value={item.accountTypeMsId}>
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect">Account currency:</Label>
                <Input
                  id="exampleSelect"
                  name="completing_Account_accountCurrency_tblCurrencyId"
                  type="select"
                  value={data.completing_Account_accountCurrency_tblCurrencyId}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "completing_Account_accountCurrency_tblCurrencyId"
                    )
                  }
                >
                  {getComboData("dsFintrac_Currency_CurrencyList_ForCombo").map(
                    (item, inx) => (
                      <option
                        key={inx}
                        value={item.startingOrCompleting_tblCurrencyId}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </Input>
              </FormGroup>
            </div>
          </div>
        )}

      <div className="row mt-3">
        <div className="col-6">
          <p className="mb-0">
            Was there any other person or entity involved in the completing
            action?
          </p>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="completing_isOtherPersonInvolvedInCompleting"
              id="flexRadioDefault23"
              checked={
                data.completing_isOtherPersonInvolvedInCompleting === true
              }
              onChange={() =>
                setData({
                  ...data,
                  completing_isOtherPersonInvolvedInCompleting: true,
                })
              }
            />
            <label class="form-check-label" for="flexRadioDefault23">
              Yes
            </label>
          </div>
          <div class="form-check">
            <input
              class="form-check-input"
              type="radio"
              name="completing_isOtherPersonInvolvedInCompleting"
              id="flexRadioDefault22"
              checked={
                data.completing_isOtherPersonInvolvedInCompleting === false
              }
              onChange={() =>
                setData({
                  ...data,
                  completing_isOtherPersonInvolvedInCompleting: false,
                })
              }
            />
            <label class="form-check-label" for="flexRadioDefault22">
              No
            </label>
          </div>
        </div>
      </div>
      <div className="d-flex flex-column align-items-end mb-5 mt-5">
        <div
          onClick={() => {
            ///////////Show and hide INVOLVMENT
            if (
              data.completing_isOtherPersonInvolvedInCompleting === true ||
              data.completing_isOtherPersonInvolvedInCompleting === "true"
            ) {
              onShowInvolvement(true);
            }
            if (
              data.completing_isOtherPersonInvolvedInCompleting === false ||
              data.completing_isOtherPersonInvolvedInCompleting === "false"
            ) {
              onShowInvolvement(false);
            }

            onShowBeneficiary(true);
          }}
        >
          <ButtonFieldInfo
            key={1}
            fieldInfo={btnSaveTransaction.props.fieldInfo}
            externalData={data}
            getDataFromExternal="true"
          />
        </div>
        {/* <div className="mt-2">
          <span>
            <button className="btn btn-light ml-2">
              <i class="bi bi-arrow-left" style={{ marginRight: "5px" }} />
              Previous Part
            </button>
            <button className="btn btn-light">
              Next Part
              <i class="bi bi-arrow-right" style={{ marginLeft: "5px" }} />
            </button>
          </span>
        </div> */}
      </div>
    </div>
  );
}

export default CompletingActionComponent;
