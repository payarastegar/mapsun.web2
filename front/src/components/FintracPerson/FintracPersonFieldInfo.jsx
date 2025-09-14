import React, { useEffect, useState } from "react";
import PersonComponent from "./PersonComponent/PersonComponent";
import SidebarComponent from "../FintracTransaction/UtilityComponents/SidebarComponent";
import { v4 as uuidv4 } from "uuid";

function FintracPersonFieldInfo(props) {
  const [activeComponent, setActiveComponent] = useState();
  const [showError, setShowError] = useState(false);
  const [data, setData] = useState({});

  let dsPersonEdit;

  const isIndividualPerson =
    props.fieldInfo._parentFieldInfo._parentFieldInfo._paramList.formParams
      .isIndividualPerson;

  let tblPersonId;
  let personUid_Text;

  useEffect(function() {
    handleChangeComponent("PersonInfo");

    if (!dsPersonEdit.tblPersonId) {
      setData({
        person_Surname: "",
        person_GivenName: "",
        person_OtherName: "",
        person_PhoneNumber: "",
        person_Extension: "",
        person_EmailAddress: "",
        person_Alias: "",
        person_DateOfBirth: "",
        person_CountryOfResidence_tblCountryId: 1,
        // person_CountryOfResidence_tblProvinceId: "",
        person_EmployerName: "",
        ///////////////////////////////////////////
        identification_IdentifierTypeCodeMsId: "",
        identification_NumberOfIdentifier: "",
        identification_JurisdictionOfIssue_tblCountryId: 1,
        identification_JurisdictionOfIssue_tblProvinceId: 0,
        identification_JurisdictionOfIssue_tblProvince_Text_Other: "",
        identification_ExpireDateOfIdentifier: "",
        ///////////////////////////////////////////
        address_UnitNumber: "",
        address_BuildingNumber: "",
        address_tblCountryId: 1,
        address_tblProvinceId: 0,
        address_tblProvince_Text_Other: "",
        address_District: "",
        address_SubProvince: "",
        address_PostalCode: "",
        address_City: "",
        address_StreetAddress: "",
        ///////////////////////////////////////////
        isPerson: "",
        isEntity: "",
        ///////////////////////////////////////////
        entity_Name: "",
        entity_NatureOfBusiness: "",
        entity_RegistrationIncorporation_Number: "",
        entity_RegistrationIncorporation_JurisdictionOfIssue_tblCountryId: 1,
        entity_RegistrationIncorporation_JurisdictionOfIssue_tblProvinceId: 0,
        entity_RegistrationIncorporation_JurisdictionOfIssue_tblProvince_Text_Other:
          "",
        entity_RegistrationIncorporation_TypeMsId: "",
        entity_StructureTypeMsId: "",
        entity_StructureType_Text_Other: "",
        ///////////////////////////////////////////
        isBusinessRelationship: false,
        tblOccupationId: "",
        bicOrBeiCode: "",
        ///////////////////////////////////////////
        person_employerInfo_name: "",
        person_EmployerInfo_TelephoneNumber: "",
        person_EmployerInfo_ExtensionNumber: "",
        person_EmployerInfo_Address_UnitNumber: "",
        person_EmployerInfo_Address_BuildingNumber: "",
        person_EmployerInfo_Address_tblCountryId: 1,
        person_EmployerInfo_Address_tblProvinceId: 0,
        person_EmployerInfo_Address_tblProvince_Text_Other: "",
        person_EmployerInfo_Address_District: "",
        person_EmployerInfo_Address_SubProvince: "",
        person_EmployerInfo_Address_PostalCode: "",
        person_EmployerInfo_Address_City: "",
        person_EmployerInfo_Address_StreetAddress: "",
        ///////////////////////////////////////////
        person_Member_tblPerson_MemberId: "",
        person_Member_PersonMemberTypeMsId: 230005,
        person_Member_Surname: "",
        person_Member_GivenName: "",
        person_Member_OtherName: "",
        person_Member_TelephoneNumber: "",
        person_Member_ExtensionNumber: "",
        person_Member_Address_UnitNumber: "",
        person_Member_Address_BuildingNumber: "",
        person_Member_Address_tblCountryId: 1,
        person_Member_Address_tblProvinceId: 0,
        person_Member_Address_tblProvince_Text_Other: "",
        person_Member_Address_District: "",
        person_Member_Address_SubProvince: "",
        person_Member_Address_PostalCode: "",
        person_Member_Address_City: "",
        person_Member_Address_StreetAddress: "",
        tblPersonId: null,
      });

      personUid_Text = uuidv4();

      btnSave.props.fieldInfo._parentFieldInfo._paramList.formParams = {
        ...btnSave.props.fieldInfo._parentFieldInfo._paramList.formParams,
        personUid_Text: personUid_Text,
      };

      btnOpenPerson_MemberEdit.props.fieldInfo._parentFieldInfo._paramList.formParams = {
        ...btnOpenPerson_MemberEdit.props.fieldInfo._parentFieldInfo._paramList
          .formParams,
        personUid_Text: personUid_Text,
      };

      // btnSavePerson_Member.props.fieldInfo._parentFieldInfo._paramList.formParams = {
      //   ...btnSavePerson_Member.props.fieldInfo._parentFieldInfo._paramList
      //     .formParams,
      //   personUid_Text: personUid_Text,
      // };
    } else {
      setData(dsPersonEdit);
    }
  }, []);

  if (dsPersonEdit) {
    tblPersonId = dsPersonEdit.tblPersonId;
  }

  const btnSave =
    props.fieldInfo._parentFieldInfo.component.data.components.btnSave;

  const btnOpenPerson_MemberEdit =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnOpenPerson_MemberEdit;

  const btnOpenPerson_MemberEdit_2 =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnOpenPerson_MemberEdit_2;

  const btnDeletePerson_Member =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnDeletePerson_Member;

  const btnOpenOccupationEdit =
    props.fieldInfo._parentFieldInfo.component.data.components
      .btnOpenOccupationEdit;

  const handleChangeComponent = (newAction) => {
    // props.setActiveComponent(newAction);
    setActiveComponent(newAction);
  };

  function getDataSourceForFintrac(dsName) {
    return props.fieldInfo.getDataSource(dsName);
  }

  dsPersonEdit = getDataSourceForFintrac("dsFintrac_Person_PersonEdit")
    .dataArray[
    getDataSourceForFintrac("dsFintrac_Person_PersonEdit").dataArray.length - 1
  ];

  function handleChangeInput(e, targetName) {
    setData((data) => ({ ...data, [targetName]: e.target.value }));

    if (targetName === "person_CountryOfResidence_tblCountryId") {
      setData((data) => ({
        ...data,
        address_tblCountryId: e.target.value,
      }));
    }

    if (targetName === "identification_JurisdictionOfIssue_tblCountryId") {
      setData((data) => ({
        ...data,
        identification_JurisdictionOfIssue_tblProvinceId: 0,
      }));
    }

    if (targetName === "address_tblCountryId") {
      setData((data) => ({ ...data, address_tblProvinceId: 0 }));
    }

    if (
      targetName ===
      "entity_RegistrationIncorporation_JurisdictionOfIssue_tblCountryId"
    ) {
      setData((data) => ({
        ...data,
        entity_RegistrationIncorporation_JurisdictionOfIssue_tblProvinceId: 0,
      }));
    }

    if (targetName === "person_EmployerInfo_Address_tblCountryId") {
      setData((data) => ({
        ...data,
        person_EmployerInfo_Address_tblProvinceId: 0,
      }));
    }

    if (targetName === "person_Member_Address_tblCountryId") {
      setData((data) => ({ ...data, person_Member_Address_tblProvinceId: 0 }));
    }

    setShowError(true);
  }

  function getComboData(dsName) {
    let ds = props.fieldInfo.getDataSource(dsName).dataArray;

    return ds;
  }

  return (
    <>
      <div
        className="container"
        style={{ minHeight: "70vh", dir: "ltr", textAlign: "left" }}
      >
        <div className="row">
          <PersonComponent
            data={data}
            getDataSourceForFintrac={getDataSourceForFintrac}
            activeComponent={activeComponent}
            getComboData={getComboData}
            handleChangeInput={handleChangeInput}
            isIndividualPerson={isIndividualPerson}
            btnOpenOccupationEdit={btnOpenOccupationEdit}
            btnOpenPerson_MemberEdit={btnOpenPerson_MemberEdit}
            btnOpenPerson_MemberEdit_2={btnOpenPerson_MemberEdit_2}
            btnDeletePerson_Member={btnDeletePerson_Member}
            personUid_Text={personUid_Text}
          />
          <SidebarComponent
            data={data}
            activeComponent={activeComponent}
            handleChangeComponent={handleChangeComponent}
            isIndividualPerson={isIndividualPerson}
            btnSave={btnSave}
            props={props}
            tblPersonId={tblPersonId}
            personUid_Text={personUid_Text}
          />
        </div>
      </div>
    </>
  );
}

export default FintracPersonFieldInfo;
