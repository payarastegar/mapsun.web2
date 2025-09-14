import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import TransactionPersonComponent from "../UtilityComponents/TransactionPersonComponent";
import InputField from "../UtilityComponents/InputFieldComponent";
import RadioComponent from "../UtilityComponents/RadioComponent";

function ConductorComponent({
  dataSource,
  props,
  tblTransactionId,
  tblTransaction_ActionId,
  reportTypeMsId,
  onShowConductor,
  onShowOnbehalfof_Requester,
  onShowAccountHolder_Requester,
  onShowCompletingAction,
}) {
  const [data, setData] = useState({});

  useEffect(function() {
    onShowConductor(true);
    if (!dataSource) {
      setData({
        tblPersonId: undefined,
        tblTransactionId,
        tblTransaction_ActionId,
        actionPersonTypeMsId: 208001 /* conductor */,
        hasOnBehalfOf: false,
        virtualConductor_clientOfReportingEntityIndicator:
          reportTypeMsId === 211014 ? false : null,
        virtualConductor_typeOfDeviceMsId:
          reportTypeMsId === 211014 ? "" : null,
        virtualConductor_typeOfDevice_Text_OnOther:
          reportTypeMsId === 211014 ? "" : null,
        virtualConductor_deviceIdentifierNumber:
          reportTypeMsId === 211014 ? "" : null,
        virtualConductor_internetProtocolAddress:
          reportTypeMsId === 211014 ? "" : null,
        virtualConductor_dateTimeOfOnlineSession_Text:
          reportTypeMsId === 211014 ? "" : null,
        virtualConductor_tblTimezoneId_OnlineSession:
          reportTypeMsId === 211014 ? "" : null,
        virtualConductor_onBehalfOfIndicator:
          reportTypeMsId === 211014 ? false : null,
        account_hasAccountHolder: false,
      });
    } else {
      setData({ ...dataSource });
    }
  }, []);

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

  function handleChangeInput(e, targetName) {
    if (e === undefined) return;
    if (targetName === "starting_sendingAddresses") {
      setData((data) => ({
        ...data,
        starting_sendingAddresses: [e.target.value],
      }));
      return;
    }
    if (targetName === "startingOrCompleting_amount") {
      setData((data) => ({
        ...data,
        startingOrCompleting_amount: e,
      }));
    } else if (targetName !== "startingOrCompleting_amount") {
      setData((data) => ({ ...data, [targetName]: e.target.value }));
    } else return;
  }

  return (
    <div className="col-9">
      <h2>Conductor</h2>
      <h5 style={{ color: "#5FBDFF" }}>
        Information about subject conducting the transaction
      </h5>
      <div>
        <TransactionPersonComponent
          dataSource={data}
          tblTransactionId={tblTransactionId}
          tblTransaction_ActionId={tblTransaction_ActionId}
          props={props}
          handleSetData={(data) => setData(data)}
        />

        <div className="row mt-3 ">
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
          {reportTypeMsId === 211014 && (
            <RadioComponent
              fieldTitle={"Client of reporting entity"}
              fieldName={"virtualConductor_clientOfReportingEntityIndicator"}
              firstSelectId={
                "virtualConductor_clientOfReportingEntityIndicator1"
              }
              secondSelectId={
                "virtualConductor_clientOfReportingEntityIndicator2"
              }
              radioValue={
                data.virtualConductor_clientOfReportingEntityIndicator
              }
              handleChangeInput={handleChangeInput}
              firstSelectTitle={"Yes"}
              secondSelectTitle={"No"}
            />
          )}
          {reportTypeMsId === 211014 && (
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect">Type of device:</Label>
                <Input
                  id="exampleSelect"
                  name="virtualConductor_typeOfDeviceMsId"
                  type="select"
                  value={data.virtualConductor_typeOfDeviceMsId}
                  onChange={(e) =>
                    handleChangeInput(e, "virtualConductor_typeOfDeviceMsId")
                  }
                >
                  {getComboData(
                    "dsFintrac_Transaction_Action_Person_TypeOfDeviceMsId_ForCombo"
                  ).map((item, inx) => (
                    <option key={inx} value={item.strDirectionMsId}>
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
          )}
          {reportTypeMsId === 211014 &&
          data.virtualConductor_typeOfDeviceMsId == 231004 ? (
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect">Other type of device:</Label>
                <Input
                  id="exampleSelect"
                  name="virtualConductor_typeOfDevice_Text_OnOther"
                  type="text"
                  value={data.virtualConductor_typeOfDevice_Text_OnOther}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "virtualConductor_typeOfDevice_Text_OnOther"
                    )
                  }
                >
                  {getComboData(
                    "dsFintrac_LocationCwr_LocationList_ForCombo"
                  ).map((item, inx) => (
                    <option
                      key={inx}
                      value={item.virtualConductor_typeOfDevice_Text_OnOther}
                    >
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
          ) : (
            <div className="col-6" />
          )}
          {reportTypeMsId === 211014 && (
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect">Device identifier number:</Label>
                <Input
                  id="exampleSelect"
                  name="virtualConductor_deviceIdentifierNumber"
                  type="text"
                  value={data.virtualConductor_deviceIdentifierNumber}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "virtualConductor_deviceIdentifierNumber"
                    )
                  }
                />
              </FormGroup>
            </div>
          )}
          {reportTypeMsId === 211014 && (
            <div className="col-6">
              <FormGroup>
                <Label for="exampleSelect">Internet protocol address:</Label>
                <Input
                  id="exampleSelect"
                  name="virtualConductor_internetProtocolAddress"
                  type="text"
                  value={data.virtualConductor_internetProtocolAddress}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "virtualConductor_internetProtocolAddress"
                    )
                  }
                />
              </FormGroup>
            </div>
          )}
          {reportTypeMsId === 211014 && (
            <div className="col-6 padding-right-0">
              <InputField
                lableTxt="Date time of online session:"
                type={"datetime-local"}
                name={"virtualConductor_dateTimeOfOnlineSession_Text"}
                value={data.virtualConductor_dateTimeOfOnlineSession_Text}
                handleChangeInput={(e) =>
                  handleChangeInput(
                    e,
                    "virtualConductor_dateTimeOfOnlineSession_Text"
                  )
                }
                max="9999-12-31T23:59"
              />
            </div>
          )}
          {reportTypeMsId === 211014 && (
            <div className="col-6 ">
              <FormGroup>
                <Label for="exampleSelect">Time zone of online session:</Label>
                <Input
                  id="exampleSelect"
                  name="virtualConductor_tblTimezoneId_OnlineSession"
                  type="select"
                  value={data.virtualConductor_tblTimezoneId_OnlineSession}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "virtualConductor_tblTimezoneId_OnlineSession"
                    )
                  }
                >
                  {getComboData("dsFintrac_Timezone_TimezoneList_ForCombo").map(
                    (item, inx) => (
                      <option key={inx} value={item.tblTimezoneId}>
                        {item.name}
                      </option>
                    )
                  )}
                </Input>
              </FormGroup>
            </div>
          )}
        </div>

        <div
          className="d-flex flex-column align-items-end mb-5 mt-5"
          // onClick={handleGetEvent}
        >
          <div
            onClick={() => {
              if (
                data.hasOnBehalfOf === true ||
                data.hasOnBehalfOf === "true"
              ) {
                onShowOnbehalfof_Requester(true);
              } else {
                onShowOnbehalfof_Requester(false);
              }

              if (
                data.account_hasAccountHolder === true ||
                data.account_hasAccountHolder === "true"
              ) {
                onShowAccountHolder_Requester(true);
              } else {
                onShowAccountHolder_Requester(false);
              }

              if (
                (data.hasOnBehalfOf === false ||
                  data.hasOnBehalfOf === "false") &&
                (data.account_hasAccountHolder === false ||
                  data.account_hasAccountHolder === "false")
              ) {
                onShowCompletingAction(true);
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
    </div>
  );
}

export default ConductorComponent;
