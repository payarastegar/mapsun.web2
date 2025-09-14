import InputField from "../UtilityComponents/InputFieldComponent";
import TransactionPersonComponent from "../UtilityComponents/TransactionPersonComponent";
import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import "bootstrap-icons/font/bootstrap-icons.css";

function SourceOfCashComponent({
  dataSource,
  props,
  tblTransactionId,
  tblTransaction_ActionId,
  reportTypeMsId,
  strRelatedTransactionMsId,
  onShowSourceOfCash,
  onShowSender,
  onShowReciever,
}) {
  const [data, setData] = useState({});

  useEffect(function() {
    onShowSourceOfCash(true);

    // if (reportTypeMsId === 211145) onShowSender(true);
    // if (reportTypeMsId === 211146) onShowReciever(true);

    if (!dataSource) {
      setData({
        tblPersonId: undefined,
        tblTransactionId,
        tblTransaction_ActionId,
        actionPersonTypeMsId: 208002 /* Source Of Cash */,
        accountNumber: "",
        policyNumber: "",
        identifyingNumber: "",
        hasOnBehalfOf: false,
        account_hasAccountHolder: false,
      });
    } else {
      setData({ ...dataSource });
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
      <h2>
        Source of{" "}
        {reportTypeMsId === 211106 || strRelatedTransactionMsId === 211106
          ? " Cash "
          : ""}
        {reportTypeMsId === 211014 || strRelatedTransactionMsId === 211014
          ? " Virtual Currency "
          : ""}
        {reportTypeMsId === 211145 ||
        strRelatedTransactionMsId === 211145 ||
        reportTypeMsId === 211146 ||
        strRelatedTransactionMsId === 211146
          ? " Fund "
          : ""}
      </h2>
      <h5 style={{ color: "#5FBDFF" }}>
        Information about the source of{" "}
        {reportTypeMsId === 211106 ? " Cash" : " Fund"}
      </h5>
      <div>
        <div className="row mt-3">
          <InputField
            lableTxt="Account number:"
            maxWidth={"50%"}
            type={"text"}
            className={"mb-2 col-6"}
            value={data.accountNumber}
            name={"accountNumber"}
            handleChangeInput={handleChangeInput}
          />
          <InputField
            lableTxt="Policy number:"
            maxWidth={"50%"}
            type={"text"}
            className={"mb-2 col-6"}
            value={data.policyNumber}
            name={"policyNumber"}
            handleChangeInput={handleChangeInput}
          />
          <InputField
            lableTxt="Identifying number:"
            maxWidth={"50%"}
            type={"text"}
            className={"mb-2 col-6"}
            value={data.identifyingNumber}
            name={"identifyingNumber"}
            handleChangeInput={handleChangeInput}
          />
        </div>
      </div>
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

export default SourceOfCashComponent;
