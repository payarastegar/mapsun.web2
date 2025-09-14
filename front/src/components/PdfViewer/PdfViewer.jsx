import React, { useEffect } from "react";
import { useState, useRef } from "react";

import { Button } from "reactstrap";

import { Document, Page, pdfjs } from "react-pdf";

import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import WebService from "../../WebService";

export default function PdfViewer({ src }) {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${
    pdfjs.version
  }/pdf.worker.js`;

  const ref = useRef();
  const toggle = () => setModal(!modal);

  let pdfUrl;

  useEffect(() => {
    if (src) {
      pdfUrl = WebService.getFileUrl(src.row.documentHyperLink);

      setModal(true);
      setPageNumber(1);

      console.log(pdfUrl);
    }
  }, [src]);

  if (src) {
    pdfUrl = WebService.getFileUrl(src.row.documentHyperLink);

    console.log(pdfUrl);
  }

  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [modal, setModal] = useState(false);
  const [opacity, setOpacity] = useState(0.2);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const maxHeight = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0
  );

  const mainMenuHeight = document.querySelector(".MainMenu").offsetHeight;

  const pdfHeight = maxHeight - mainMenuHeight * 4;

  return (
    <div className="position-relative d-flex align-items-end justify-content-center">
      <Document
        file={pdfUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<LoadingSpinner />}
      >
        <Page pageNumber={pageNumber} height={pdfHeight} scale={1.02} />
      </Document>

      {numPages > 1 && (
        <div
          className="position-absolute top-150 start-150 translate-middle d-flex flex-column gap-2"
          style={{ opacity, transition: "opacity 0.3s" }}
          onMouseEnter={() => setOpacity(1)}
          onMouseLeave={() => setOpacity(0.25)}
        >
          <div className="mb-2">
            <Button
              color="secondary"
              onClick={() => setPageNumber(pageNumber - 1)}
              disabled={pageNumber <= 1}
            >
              Prev
            </Button>
            <Button
              color="secondary"
              onClick={() => setPageNumber(pageNumber + 1)}
              disabled={pageNumber >= numPages}
            >
              Next
            </Button>
            <p className="text-center">
              Page {pageNumber} of {numPages}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
