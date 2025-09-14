import InputField from "../UtilityComponents/InputFieldComponent";
import TransactionPersonComponent from "../UtilityComponents/TransactionPersonComponent";
import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

function AccountholderComponent({
  dataSource,
  props,
  tblTransactionId,
  tblTransaction_ActionId,
  onShowOnbehalfof_Requester,
  onShowAccountHolder_Requester,
}) {
  const [data, setData] = useState({});

  useEffect(function() {
    if (!dataSource) {
      setData({
        tblPersonId: undefined,
        tblTransactionId,
        tblTransaction_ActionId,
        actionPersonTypeMsId: 208006 /* AccountHolder */,
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
      <h2>Account Holder</h2>
      <h5 style={{ color: "#5FBDFF" }}>Information about account holder</h5>
      <div>
        <TransactionPersonComponent
          dataSource={data}
          tblTransactionId={tblTransactionId}
          tblTransaction_ActionId={tblTransaction_ActionId}
          props={props}
          handleSetData={(data) => setData(data)}
        />

        <div className="d-flex flex-column align-items-end mb-5 mt-5">
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
    </div>
  );
}

export default AccountholderComponent;
