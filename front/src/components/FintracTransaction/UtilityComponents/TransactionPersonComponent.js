import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import React, { useEffect, useState } from "react";
import { FormGroup, Label, Input } from "reactstrap";
import "bootstrap-icons/font/bootstrap-icons.css";
import RadioComponent from "./RadioComponent";

function TransactionPersonComponent({
  dataSource,
  props,
  handleChangeInput,
  getComboData,
  handleSetData,
  relatedPersonId,
  relatedPersonIndicator,
}) {
  const listOfAllPersons = getComboData(
    "dsFintrac_Transaction_Action_Person_PersonList_ForCombo"
  );

  let listOfRelatedPersonIds = [];
  let listOfRelatedPersons = [];

  if (relatedPersonId) {
    listOfRelatedPersonIds =
      listOfAllPersons.filter(
        (person) => person.tblPersonId === relatedPersonId
      )[0].relatedPersons_List || "";

    if (listOfRelatedPersonIds.length > 0) {
      listOfRelatedPersonIds = listOfRelatedPersonIds.split("~");

      listOfRelatedPersons = listOfAllPersons.filter((item) =>
        listOfRelatedPersonIds.includes(item.tblPersonId.toString())
      );
    }
  }

  const btnInsertPerson =
    props.fieldInfo._parentFieldInfo.component.data.components.btnInsertPerson;
  const btnEditPerson =
    props.fieldInfo._parentFieldInfo.component.data.components.btnEditPerson;

  function getComboData(dsName) {
    let ds = props.fieldInfo.getDataSource(dsName).dataArray;

    return ds;
  }

  function handleBtnInsertPerson_Click() {
    btnInsertPerson.props.fieldInfo._parentFieldInfo._paramList.formParams = {
      ...btnInsertPerson.props.fieldInfo._parentFieldInfo._paramList.formParams,
      isIndividualPerson: dataSource.isIndividualPerson,
      tblPersonId: "",
    };
  }

  function handleBtnEditPerson_Click() {
    btnEditPerson.props.fieldInfo._parentFieldInfo._paramList.formParams = {
      ...btnInsertPerson.props.fieldInfo._parentFieldInfo._paramList.formParams,
      isIndividualPerson: dataSource.isIndividualPerson,
      tblPersonId: dataSource.tblPersonId,
    };
  }

  function handleChangeInput(e, targetName) {
    handleSetData({ ...dataSource, [targetName]: e.target.value });

    if (targetName === "tblPersonId") {
      for (const iterator of e.target.children) {
        if (
          iterator.attributes[0].value === e.target.value &&
          iterator.attributes[1].value === "individual"
        ) {
          handleSetData((data) => ({
            ...data,
            isIndividualPerson: true,
          }));
        } else if (
          iterator.attributes[0].value === e.target.value &&
          iterator.attributes[1].value === "entity"
        ) {
          handleSetData((data) => ({
            ...data,
            isIndividualPerson: false,
          }));
        }
      }
      btnEditPerson.props.fieldInfo._parentFieldInfo._paramList.formParams = {
        ...btnEditPerson.props.fieldInfo._parentFieldInfo._paramList.formParams,
        isIndividualPerson: dataSource.isIndividualPerson,
        tblPersonId: dataSource.tblPersonId,
      };
      // btnInsertPerson.props.fieldInfo._parentFieldInfo._paramList.formParams = {
      //   isIndividualPerson: 1,
      // };
    }
  }

  if (dataSource.isIndividualPerson === false) {
    btnInsertPerson.props.fieldInfo._parentFieldInfo._paramList.formParams = {
      ...btnInsertPerson.props.fieldInfo._parentFieldInfo._paramList.formParams,
      isIndividualPerson: false,
    };
  }

  if (dataSource.isIndividualPerson === undefined) {
    dataSource.isIndividualPerson = true;
  }

  return (
    <div className="mt-5">
      <div>
        <p className="mb-0">What is type of person?</p>
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            name="isIndividualPerson"
            id="flexRadioDefault1"
            checked={dataSource.isIndividualPerson === true}
            onChange={() =>
              handleSetData({
                ...dataSource,
                isIndividualPerson: true,
              })
            }
          />
          <label class="form-check-label" for="flexRadioDefault1">
            Individual
          </label>
        </div>
        <div class="form-check">
          <input
            class="form-check-input"
            type="radio"
            name="isEntityPerson"
            id="flexRadioDefault2"
            checked={dataSource.isIndividualPerson === false}
            onChange={() =>
              handleSetData({
                ...dataSource,
                isIndividualPerson: false,
              })
            }
          />
          <label class="form-check-label" for="flexRadioDefault2">
            Entity
          </label>
        </div>
      </div>

      <div className="row mt-3">
        <div className="col-9">
          <span>
            <FormGroup>
              <Label for="exampleSelect">
                Client name (Entity / Individual):
              </Label>
              {listOfAllPersons.length > 0 ? (
                <Input
                  id="exampleSelect"
                  name="select"
                  type="select"
                  value={
                    dataSource.tblPersonId === undefined
                      ? getComboData(
                          "dsFintrac_Transaction_Action_Person_PersonList_ForCombo"
                        )[0].tblPersonId
                      : dataSource.tblPersonId
                  }
                  onChange={(e) => handleChangeInput(e, "tblPersonId")}
                  list="person"
                >
                  <option key={Math.random()} value={0} type={"individual"}>
                    Select a person
                  </option>
                  {relatedPersonIndicator === true ||
                  relatedPersonIndicator === "true"
                    ? listOfRelatedPersons.map((item, inx) => {
                        return (
                          <option
                            key={inx}
                            value={item.tblPersonId}
                            type={
                              item.isIndividualPerson === true
                                ? "individual"
                                : "entity"
                            }
                          >
                            {item.name}
                          </option>
                        );
                      })
                    : getComboData(
                        "dsFintrac_Transaction_Action_Person_PersonList_ForCombo"
                      )
                        .map((item, inx) => {
                          return (
                            <option
                              key={inx}
                              value={item.tblPersonId}
                              type={
                                item.isIndividualPerson === true
                                  ? "individual"
                                  : "entity"
                              }
                            >
                              {item.name}
                            </option>
                          );
                        })
                        .filter((option, inx) => {
                          if (dataSource.isIndividualPerson === undefined) {
                            if (dataSource.tblPersonId) {
                              return (
                                option.props.value == dataSource.tblPersonId
                              );
                            } else if (dataSource.tblPersonId === undefined)
                              return true;
                          } else if (dataSource.isIndividualPerson === true) {
                            return option.props.type === "individual";
                          } else {
                            return (
                              option.props.value === 0 ||
                              option.props.type === "entity"
                            );
                          }
                        })}
                </Input>
              ) : (
                <div>
                  <label className="text-danger text-bold">
                    Create your first person{" "}
                  </label>
                </div>
              )}
            </FormGroup>
            <div className="d-flex flex-row">
              <div onClick={handleBtnInsertPerson_Click}>
                <ButtonFieldInfo
                  key={9998}
                  fieldInfo={btnInsertPerson.props.fieldInfo}
                  externalData={dataSource}
                  getDataFromExternal="true"
                />
              </div>
              <div onClick={handleBtnEditPerson_Click}>
                <ButtonFieldInfo
                  key={9999}
                  fieldInfo={btnEditPerson.props.fieldInfo}
                  externalData={dataSource}
                  getDataFromExternal="true"
                />
              </div>
            </div>
          </span>
        </div>
      </div>
    </div>
  );
}

export default TransactionPersonComponent;
