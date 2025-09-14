import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import TransactionPersonComponent from "../UtilityComponents/TransactionPersonComponent";

function InitiatorComponent({
  dataSource,
  props,
  tblTransactionId,
  tblTransaction_ActionId,
  onShowInitiator,
  onShowStartingAction,
}) {
  const [data, setData] = useState({});

  useEffect(function() {
    onShowInitiator(true);
    if (!dataSource) {
      setData({
        tblPersonId: undefined,
        tblTransactionId,
        tblTransaction_ActionId,
        actionPersonTypeMsId: 208007 /* initiator */,
        tblLocationCashWasReceivedId: 10000001,
        account_hasAccountHolder: false,
      });
    } else {
      setData({ ...dataSource });
      // onShowStartingAction(true);
    }
  }, []);

  const btnTransaction_Action_PersonSave =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnTransaction_Action_PersonSave;

  const btnTransaction_Action_PersonRemove =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnTransaction_Action_PersonRemove;

  function handleChangeInput(e, targetName) {
    setData((data) => ({ ...data, [targetName]: e.target.value }));
  }
  function getComboData(dsName) {
    let ds = props.fieldInfo.getDataSource(dsName).dataArray;

    return ds;
  }

  return (
    <div className="col-9">
      <h2>Initiator</h2>
      <h5 style={{ color: "#5FBDFF" }}>
        Information about subject Initiate the transaction:
      </h5>
      <div className="row mt-3">
        <div className="col-6">
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
        <div className="col-12">
          <TransactionPersonComponent
            dataSource={data}
            tblTransactionId={tblTransactionId}
            tblTransaction_ActionId={tblTransaction_ActionId}
            props={props}
            handleSetData={(data) => setData(data)}
          />
        </div>
      </div>

      <div
        className="d-flex flex-column align-items-end mb-5 mt-5"
        onClick={() => onShowStartingAction(true)}
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

export default InitiatorComponent;
