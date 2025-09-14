import React, { useEffect, useRef } from "react";
import { Button } from "reactstrap";
import { ReactToPrint, useReactToPrint } from "react-to-print";
import WebService from "../../WebService";

function PrintComponentFieldInfo(props) {
  let bodyMainSection;

  const printDataSourceName =
    props.fieldInfo._parentFieldInfo.form_Print_Body_Main_DataSourceName;

  //get data from datasource
  function getDataSourceForFintrac(dsName) {
    return props.fieldInfo.getDataSource(dsName);
  }

  bodyMainSection = getDataSourceForFintrac(printDataSourceName).dataArray[0]
    .htmlText;

  const ref = useRef();

  const reportPrint = (
    <ReactToPrint
      bodyClass="print-agreement"
      content={() => ref.current}
      trigger={() => <Button color="primary">Print</Button>}
    />
  );

  const getPrintHtml = function(htmlString) {
    const userInfo = WebService.getUserInfo();
    const encodedUserInfo = encodeURIComponent(JSON.stringify(userInfo));
    htmlString = htmlString.replaceAll("$userInfoReplace$", encodedUserInfo);

    return htmlString;
  };

  console.log(getPrintHtml(bodyMainSection));
  return (
    <>
      <div>
        <ReactToPrint
          bodyClass="print-agreement"
          content={() => ref.current}
          trigger={() => (
            <Button
              color="primary"
              className="btn btn-primary btn-lg btn-block my-3"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="21"
                height="21"
                fill="currentColor"
                class="bi bi-printer-fill"
                viewBox="0 0 21 21"
              >
                <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1" />
                <path d="M5 1a2 2 0 0 0-2 2v2H2a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h1v1a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-1h1a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-1V3a2 2 0 0 0-2-2zM4 3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2H4zm1 5a2 2 0 0 0-2 2v1H2a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v-1a2 2 0 0 0-2-2zm7 2v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1" />
              </svg>
              <i class="fa-solid fa-print" />
              Print
            </Button>
          )}
        />
        <div className="border border-primary">
          <div
            dangerouslySetInnerHTML={{ __html: getPrintHtml(bodyMainSection) }}
            ref={ref}
          />
        </div>
      </div>
    </>
  );
}

export default PrintComponentFieldInfo;
