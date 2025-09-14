import InputField from "../UtilityComponents/InputFieldComponent";
import TransactionPersonComponent from "../UtilityComponents/TransactionPersonComponent";
import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import MandatoryIndicator from "../UtilityComponents/MandatoryIndicator";
import "bootstrap-icons/font/bootstrap-icons.css";

function OnBehalfOfComponent({
  dataSource,
  props,
  tblTransactionId,
  tblTransaction_ActionId,
  onShowOnbehalfof_Requester,
  onShowAccountHolder_Requester,
}) {
  const [data, setData] = useState({});

  useEffect(function() {
    onShowOnbehalfof_Requester(true);
    if (!dataSource) {
      setData({
        tblPersonId: undefined,
        tblTransactionId,
        tblTransaction_ActionId,
        relationshipOfConductorMsId: 207001 /* Accountant */,
        actionPersonTypeMsId: 208005 /* OnBehalfOf */,
        relationshipDescriptionOnOtherCode: "",
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
      <h2>On behalf Of</h2>
      <h5 style={{ color: "#5FBDFF" }}>Information about on behalf of</h5>
      <span>
        <FormGroup>
          <Label for="exampleSelect">
            Relationship: Select the value to indicate the relationship of the
            third party on whose behalf the transaction was conducted to the
            person or entity conducting the transaction. if the selections
            provided do not cover the relationship. indicate "Other" and provide
            details.
          </Label>
          <Input
            id="exampleSelect"
            name="select"
            type="select"
            value={data.relationshipOfConductorMsId}
            onChange={(e) =>
              handleChangeInput(e, "relationshipOfConductorMsId")
            }
            list="person"
          >
            {getComboData(
              "dsFintrac_Transaction_Action_Person_RelationshipOfConductorMsId_ForCombo"
            ).map((item, inx) => (
              <option key={inx} value={item.relationshipOfConductorMsId}>
                {item.name}
              </option>
            ))}
          </Input>
        </FormGroup>
      </span>

      {data.relationshipOfConductorMsId == 207009 && (
        <FormGroup>
          <Label for="exampleSelect">Other relationship:</Label>
          <Input
            id="exampleSelect"
            name="relationshipDescriptionOnOtherCode"
            type="text"
            value={data.relationshipDescriptionOnOtherCode}
            onChange={(e) =>
              handleChangeInput(e, "relationshipDescriptionOnOtherCode")
            }
          />
        </FormGroup>
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
        // onClick={handleGetEvent}
      >
        <div>
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
export default OnBehalfOfComponent;
