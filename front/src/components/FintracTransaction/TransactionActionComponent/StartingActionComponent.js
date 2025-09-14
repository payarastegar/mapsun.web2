import InputField from "../UtilityComponents/InputFieldComponent";
import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import MandatoryIndicator from "../UtilityComponents/MandatoryIndicator";
import { NumericFormat } from "react-number-format";
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import RadioComponent from "../UtilityComponents/RadioComponent";

function StartingActionComponent({
  dataSource,
  dsTransactionEdit,
  props,
  tblTransactionId,
  tblTransaction_ActionId,
  reportTypeMsId,
  onShowInitiator,
  onShowCompletingAction,
  onShowStartingAction,
  onShowSourceOfCash,
  onShowSender,
  onShowReciever,
  onShowInvolvement,
  onShowRequester,
  onShowConductor,
  strRelatedTransactionMsId,
}) {
  const [data, setData] = useState({});
  const [howWasCashObtainedList, setHowWasCashObtained] = useState([]);

  useEffect(function() {
    if (dsTransactionEdit.initiatorAndReceiverIndicator) {
      onShowInitiator(true);
    }
    // onShowStartingAction(true);

    if (!tblTransaction_ActionId || !tblTransaction_ActionId) {
      setData({
        completing_isCompletingAction: false,
        starting_isStartingAction: true,
        tblTransaction_ActionId: tblTransaction_ActionId,
        tblTransactionId: tblTransactionId,
        completing_isOtherPersonInvolvedInCompleting:
          reportTypeMsId === 211106 || strRelatedTransactionMsId === 211106
            ? false
            : null,
        startingOrCompleting_tblCurrencyId:
          reportTypeMsId === 211145 ? 104 : 45,
        starting_howWasCashObtained: "",
        startingOrCompleting_amount: "",
        currencyOther: "",
        starting_sendingAddresses: [],
        starting_conductorIndicator: false,
        completing_exchangeRate: "",
        starting_isSourceOfCashInformationObtained: false,
        starting_isInvolvedDepositToBusinessAccount: false,
        str_startingOrCompleting_directionMsId:
          reportTypeMsId === 211102 ? 226001 : null,
        str_startingOrCompleting_fundAssetVirtualCurrencyTypeMsId:
          reportTypeMsId === 211102 ? 227001 : null,
        str_startingOrCompleting_fundAssetVirtualCurrencyType_Text_Other:
          reportTypeMsId === 211102 ? "" : null,
      });
    } else {
      setData(dataSource);
      if (dataSource.starting_isSourceOfCashInformationObtained) {
        onShowSourceOfCash(true);
      }
    }

    setHowWasCashObtained(
      getComboData(
        "dsFintrac_GorooheKala_ListeGoroohha_Simple_ListOfHowCashObtained"
      )
    );
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

  const btnTransaction_ActionSave =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnTransaction_ActionSave;

  const btnOpen_HowCashObtainedList =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnOpen_HowCashObtainedList;

  const btnRefresh_PurposeOfTransactionAndHowCashObtainedList =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnRefresh_PurposeOfTransactionAndHowCashObtainedList;

  function getComboData(dsName) {
    let ds = props.fieldInfo.getDataSource(dsName).dataArray;

    return ds;
  }

  const InputProps = {
    type: "text",
    placeholder: "X,XXX.XX",
  };

  function handleSetHowWasCashObtainedList() {
    setHowWasCashObtained((prev) =>
      getComboData(
        "dsFintrac_GorooheKala_ListeGoroohha_Simple_ListOfHowCashObtained"
      )
    );
  }

  return (
    <div className="col-9">
      <h2>Starting action</h2>
      <h5 style={{ color: "#5FBDFF" }}>Details about the starting action</h5>
      <div>
        <div className="row mt-3">
          <div className="flex-column col-6">
            <div>
              <p>Amount</p>
            </div>
            <div />
            <div>
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
          </div>
          <div className="col-6">
            <div>
              <p>Exchange Rate:</p>
            </div>
            <div />
            <div className="mt-1">
              <NumericFormat
                value={data.completing_exchangeRate}
                // prefix="$"
                thousandSeparator
                customInput={Input}
                displayType="input"
                onValueChange={(values, sourceInfo) =>
                  handleChangeInput(
                    values.floatValue,
                    "completing_exchangeRate"
                  )
                }
                {...InputProps}
              />
            </div>
          </div>
        </div>
        <div className="row mt-3">
          {reportTypeMsId === 211014 || strRelatedTransactionMsId === 211014 ? (
            <div className="col-6 ">
              <FormGroup>
                <Label for="exampleSelect">Transaction virtual currency:</Label>
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
              </FormGroup>
            </div>
          ) : (
            <div className="col-6 ">
              <FormGroup>
                <Label for="exampleSelect">Transaction currency:</Label>
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
              </FormGroup>
            </div>
          )}

          {data.startingOrCompleting_tblCurrencyId == 1142 && (
            <div className="col-6">
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
        </div>
        <div className="row mt-3">
          {reportTypeMsId === 211102 ? (
            <div className="col-6 ">
              <FormGroup>
                <Label for="exampleSelect">
                  Fund asset virtual currency type:
                </Label>
                <Input
                  id="exampleSelect"
                  name="str_startingOrCompleting_fundAssetVirtualCurrencyTypeMsId"
                  type="select"
                  value={
                    data.str_startingOrCompleting_fundAssetVirtualCurrencyTypeMsId
                  }
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "str_startingOrCompleting_fundAssetVirtualCurrencyTypeMsId"
                    )
                  }
                >
                  {getComboData(
                    "dsFintrac_Transaction_Action_FundAssetVirtualCurrencyTypeMsId_ForCombo"
                  ).map((item, inx) => (
                    <option
                      key={inx}
                      value={item.fundAssetVirtualCurrencyTypeMsId}
                    >
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
          ) : null}

          {data.str_startingOrCompleting_fundAssetVirtualCurrencyTypeMsId ==
            227017 && (
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect">
                  Other fund asset virtual currency type:
                </Label>
                <Input
                  id="exampleSelect"
                  name="str_startingOrCompleting_fundAssetVirtualCurrencyType_Text_Other"
                  type="text"
                  value={
                    data.str_startingOrCompleting_fundAssetVirtualCurrencyType_Text_Other
                  }
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "str_startingOrCompleting_fundAssetVirtualCurrencyType_Text_Other"
                    )
                  }
                />
              </FormGroup>
            </div>
          )}
        </div>
        <div className="row mt-3">
          {reportTypeMsId === 211014 ||
            (strRelatedTransactionMsId === 211014 && (
              <div className="col-12">
                <Label for="exampleText">
                  Sending virtual currency address:
                </Label>
                <Input
                  id="exampleText"
                  name="starting_sendingAddresses"
                  type="text"
                  value={data.starting_sendingAddresses}
                  onChange={(e) => handleChangeInput(e, e.target.name)}
                />
              </div>
            ))}
          {strRelatedTransactionMsId === 211145 ||
          strRelatedTransactionMsId === 211146 ? (
            <div className="col-6 ">
              <FormGroup>
                <Label for="exampleSelect">STR Direction:</Label>
                <Input
                  id="exampleSelect"
                  name="str_startingOrCompleting_directionMsId"
                  type="select"
                  value={data.str_startingOrCompleting_directionMsId}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "str_startingOrCompleting_directionMsId"
                    )
                  }
                >
                  {getComboData("dsFintrac_StrDirectionMsId_ForCombo").map(
                    (item, inx) => (
                      <option
                        key={inx}
                        value={item.str_startingOrCompleting_directionMsId}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </Input>
              </FormGroup>
            </div>
          ) : null}
          {/* <div className="col-12 mt-3">
            <Label for="exampleText">
              How was the
              {reportTypeMsId === 211106 || strRelatedTransactionMsId === 211106
                ? " Cash "
                : ""}
              {reportTypeMsId === 211014 || strRelatedTransactionMsId === 211014
                ? " Virtual Currency "
                : ""}
              {reportTypeMsId === 211145 ||
              strRelatedTransactionMsId === 211145 ||
              strRelatedTransactionMsId === 211146 ||
              strRelatedTransactionMsId === 211146
                ? " Fund "
                : ""}
              obtained?
            </Label>
            <Input
              id="exampleText"
              name="starting_howWasCashObtained"
              type="textarea"
              rows={3}
              columns={65}
              value={data.starting_howWasCashObtained}
              onChange={(e) => handleChangeInput(e, e.target.name)}
            />
          </div> */}

          <div className="col-6">
            <Label for="exampleSelect">
              How was the
              {reportTypeMsId === 211106 || strRelatedTransactionMsId === 211106
                ? " Cash "
                : ""}
              {reportTypeMsId === 211014 || strRelatedTransactionMsId === 211014
                ? " Virtual Currency "
                : ""}
              {reportTypeMsId === 211145 ||
              strRelatedTransactionMsId === 211145 ||
              strRelatedTransactionMsId === 211146 ||
              strRelatedTransactionMsId === 211146
                ? " Fund "
                : ""}
              obtained?:
            </Label>
            <FormGroup>
              <Input
                id="exampleSelect"
                name="starting_howWasCashObtained"
                type="select"
                value={data.starting_howWasCashObtained}
                onChange={(e) =>
                  handleChangeInput(e, "starting_howWasCashObtained")
                }
              >
                <option key={Math.random()} value={null}>
                  Select an option
                </option>
                {howWasCashObtainedList.map((item, inx) => (
                  <option key={inx} value={item.tblGorooheKalaId}>
                    {item.nameGorooh}
                  </option>
                ))}
              </Input>
            </FormGroup>
            <div className="d-flex w-100">
              <div className="w-75">
                <ButtonFieldInfo
                  key={1}
                  fieldInfo={btnOpen_HowCashObtainedList.props.fieldInfo}
                  externalData={data}
                  getDataFromExternal="true"
                />
              </div>
              <div className="w-25">
                <ButtonFieldInfo
                  key={1}
                  fieldInfo={
                    btnRefresh_PurposeOfTransactionAndHowCashObtainedList.props
                      .fieldInfo
                  }
                  externalData={data}
                  getDataFromExternal="true"
                  onGetDatasource={handleSetHowWasCashObtainedList}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-3">
          <RadioComponent
            fieldTitle={`Was information about the source (person/entity) of
                  ${
                    reportTypeMsId === 211106 ||
                    strRelatedTransactionMsId === 211106
                      ? " Cash "
                      : ""
                  } 
                  ${
                    reportTypeMsId === 211014 ||
                    strRelatedTransactionMsId === 211014
                      ? " Virtual Currency "
                      : ""
                  } 
                  ${
                    reportTypeMsId === 211145 ||
                    strRelatedTransactionMsId === 211145 ||
                    strRelatedTransactionMsId === 211146 ||
                    strRelatedTransactionMsId === 211146
                      ? " Fund "
                      : ""
                  } 
                 
                  obtained?`}
            fieldName={"starting_isSourceOfCashInformationObtained"}
            firstSelectId={"starting_isSourceOfCashInformationObtained1"}
            secondSelectId={"starting_isSourceOfCashInformationObtained2"}
            radioValue={data.starting_isSourceOfCashInformationObtained}
            handleChangeInput={handleChangeInput}
            firstSelectTitle={"Yes"}
            secondSelectTitle={"No"}
          />
          {(reportTypeMsId === 211106 ||
            strRelatedTransactionMsId === 211106) && (
            <RadioComponent
              fieldTitle={
                "Does this action involve a deposit to a business account?"
              }
              fieldName={"starting_isInvolvedDepositToBusinessAccount"}
              firstSelectId={"starting_isInvolvedDepositToBusinessAccount1"}
              secondSelectId={"starting_isInvolvedDepositToBusinessAccount2"}
              radioValue={data.starting_isInvolvedDepositToBusinessAccount}
              handleChangeInput={handleChangeInput}
              firstSelectTitle={"Yes"}
              secondSelectTitle={"No"}
            />
          )}
          {(reportTypeMsId === 211014 ||
            strRelatedTransactionMsId === 211014) && (
            <RadioComponent
              fieldTitle={"Does this action involve a conductor indicator?"}
              fieldName={"starting_conductorIndicator"}
              firstSelectId={"starting_conductorIndicator1"}
              secondSelectId={"starting_conductorIndicator2"}
              radioValue={data.starting_conductorIndicator}
              handleChangeInput={handleChangeInput}
              firstSelectTitle={"Yes"}
              secondSelectTitle={"No"}
            />
          )}
        </div>
        <div className="d-flex flex-column align-items-end mb-5 mt-5">
          <div
            // Here you can manage visibility of source of cash link
            onClick={() => {
              if (
                reportTypeMsId === 211145 ||
                reportTypeMsId === 211146 ||
                strRelatedTransactionMsId === 211145 ||
                strRelatedTransactionMsId === 211146
              ) {
                onShowRequester(true);
              }

              if (data.starting_isSourceOfCashInformationObtained) {
                onShowSourceOfCash(true);
              }

              if (
                data.starting_isSourceOfCashInformationObtained === false ||
                data.starting_isSourceOfCashInformationObtained === "false"
              ) {
                onShowSourceOfCash(false);

                if (
                  data.starting_isInvolvedDepositToBusinessAccount === false ||
                  data.starting_isInvolvedDepositToBusinessAccount === "false"
                ) {
                  onShowInvolvement(false);
                }

                if (
                  reportTypeMsId === 211106 ||
                  reportTypeMsId === 211014 ||
                  reportTypeMsId === 211102
                ) {
                  onShowConductor(true);
                }
              }
            }}
          >
            <ButtonFieldInfo
              key={1}
              fieldInfo={btnTransaction_ActionSave.props.fieldInfo}
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
    </div>
  );
}

export default StartingActionComponent;
