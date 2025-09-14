import InputField from "../UtilityComponents/InputFieldComponent";
import TransactionPersonComponent from "../UtilityComponents/TransactionPersonComponent";
import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import MandatoryIndicator from "../UtilityComponents/MandatoryIndicator";
import "bootstrap-icons/font/bootstrap-icons.css";

function SenderRecieverComponent({
  dataSource,
  props,
  tblTransactionId,
  tblTransaction_ActionId,
  reportTypeMsId,
  sender,
  reciever,
  onShowReciever,
  onShowSender,
  onShowCompletingAction,
}) {
  const [data, setData] = useState({});

  useEffect(function() {
    if (!dataSource) {
      setData({
        tblPersonId: undefined,
        tblTransactionId,
        tblTransaction_ActionId,
        actionPersonTypeMsId: !!sender
          ? 208009 /* Sender */
          : 208010 /* Reciever */,
        tblLocationCashWasReceivedId:
          (!sender && reportTypeMsId == 211145) ||
          (sender && reportTypeMsId == 211146)
            ? 10000001
            : null,
        eftActivityIdentificationNumber: "",
        relationshipWithInitiatorMsId:
          sender && reportTypeMsId == 211146 ? 216017 : null,
        relationshipWithInitiator_Text_Other: "",
        relationshipWithReceiverMsId:
          sender && reportTypeMsId == 211145 ? 216017 : null,
        relationshipWithReceiver_Text_Other: "",
        account_hasAccountHolder: false,
      });
    } else {
      setData(dataSource);
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
      <h2>{!!sender ? "Sender" : "Reciever"}</h2>
      <h5 style={{ color: "#5FBDFF" }}>
        Information about the {!!sender ? " Sender" : " Reciever"}
      </h5>
      {sender && reportTypeMsId == 211146 && (
        <div style={{ maxWidth: "95%" }}>
          <FormGroup>
            <Label for="exampleSelect">
              Relationship with initiator: Select the value to indicate the
              relationship of the sender to the person or entity initiating the
              transaction.
            </Label>
            <Input
              id="exampleSelect"
              name="select"
              type="select"
              value={data.relationshipWithInitiatorMsId}
              onChange={(e) =>
                handleChangeInput(e, "relationshipWithInitiatorMsId")
              }
              list="person"
            >
              {getComboData(
                "dsFintrac_Transaction_Action_Person_RelationshipWithReceiverMsId_ForCombo"
              ).map((item, inx) => (
                <option key={inx} value={item.relationshipWithReceiverMsId}>
                  {item.name}
                </option>
              ))}
            </Input>
          </FormGroup>
          {(data.relationshipWithInitiatorMsId === "216009" ||
            data.relationshipWithInitiatorMsId === 216009) && (
            <>
              <Label for="relationshipWithInitiator_Text_Other">
                Other relationship with initiator:
              </Label>
              <Input
                id="relationshipWithInitiator_Text_Other"
                type="text"
                value={data.relationshipWithInitiator_Text_Other}
                onChange={(e) =>
                  handleChangeInput(e, "relationshipWithInitiator_Text_Other")
                }
              />
            </>
          )}
        </div>
      )}
      {sender && reportTypeMsId == 211145 && (
        <div style={{ maxWidth: "95%" }} className="mt-4">
          <FormGroup>
            <Label for="exampleSelect">
              Relationship with receiver: Select the value to indicate the
              relationship of the sender to the person or entity receiving the
              transaction.
            </Label>
            <Input
              id="exampleSelect"
              name="select"
              type="select"
              value={data.relationshipWithReceiverMsId}
              onChange={(e) =>
                handleChangeInput(e, "relationshipWithReceiverMsId")
              }
              list="person"
            >
              {getComboData(
                "dsFintrac_Transaction_Action_Person_RelationshipWithReceiverMsId_ForCombo"
              ).map((item, inx) => (
                <option
                  key={item.relationshipWithReceiverMsId}
                  value={item.relationshipWithReceiverMsId}
                >
                  {item.name}
                </option>
              ))}
            </Input>
            {(data.relationshipWithReceiverMsId === "216009" ||
              data.relationshipWithReceiverMsId === 216009) && (
              <>
                <Label for="otherrelationshipreceiver" className="mt-3">
                  Other relationship with receiver:
                </Label>
                <Input
                  id="otherrelationshipreceiver"
                  type="text"
                  value={data.relationshipWithReceiver_Text_Other}
                  onChange={(e) =>
                    handleChangeInput(e, "relationshipWithReceiver_Text_Other")
                  }
                />
              </>
            )}
          </FormGroup>
        </div>
      )}
      {sender && reportTypeMsId == 211146 && (
        <div className="mt-3" style={{ maxWidth: "75%" }}>
          <FormGroup>
            <Label for="exampleSelect">Reporting location:</Label>
            <Input
              id="exampleSelect"
              name="tblLocationCashWasReceivedId"
              type="select"
              value={data.tblLocationCashWasReceivedId}
              onChange={(e) =>
                handleChangeInput(e, "tblLocationCashWasReceivedId")
              }
            >
              {getComboData("dsFintrac_LocationCwr_LocationList_ForCombo").map(
                (item, inx) => (
                  <option key={inx} value={item.tblLocationCashWasReceivedId}>
                    {item.name}
                  </option>
                )
              )}
            </Input>
          </FormGroup>
        </div>
      )}
      {!sender && reportTypeMsId == 211145 && (
        <div className="mt-5" style={{ maxWidth: "75%" }}>
          <FormGroup>
            <Label for="exampleSelect">Reporting location:</Label>
            <Input
              id="exampleSelect"
              name="tblLocationCashWasReceivedId"
              type="select"
              value={data.tblLocationCashWasReceivedId}
              onChange={(e) =>
                handleChangeInput(e, "tblLocationCashWasReceivedId")
              }
            >
              {getComboData("dsFintrac_LocationCwr_LocationList_ForCombo").map(
                (item, inx) => (
                  <option key={inx} value={item.tblLocationCashWasReceivedId}>
                    {item.name}
                  </option>
                )
              )}
            </Input>
          </FormGroup>
        </div>
      )}
      <TransactionPersonComponent
        dataSource={data}
        tblTransactionId={tblTransactionId}
        tblTransaction_ActionId={tblTransaction_ActionId}
        props={props}
        handleSetData={(data) => setData(data)}
      />

      <div
        className="d-flex flex-column align-items-end mb-5 mt-5"
        onClick={() => onShowCompletingAction(true)}
      >
        <ButtonFieldInfo
          key={999}
          fieldInfo={btnTransaction_Action_PersonSave.props.fieldInfo}
          externalData={data}
          getDataFromExternal="true"
        />
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

export default SenderRecieverComponent;
