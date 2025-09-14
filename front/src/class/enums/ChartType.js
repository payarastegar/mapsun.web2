import Enum_Base from "./Enum_Base";
import * as am4charts from "@amcharts/amcharts4/charts";

/** Enum Class ChartType */
class ChartType extends Enum_Base {
    /** Enum of ChartType
     * @typedef {string} ChartType */

    static XyChart_ByDate = am4charts.XYChart
    static PieChart = am4charts.PieChart
    static XyChart_Category_Inversed = am4charts.XYChart
    static XyChart_Category = am4charts.XYChart

}

export default ChartType;
