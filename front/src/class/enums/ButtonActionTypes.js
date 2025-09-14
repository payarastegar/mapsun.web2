import Enum_Base from "./Enum_Base";

/** Enum Class ButtonActionTypes */
class ButtonActionTypes extends Enum_Base {
  /** Enum of ButtonActionTypes
   * @typedef {string} ButtonActionTypes */

  static OpenDialog = "OpenDialog";
  static CallWebSvc = "CallWebSvc";
  static CancelDialog = "CancelDialog";
  static CloseForm = "CloseForm";
  static CloseFormAndOpenDialog = "CloseFormAndOpenDialog";
  static Nothing = "Nothing";
  static CallWebSvcAndCloseDialog = "CallWebSvcAndCloseDialog";
  static DownloadHyperlink = "DownloadHyperlink";
  static OpenImageViewer = "OpenImageViewer";
  static OpenPdfViewer = "OpenPdfViewer";

  static PrintByTemplate = "PrintByTemplate";
  static DesignPrintTemplate = "DesignPrintTemplate";
  static CopyToClipBoard = "CopyToClipBoard";
}

export default ButtonActionTypes;
