import React, { useEffect, useState } from "react";
import InputField from "../../FintracTransaction/UtilityComponents/InputFieldComponent";
import { FormGroup, Input, Label } from "reactstrap";
import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import { random } from "@amcharts/amcharts4/.internal/core/utils/String";

function PersonComponent({
  data,
  getDataSourceForFintrac,
  activeComponent,
  getComboData,
  handleChangeInput,
  isIndividualPerson,
  btnOpenOccupationEdit,
  btnOpenPerson_MemberEdit,
  btnOpenPerson_MemberEdit_2,
  btnDeletePerson_Member,
  personUid_Text,
}) {
  let dsPerson_ListOfMembers = getDataSourceForFintrac(
    "dsFintrac_Person_ListOfMembers"
  ).dataArray;

  return (
    <>
      {activeComponent === "PersonInfo" &&
      (isIndividualPerson === "true" || isIndividualPerson === true) ? (
        <div className="col-9">
          <div className="row">
            <InputField
              lableTxt="Surname:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_Surname}
              name={"person_Surname"}
              handleChangeInput={(e) => handleChangeInput(e, "person_Surname")}
            />
            <InputField
              lableTxt="Given name:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_GivenName}
              name={"person_GivenName"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_GivenName")
              }
            />
            <InputField
              lableTxt="Other name:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_OtherName}
              name={"person_OtherName"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_OtherName")
              }
            />
            <InputField
              lableTxt="Person alias:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_Alias}
              name={"person_Alias"}
              handleChangeInput={(e) => handleChangeInput(e, "person_Alias")}
            />
            <InputField
              lableTxt="Phone number:"
              maxWidth={"50%"}
              type={"tel"}
              className={"mb-4 col-8"}
              value={data.person_PhoneNumber}
              name={"person_PhoneNumber"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_PhoneNumber")
              }
            />
            <InputField
              lableTxt="Extention:"
              maxWidth={"50%"}
              type={"number"}
              className={"mb-4 col-8"}
              value={data.person_Extension}
              name={"person_Extension"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_Extension")
              }
            />
            <InputField
              lableTxt="Email address:"
              maxWidth={"50%"}
              type={"email"}
              className={"mb-4 col-8"}
              value={data.person_EmailAddress}
              name={"person_EmailAddress"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_EmailAddress")
              }
            />
            <InputField
              lableTxt="Date of birth:"
              maxWidth={"50%"}
              type={"date"}
              className={"mb-4 col-8"}
              value={data.person_DateOfBirth}
              name={"person_DateOfBirth"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_DateOfBirth")
              }
              max={"2999-12-31"}
            />
            <div className="col-6 mb-3">
              <FormGroup>
                <Label for="person_CountryOfResidence_tblCountryId">
                  Country of residence:
                </Label>
                <Input
                  id="person_CountryOfResidence_tblCountryId"
                  name="person_CountryOfResidence_tblCountryId"
                  type="select"
                  value={data.person_CountryOfResidence_tblCountryId}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "person_CountryOfResidence_tblCountryId"
                    )
                  }
                >
                  {getComboData("dsFintrac_Country_CountryList_ForCombo").map(
                    (item, inx) => (
                      <option key={inx} value={item.tblCountryId}>
                        {item.name}
                      </option>
                    )
                  )}
                </Input>
              </FormGroup>
            </div>
            <InputField
              lableTxt="Bie or Bei code:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.bicOrBeiCode}
              name={"bicOrBeiCode"}
              handleChangeInput={(e) => handleChangeInput(e, "bicOrBeiCode")}
            />
            <div className="col-6 ">
              <FormGroup>
                <Label for="tblOccupationId">Occupation:</Label>
                <Input
                  id="tblOccupationId"
                  name="tblOccupationId"
                  type="select"
                  value={data.tblOccupationId}
                  onChange={(e) => handleChangeInput(e, "tblOccupationId")}
                >
                  {data.tblOccupationId === "" ? (
                    <option key={0} value={null}>
                      Select an item
                    </option>
                  ) : null}
                  {getComboData(
                    "dsFintrac_Occupation_OccupationList_ForCombo"
                  ).map((item, inx) => (
                    <option key={inx} value={item.tblOccupationId}>
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
              <div className="mt-2">
                <ButtonFieldInfo
                  key={Math.random()}
                  fieldInfo={btnOpenOccupationEdit.props.fieldInfo}
                  externalData={data}
                  getDataFromExternal="true"
                />
              </div>
            </div>
            {data.address_tblProvinceId == 0 && (
              <InputField
                lableTxt="Other province name:"
                maxWidth={"50%"}
                type={"text"}
                className={"mb-4 col-8"}
                value={data.address_tblProvince_Text_Other}
                name={"address_tblProvince_Text_Other"}
                handleChangeInput={(e) =>
                  handleChangeInput(e, "address_tblProvince_Text_Other")
                }
              />
            )}
            <div className="col-6 ">
              <FormGroup>
                <Label for="risky_NonPhysicalClient">
                  Non Physical Client:
                </Label>
                <Input
                  id="risky_NonPhysicalClient"
                  name="risky_NonPhysicalClient"
                  type="select"
                  value={data.risky_NonPhysicalClient}
                  onChange={(e) =>
                    handleChangeInput(e, "risky_NonPhysicalClient")
                  }
                >
                  <option key={Math.random()} value={true}>
                    Yes
                  </option>
                  <option key={Math.random()} value={false}>
                    No
                  </option>
                </Input>
              </FormGroup>
            </div>
          </div>
        </div>
      ) : null}
      {activeComponent === "PersonInfo" &&
      (isIndividualPerson === "false" || isIndividualPerson === false) ? (
        <div className="col-9">
          <div className="row">
            <InputField
              lableTxt="Entity name:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.entity_Name}
              name={"entity_Name"}
              handleChangeInput={(e) => handleChangeInput(e, "entity_Name")}
            />
            <InputField
              lableTxt="Nature of business:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.entity_NatureOfBusiness}
              name={"entity_NatureOfBusiness"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "entity_NatureOfBusiness")
              }
            />
            <InputField
              lableTxt="Registration incorporation number:"
              maxWidth={"50%"}
              type={"tel"}
              className={"mb-4 col-8"}
              value={data.entity_RegistrationIncorporation_Number}
              name={"entity_RegistrationIncorporation_Number"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "entity_RegistrationIncorporation_Number")
              }
            />
            <div className="col-6 mb-4">
              <FormGroup>
                <Label for="entity_RegistrationIncorporation_JurisdictionOfIssue_tblCountryId">
                  Registration incorporation country:
                </Label>
                <Input
                  id="entity_RegistrationIncorporation_JurisdictionOfIssue_tblCountryId"
                  name="entity_RegistrationIncorporation_JurisdictionOfIssue_tblCountryId"
                  type="select"
                  value={
                    data.entity_RegistrationIncorporation_JurisdictionOfIssue_tblCountryId
                  }
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "entity_RegistrationIncorporation_JurisdictionOfIssue_tblCountryId"
                    )
                  }
                >
                  {getComboData("dsFintrac_Country_CountryList_ForCombo").map(
                    (item, inx) => (
                      <option key={inx} value={item.tblCountryId}>
                        {item.name}
                      </option>
                    )
                  )}
                </Input>
              </FormGroup>
            </div>
            <div className="col-6 mb-4">
              <FormGroup>
                <Label for="entity_RegistrationIncorporation_JurisdictionOfIssue_tblProvinceId">
                  Registration incorporation province:
                </Label>
                <Input
                  id="entity_RegistrationIncorporation_JurisdictionOfIssue_tblProvinceId"
                  name="entity_RegistrationIncorporation_JurisdictionOfIssue_tblProvinceId"
                  type="select"
                  value={
                    data.entity_RegistrationIncorporation_JurisdictionOfIssue_tblProvinceId
                  }
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "entity_RegistrationIncorporation_JurisdictionOfIssue_tblProvinceId"
                    )
                  }
                >
                  {getComboData("dsFintrac_Province_ProvinceList_ForCombo")
                    .filter(
                      (item) =>
                        item.tblCountryId == 0 ||
                        item.tblCountryId ==
                          data.entity_RegistrationIncorporation_JurisdictionOfIssue_tblCountryId
                    )
                    .map((item, inx) => (
                      <option key={inx} value={item.tblProvinceId}>
                        {item.provinceName}
                      </option>
                    ))}
                </Input>
              </FormGroup>
            </div>

            <div className="col-6 mb-4">
              <FormGroup>
                <Label for="entity_RegistrationIncorporation_TypeMsId">
                  Registration type:
                </Label>
                <Input
                  id="entity_RegistrationIncorporation_TypeMsId"
                  name="entity_RegistrationIncorporation_TypeMsId"
                  type="select"
                  value={data.entity_RegistrationIncorporation_TypeMsId}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "entity_RegistrationIncorporation_TypeMsId"
                    )
                  }
                >
                  {getComboData(
                    "dsFintrac_Person_RegistrationIncorporationTypeMsId_ForCombo"
                  ).map((item, inx) => (
                    <option
                      key={inx}
                      value={item.registrationIncorporationTypeMsId}
                    >
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
            <div className="col-6 mb-4">
              <FormGroup>
                <Label for="entity_StructureTypeMsId">Structure type:</Label>
                <Input
                  id="entity_StructureTypeMsId"
                  name="entity_StructureTypeMsId"
                  type="select"
                  value={data.entity_StructureTypeMsId}
                  onChange={(e) =>
                    handleChangeInput(e, "entity_StructureTypeMsId")
                  }
                >
                  {data.entity_StructureTypeMsId === "" ? (
                    <option key={0} value={null}>
                      Select an item
                    </option>
                  ) : null}
                  {getComboData(
                    "dsFintrac_Person_EntityStructureTypeMsId_ForCombo"
                  ).map((item, inx) => (
                    <option key={inx} value={item.entityStructureTypeMsId}>
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
            {data.entity_StructureTypeMsId == 229002 && (
              <div className="col-6 mb-4">
                <FormGroup>
                  <Label for="entity_StructureType_Text_Other">
                    Other type of structure:
                  </Label>
                  <Input
                    id="entity_StructureType_Text_Other"
                    name="entity_StructureType_Text_Other"
                    type="text"
                    value={data.entity_StructureType_Text_Other}
                    onChange={(e) =>
                      handleChangeInput(e, "entity_StructureType_Text_Other")
                    }
                  />
                </FormGroup>
              </div>
            )}
            <div className="col-6 mb-4">
              <FormGroup>
                <Label for="risky_NonPhysicalClient">
                  Non Physical Client:
                </Label>
                <Input
                  id="risky_NonPhysicalClient"
                  name="risky_NonPhysicalClient"
                  type="select"
                  value={data.risky_NonPhysicalClient}
                  onChange={(e) =>
                    handleChangeInput(e, "risky_NonPhysicalClient")
                  }
                >
                  <option key={Math.random()} value={true}>
                    Yes
                  </option>
                  <option key={Math.random()} value={false}>
                    No
                  </option>
                </Input>
              </FormGroup>
            </div>
          </div>
        </div>
      ) : null}
      {activeComponent === "PersonAddress" && (
        <div className="col-9">
          <div className="row">
            <div className="col-6 mb-4">
              <FormGroup>
                <Label for="address_tblCountryId">Country:</Label>
                <Input
                  id="address_tblCountryId"
                  name="address_tblCountryId"
                  type="select"
                  value={data.address_tblCountryId}
                  onChange={(e) => handleChangeInput(e, "address_tblCountryId")}
                >
                  {getComboData("dsFintrac_Country_CountryList_ForCombo").map(
                    (item, inx) => (
                      <option key={inx} value={item.tblCountryId}>
                        {item.name}
                      </option>
                    )
                  )}
                </Input>
              </FormGroup>
            </div>
            <div className="col-6 mb-4">
              <FormGroup>
                <Label for="address_tblProvinceId">Province:</Label>
                <Input
                  id="address_tblProvinceId"
                  name="address_tblProvinceId"
                  type="select"
                  value={data.address_tblProvinceId}
                  onChange={(e) =>
                    handleChangeInput(e, "address_tblProvinceId")
                  }
                >
                  {getComboData("dsFintrac_Province_ProvinceList_ForCombo")
                    .filter(
                      (item) =>
                        item.tblCountryId === 0 ||
                        item.tblCountryId == data.address_tblCountryId
                    )
                    .map((item, inx) => (
                      <option key={inx} value={item.tblProvinceId}>
                        {item.provinceName}
                      </option>
                    ))}
                </Input>
              </FormGroup>
            </div>
            {data.address_tblProvinceId == 0 && (
              <InputField
                lableTxt="Other province name:"
                maxWidth={"50%"}
                type={"text"}
                className={"mb-4 col-8"}
                value={data.address_tblProvince_Text_Other}
                name={"address_tblProvince_Text_Other"}
                handleChangeInput={(e) =>
                  handleChangeInput(e, "address_tblProvince_Text_Other")
                }
              />
            )}
            <InputField
              lableTxt="City:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.address_City}
              name={"address_City"}
              handleChangeInput={(e) => handleChangeInput(e, "address_City")}
            />
            <InputField
              lableTxt="Street address:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.address_StreetAddress}
              name={"address_StreetAddress"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "address_StreetAddress")
              }
            />

            <InputField
              lableTxt="Building number:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.address_BuildingNumber}
              name={"address_BuildingNumber"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "address_BuildingNumber")
              }
            />
            <InputField
              lableTxt="Unit number:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.address_UnitNumber}
              name={"address_UnitNumber"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "address_UnitNumber")
              }
            />
            <InputField
              lableTxt="District:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.address_District}
              name={"address_District"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "address_District")
              }
            />
            <InputField
              lableTxt="Subprovince:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.address_SubProvince}
              name={"address_SubProvince"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "address_SubProvince")
              }
            />
            <InputField
              lableTxt="Postal code:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.address_PostalCode}
              name={"address_PostalCode"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "address_PostalCode")
              }
            />
          </div>
        </div>
      )}
      {activeComponent === "PersonIdentification" && (
        <div className="col-9">
          <div className="row">
            <div className="col-6 mb-3">
              <FormGroup>
                <Label for="identification_IdentifierTypeCodeMsId">
                  Identification type:
                </Label>
                <Input
                  id="identification_IdentifierTypeCodeMsId"
                  name="identification_IdentifierTypeCodeMsId"
                  type="select"
                  value={data.identification_IdentifierTypeCodeMsId}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "identification_IdentifierTypeCodeMsId"
                    )
                  }
                >
                  {getComboData(
                    "dsFintrac_Person_IdentifierTypeMsId_ForCombo"
                  ).map((item, inx) => (
                    <option key={inx} value={item.identifierTypeMsId}>
                      {item.name}
                    </option>
                  ))}
                </Input>
              </FormGroup>
            </div>
            <InputField
              lableTxt="Identification number:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-3 col-8"}
              value={data.identification_NumberOfIdentifier}
              name={"identification_NumberOfIdentifier"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "identification_NumberOfIdentifier")
              }
            />
            <InputField
              lableTxt="Identification expiration date:"
              maxWidth={"50%"}
              type={"date"}
              className={"mb-3 col-8"}
              value={data.identification_ExpireDateOfIdentifier}
              name={"identification_ExpireDateOfIdentifier"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "identification_ExpireDateOfIdentifier")
              }
              max={"2999-12-31"}
            />
            {data.identification_IdentifierTypeCodeMsId == 210007 ||
            data.identification_IdentifierTypeCodeMsId == 209003 ? (
              <InputField
                lableTxt="Other identification type:"
                maxWidth={"50%"}
                type={"text"}
                className={"mb-3 col-8"}
                value={data.identification_IdentifierType_Text_Other}
                name={"identification_IdentifierType_Text_Other"}
                handleChangeInput={(e) =>
                  handleChangeInput(
                    e,
                    "identification_IdentifierType_Text_Other"
                  )
                }
              />
            ) : (
              <div className="col-6 mb-3" />
            )}
            <div className="col-6 mb-3">
              <FormGroup>
                <Label for="identification_JurisdictionOfIssue_tblCountryId">
                  Identification country:
                </Label>
                <Input
                  id="identification_JurisdictionOfIssue_tblCountryId"
                  name="identification_JurisdictionOfIssue_tblCountryId"
                  type="select"
                  value={data.identification_JurisdictionOfIssue_tblCountryId}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "identification_JurisdictionOfIssue_tblCountryId"
                    )
                  }
                >
                  {getComboData("dsFintrac_Country_CountryList_ForCombo").map(
                    (item, inx) => (
                      <option key={inx} value={item.tblCountryId}>
                        {item.name}
                      </option>
                    )
                  )}
                </Input>
              </FormGroup>
            </div>
            <div className="col-6 mb-3">
              <FormGroup>
                <Label for="identification_JurisdictionOfIssue_tblProvinceId">
                  Identification province:
                </Label>
                <Input
                  id="identification_JurisdictionOfIssue_tblProvinceId"
                  name="identification_JurisdictionOfIssue_tblProvinceId"
                  type="select"
                  value={data.identification_JurisdictionOfIssue_tblProvinceId}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "identification_JurisdictionOfIssue_tblProvinceId"
                    )
                  }
                >
                  {getComboData("dsFintrac_Province_ProvinceList_ForCombo")
                    .filter(
                      (item) =>
                        item.tblCountryId === 0 ||
                        item.tblCountryId ==
                          data.identification_JurisdictionOfIssue_tblCountryId
                    )
                    .map((item, inx) => (
                      <option key={inx} value={item.tblProvinceId}>
                        {item.provinceName}
                      </option>
                    ))}
                </Input>
              </FormGroup>
            </div>
            {data.identification_JurisdictionOfIssue_tblProvinceId == 0 && (
              <InputField
                lableTxt="Other province name:"
                maxWidth={"50%"}
                type={"text"}
                className={"mb-4 col-8"}
                value={
                  data.identification_JurisdictionOfIssue_tblProvince_Text_Other
                }
                name={
                  "identification_JurisdictionOfIssue_tblProvince_Text_Other"
                }
                handleChangeInput={(e) =>
                  handleChangeInput(
                    e,
                    "identification_JurisdictionOfIssue_tblProvince_Text_Other"
                  )
                }
              />
            )}
          </div>
        </div>
      )}
      {activeComponent === "PersonEmployer" && (
        <div className="col-9">
          <div className="row">
            <InputField
              lableTxt="Name:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_EmployerInfo_Name}
              name={"person_EmployerInfo_Name"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_EmployerInfo_Name")
              }
            />
            <InputField
              lableTxt="Telephone number:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_EmployerInfo_TelephoneNumber}
              name={"person_EmployerInfo_TelephoneNumber"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_EmployerInfo_TelephoneNumber")
              }
            />
            <InputField
              lableTxt="Extention number:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_EmployerInfo_ExtensionNumber}
              name={"person_EmployerInfo_ExtensionNumber"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_EmployerInfo_ExtensionNumber")
              }
            />
            <InputField
              lableTxt="City:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_EmployerInfo_Address_City}
              name={"person_EmployerInfo_Address_City"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_EmployerInfo_Address_City")
              }
            />
            <div className="col-6 mb-4">
              <FormGroup>
                <Label for="person_EmployerInfo_Address_tblCountryId">
                  Country:
                </Label>
                <Input
                  id="person_EmployerInfo_Address_tblCountryId"
                  name="person_EmployerInfo_Address_tblCountryId"
                  type="select"
                  value={data.person_EmployerInfo_Address_tblCountryId}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "person_EmployerInfo_Address_tblCountryId"
                    )
                  }
                >
                  {getComboData("dsFintrac_Country_CountryList_ForCombo").map(
                    (item, inx) => (
                      <option key={inx} value={item.tblCountryId}>
                        {item.name}
                      </option>
                    )
                  )}
                </Input>
              </FormGroup>
            </div>
            <div className="col-6 mb-4">
              <FormGroup>
                <Label for="person_EmployerInfo_Address_tblProvinceId">
                  Province:
                </Label>
                <Input
                  id="person_EmployerInfo_Address_tblProvinceId"
                  name="person_EmployerInfo_Address_tblProvinceId"
                  type="select"
                  value={data.person_EmployerInfo_Address_tblProvinceId}
                  onChange={(e) =>
                    handleChangeInput(
                      e,
                      "person_EmployerInfo_Address_tblProvinceId"
                    )
                  }
                >
                  {getComboData("dsFintrac_Province_ProvinceList_ForCombo")
                    .filter(
                      (item) =>
                        item.tblCountryId === 0 ||
                        item.tblCountryId ==
                          data.person_EmployerInfo_Address_tblCountryId
                    )
                    .map((item, inx) => (
                      <option key={inx} value={item.tblProvinceId}>
                        {item.provinceName}
                      </option>
                    ))}
                </Input>
              </FormGroup>
            </div>
            {data.person_EmployerInfo_Address_tblProvinceId == 0 && (
              <InputField
                lableTxt="Other province name:"
                maxWidth={"50%"}
                type={"text"}
                className={"mb-4 col-8"}
                value={data.person_EmployerInfo_Address_tblProvince_Text_Other}
                name={"person_EmployerInfo_Address_tblProvince_Text_Other"}
                handleChangeInput={(e) =>
                  handleChangeInput(
                    e,
                    "person_EmployerInfo_Address_tblProvince_Text_Other"
                  )
                }
              />
            )}
            <InputField
              lableTxt="District:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_EmployerInfo_Address_District}
              name={"person_EmployerInfo_Address_District"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_EmployerInfo_Address_District")
              }
            />
            <InputField
              lableTxt="Street address:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_EmployerInfo_Address_StreetAddress}
              name={"person_EmployerInfo_Address_StreetAddress"}
              handleChangeInput={(e) =>
                handleChangeInput(
                  e,
                  "person_EmployerInfo_Address_StreetAddress"
                )
              }
            />

            <InputField
              lableTxt="Building number:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_EmployerInfo_Address_BuildingNumber}
              name={"person_EmployerInfo_Address_BuildingNumber"}
              handleChangeInput={(e) =>
                handleChangeInput(
                  e,
                  "person_EmployerInfo_Address_BuildingNumber"
                )
              }
            />
            <InputField
              lableTxt="Unit number:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_EmployerInfo_Address_UnitNumber}
              name={"person_EmployerInfo_Address_UnitNumber"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_EmployerInfo_Address_UnitNumber")
              }
            />
            <InputField
              lableTxt="Subprovince:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_EmployerInfo_Address_SubProvince}
              name={"person_EmployerInfo_Address_SubProvince"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_EmployerInfo_Address_SubProvince")
              }
            />
            <InputField
              lableTxt="Postal code:"
              maxWidth={"50%"}
              type={"text"}
              className={"mb-4 col-8"}
              value={data.person_EmployerInfo_Address_PostalCode}
              name={"person_EmployerInfo_Address_PostalCode"}
              handleChangeInput={(e) =>
                handleChangeInput(e, "person_EmployerInfo_Address_PostalCode")
              }
            />
          </div>
        </div>
      )}
      {activeComponent === "PersonMember" && (
        <div className="col-9">
          <div className="d-flex my-3" style={{ maxWidth: "60%", gap: "20px" }}>
            {activeComponent === "PersonMember" && (
              <div className="mt-3">
                <ButtonFieldInfo
                  key={Math.random()}
                  fieldInfo={btnOpenPerson_MemberEdit.props.fieldInfo}
                  externalData={data}
                  getDataFromExternal="true"
                />
              </div>
            )}
          </div>
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">#</th>
                <th scope="col">Member Type</th>
                <th scope="col">Surname</th>
                <th scope="col">Given Name</th>
                <th scope="col" />
                <th scope="col" />
              </tr>
            </thead>
            <tbody>
              {dsPerson_ListOfMembers.map((member, inx) => (
                <tr key={inx}>
                  <th scope="row">{inx + 1}</th>
                  <td>{member.personMemberTypeMsName}</td>
                  <td>{member.surname}</td>
                  <td>{member.givenName}</td>
                  <td>
                    <div
                      onClick={() => {
                        btnOpenPerson_MemberEdit_2.props.fieldInfo._parentFieldInfo._paramList.formParams = {
                          ...btnOpenPerson_MemberEdit_2.props.fieldInfo
                            ._parentFieldInfo._paramList.formParams,
                          tblPerson_MemberId: member.tblPerson_MemberId,
                        };
                      }}
                    >
                      <ButtonFieldInfo
                        key={Math.random()}
                        fieldInfo={btnOpenPerson_MemberEdit_2.props.fieldInfo}
                        externalData={data}
                        getDataFromExternal="true"
                      />
                    </div>
                  </td>
                  <td>
                    <div
                      onClick={() => {
                        btnOpenPerson_MemberEdit_2.props.fieldInfo._parentFieldInfo._paramList.formParams = {
                          ...btnOpenPerson_MemberEdit_2.props.fieldInfo
                            ._parentFieldInfo._paramList.formParams,
                          tblPerson_MemberId: member.tblPerson_MemberId,
                        };
                      }}
                    >
                      <ButtonFieldInfo
                        key={Math.random()}
                        fieldInfo={btnDeletePerson_Member.props.fieldInfo}
                        externalData={data}
                        getDataFromExternal="true"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default PersonComponent;
