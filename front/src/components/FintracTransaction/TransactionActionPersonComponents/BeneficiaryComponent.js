import InputField from "../UtilityComponents/InputFieldComponent";
import TransactionPersonComponent from "../UtilityComponents/TransactionPersonComponent";
import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import MandatoryIndicator from "../UtilityComponents/MandatoryIndicator";
import "bootstrap-icons/font/bootstrap-icons.css";
import RadioComponent from "../UtilityComponents/RadioComponent";

function BeneficiaryComponent({
  dataSource,
  props,
  tblTransactionId,
  tblTransaction_ActionId,
  reportTypeMsId,
  strRelatedTransactionMsId,
  onShowBeneficiary,
  onShowSender,
  onShowReciever,
  onShowOnbehalfof_Beneficiary,
  onShowAccountHolder_Beneficiary,
  relatedPerson,
}) {
  const [data, setData] = useState({});

  useEffect(function() {
    onShowBeneficiary(true);
    if (!dataSource) {
      setData({
        tblPersonId: undefined,
        tblTransactionId,
        tblTransaction_ActionId,
        hasOnBehalfOf: false,
        account_financialInstitutionNumber: "",
        account_branchNumber: "",
        account_accountNumber: "",
        account_dateAccountOpened: "",
        account_accountTypeMsId: 213001,
        account_accountCurrency_tblCurrencyId: 45,
        account_hasAccountHolder: false,
        actionPersonTypeMsId: 208003 /* Beneficiary */,
        relatedPersonIndicator: true,
      });
    } else {
      setData({ ...dataSource, relatedPersonIndicator: true });
    }
  }, []);

  function handleChangeInput(e, targetName) {
    setData((data) => ({ ...data, [targetName]: e.target.value }));
  }

  const btnTransaction_Action_PersonSave =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnTransaction_Action_PersonSave;

  const btnTransaction_Action_PersonRemove =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnTransaction_Action_PersonRemove;

  function getComboData(dsName) {
    let ds = props.fieldInfo.getDataSource(dsName).dataArray;

    return ds;
  }

  return (
    <div className="col-9">
      <h2>Beneficiary</h2>
      <h5 style={{ color: "#5FBDFF" }}>Information about the Beneficiary</h5>
      <div className="d-flex row">
        <RadioComponent
          fieldTitle={"Only related person"}
          fieldName={"relatedPersonIndicator"}
          firstSelectId={"relatedPersonIndicator1"}
          secondSelectId={"relatedPersonIndicator2"}
          radioValue={data.relatedPersonIndicator}
          handleChangeInput={handleChangeInput}
          firstSelectTitle={"Yes"}
          secondSelectTitle={"No"}
        />
      </div>
      <div>
        <TransactionPersonComponent
          dataSource={data}
          tblTransactionId={tblTransactionId}
          tblTransaction_ActionId={tblTransaction_ActionId}
          props={props}
          handleSetData={(data) => setData(data)}
          relatedPersonId={relatedPerson.tblPersonId}
          relatedPersonIndicator={data.relatedPersonIndicator}
        />
      </div>
      <div className="d-flex row mb-2 mt-3">
        <InputField
          lableTxt="Financial institution number:"
          type={"text"}
          maxWidth={"50%"}
          value={data.account_financialInstitutionNumber}
          name={"account_financialInstitutionNumber"}
          handleChangeInput={handleChangeInput}
          className={"col-6"}
          isMandatory={false}
        />
        <InputField
          lableTxt="Branch number:"
          type={"text"}
          maxWidth={"50%"}
          value={data.account_branchNumber}
          name={"account_branchNumber"}
          handleChangeInput={handleChangeInput}
          className={"col-6"}
          isMandatory={false}
        />
      </div>

      <div className="d-flex row mb-2">
        <InputField
          lableTxt="Account number:"
          type={"text"}
          maxWidth={"50%"}
          value={data.account_accountNumber}
          name={"account_accountNumber"}
          handleChangeInput={handleChangeInput}
          className={"col-6"}
          isMandatory={false}
        />
        <InputField
          lableTxt="Date account opened:"
          type={"date"}
          maxWidth={"50%"}
          value={data.account_dateAccountOpened}
          name={"account_dateAccountOpened"}
          handleChangeInput={handleChangeInput}
          className={"col-6"}
          max={"2999-12-31"}
        />

        <div className="col-6">
          <FormGroup>
            <Label for="exampleSelect">Account type:</Label>
            <Input
              id="exampleSelect"
              name="account_accountTypeMsId"
              type="select"
              value={data.account_accountTypeMsId || 213001}
              onChange={(e) => handleChangeInput(e, "account_accountTypeMsId")}
              isMandatory={false}
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
              name="account_accountCurrency_tblCurrencyId"
              type="select"
              value={data.account_accountCurrency_tblCurrencyId || 45}
              onChange={(e) =>
                handleChangeInput(e, "account_accountCurrency_tblCurrencyId")
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
        <RadioComponent
          fieldTitle={"Does this action has an onbehalf of?"}
          fieldName={"hasOnBehalfOf"}
          firstSelectId={"hasOnBehalfOf1"}
          secondSelectId={"hasOnBehalfOf2"}
          radioValue={data.hasOnBehalfOf}
          handleChangeInput={handleChangeInput}
          firstSelectTitle={"Yes"}
          secondSelectTitle={"No"}
        />
        <RadioComponent
          fieldTitle={"Does this action has an account holder?"}
          fieldName={"account_hasAccountHolder"}
          firstSelectId={"account_hasAccountHolder1"}
          secondSelectId={"account_hasAccountHolder2"}
          radioValue={data.account_hasAccountHolder}
          handleChangeInput={handleChangeInput}
          firstSelectTitle={"Yes"}
          secondSelectTitle={"No"}
        />
      </div>

      <div className="d-flex flex-column align-items-end mb-5 mt-5">
        <div
          onClick={() => {
            if (
              reportTypeMsId === 211145 ||
              strRelatedTransactionMsId === 211145
            ) {
              onShowReciever(true);
            }

            if (
              reportTypeMsId === 211146 ||
              strRelatedTransactionMsId === 211146
            ) {
              onShowSender(true);
            }

            if (data.hasOnBehalfOf === true || data.hasOnBehalfOf === "true") {
              onShowOnbehalfof_Beneficiary(true);
            } else {
              onShowOnbehalfof_Beneficiary(false);
            }

            if (
              data.account_hasAccountHolder === true ||
              data.account_hasAccountHolder === "true"
            ) {
              onShowAccountHolder_Beneficiary(true);
            } else {
              onShowAccountHolder_Beneficiary(false);
            }
          }}
        >
          <ButtonFieldInfo
            key={999}
            fieldInfo={btnTransaction_Action_PersonSave.props.fieldInfo}
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

export default BeneficiaryComponent;
