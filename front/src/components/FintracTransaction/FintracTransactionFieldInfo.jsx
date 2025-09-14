import React, { Suspense, useEffect, useState } from "react";
import { Nav, NavItem, NavLink } from "reactstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import TransactionComponent from "./TransactionComponent/TransactionComponent";
import StartingActionComponent from "./TransactionActionComponent/StartingActionComponent";
import ConductorComponent from "./TransactionActionPersonComponents/ConductorComponent";
import CompletingActionComponent from "./TransactionActionComponent/CompletingActionComponent";
import AccountholderComponent from "./TransactionActionPersonComponents/AccountholderComponent";
import InvolvementComponent from "./TransactionActionPersonComponents/InvolvementComponent";
import SourceOfCashComponent from "./TransactionActionPersonComponents/SourceOfCashComponent";
import OnBehalfOfComponent from "./TransactionActionPersonComponents/OnBehalfOfComponent";
import BeneficiaryComponent from "./TransactionActionPersonComponents/BeneficiaryComponent";
import InitiatorComponent from "./TransactionActionPersonComponents/InitiatorComponent";
import RequesterComponent from "./TransactionActionPersonComponents/RequesterComponent";
import SenderRecieverComponent from "./TransactionActionPersonComponents/SenderRecieverComponent";
import ButtonFieldInfo from "../ButtonFieldInfo/ButtonFieldInfo";

import { FormGroup, Label, Input } from "reactstrap";

