import CheckBoxFieldInfo from "./CheckBoxFieldInfo/CheckBoxFieldInfo";
import ComboFieldInfo from "./ComboFieldInfo/ComboFieldInfo";
import NumberFieldInfo from "./NumberFieldInfo/NumberFieldInfo";
import TextFieldInfo from "./TextFieldInfo/TextFieldInfo";
import GridInfo from "./GridInfo/GridInfo";
import ImageFieldInfo from "./ImageFieldInfo/ImageFieldInfo";
import ButtonFieldInfo from "./ButtonFieldInfo/ButtonFieldInfo";
import LabelFieldInfo from "./LabelFieldInfo/LabelFieldInfo";
import FieldType from "../class/enums/FieldType";
import DateFieldInfo from "./DateFieldInfo/DateFieldInfo";
import ImageViewerFieldInfo from "./ImageViewerFieldInfo/ImageViewerFieldInfo";
import FormInfo from "./FormInfo/FormInfo";
import ChartFieldInfo from "./ChartFieldInfo/ChartFieldInfo";
import MapFieldInfo from "./MapFieldInfo/MapFieldInfo";
import GanttFieldInfo from "./GanttFieldInfo/GanttFieldInfo";
import FintracTransactionFieldInfo from "./FintracTransaction/FintracTransactionFieldInfo";
import FintracPersonFieldInfo from "./FintracPerson/FintracPersonFieldInfo";
import PrintComponentFieldInfo from "./PrintComponent/PrintComponentFieldInfo";
import ProjectDashboardFieldInfo from "./ProjectDashboard/ProjectDashboardFieldInfo";
import PdfViewerFieldInfo from "./PdfViewerFieldInfo/PdfViewerFieldInfo";

class ComponentUtils {
  /***
   * return Component Tag Class
   * @param fieldInfo
   * @return Component
   */
  static getComponentTag(fieldInfo) {
    const componentName = fieldInfo.fieldType;

    if (!componentName) return null;
    if (fieldInfo.chartType == "GanttChart") return GanttFieldInfo;

    return {
      ["Form".toUpperCase()]: FormInfo,
      [FieldType.Form.toUpperCase()]: FormInfo,

      ["CheckBoxFieldInfo".toUpperCase()]: CheckBoxFieldInfo,
      [FieldType.CheckBox.toUpperCase()]: CheckBoxFieldInfo,

      ["ComboFieldInfo".toUpperCase()]: ComboFieldInfo,
      [FieldType.Combo.toUpperCase()]: ComboFieldInfo,
      ["ComboFix".toUpperCase()]: ComboFieldInfo,
      ["ComboOpen".toUpperCase()]: ComboFieldInfo,
      ["ComboSearch".toUpperCase()]: ComboFieldInfo,

      ["NumberFieldInfo".toUpperCase()]: NumberFieldInfo,
      [FieldType.Number.toUpperCase()]: NumberFieldInfo,

      ["TextFieldInfo".toUpperCase()]: TextFieldInfo,
      [FieldType.Text.toUpperCase()]: TextFieldInfo,
      ["ProgressBar".toUpperCase()]: TextFieldInfo,
      [FieldType.ProgressBar.toUpperCase()]: TextFieldInfo,

      ["GridInfo".toUpperCase()]: GridInfo,
      [FieldType.Grid.toUpperCase()]: GridInfo,

      ["ImageFieldInfo".toUpperCase()]: ImageFieldInfo,
      [FieldType.Image.toUpperCase()]: ImageFieldInfo,

      ["ButtonFieldInfo".toUpperCase()]: ButtonFieldInfo,
      [FieldType.Button.toUpperCase()]: ButtonFieldInfo,

      ["LabelFieldInfo".toUpperCase()]: LabelFieldInfo,
      [FieldType.Label.toUpperCase()]: LabelFieldInfo,

      ["Date".toUpperCase()]: DateFieldInfo,
      [FieldType.Date.toUpperCase()]: DateFieldInfo,

      ["ImageViewerFieldInfo".toUpperCase()]: ImageViewerFieldInfo,
      [FieldType.ImageViewer.toUpperCase()]: ImageViewerFieldInfo,

      ["Chart".toUpperCase()]: ChartFieldInfo,
      [FieldType.Chart.toUpperCase()]: ChartFieldInfo,

      ["Map".toUpperCase()]: MapFieldInfo,
      [FieldType.Map.toUpperCase()]: MapFieldInfo,

      ["FintracTransaction".toUpperCase()]: FintracTransactionFieldInfo,
      [FieldType.FintracTransactionComponent.toUpperCase()]: FintracTransactionFieldInfo,

      ["FintracPerson".toUpperCase()]: FintracPersonFieldInfo,
      [FieldType.FintracPersonComponent.toUpperCase()]: FintracPersonFieldInfo,

      ["PrintComponent".toUpperCase()]: PrintComponentFieldInfo,
      [FieldType.PrintComponent.toUpperCase()]: PrintComponentFieldInfo,

      ["ProjectDashboard".toUpperCase()]: ProjectDashboardFieldInfo,
      [FieldType.ProjectDashboard.toUpperCase()]: ProjectDashboardFieldInfo,

      ["PdfViewerFieldInfo".toUpperCase()]: PdfViewerFieldInfo,
      [FieldType.PdfViewer.toUpperCase()]: PdfViewerFieldInfo,
    }[componentName.toUpperCase()];
  }
}

export default ComponentUtils;
