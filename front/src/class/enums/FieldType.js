import Enum_Base from "./Enum_Base";

/** Enum Class FieldType */
class FieldType extends Enum_Base {
  /** Enum of FieldType
   * @typedef {string} FieldType */

  static Text = "Text";

  static ProgressBar = "ProgressBar";
  static Number = "Number";
  static Date = "Date";
  static Combo = "Combo";
  static ComboFix = "ComboFix";
  static ComboOpen = "ComboOpen";
  static ComboSearch = "ComboSearch";
  static CheckBox = "CheckBox";
  static Grid = "Grid";
  static Form = "Form";
  static DataSource = "DataSource";
  static Image = "Image";
  static Button = "Button";
  static Label = "Label";
  static WebService_Update = "WebService_Update";
  static ImageViewer = "ImageViewer";
  static PdfViewer = "PdfViewer";
  static ParameterControl = "ParameterControl";

  static Chart = "Chart";
  static Map = "Map";

  static FormMenu = "FormMenu";
  static FintracTransactionComponent = "FintracTransactionComponent";
  static FintracPersonComponent = "FintracPersonComponent";
  static PrintComponent = "PrintComponent";
  static ProjectDashboard = "ProjectDashboard";
}

export default FieldType;