function FintracTransactionFieldInfo(props) {
  const [activeComponent, setActiveComponent] = useState();

  const [showInitiator, setShowInitiator] = useState(false);
  const [showStartingAction, setShowStartingAction] = useState(false);
  const [showCompletingAction, setShowCompletingAction] = useState(false);

  const [showSourceOfCash, setShowSourceOfCash] = useState(false);
  const [showRequester, setShowRequester] = useState(false);
  const [showSender, setShowSender] = useState(false);
  const [showReciever, setShowReciever] = useState(false);
  const [showConductor, setShowConductor] = useState(false);
  const [showOnBehalfOf_Requester, setShowOnBehalfOf_Requester] = useState(
    false
  );
  const [
    showAccountHolder_Requester,
    setShowAccountHolder_Requester,
  ] = useState(false);
  const [showInvolvement, setShowInvolvement] = useState(false);
  const [showBeneficiary, setShowBeneficiary] = useState(false);

  const [showOnBehalfOf_Beneficiary, setShowOnBehalfOf_Beneficiary] = useState(
    false
  );
  const [
    showAccountHolder_Beneficiary,
    setShowAccountHolder_Beneficiary,
  ] = useState(false);
  let strRelatedTransactionMsId = undefined;

  const [showError, setShowError] = useState(false);

  const reportTypeMsId =
    props.fieldInfo._parentFieldInfo._parentFieldInfo._paramList.formParams
      .reportTypeMsId;

  let dsTransactionEdit;
  let dsTransactionAction;
  let dsTransactionStartingAction;
  let dsTransactionCompletingAction;
  let dsListOfPerson_Conductors;
  let dsListOfPerson_Involvement;
  let dsListOfPerson_SourceOfCash;
  let dsListOfPerson_Beneficiary;
  let dsListOfPerson_Initiator;
  let dsListOfPerson_Requester;
  let dsListOfPerson_Sender;
  let dsListOfPerson_Reciever;

  let dsListOfPerson_AccountHolder_Requester;
  let dsListOfPerson_OnBehalfOf_Requester;

  let dsListOfPerson_AccountHolder_Beneficiary;
  let dsListOfPerson_OnBehalfOf_Beneficiary;

  let tblTransactionId;
  let tblTransaction_ActionId;
  let tblTransaction_StartingActionId;
  let onBehalfOf_tblTransaction_Action_PersonId_Parent;
  let tblTransaction_CompletingActionId;

  const btnPrintTransaction =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnOpenReportPrint;

  const btnOpen_EventList =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnOpen_EventList;

  function handleForceUpdate() {
    props.setActiveComponent("Transaction");
  }

  function handleSetStrTransaction(relatedTransactionMsId) {
    strRelatedTransactionMsId = relatedTransactionMsId;
  }

  useEffect(
    function() {
      dsTransactionEdit = getDataSourceForFintrac(
        "dsFintrac_Transaction_TransactionEdit"
      ).dataArray[
        getDataSourceForFintrac("dsFintrac_Transaction_TransactionEdit")
          .dataArray.length - 1
      ];

      setActiveComponent(props.activeComponent);

      if (dsTransactionEdit) {
        if (
          (reportTypeMsId === 211145 ||
            reportTypeMsId === 211146 ||
            strRelatedTransactionMsId === 211145 ||
            strRelatedTransactionMsId === 211146) &&
          (dsTransactionEdit.initiatorAndReceiverIndicator === true ||
            dsTransactionEdit.initiatorAndReceiverIndicator === "true")
        ) {
          if (dsListOfPerson_Initiator) {
            // setShowInitiator(true);
            setShowStartingAction(true);
          } else {
            // setShowInitiator(true);
            setShowStartingAction(false);
          }
        } else if (tblTransactionId) {
          setShowInitiator(false);
          dsListOfPerson_Initiator = {}; //If initiatorAndReceiverIndicator is false erase initiator datasource
          setShowStartingAction(true);
          if (dsListOfPerson_Requester) {
            setShowRequester(true);
          }
        }
      }

      if (dsTransactionStartingAction) {
        if (
          dsTransactionStartingAction.starting_isSourceOfCashInformationObtained
        ) {
          setShowSourceOfCash(true);
        } else {
          setShowSourceOfCash(false);
          dsListOfPerson_SourceOfCash = {};
        }

        if (
          reportTypeMsId === 211106 ||
          strRelatedTransactionMsId === 211106 ||
          reportTypeMsId === 211014 ||
          strRelatedTransactionMsId === 211014
        ) {
          setShowConductor(true);

          if (dsListOfPerson_Conductors) {
            setShowCompletingAction(true);
          }
        }

        if (reportTypeMsId === 211145 || strRelatedTransactionMsId === 211145) {
          setShowRequester(true);
          if (dsListOfPerson_Sender) {
            setShowCompletingAction(true);
          }
        }
        if (reportTypeMsId === 211146 || strRelatedTransactionMsId === 211146) {
          setShowRequester(true);
          if (dsListOfPerson_Sender) {
            setShowCompletingAction(true);
          }
          if (dsTransactionCompletingAction) {
            setShowReciever(true);
          }
        }

        // THIS FIELDS FILL WHEN REPORT TYPE IS LCTR AND CONDUCTOR HAS DATA TOO
        if (
          dsListOfPerson_Requester ||
          dsListOfPerson_Conductors /* AND CODUCTOR */
        ) {
          if (
            reportTypeMsId === 211145 ||
            strRelatedTransactionMsId === 211145
          ) {
            setShowSender(true);
          }

          if (
            reportTypeMsId === 211146 ||
            strRelatedTransactionMsId === 211146
          ) {
            setShowReciever(true);
          }

          if (dsListOfPerson_Conductors) {
            if (
              dsListOfPerson_Conductors.account_hasAccountHolder === true ||
              dsListOfPerson_Conductors.account_hasAccountHolder === "true" ||
              dsListOfPerson_AccountHolder_Requester
            )
              setShowAccountHolder_Requester(true);

            if (
              dsListOfPerson_Conductors.hasOnBehalfOf === true ||
              dsListOfPerson_Conductors.hasOnBehalfOf === "true" ||
              dsListOfPerson_OnBehalfOf_Requester
            )
              setShowOnBehalfOf_Requester(true);
          }
        }

        if (dsListOfPerson_Requester) {
          if (
            dsListOfPerson_Requester.account_hasAccountHolder === true ||
            dsListOfPerson_Requester.account_hasAccountHolder === "true" ||
            dsListOfPerson_AccountHolder_Requester
          )
            setShowAccountHolder_Requester(true);

          if (
            dsListOfPerson_Requester.hasOnBehalfOf === true ||
            dsListOfPerson_Requester.hasOnBehalfOf === "true" ||
            dsListOfPerson_OnBehalfOf_Requester
          )
            setShowOnBehalfOf_Requester(true);
        }
      }

      if (dsListOfPerson_Reciever) {
        setShowCompletingAction(true);
      }

      if (dsTransactionCompletingAction) {
        setShowCompletingAction(true);
        if (
          dsTransactionCompletingAction.completing_isOtherPersonInvolvedInCompleting
        ) {
          setShowInvolvement(true);
        }
        setShowBeneficiary(true);

        if (dsListOfPerson_Beneficiary) {
          if (
            reportTypeMsId === 211145 ||
            strRelatedTransactionMsId === 211145
          ) {
            setShowReciever(true);
          }

          if (
            reportTypeMsId === 211146 ||
            strRelatedTransactionMsId === 211146
          ) {
            setShowSender(true);
          }
        }

        if (dsListOfPerson_Beneficiary) {
          if (
            dsListOfPerson_Beneficiary.hasOnBehalfOf === true ||
            dsListOfPerson_Beneficiary.hasOnBehalfOf === "true" ||
            dsListOfPerson_OnBehalfOf_Beneficiary
          ) {
            setShowOnBehalfOf_Beneficiary(true);
          }

          if (
            dsListOfPerson_Beneficiary.account_hasAccountHolder === true ||
            dsListOfPerson_Beneficiary.account_hasAccountHolder === "true" ||
            dsListOfPerson_AccountHolder_Beneficiary
          ) {
            setShowAccountHolder_Beneficiary(true);
          }
        }
      }
    },
    [dsTransactionEdit]
  );

  const handleChangeComponent = (newAction) => {
    props.setActiveComponent(newAction);
    setActiveComponent(newAction);
  };

  //get data from datasource
  function getDataSourceForFintrac(dsName) {
    return props.fieldInfo.getDataSource(dsName);
  }

  if (props.fieldInfo._parentFieldInfo.component.dataSource.dataArray[1]) {
    tblTransactionId =
      props.fieldInfo._parentFieldInfo.component.dataSource.dataArray[1]
        .tblTransactionId;

    dsTransactionEdit =
      props.fieldInfo._parentFieldInfo.component.dataSource.dataArray[1];
  } else {
    dsTransactionEdit =
      props.fieldInfo._parentFieldInfo.component.dataSource.dataArray[1] ||
      props.fieldInfo._parentFieldInfo.component.dataSource.dataArray[0];
    tblTransactionId = dsTransactionEdit.tblTransactionId;
  }

  if (tblTransactionId) {
    dsTransactionAction = getDataSourceForFintrac(
      "dsFintrac_Transaction_TransactionEdit_ListOfAction"
    );

    if (dsTransactionEdit.reportTypeMsId_relatedTransaction) {
      handleSetStrTransaction(
        dsTransactionEdit.reportTypeMsId_relatedTransaction
      );
    }

    dsListOfPerson_Initiator = getDataSourceForFintrac(
      "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
    ).dataArray.filter(
      (item) =>
        item.tblTransaction_ActionId === tblTransaction_StartingActionId &&
        item.actionPersonTypeMsId === 208007 /* initiator */
    )[0];

    dsListOfPerson_Sender = getDataSourceForFintrac(
      "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
    ).dataArray.filter(
      (item) =>
        item.tblTransaction_ActionId === tblTransaction_StartingActionId &&
        item.actionPersonTypeMsId === 208009 /* Sender */
    )[0];

    dsListOfPerson_Reciever = getDataSourceForFintrac(
      "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
    ).dataArray.filter(
      (item) =>
        item.tblTransaction_ActionId === tblTransaction_StartingActionId &&
        item.actionPersonTypeMsId === 208010 /* Reciever */
    )[0];

    if (dsTransactionAction.dataArray.length > 0) {
      dsTransactionStartingAction = dsTransactionAction.dataArray.filter(
        (item) =>
          item.tblTransactionId === tblTransactionId &&
          item.starting_isStartingAction
      )[0];

      dsTransactionCompletingAction = dsTransactionAction.dataArray.filter(
        (item) =>
          item.tblTransactionId === tblTransactionId &&
          item.completing_isCompletingAction
      )[0];

      if (dsTransactionStartingAction) {
        tblTransaction_StartingActionId =
          dsTransactionStartingAction.tblTransaction_ActionId;
      }

      if (dsTransactionCompletingAction) {
        tblTransaction_CompletingActionId =
          dsTransactionCompletingAction.tblTransaction_ActionId;
      }
    }

    if (tblTransaction_StartingActionId) {
      dsListOfPerson_Conductors = getDataSourceForFintrac(
        "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
      ).dataArray.filter(
        (item) =>
          item.tblTransaction_ActionId === tblTransaction_StartingActionId &&
          item.actionPersonTypeMsId === 208001 /* conductor */
      )[0];

      if (
        dsTransactionStartingAction.starting_isSourceOfCashInformationObtained
      ) {
        dsListOfPerson_SourceOfCash = getDataSourceForFintrac(
          "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
        ).dataArray.filter(
          (item) =>
            item.tblTransaction_ActionId === tblTransaction_StartingActionId &&
            item.actionPersonTypeMsId === 208002 /* Source Of Cash */
        )[0];
      }

      dsListOfPerson_OnBehalfOf_Requester = getDataSourceForFintrac(
        "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
      ).dataArray.filter(
        (item) =>
          item.tblTransaction_ActionId === tblTransaction_StartingActionId &&
          item.actionPersonTypeMsId === 208005 /* OnBehalfOf */
      )[0];

      dsListOfPerson_Requester = getDataSourceForFintrac(
        "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
      ).dataArray.filter(
        (item) =>
          item.tblTransaction_ActionId === tblTransaction_StartingActionId &&
          item.actionPersonTypeMsId === 208008 /* Requester */
      )[0];

      dsListOfPerson_AccountHolder_Requester = getDataSourceForFintrac(
        "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
      ).dataArray.filter(
        (item) =>
          item.tblTransaction_ActionId === tblTransaction_StartingActionId &&
          item.actionPersonTypeMsId === 208006 /* account holder */
      )[0];
    }

    if (tblTransaction_CompletingActionId) {
      dsListOfPerson_Involvement = getDataSourceForFintrac(
        "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
      ).dataArray.filter(
        (item) =>
          item.tblTransaction_ActionId === tblTransaction_CompletingActionId &&
          item.actionPersonTypeMsId === 208004 /* involvement */
      )[0];

      dsListOfPerson_Beneficiary = getDataSourceForFintrac(
        "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
      ).dataArray.filter(
        (item) =>
          item.tblTransaction_ActionId === tblTransaction_CompletingActionId &&
          item.actionPersonTypeMsId === 208003 /* Beneficiary */
      )[0];

      dsListOfPerson_AccountHolder_Beneficiary = getDataSourceForFintrac(
        "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
      ).dataArray.filter(
        (item) =>
          item.tblTransaction_ActionId === tblTransaction_CompletingActionId &&
          item.actionPersonTypeMsId === 208006 /* accouont holder */
      )[0];

      dsListOfPerson_OnBehalfOf_Beneficiary = getDataSourceForFintrac(
        "dsFintrac_Transaction_TransactionEdit_ListOfPerson"
      ).dataArray.filter(
        (item) =>
          item.tblTransaction_ActionId === tblTransaction_CompletingActionId &&
          item.actionPersonTypeMsId === 208005 /* OnBehalfOf */
      )[0];
    }
  }

  const handleNextPart = () => {
    if (activeComponent === "Transaction") {
      handleChangeComponent("StartingAction");
      return;
    }
    if (activeComponent === "Transaction") {
      handleChangeComponent("StartingAction");
      return;
    }
  };
  const handlePreviousPart = () => {
    if (activeComponent === "Transaction") {
      return;
    }
    if (activeComponent === "StartingAction") {
      handleChangeComponent("Transaction");
    }
  };

  let btnInsertPerson =
    props.fieldInfo._parentFieldInfo.component.data.components.btnInsertPerson;

  btnInsertPerson.props.fieldInfo._parentFieldInfo._paramList.formParams = {
    ...btnInsertPerson.props.fieldInfo._parentFieldInfo._paramList.formParams,
    isIndividualPerson: true,
  };

  return (
    <>
      <div
        className="container"
        style={{ margin: 0, minHeight: "90vh", dir: "ltr", textAlign: "left" }}
      >
        <div className="row">
          {activeComponent === "Transaction" && (
            <TransactionComponent
              dataSource={dsTransactionEdit}
              handleForceUpdate={handleForceUpdate}
              getDataSource={getDataSourceForFintrac}
              tblTransactionId={tblTransactionId}
              reportTypeMsId={reportTypeMsId}
              props={props}
              onShowInitiator={setShowInitiator}
              onShowStartingAction={setShowStartingAction}
              onShowInvolvement={setShowInvolvement}
              onChangeStrRelatedTransaction={handleSetStrTransaction}
              onShowError={setShowError}
            />
          )}
          {activeComponent === "Initiator" && (
            <InitiatorComponent
              dataSource={dsListOfPerson_Initiator}
              tblTransactionId={tblTransactionId}
              tblTransaction_ActionId={tblTransaction_StartingActionId}
              props={props}
              onShowInitiator={setShowInitiator}
              onShowStartingAction={setShowStartingAction}
            />
          )}
          {activeComponent === "StartingAction" && (
            <StartingActionComponent
              dataSource={dsTransactionStartingAction}
              dsTransactionEdit={dsTransactionEdit}
              tblTransactionId={tblTransactionId}
              tblTransaction_ActionId={tblTransaction_StartingActionId}
              reportTypeMsId={reportTypeMsId}
              strRelatedTransactionMsId={strRelatedTransactionMsId}
              onShowInitiator={setShowInitiator}
              onShowStartingAction={setShowStartingAction}
              onShowCompletingAction={setShowCompletingAction}
              onShowSender={setShowSender}
              onShowReciever={setShowReciever}
              onShowSourceOfCash={setShowSourceOfCash}
              onShowInvolvement={setShowInvolvement}
              onShowRequester={setShowRequester}
              onShowConductor={setShowConductor}
              props={props}
            />
          )}
          {activeComponent === "SourceOfCash" && (
            <SourceOfCashComponent
              dataSource={dsListOfPerson_SourceOfCash}
              tblTransactionId={tblTransactionId}
              tblTransaction_ActionId={tblTransaction_StartingActionId}
              reportTypeMsId={reportTypeMsId}
              onShowStartingAction={setShowStartingAction}
              onShowSourceOfCash={setShowSourceOfCash}
              onShowSender={setShowSender}
              onShowReciever={setShowReciever}
              props={props}
              strRelatedTransactionMsId={strRelatedTransactionMsId}
            />
          )}
          {activeComponent === "Requester" && (
            <RequesterComponent
              dataSource={dsListOfPerson_Requester}
              tblTransactionId={tblTransactionId}
              tblTransaction_ActionId={tblTransaction_StartingActionId}
              reportTypeMsId={reportTypeMsId}
              strRelatedTransactionMsId={strRelatedTransactionMsId}
              onShowRequester={setShowRequester}
              onShowOnbehalfof_Requester={setShowOnBehalfOf_Requester}
              onShowAccountHolder_Requester={setShowAccountHolder_Requester}
              onShowSender={setShowSender}
              onShowReciever={setShowReciever}
              props={props}
            />
          )}
          {activeComponent === "Sender" && (
            <SenderRecieverComponent
              dataSource={dsListOfPerson_Sender}
              tblTransactionId={tblTransactionId}
              tblTransaction_ActionId={tblTransaction_StartingActionId}
              reportTypeMsId={reportTypeMsId}
              onShowReciever={setShowReciever}
              onShowSender={setShowSender}
              props={props}
              sender={true}
              onShowCompletingAction={setShowCompletingAction}
            />
          )}
          {activeComponent === "Reciever" && (
            <SenderRecieverComponent
              dataSource={dsListOfPerson_Reciever}
              tblTransactionId={tblTransactionId}
              tblTransaction_ActionId={tblTransaction_StartingActionId}
              reportTypeMsId={reportTypeMsId}
              onShowReciever={setShowReciever}
              onShowSender={setShowSender}
              props={props}
              sender={false}
              onShowCompletingAction={setShowCompletingAction}
            />
          )}
          {activeComponent === "Conductor" && (
            <ConductorComponent
              dataSource={dsListOfPerson_Conductors}
              tblTransactionId={tblTransactionId}
              tblTransaction_ActionId={tblTransaction_StartingActionId}
              reportTypeMsId={reportTypeMsId}
              props={props}
              onShowConductor={setShowConductor}
              onShowOnbehalfof_Requester={setShowOnBehalfOf_Requester}
              onShowAccountHolder_Requester={setShowAccountHolder_Requester}
              onShowCompletingAction={setShowCompletingAction}
            />
          )}
          {activeComponent === "OnBehalfOf_Requester" &&
            showOnBehalfOf_Requester && (
              <OnBehalfOfComponent
                dataSource={dsListOfPerson_OnBehalfOf_Requester}
                tblTransactionId={tblTransactionId}
                tblTransaction_ActionId={tblTransaction_StartingActionId}
                props={props}
                onShowOnbehalfof_Requester={setShowOnBehalfOf_Requester}
                onShowAccountHolder_Requester={setShowAccountHolder_Requester}
              />
            )}
          {activeComponent === "AccountHolder_Requester" &&
            showAccountHolder_Requester && (
              <AccountholderComponent
                dataSource={dsListOfPerson_AccountHolder_Requester}
                tblTransactionId={tblTransactionId}
                tblTransaction_ActionId={tblTransaction_StartingActionId}
                onShowOnbehalfof_Requester={setShowOnBehalfOf_Requester}
                onShowAccountHolder_Requester={setShowAccountHolder_Requester}
                props={props}
              />
            )}
          {activeComponent === "CompletingAction" && (
            <CompletingActionComponent
              dataSource={dsTransactionCompletingAction}
              tblTransactionId={tblTransactionId}
              tblTransaction_ActionId={tblTransaction_CompletingActionId}
              reportTypeMsId={reportTypeMsId}
              strRelatedTransactionMsId={strRelatedTransactionMsId}
              props={props}
              onShowInvolvement={setShowInvolvement}
              onShowBeneficiary={setShowBeneficiary}
              onShowSender={setShowSender}
              onShowReciever={setShowReciever}
              onShowCompletingAction={setShowCompletingAction}
            />
          )}
          {activeComponent === "Involvement" && (
            <InvolvementComponent
              dataSource={dsListOfPerson_Involvement}
              tblTransactionId={tblTransactionId}
              tblTransaction_ActionId={tblTransaction_CompletingActionId}
              props={props}
              onShowInvolvement={setShowInvolvement}
            />
          )}
          {activeComponent === "Beneficiary" && (
            <BeneficiaryComponent
              dataSource={dsListOfPerson_Beneficiary}
              tblTransactionId={tblTransactionId}
              tblTransaction_ActionId={tblTransaction_CompletingActionId}
              props={props}
              reportTypeMsId={reportTypeMsId}
              strRelatedTransactionMsId={strRelatedTransactionMsId}
              onShowBeneficiary={setShowBeneficiary}
              onShowSender={setShowSender}
              onShowReciever={setShowReciever}
              onShowOnbehalfof_Beneficiary={setShowOnBehalfOf_Beneficiary}
              onShowAccountHolder_Beneficiary={setShowAccountHolder_Beneficiary}
              relatedPerson={
                dsListOfPerson_Requester || dsListOfPerson_Conductors
              }
            />
          )}
          {activeComponent === "OnBehalfOf_Beneficiary" &&
            showOnBehalfOf_Beneficiary && (
              <OnBehalfOfComponent
                dataSource={dsListOfPerson_OnBehalfOf_Beneficiary}
                tblTransactionId={tblTransactionId}
                tblTransaction_ActionId={tblTransaction_CompletingActionId}
                props={props}
                onShowOnbehalfof_Requester={setShowOnBehalfOf_Requester}
                onShowAccountHolder_Requester={setShowAccountHolder_Requester}
                onShowOnbehalfof_Beneficiary={setShowOnBehalfOf_Beneficiary}
                onShowAccountHolder_Beneficiary={
                  setShowAccountHolder_Beneficiary
                }
              />
            )}
          {activeComponent === "AccountHolder_Beneficiary" &&
            showAccountHolder_Beneficiary && (
              <AccountholderComponent
                dataSource={dsListOfPerson_AccountHolder_Beneficiary}
                tblTransactionId={tblTransactionId}
                tblTransaction_ActionId={tblTransaction_CompletingActionId}
                onShowOnbehalfof_Requester={setShowOnBehalfOf_Requester}
                onShowAccountHolder_Requester={setShowAccountHolder_Requester}
                onShowOnbehalfof_Beneficiary={setShowOnBehalfOf_Beneficiary}
                onShowAccountHolder_Beneficiary={
                  setShowAccountHolder_Beneficiary
                }
                props={props}
              />
            )}
          <div
            className="col-3 flex-d flex-column p-3 mb-5"
            style={{
              backgroundColor: "#F8F8F8",
              border: "2px solid #E8E8E8",
            }}
          >
            <h3>Report actions</h3>
            {/* <div class="d-grid gap-2 mt-3">
              <button
                class="btn btn-light"
                type="button"
                style={{
                  display: "block",
                  minWidth: "100%",
                  border: "2px solid #E8E8E8",
                }}
                onClick={handleNextPart}
              >
                Next part
                <i class="bi bi-arrow-right" style={{ marginLeft: "5px" }} />
              </button>
              <button
                class="btn btn-light mt-3"
                type="button"
                style={{
                  display: "block",
                  minWidth: "100%",
                  border: "2px solid #E8E8E8",
                }}
                onClick={handlePreviousPart}
              >
                <i class="bi bi-arrow-left" style={{ marginRight: "5px" }} />
                Previous part
              </button>
            </div> */}
            <div
              style={{
                backgroundColor: "#F8F8F8",
                border: "1px solid #E0E0E0",
                marginTop: "10px",
              }}
            >
              <p
                className="p-2 m-0"
                style={{
                  textAlign: "left",
                  textJustify: "auto",
                  backgroundColor: "#E8E8E8",
                  height: "100%",
                }}
              >
                Report parts
              </p>
              <Nav justified pills vertical>
                <NavItem>
                  <NavLink
                    href="#"
                    className={activeComponent === "Transaction" && "active"}
                    onClick={() => handleChangeComponent("Transaction")}
                  >
                    Transaction
                  </NavLink>
                </NavItem>
                {(reportTypeMsId === 211145 ||
                  reportTypeMsId === 211146 ||
                  reportTypeMsId === 211102) &&
                  showInitiator && (
                    <NavItem>
                      <NavLink
                        href="#"
                        className={activeComponent === "Initiator" && "active"}
                        onClick={() => handleChangeComponent("Initiator")}
                      >
                        Initiator
                      </NavLink>
                    </NavItem>
                  )}
                {showStartingAction && (
                  <NavItem>
                    <NavLink
                      href="#"
                      className={
                        activeComponent === "StartingAction" && "active"
                      }
                      onClick={() => handleChangeComponent("StartingAction")}
                    >
                      Starting action
                    </NavLink>
                  </NavItem>
                )}
                {showSourceOfCash && (
                  <NavItem>
                    <NavLink
                      href="#"
                      className={activeComponent === "SourceOfCash" && "active"}
                      onClick={() => handleChangeComponent("SourceOfCash")}
                    >
                      Source of{" "}
                      {reportTypeMsId === 211106 ||
                      strRelatedTransactionMsId === 211106
                        ? " Cash "
                        : ""}
                      {reportTypeMsId === 211014 ||
                      strRelatedTransactionMsId === 211014
                        ? " Virtual Currency "
                        : ""}
                      {reportTypeMsId === 211145 ||
                      strRelatedTransactionMsId === 211145 ||
                      reportTypeMsId === 211146 ||
                      strRelatedTransactionMsId === 211146
                        ? " Fund "
                        : ""}
                    </NavLink>
                  </NavItem>
                )}
                {(reportTypeMsId === 211145 ||
                  reportTypeMsId === 211146 ||
                  reportTypeMsId === 211102) &&
                  showRequester && (
                    <NavItem>
                      <NavLink
                        href="#"
                        className={activeComponent === "Requester" && "active"}
                        onClick={() => handleChangeComponent("Requester")}
                      >
                        Requester
                      </NavLink>
                    </NavItem>
                  )}
                {(reportTypeMsId === 211106 ||
                  reportTypeMsId === 211014 ||
                  reportTypeMsId === 211102) &&
                  showConductor && (
                    <NavItem>
                      <NavLink
                        href="#"
                        className={activeComponent === "Conductor" && "active"}
                        onClick={() => handleChangeComponent("Conductor")}
                      >
                        Conductor
                      </NavLink>
                    </NavItem>
                  )}
                {showAccountHolder_Requester && (
                  <NavItem>
                    <NavLink
                      href="#"
                      className={
                        activeComponent === "AccountHolder_Requester" &&
                        "active"
                      }
                      onClick={() =>
                        handleChangeComponent("AccountHolder_Requester")
                      }
                    >
                      Account Holder
                    </NavLink>
                  </NavItem>
                )}
                {showOnBehalfOf_Requester && (
                  <NavItem>
                    <NavLink
                      href="#"
                      className={
                        activeComponent === "OnBehalfOf_Requester" && "active"
                      }
                      onClick={() =>
                        handleChangeComponent("OnBehalfOf_Requester")
                      }
                    >
                      On BeHalf Of
                    </NavLink>
                  </NavItem>
                )}
                {(reportTypeMsId === 211145 ||
                  strRelatedTransactionMsId === 211145) &&
                  showSender && (
                    <NavItem>
                      <NavLink
                        href="#"
                        className={activeComponent === "Sender" && "active"}
                        onClick={() => handleChangeComponent("Sender")}
                      >
                        Sender
                      </NavLink>
                    </NavItem>
                  )}
                {(reportTypeMsId === 211146 ||
                  strRelatedTransactionMsId === 211146) &&
                  showReciever && (
                    <NavItem>
                      <NavLink
                        href="#"
                        className={activeComponent === "Reciever" && "active"}
                        onClick={() => handleChangeComponent("Reciever")}
                      >
                        Reciever
                      </NavLink>
                    </NavItem>
                  )}
                {showCompletingAction && (
                  <NavItem>
                    <NavLink
                      href="#"
                      className={
                        activeComponent === "CompletingAction" && "active"
                      }
                      onClick={() => handleChangeComponent("CompletingAction")}
                    >
                      Compeleting action
                    </NavLink>
                  </NavItem>
                )}
                {showInvolvement && (
                  <NavItem>
                    <NavLink
                      href="#"
                      className={activeComponent === "Involvement" && "active"}
                      onClick={() => handleChangeComponent("Involvement")}
                    >
                      Involvement
                    </NavLink>
                  </NavItem>
                )}
                {showBeneficiary && (
                  <NavItem>
                    <NavLink
                      href="#"
                      className={activeComponent === "Beneficiary" && "active"}
                      onClick={() => handleChangeComponent("Beneficiary")}
                    >
                      Beneficiary
                    </NavLink>
                  </NavItem>
                )}
                {showAccountHolder_Beneficiary && (
                  <NavItem>
                    <NavLink
                      href="#"
                      className={
                        activeComponent === "AccountHolder_Beneficiary" &&
                        "active"
                      }
                      onClick={() =>
                        handleChangeComponent("AccountHolder_Beneficiary")
                      }
                    >
                      Account Holder
                    </NavLink>
                  </NavItem>
                )}
                {showOnBehalfOf_Beneficiary && (
                  <NavItem>
                    <NavLink
                      href="#"
                      className={
                        activeComponent === "OnBehalfOf_Beneficiary" && "active"
                      }
                      onClick={() =>
                        handleChangeComponent("OnBehalfOf_Beneficiary")
                      }
                    >
                      On BeHalf Of
                    </NavLink>
                  </NavItem>
                )}
                {(reportTypeMsId === 211145 ||
                  strRelatedTransactionMsId === 211145) &&
                  showReciever && (
                    <NavItem>
                      <NavLink
                        href="#"
                        className={activeComponent === "Reciever" && "active"}
                        onClick={() => handleChangeComponent("Reciever")}
                      >
                        Reciever
                      </NavLink>
                    </NavItem>
                  )}
                {(reportTypeMsId === 211146 ||
                  strRelatedTransactionMsId === 211146) &&
                  showSender && (
                    <NavItem>
                      <NavLink
                        href="#"
                        className={activeComponent === "Sender" && "active"}
                        onClick={() => handleChangeComponent("Sender")}
                      >
                        Sender
                      </NavLink>
                    </NavItem>
                  )}
              </Nav>
            </div>
            <button
              class="btn btn-light mt-3"
              type="button"
              style={{
                display: "block",
                minWidth: "100%",
                border: "2px solid #E8E8E8",
              }}
            >
              <i
                class="bi bi-file-earmark-spreadsheet"
                style={{ marginRight: "5px" }}
              />
              Subjects
            </button>
            <div className="mt-3">
              <ButtonFieldInfo
                key={Math.random()}
                fieldInfo={btnPrintTransaction.props.fieldInfo}
                // externalData={data}
                // getDataFromExternal="true"
              />
            </div>
            <div className="mt-3">
              <ButtonFieldInfo
                key={Math.random()}
                fieldInfo={btnOpen_EventList.props.fieldInfo}
                // externalData={data}
                // getDataFromExternal="true"
              />
            </div>
            {showError && (
              <div
                style={{ position: "static", zIndex: 999 }}
                className="alert alert-danger my-4"
                role="alert"
              >
                You have unsaved information! please click on Save button.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default FintracTransactionFieldInfo;
