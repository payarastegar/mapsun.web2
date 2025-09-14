import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import { v4 as uuidv4 } from "uuid";
import "bootstrap-icons/font/bootstrap-icons.css";

import InputField from "../UtilityComponents/InputFieldComponent";
import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import MandatoryIndicator from "../UtilityComponents/MandatoryIndicator";
import RadioComponent from "../UtilityComponents/RadioComponent";
import ButtonFieldInfo_Core from "../../ButtonFieldInfo/ButtonFieldInfo_Core";

function TransactionComponent({
  dataSource,
  props,
  reportTypeMsId,
  onShowInitiator,
  onShowStartingAction,
  onChangeStrRelatedTransaction,
  onShowError,
  onShowRequester,
}) {
  const [data, setData] = useState({});
  // const [submitedRepotType, setSubmitedReportType] = useState(211145);

  const [startingActionIndicator, setStartingActionIndicator] = useState(false);
  const [purposeOfTransactionsList, setPurposeOfTransactionList] = useState([]);

  useEffect(function() {
    if (!dataSource.tblTransactionId) {
      setData({
        methodOfTransactionMsId: reportTypeMsId === 211106 ? 205003 : null,
        methodOfVirtualTransactionMsId:
          reportTypeMsId === 211014 ? 205001 : null,
        tblLocationCashWasReceivedId:
          reportTypeMsId === 211106 ? 10000001 : null,
        methodOfTransaction_Text_OnOther: null,
        tblTimezoneId: 1,
        thresholdIndicator: reportTypeMsId === 211102 ? null : false,
        dateAndTimeOfTransaction_Text: "",
        eftTypeMsId:
          reportTypeMsId === 211106 || reportTypeMsId === 211014
            ? null
            : 215002,
        initiatorAndReceiverIndicator: reportTypeMsId === 211106 ? null : false,
        regulatoryExceptionIndicator: reportTypeMsId === 211106 ? null : false,
        additionalPartiesSendingIndicator:
          reportTypeMsId === 211106 ? null : true,
        additionalPartiesEffectingSwiftIndicator:
          reportTypeMsId === 211106 ? null : false,
        idOfVirtualTransaction: reportTypeMsId === 211014 ? "" : null,
        attemptedTransactionIndicator: reportTypeMsId === 211102 ? false : null,
        tblTransaction_ReportId_relatedReport:
          reportTypeMsId === 211102 ? undefined : null,
        descriptionOfSuspiciousActivity: reportTypeMsId === 211102 ? "" : null,
        suspicionTypeMsId: reportTypeMsId === 211102 ? 224001 : null,
        publicPrivatePartnershipProjectNameMsId:
          reportTypeMsId === 211102 ? 225001 : null,
        politicallyExposedPersonIncludedIndicator:
          reportTypeMsId === 211102 ? false : null,
        actionTakenDescription: reportTypeMsId === 211102 ? "" : null,
        reasonNotCompleted: reportTypeMsId === 211102 ? "" : null,
        reportTypeMsId_relatedTransaction:
          reportTypeMsId === 211102 ? 211146 : null,
        fundsReceivedOrInitiatedWithinInstitutionIndicator:
          reportTypeMsId === 211145 || reportTypeMsId === 211146 ? false : null,
        requesterClientStatusMsId:
          reportTypeMsId === 211145 || reportTypeMsId === 211146
            ? 232001
            : null,
        beneficiaryClientStatusMsId:
          reportTypeMsId === 211145 || reportTypeMsId === 211146
            ? 232001
            : null,
        fundsOriginatingOutsideCanadaIndicator:
          reportTypeMsId === 211145 || reportTypeMsId === 211146 ? "" : null,
        additionalPaymentInformationsTagMsId:
          reportTypeMsId === 211145 || reportTypeMsId === 211146
            ? 233003
            : null,
        additionalPaymentInformationsRawValue:
          reportTypeMsId === 211145 || reportTypeMsId === 211146 ? "" : null,
        purposeOfTransaction: "0",
      });

      btnSaveTransaction.props.fieldInfo._parentFieldInfo._paramList.formParams = {
        ...btnSaveTransaction.props.fieldInfo._parentFieldInfo._paramList
          .formParams,
        transactionUid_Text: uuidv4(),
      };
    } else {
      setData(dataSource);
      if (
        reportTypeMsId === 211145 ||
        reportTypeMsId === 211146 ||
        reportTypeMsId === 211102 ||
        dataSource.strRelatedTransactionMsId === 211145 ||
        dataSource.strRelatedTransactionMsId === 211146
      ) {
        if (
          dataSource.initiatorAndReceiverIndicator === true ||
          dataSource.initiatorAndReceiverIndicator === "true"
        ) {
          onShowInitiator(true);
        }
      } else {
        onShowInitiator(false);
      }

      if (dataSource.tblTransactionId) {
        if (
          reportTypeMsId === 211102 &&
          (dataSource.attemptedTransactionIndicator === true ||
            dataSource.attemptedTransactionIndicator === "true")
        ) {
          if (dataSource.reportTypeMsId_relatedTransaction === 111111)
            onShowStartingAction(false);
          if (dataSource.reportTypeMsId_relatedTransaction !== 111111)
            onShowStartingAction(true);
        } else if (
          reportTypeMsId === 211102 &&
          (dataSource.attemptedTransactionIndicator === false ||
            dataSource.attemptedTransactionIndicator === "false")
        ) {
          onShowStartingAction(false);
        } else {
          // onShowStartingAction(true);
        }
      }
    }

    setPurposeOfTransactionList(
      getComboData(
        "dsFintrac_GorooheKala_ListeGoroohha_Simple_ListOfPurposeOfTransaction"
      )
    );
  }, []);

  useEffect(
    function() {
      if (
        reportTypeMsId === 211102 &&
        (data.attemptedTransactionIndicator === true ||
          data.attemptedTransactionIndicator === "true")
      ) {
        if (
          data.reportTypeMsId_relatedTransaction === 111111 ||
          data.reportTypeMsId_relatedTransaction === "111111"
        )
          setStartingActionIndicator(false);
        else {
          setStartingActionIndicator(true);
        }
      } else if (
        reportTypeMsId === 211102 &&
        (data.attemptedTransactionIndicator === false ||
          data.attemptedTransactionIndicator === "false")
      ) {
        setStartingActionIndicator(false);
      }
    },
    [data.reportTypeMsId_relatedTransaction, data.attemptedTransactionIndicator]
  );

  function handleChangeInput(e, targetName) {
    if (targetName === "tblTransaction_ReportId_relatedReport") {
      setData((data) => ({ ...data, [targetName]: +e.target.value }));
      return;
    }

    if (
      reportTypeMsId === 211102 &&
      targetName === "reportTypeMsId_relatedTransaction"
    ) {
      setData((data) => ({ ...data, [targetName]: +e.target.value }));
      onChangeStrRelatedTransaction(e.target.value);

      return;
    }

    setData((data) => ({ ...data, [targetName]: e.target.value }));

    onShowError(true);
  }

  const btnSaveTransaction =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnTransactionSave;

  const btnOpen_PurposeOfTransactionList =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnOpen_PurposeOfTransactionList;

  const btnRefresh_PurposeOfTransactionAndHowCashObtainedList =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnRefresh_PurposeOfTransactionAndHowCashObtainedList;

  function getComboData(dsName) {
    let ds = props.fieldInfo.getDataSource(dsName).dataArray;

    return ds;
  }

  function handleSetPurposeOfTransactionList() {
    setPurposeOfTransactionList((prev) =>
      getComboData(
        "dsFintrac_GorooheKala_ListeGoroohha_Simple_ListOfPurposeOfTransaction"
      )
    );
  }

  return (
    <div className="col-9">
      <h2>Transaction</h2>
      <h5 style={{ color: "#5FBDFF" }}>Information about the transaction</h5>

      <div>
        <div className="row">
          <InputField
            lableTxt="Reporting entity report reference number(auto generate):"
            maxWidth={"70%"}
            type={"text"}
            className={"mb-2 col-8"}
            value={data.reportingEntity_TransactionReferenceNumber}
            name={"reportingEntity_TransactionReferenceNumber"}
            disabled={true}
            onChange={(e) =>
              handleChangeInput(e, "reportingEntity_TransactionReferenceNumber")
            }
          />
        </div>
        <div className="row">
          {reportTypeMsId === 211102 ? (
            <>
              <RadioComponent
                fieldTitle={"Attempted transaction indicator"}
                fieldName={"attemptedTransactionIndicator"}
                firstSelectId={"attemptedTransactionIndicator1"}
                secondSelectId={"attemptedTransactionIndicator2"}
                radioValue={data.attemptedTransactionIndicator}
                handleChangeInput={handleChangeInput}
                firstSelectTitle={"Attempted"}
                secondSelectTitle={"Compeleted"}
              />
              <RadioComponent
                fieldTitle={"Politically exposed person indicator:"}
                fieldName={"politicallyExposedPersonIncludedIndicator"}
                firstSelectId={"politicallyExposedPersonIncludedIndicator1"}
                secondSelectId={"politicallyExposedPersonIncludedIndicator2"}
                radioValue={data.politicallyExposedPersonIncludedIndicator}
                handleChangeInput={handleChangeInput}
                firstSelectTitle={"Yes"}
                secondSelectTitle={"No"}
              />
              <div className="col-6 mt-3">
                <Label for="selectTransaction">Select transaction type:</Label>
                <Input
                  type="select"
                  name="reportTypeMsId_relatedTransaction"
                  // value={data.reportTypeMsId_relatedTransaction}
                  value={
                    data.reportTypeMsId_relatedTransaction === undefined
                      ? 211145
                      : data.reportTypeMsId_relatedTransaction
                  }
                  id="reportTypeMsId_relatedTransaction"
                  onChange={(e) =>
                    handleChangeInput(e, "reportTypeMsId_relatedTransaction")
                  }
                >
                  <option value={211145}>EFTI</option>
                  <option value={211146}>EFTO</option>
                  <option value={211106}>LCTR</option>
                  <option value={211014}>LVCTR</option>
                  {data.attemptedTransactionIndicator === true ||
                  data.attemptedTransactionIndicator == "true" ? (
                    <option value={111111}>Unknown</option>
                  ) : null}
                </Input>
              </div>

              {data.attemptedTransactionIndicator === true ||
              data.attemptedTransactionIndicator == "true" ? null : (
                <div className="col-6 mt-3">
                  <FormGroup>
                    <Label for="exampleSelect">Select related report:</Label>
                    <Input
                      id="exampleSelect"
                      name="tblTransaction_ReportId_relatedReport"
                      type="select"
                      value={data.tblTransaction_ReportId_relatedReport}
                      onChange={(e) =>
                        handleChangeInput(
                          e,
                          "tblTransaction_ReportId_relatedReport"
                        )
                      }
                    >
                      {getComboData(
                        "dsFintrac_Transaction_SubmittedTransactionList_ForCombo"
                      )
                        .filter((item) => {
                          if (
                            data.reportTypeMsId_relatedTransaction === undefined
                          ) {
                            return item.reportTypeMsId == 211145;
                          } else {
                            return (
                              item.tblTransaction_ReportId == 99000000 ||
                              item.reportTypeMsId ==
                                data.reportTypeMsId_relatedTransaction
                            );
                          }
                        })
                        .map((item, inx) => (
                          <option
                            key={inx}
                            value={item.tblTransaction_ReportId}
                          >
                            {item.reportReferenceNumber}
                          </option>
                        ))}
                    </Input>
                  </FormGroup>
                </div>
              )}
            </>
          ) : (
            <>
              <RadioComponent
                fieldTitle={"Threshold indicator"}
                fieldName={"thresholdIndicator"}
                firstSelectId={"thresholdIndicator1"}
                secondSelectId={"thresholdIndicator2"}
                radioValue={data.thresholdIndicator}
                handleChangeInput={handleChangeInput}
                firstSelectTitle={"Yes"}
                secondSelectTitle={"No"}
              />
            </>
          )}

          {(reportTypeMsId === 211014 ||
            (reportTypeMsId === 211102 &&
              data.attemptedTransactionIndicator == "true" &&
              data.reportTypeMsId_relatedTransaction == 211014)) && (
            <div className="col-6 mt-3">
              <FormGroup>
                <Label for="exampleSelect">Id of virtual transaction:</Label>
                <Input
                  id="exampleSelect"
                  name="idOfVirtualTransaction"
                  type="text"
                  value={data.idOfVirtualTransaction}
                  onChange={(e) =>
                    handleChangeInput(e, "idOfVirtualTransaction")
                  }
                />
              </FormGroup>
            </div>
          )}

          {(reportTypeMsId === 211145 ||
            reportTypeMsId === 211146 ||
            (reportTypeMsId === 211102 &&
              (data.attemptedTransactionIndicator === "true" ||
                data.attemptedTransactionIndicator === true) &&
              (data.reportTypeMsId_relatedTransaction === undefined ||
                data.reportTypeMsId_relatedTransaction === 211145 ||
                data.reportTypeMsId_relatedTransaction === 211146 ||
                data.reportTypeMsId_relatedTransaction === "211145" ||
                data.reportTypeMsId_relatedTransaction === "211146"))) && (
            <div className="col-6 mt-3">
              <FormGroup>
                <Label for="exampleSelect">EFT Type:</Label>
                <Input
                  id="exampleSelect"
                  name="eftTypeMsId"
                  type="select"
                  value={data.eftTypeMsId}
                  onChange={(e) => handleChangeInput(e, "eftTypeMsId")}
                >
                  {getComboData(
                    "dsFintrac_Transaction_EftTypeMsId_ForCombo"
                  ).map((item, inx) => (
                    <option key={inx} value={item.eftTypeMsId}>
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
          )}
        </div>
        {(reportTypeMsId !== 211102 ||
          (reportTypeMsId === 211102 &&
            data.attemptedTransactionIndicator == "true")) && (
          <div className="row">
            <div className="col-6">
              <Label for="exampleSelect">Purpose of transaction:</Label>
              <FormGroup>
                <Input
                  id="exampleSelect"
                  name="purposeOfTransaction"
                  type="select"
                  value={data.purposeOfTransaction}
                  onChange={(e) => handleChangeInput(e, "purposeOfTransaction")}
                >
                  <option key={1} value="0">
                    Select an option
                  </option>

                  {purposeOfTransactionsList.map((item, inx) => (
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
                    fieldInfo={btnOpen_PurposeOfTransactionList.props.fieldInfo}
                    externalData={data}
                    getDataFromExternal="true"
                  />
                </div>
                <div className="w-25">
                  <ButtonFieldInfo
                    key={1}
                    fieldInfo={
                      btnRefresh_PurposeOfTransactionAndHowCashObtainedList
                        .props.fieldInfo
                    }
                    // externalData={data}
                    // getDataFromExternal="true"
                    onGetDatasource={handleSetPurposeOfTransactionList}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        {(reportTypeMsId === 211106 || reportTypeMsId === 211102) &&
          (data.attemptedTransactionIndicator == "true" &&
            data.reportTypeMsId_relatedTransaction == 211106) && (
            <div className="row mt-3">
              <div className="col-6">
                <FormGroup>
                  <Label for="exampleSelect">Method of transaction:</Label>
                  <Input
                    id="exampleSelect"
                    name="methodOfTransactionMsId"
                    type="select"
                    value={data.methodOfTransactionMsId}
                    onChange={(e) =>
                      handleChangeInput(e, "methodOfTransactionMsId")
                    }
                  >
                    {getComboData(
                      "dsFintrac_Transaction_MethodOfTransactionMsId_ForCombo"
                    ).map((item, inx) => (
                      <option key={inx} value={item.methodOfTransactionMsId}>
                        {item.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
              <div className="col-6">
                <FormGroup>
                  <Label for="exampleSelect">Location cash was received:</Label>
                  <Input
                    id="exampleSelect"
                    name="tblLocationCashWasReceivedId"
                    type="select"
                    value={data.tblLocationCashWasReceivedId}
                    onChange={(e) =>
                      handleChangeInput(e, "tblLocationCashWasReceivedId")
                    }
                  >
                    {getComboData(
                      "dsFintrac_LocationCwr_LocationList_ForCombo"
                    ).map((item, inx) => (
                      <option
                        key={inx}
                        value={item.tblLocationCashWasReceivedId}
                      >
                        {item.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
              {data.methodOfTransactionMsId == 205007 && (
                <div className="col-6">
                  <FormGroup>
                    <Label for="exampleSelect">
                      Other method of transaction:
                    </Label>
                    <Input
                      id="exampleSelect"
                      name="methodOfTransaction_Text_OnOther"
                      type="text"
                      value={data.methodOfTransaction_Text_OnOther}
                      onChange={(e) =>
                        handleChangeInput(e, "methodOfTransaction_Text_OnOther")
                      }
                    />
                  </FormGroup>
                </div>
              )}
            </div>
          )}
        {true && (
          <>
            <div className="row mt-3">
              <div className="col-6 padding-right-0">
                <InputField
                  lableTxt="Date and time of transaction:"
                  type={"datetime-local"}
                  name={"dateAndTimeOfTransaction_Text"}
                  isMandatory={false}
                  value={data.dateAndTimeOfTransaction_Text}
                  handleChangeInput={(e) =>
                    handleChangeInput(e, "dateAndTimeOfTransaction_Text")
                  }
                  max="9999-12-31T23:59"
                />
              </div>
              <div className="col-6 ">
                <FormGroup>
                  <Label for="exampleSelect">Time zone of transaction:</Label>
                  <Input
                    id="exampleSelect"
                    name="tblTimezoneId"
                    type="select"
                    value={data.tblTimezoneId}
                    onChange={(e) => handleChangeInput(e, "tblTimezoneId")}
                  >
                    {getComboData(
                      "dsFintrac_Timezone_TimezoneList_ForCombo"
                    ).map((item, inx) => (
                      <option key={inx} value={item.tblTimezoneId}>
                        {item.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
            </div>
          </>
        )}
        {(reportTypeMsId === 211145 ||
          reportTypeMsId === 211146 ||
          (reportTypeMsId === 211102 &&
            (data.attemptedTransactionIndicator === "true" ||
              data.attemptedTransactionIndicator === true) &&
            (data.reportTypeMsId_relatedTransaction === undefined ||
              data.reportTypeMsId_relatedTransaction === 211145 ||
              data.reportTypeMsId_relatedTransaction === 211146))) && (
          <div className="row mt-3">
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect">Requester client status:</Label>
                <Input
                  id="exampleSelect"
                  name="requesterClientStatusMsId"
                  type="select"
                  value={data.requesterClientStatusMsId}
                  onChange={(e) =>
                    handleChangeInput(e, "requesterClientStatusMsId")
                  }
                >
                  {getComboData(
                    "dsFintrac_Transaction_ClientStatusMsId_ForCombo"
                  ).map((item) => (
                    <option
                      key={item.requesterClientStatusMsId}
                      value={item.clientStatusMsId}
                    >
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect">Beneficiary client status:</Label>
                <Input
                  id="exampleSelect"
                  name="beneficiaryClientStatusMsId"
                  type="select"
                  value={data.beneficiaryClientStatusMsId}
                  onChange={(e) =>
                    handleChangeInput(e, "beneficiaryClientStatusMsId")
                  }
                >
                  {getComboData(
                    "dsFintrac_Transaction_ClientStatusMsId_ForCombo"
                  ).map((item) => (
                    <option
                      key={item.beneficiaryClientStatusMsId}
                      value={item.clientStatusMsId}
                    >
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect">
                  Additional payment information tag:
                </Label>
                <Input
                  id="exampleSelect"
                  name="additionalPaymentInformationsTagMsId"
                  type="select"
                  value={data.additionalPaymentInformationsTagMsId}
                  onChange={(e) =>
                    handleChangeInput(e, "additionalPaymentInformationsTagMsId")
                  }
                >
                  {getComboData(
                    "dsFintrac_Transaction_PaymentInformationTagMsId_ForCombo"
                  ).map((item) => (
                    <option
                      key={item.additionalPaymentInformationsTagMsId}
                      value={item.paymentInformationTagMsId}
                    >
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect222">
                  Additional payment information raw value:
                </Label>
                <Input
                  id="exampleSelect222"
                  name="additionalPaymentInformationsRawValue"
                  type="text"
                  value={data.additionalPaymentInformationsRawValue}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "additionalPaymentInformationsRawValue"
                    )
                  }
                />
              </FormGroup>
            </div>
          </div>
        )}

        {(reportTypeMsId === 211014 ||
          (reportTypeMsId === 211102 &&
            data.attemptedTransactionIndicator == "true" &&
            data.reportTypeMsId_relatedTransaction == 211014)) && (
          <div className="row mt-3">
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect">
                  Method of virtual currency transaction:
                </Label>
                <Input
                  id="exampleSelect"
                  name="methodOfVirtualTransactionMsId"
                  type="select"
                  value={data.methodOfVirtualTransactionMsId}
                  onChange={(e) =>
                    handleChangeInput(e, "methodOfVirtualTransactionMsId")
                  }
                >
                  {getComboData(
                    "dsFintrac_Transaction_MethodOfVirtualTransactionMsId_ForCombo"
                  ).map((item, inx) => (
                    <option
                      key={inx}
                      value={item.methodOfVirtualTransactionMsId}
                    >
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
            {data.methodOfVirtualTransactionMsId == 205007 && (
              <div className="col-6">
                <FormGroup>
                  <Label for="exampleSelect">
                    Other method of virtual currency transaction:
                  </Label>
                  <Input
                    id="exampleSelect"
                    name="methodOfTransaction_Text_OnOther"
                    type="text"
                    value={data.methodOfTransaction_Text_OnOther}
                    onChange={(e) =>
                      handleChangeInput(e, "methodOfTransaction_Text_OnOther")
                    }
                  >
                    {getComboData(
                      "dsFintrac_LocationCwr_LocationList_ForCombo"
                    ).map((item, inx) => (
                      <option
                        key={inx}
                        value={item.methodOfTransaction_Text_OnOther}
                      >
                        {item.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
            )}
          </div>
        )}
        {reportTypeMsId === 211102 ? (
          <>
            <div className="row mt-3">
              <div className="col-6">
                <FormGroup>
                  <Label for="exampleSelect">Suspicion type:</Label>
                  <Input
                    id="exampleSelect"
                    name="suspicionTypeMsId"
                    type="select"
                    value={data.suspicionTypeMsId}
                    onChange={(e) => handleChangeInput(e, "suspicionTypeMsId")}
                  >
                    {getComboData("dsFintrac_SuspicionTypeMsId_ForCombo").map(
                      (item) => (
                        <option
                          key={item.suspicionTypeMsId}
                          value={item.suspicionTypeMsId}
                        >
                          {item.name}
                        </option>
                      )
                    )}
                  </Input>
                </FormGroup>
              </div>
              <div className="col-6">
                <FormGroup>
                  <Label for="exampleSelect">
                    Public or private partnership project name:
                  </Label>
                  <Input
                    id="exampleSelect"
                    name="publicPrivatePartnershipProjectNameMsId"
                    type="select"
                    value={data.publicPrivatePartnershipProjectNameMsId}
                    onChange={(e) =>
                      handleChangeInput(
                        e,
                        "publicPrivatePartnershipProjectNameMsId"
                      )
                    }
                  >
                    {getComboData(
                      "dsFintrac_PublicPrivatePartnershipProjectNameMsId_ForCombo"
                    ).map((item) => (
                      <option
                        key={item.publicPrivatePartnershipProjectNameMsId}
                        value={item.publicPrivatePartnershipProjectNameMsId}
                      >
                        {item.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
              </div>
              <div className="col-12">
                <Label for="exampleText">
                  Description of suspicious activity:
                </Label>
                <Input
                  id="exampleText"
                  name="descriptionOfSuspiciousActivity"
                  type="textarea"
                  rows={3}
                  columns={65}
                  value={data.descriptionOfSuspiciousActivity}
                  onChange={(e) => handleChangeInput(e, e.target.name)}
                />
              </div>
              <div className="col-12 mt-3">
                <Label for="exampleText">Action taken description:</Label>
                <Input
                  id="exampleText"
                  name="actionTakenDescription"
                  type="textarea"
                  rows={3}
                  columns={65}
                  value={data.actionTakenDescription}
                  onChange={(e) => handleChangeInput(e, e.target.name)}
                />
              </div>
              {(data.attemptedTransactionIndicator === true ||
                data.attemptedTransactionIndicator === "true") && (
                <div className="col-12 mt-3">
                  <Label for="exampleText">Reason not compeleted:</Label>
                  <Input
                    id="exampleText"
                    name="reasonNotCompleted"
                    type="textarea"
                    rows={3}
                    columns={65}
                    value={data.reasonNotCompleted}
                    onChange={(e) => handleChangeInput(e, e.target.name)}
                  />
                </div>
              )}
            </div>
          </>
        ) : null}
        {data.methodOfTransactionMsId === 205007 && (
          <div className="row mt-3">
            <div className="col-12">
              <Label for="exampleText">If 'Other', please specify:</Label>
              <Input
                id="exampleText"
                name="methodOfTransaction_Text_OnOther"
                type="textarea"
                rows={3}
                columns={65}
                value={data.methodOfTransaction_Text_OnOther}
                onChange={(e) => handleChangeInput(e, e.target.name)}
              />
            </div>
          </div>
        )}
        <div className="row">
          {(reportTypeMsId === 211145 ||
            reportTypeMsId === 211146 ||
            (reportTypeMsId === 211102 &&
              (data.attemptedTransactionIndicator === "true" ||
                data.attemptedTransactionIndicator === true) &&
              (data.reportTypeMsId_relatedTransaction === undefined ||
                data.reportTypeMsId_relatedTransaction == 211145 ||
                data.reportTypeMsId_relatedTransaction == 211146))) && (
            <>
              <RadioComponent
                fieldTitle={"Regulatory exception indicator:"}
                fieldName={"regulatoryExceptionIndicator"}
                firstSelectId={"regulatoryExceptionIndicator1"}
                secondSelectId={"regulatoryExceptionIndicator2"}
                radioValue={data.regulatoryExceptionIndicator}
                handleChangeInput={handleChangeInput}
                firstSelectTitle={"Yes"}
                secondSelectTitle={"No"}
              />
              <RadioComponent
                fieldTitle={"Additional parties sending indicator:"}
                fieldName={"additionalPartiesSendingIndicator"}
                firstSelectId={"additionalPartiesSendingIndicator1"}
                secondSelectId={"additionalPartiesSendingIndicator2"}
                radioValue={data.additionalPartiesSendingIndicator}
                handleChangeInput={handleChangeInput}
                firstSelectTitle={"Yes"}
                secondSelectTitle={"No"}
              />
              <RadioComponent
                fieldTitle={"Additional parties effecting swift indicator:"}
                fieldName={"additionalPartiesEffectingSwiftIndicator"}
                firstSelectId={"additionalPartiesEffectingSwiftIndicator1"}
                secondSelectId={"additionalPartiesEffectingSwiftIndicator2"}
                radioValue={data.additionalPartiesEffectingSwiftIndicator}
                handleChangeInput={handleChangeInput}
                firstSelectTitle={"Yes"}
                secondSelectTitle={"No"}
              />
              <RadioComponent
                fieldTitle={"Funds Received Or Initiated Within Institution:"}
                fieldName={"fundsReceivedOrInitiatedWithinInstitutionIndicator"}
                firstSelectId={
                  "fundsReceivedOrInitiatedWithinInstitutionIndicator1"
                }
                secondSelectId={
                  "fundsReceivedOrInitiatedWithinInstitutionIndicator2"
                }
                radioValue={
                  data.fundsReceivedOrInitiatedWithinInstitutionIndicator
                }
                handleChangeInput={handleChangeInput}
                firstSelectTitle={"Yes"}
                secondSelectTitle={"No"}
              />
            </>
          )}
        </div>

        <div className="d-flex flex-column align-items-end mb-5 mt-5">
          <div
            onClick={() => {
              if (
                data.initiatorAndReceiverIndicator === true ||
                data.initiatorAndReceiverIndicator === "true"
              ) {
                onShowInitiator(true);
                onShowStartingAction(false);
                onShowError(false);

                return;
              }
              if (
                data.initiatorAndReceiverIndicator === false ||
                data.initiatorAndReceiverIndicator === "false"
              ) {
                onShowInitiator(false);
              }

              if (reportTypeMsId === 211102) {
                if (startingActionIndicator) {
                  onShowStartingAction(true);
                } else {
                  onShowInitiator(false);
                  onShowStartingAction(false);
                  setData((data) => ({
                    ...data,
                    initiatorAndReceiverIndicator: false,
                  }));
                }
              }

              if (reportTypeMsId !== 211102) onShowStartingAction(true);

              onShowError(false);
            }}
          >
            <ButtonFieldInfo
              key={1}
              fieldInfo={btnSaveTransaction.props.fieldInfo}
              externalData={data}
              getDataFromExternal="true"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionComponent;
