import React, { useState } from "react";
import ButtonFieldInfo from "../../ButtonFieldInfo/ButtonFieldInfo";
import { Nav, NavItem, NavLink } from "reactstrap";
import { math } from "@amcharts/amcharts4/core";

function SidebarComponent({
  isIndividualPerson,
  activeComponent,
  btnSavePerson_Member,
  btnSave,
  data,
  handleChangeComponent,
  showError,
  tblPersonId,
}) {
  return (
    <>
      <div
        className="col-3 flex-d flex-column p-3 mb-5"
        style={{
          backgroundColor: "#F8F8F8",
          border: "2px solid #E8E8E8",
        }}
      >
        <h3>
          New{" "}
          {isIndividualPerson === "true" || isIndividualPerson === true
            ? "Individual"
            : "Entity"}
        </h3>
        <div class="d-grid gap-2 mt-3">
          <button
            key={Math.random()}
            class="btn btn-light"
            type="button"
            style={{
              display: "block",
              minWidth: "100%",
              border: "2px solid #E8E8E8",
            }}
            // onClick={handleNextPart}
          >
            Next part
            <i class="bi bi-arrow-right" style={{ marginLeft: "5px" }} />
          </button>
          {activeComponent === "PersonInfo" ? (
            <button
              key={Math.random()}
              class="btn btn-disabled mt-3"
              type="button"
              style={{
                display: "block",
                minWidth: "100%",
                border: "2px solid #E8E8E8",
                cursor: "not-allowed",
              }}
              // onClick={handlePreviousPart}
            >
              <i class="bi bi-arrow-left" style={{ marginRight: "5px" }} />
              Previous part
            </button>
          ) : (
            <button
              key={Math.random()}
              class="btn btn-light mt-3"
              type="button"
              style={{
                display: "block",
                minWidth: "100%",
                border: "2px solid #E8E8E8",
              }}
              // onClick={handlePreviousPart}
            >
              <i class="bi bi-arrow-left" style={{ marginRight: "5px" }} />
              Previous part
            </button>
          )}
        </div>

        {activeComponent !== "PersonMember" && (
          <div className="mt-3">
            <ButtonFieldInfo
              key={Math.random()}
              fieldInfo={btnSave.props.fieldInfo}
              externalData={data}
              getDataFromExternal="true"
            />
          </div>
        )}
        <div
          style={{
            backgroundColor: "#F8F8F8",
            border: "1px solid #E0E0E0",
            marginTop: "20px",
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
            {isIndividualPerson === "true" || isIndividualPerson === true
              ? "Person"
              : "Entity "}{" "}
            info parts
          </p>
          <Nav justified pills vertical key={Math.random()}>
            <NavItem key={Math.random()}>
              <NavLink
                key={Math.random()}
                href="#"
                className={activeComponent === "PersonInfo" && "active"}
                onClick={() => handleChangeComponent("PersonInfo")}
              >
                {isIndividualPerson === "true" || isIndividualPerson === true
                  ? "Person"
                  : "Entity "}{" "}
                Info
              </NavLink>
            </NavItem>
            <NavItem key={Math.random()}>
              <NavLink
                key={Math.random()}
                href="#"
                className={activeComponent === "PersonAddress" && "active"}
                onClick={() => handleChangeComponent("PersonAddress")}
              >
                {isIndividualPerson === "true" || isIndividualPerson === true
                  ? "Person"
                  : "Entity "}{" "}
                Address
              </NavLink>
            </NavItem>
            <NavItem key={Math.random()}>
              <NavLink
                key={Math.random()}
                href="#"
                className={
                  activeComponent === "PersonIdentification" && "active"
                }
                onClick={() => handleChangeComponent("PersonIdentification")}
              >
                {isIndividualPerson === "true" || isIndividualPerson === true
                  ? "Person"
                  : "Entity "}{" "}
                Identification
              </NavLink>
            </NavItem>
            {isIndividualPerson === "true" || isIndividualPerson === true ? (
              <>
                <NavItem key={Math.random()}>
                  <NavLink
                    key={Math.random()}
                    href="#"
                    className={activeComponent === "PersonEmployer" && "active"}
                    onClick={() => handleChangeComponent("PersonEmployer")}
                  >
                    {isIndividualPerson === "true" ||
                    isIndividualPerson === true
                      ? "Person"
                      : "Entity "}
                    Employer Info
                  </NavLink>
                </NavItem>
              </>
            ) : (
              <NavItem key={Math.random()}>
                <NavLink
                  key={Math.random()}
                  href="#"
                  className={activeComponent === "PersonMember" && "active"}
                  onClick={() => handleChangeComponent("PersonMember")}
                >
                  {isIndividualPerson === "true" || isIndividualPerson === true
                    ? "Person"
                    : "Entity "}{" "}
                  Members
                </NavLink>
              </NavItem>
            )}
          </Nav>
        </div>
        {data.isBusinessRelationship && (
          <div
            style={{ position: "static", zIndex: 999 }}
            className="alert alert-info my-4"
            role="alert"
          >
            Business Relationship
          </div>
        )}
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
    </>
  );
}

export default SidebarComponent;
