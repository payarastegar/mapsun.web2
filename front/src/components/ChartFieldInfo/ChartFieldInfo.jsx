import React, { Component } from "react";
import "./ChartFieldInfo.css";
import LabelPosition from "../../class/enums/LabelPosition";
import SystemClass from "../../SystemClass";
import ChartFieldInfo_Core from "./ChartFieldInfo_Core";
import * as am4plugins_sliceGrouper from "@amcharts/amcharts4/plugins/sliceGrouper";

import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import ChartType from "../../class/enums/ChartType";

class ChartFieldInfo extends ChartFieldInfo_Core {

  constructor(props) {
    super(props);
    this.chartContainerRef = React.createRef();

    this.selectedRowIds = []; 
    this._mainChartClicked = false;
    this.isGrid = this.props.isGrid || false;
  }

  componentDidMount() {
    this.data.node = this.chartContainerRef.current;

    this.dataSource = this._dataGetDataSource();
    this.chart_Text = this.fieldInfo.chart_TextColName_1 || this.fieldInfo.chart_DateColName_1;
    this.chart_Text_Title = this.fieldInfo.chart_TextColName_1_Title || "";
    this.chart_Value_1 = this.fieldInfo.chart_ValueColName_1;
    this.chart_Type = this.fieldInfo.chartType;
    this.chart_idColName = this.fieldInfo.chart_IdColName_1;
    this.chart_FieldName = this.fieldInfo.fieldName;
    this.chart_AggregateValues = this.fieldInfo.chart_AggregateValue || false;
    this.chart_UseSameAxis = this.fieldInfo.chart_UseSameAxis || false;
    this.chart_ShowValues_AsTime = this.fieldInfo.chart_ShowValues_AsTime || false;
    this.chart_Value_Count = this._getValueColsCount();
    this.chart_Options = this.fieldInfo.chart_Options || {};



    if (this.chart_Type === "GridChart") {
      this.isGrid = true;
    } else {
      const chartType = ChartType[this.fieldInfo.chartType] || (this.fieldInfo.chartType === "GanttChart_Timesheet" ? am4charts.XYChart : undefined);
      if (!chartType) {
        return SystemClass.showErrorMsg("تایپ چارت تعیین نشده است " + this.fieldInfo.fieldName);
      }
      const chart = am4core.create(this.data.node, chartType);
      this.chart = chart;
      this.chart.events.disableType("animation");
      this.chart.responsive.enabled = false;
      this._setChartData(this.dataSource.dataArray, false);

      this.chart.cursor = new am4charts.XYCursor();
      // this.chart.scrollbarY = new am4core.Scrollbar();
      this.chart.rtl = true;
      this.chart.colors.step = 2;
      this.chart.responsive.enable = true;

      if (this.fieldInfo.chart_Leged_ShowLegend && this.chart_Value_Count > 1 && this.fieldInfo.chartType !== "GanttChart_Timesheet") {
        this.chart.legend = new am4charts.Legend();
      }
    }

    this._setupChart();
  }

  _setupChart() {
    if (this.isGrid) {
      this._setupGridChart();
      return;
    }
    if (this.chart_Type === "PieChart") {
      this._setupPieChart();
    } else if (this.chart_Type === "XyChart_Category_Inversed" || this.chart_Type === "XyChart_Category") {
      this.isCategoryChart = true;
      this._setupCategoryChart();
    } else if (this.chart_Type === "GanttChart_Timesheet") {
      this._setupGanttChart();
    } else {
      this._setupLineChart();
    }
    this.chart.invalidateData();
  }

  //------------------------------------------------
  //region public
  //------------------------------------------------ 

  _getValueColsCount() {
    let count = 0;
    for (let i = 1; i <= 5; i++) {
      if (!this.fieldInfo["chart_ValueColName_" + i]) break;
      count++;
    }
    return count;
  }

  componentDidUpdate() {
    // Restore selection after every update
    this._restorePieSelection();
  }

  componentWillUnmount() {
    if (this.chart) {
      this.chart.dispose();
    }
    this.data.node = null;
  }

  _deepCopy(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return obj; // Return primitive values directly
    }

    let copy;
    if (Array.isArray(obj)) {
      copy = [];
      for (let i = 0; i < obj.length; i++) {
        copy[i] = this._deepCopy(obj[i]);
      }
    } else {
      copy = {};
      for (let key in obj) {
        if (obj.hasOwnProperty(key)) {
          copy[key] = this._deepCopy(obj[key]);
        }
      }
    }
    return copy;
  }

  _getFieldTypeByColName(colName) {
    const field = this.dataSource.fieldList.find(f => f.colName === colName);
    return field ? field.typeName : null;
  }

  //------------------------------------------------
  //endregion public
  //------------------------------------------------

  //------------------------------------------------
  //region Pie Chart
  //------------------------------------------------

  _setupPieChart() {
    this.chart.innerRadius = am4core.percent(this.fieldInfo.chart_InnerRadius_Percent || 25);
    this.chart.radius = am4core.percent(70);
    const pieSeries = this.chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = this.chart_Value_1;
    pieSeries.dataFields.category = this.chart_Text;
    pieSeries.labels.template.paddingTop = 2;
    pieSeries.labels.template.paddingBottom = 0;
    pieSeries.labels.template.fontSize = 12;

    // فرمت دهی لیبل های روی چارت
    pieSeries.labels.template.adapter.add("text", (text, target) => {
      return target.dataItem && target.dataItem.index >= 15 ? "" : text;
    });

    // فرمت دهی مقادیر در تولتیپ
    pieSeries.slices.template.tooltipText = "{category}: [bold]{value.value}[/]";
    pieSeries.slices.template.adapter.add("tooltipText", (text, target) => {
      if (target.dataItem && typeof target.dataItem.value === 'number') {
        const formattedValue = this._formatValue(target.dataItem.value, this.chart_Value_1);
        return `{category}: [bold]${formattedValue}[/]`;
      }
      return text;
    });

    let grouper = pieSeries.plugins.push(new am4plugins_sliceGrouper.SliceGrouper());
    grouper.threshold = 0.5;
    grouper.groupName = "سایر";
    grouper.clickBehavior = "zoom";
    if (this.chart_idColName && this.props.setParameterControl && this.props.parameterControl_IsActive) {
      pieSeries.slices.template.events.on("hit", (ev) => {
        this._handleChartHit("PieChart", { pieSeries, idColName: this.chart_idColName, fieldName: this.chart_FieldName });
      });
    }
    this.pieSeries = pieSeries;
    this.pieIdColName = this.chart_idColName;
  }

  //------------------------------------------------
  //region Category Chart
  //------------------------------------------------


  _setupCategoryChart() {
    let categoryAxis, valueAxis, isHorizontal = false;
    if (this.chart_Type === "XyChart_Category_Inversed") {
      // Horizontal bar chart
      categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
      valueAxis = this.chart.xAxes.push(new am4charts.ValueAxis());
      categoryAxis.renderer.inversed = true;
      isHorizontal = true;
    } else {
      // Vertical column chart
      categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
      valueAxis = this.chart.yAxes.push(new am4charts.ValueAxis());
      categoryAxis.renderer.inversed = false;
      this.chart.scrollbarX = new am4core.Scrollbar();
    }

    // فرمت دهی لیبل های محور مقادیر
    valueAxis.renderer.labels.template.adapter.add("text", (text, target) => {
      if (target.dataItem && typeof target.dataItem.value === 'number') {
        return this._formatValue(target.dataItem.value, this.chart_Value_1);
      }
      return text;
    });

    this.chart.scrollbarY = new am4core.Scrollbar();
    // categoryAxis.scrollbar = new am4core.Scrollbar();
    categoryAxis.start = 0;
    categoryAxis.end = this.chart.data && this.chart.data.length > 10 ? 10 / this.chart.data.length : 1;
    categoryAxis.keepSelection = true;

    categoryAxis.dataFields.category = this.chart_Text;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.cellStartLocation = 0.01;
    categoryAxis.renderer.cellEndLocation = 0.99;
    categoryAxis.renderer.minGridDistance = 10;
    categoryAxis.renderer.autoGridCount = false;
    categoryAxis.renderer.fontSize = 12;

    valueAxis.renderer.opposite = true;
    valueAxis.tooltip.disabled = true;

    for (let i = 1; i <= this.chart_Value_Count; i++) {
      this._createCategorySeries(i, isHorizontal);
    }
  }

  _createCategorySeries(index, isHorizontal) {
    const field = this.fieldInfo["chart_ValueColName_" + index];
    const name = this.fieldInfo["chart_ValueColName_" + index + "_Title"];
    let series;
    series = this.chart.series.push(new am4charts.ColumnSeries());
    if (isHorizontal) {
      // Horizontal bar chart: valueX, categoryY
      series.dataFields.valueX = field;
      series.dataFields.categoryY = this.chart_Text;
    } else {
      // Vertical column chart: valueY, categoryX
      series.dataFields.valueY = field;
      series.dataFields.categoryX = this.chart_Text;
    }
    series.name = name;

    // فرمت دهی تولتیپ ها
    series.columns.template.adapter.add("tooltipText", (text, target) => {
      const dataItem = target.dataItem;
      if (dataItem) {
        const value = isHorizontal ? dataItem.valueX : dataItem.valueY;
        if (typeof value === 'number') {
          const formattedValue = this._formatValue(value, field);
          if (this.chart_Value_Count > 1) {
            return `{name}: [bold]${formattedValue}[/]`;
          }
          return `[bold]${formattedValue}[/]`;
        }
      }
      return text;
    });

    series.sequencedInterpolation = true;
    // Show correct value for valueLabel depending on chart orientation
    const valueLabel = series.bullets.push(new am4charts.LabelBullet());
    valueLabel.label.hideOversized = false;
    // valueLabel.label.truncate = false;
    valueLabel.label.fontSize = 12;

    // فرمت دهی لیبل های روی ستون ها
    valueLabel.label.adapter.add("text", (text, target) => {
      if (target.dataItem) {
        const value = isHorizontal ? target.dataItem.valueX : target.dataItem.valueY;
        if (typeof value === 'number') {
          return this._formatValue(value, field);
        }
      }
      return text;
    });

    if (isHorizontal) {
      valueLabel.label.horizontalCenter = "left";
      valueLabel.label.dx = 2;
    } else {
      // valueLabel.label.verticalCenter = "middle";
      // valueLabel.label.horizontalCenter = "bottom";
      // valueLabel.label.maxWidth = 80;
      // valueLabel.label.dx = -5;
      valueLabel.label.adapter.add("rotation", function (text, target) {
        const labelText = target.dataItem && target.dataItem.dataContext && target.dataItem.dataContext[target.dataField];
        return labelText && labelText.toString().length > 4 ? 270 : 0;
      });
    }

    if (this.chart_idColName && this.props.setParameterControl && this.props.parameterControl_IsActive) {
      if (!this._hoveredDataContext) this._hoveredDataContext = null;
      series.columns.template.events.on("over", (ev) => {
        this._hoveredDataContext = ev.target.dataItem && ev.target.dataItem.dataContext;
      });
      series.columns.template.events.on("out", (ev) => {
        this._hoveredDataContext = null;
      });
      this.chart.events.on("hit", (ev) => {
        if (this._hoveredDataContext) {
          this._handleChartHit(this.chart_Type, {
            idColName: this.chart_idColName,
            fieldName: this.chart_FieldName,
            dataContext: this._hoveredDataContext
          });
        }
      });
    }
  }


  //------------------------------------------------
  //region Line Chart
  //------------------------------------------------

  _setupLineChart() {
    this.chart.scrollbarY = new am4core.Scrollbar();
    const categoryAxis = this.chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = this.chart_Text;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.gridCount = this.chart.data.length;
    categoryAxis.autoGridCount = false;
    categoryAxis.groupData = false;
    // categoryAxis.tooltip.disabled = true;
    const valueAxisForSeries_Default = this.chart.yAxes.push(new am4charts.ValueAxis());
    for (let i = 1; i <= this.chart_Value_Count; i++) {
      let valueAxisForSeries;
      if (i === 1) {
        valueAxisForSeries = valueAxisForSeries_Default;
        valueAxisForSeries.scrollbar = new am4core.Scrollbar();
      }
      else if (this.chart_UseSameAxis) {
        valueAxisForSeries = valueAxisForSeries_Default;
      }
      else {
        valueAxisForSeries = this.chart.yAxes.push(new am4charts.ValueAxis());
        valueAxisForSeries.renderer.opposite = true;
      }

      const colName = this.fieldInfo["chart_ValueColName_" + i];
      // فرمت دهی لیبل های محور مقادیر
      valueAxisForSeries.renderer.labels.template.adapter.add("text", (text, target) => {
        if (target.dataItem && typeof target.dataItem.value === 'number') {
          return this._formatValue(target.dataItem.value, colName);
        }
        return text;
      });

      valueAxisForSeries.renderer.minWidth = 16;
      valueAxisForSeries.tooltip.disabled = true;
      valueAxisForSeries.start = 0;
      valueAxisForSeries.end = 1;
      valueAxisForSeries.keepSelection = true;
      this._createLineSeries(i, valueAxisForSeries);
    }
  }

  _createLineSeries(i, valueAxisForSeries) {
    const series = this.chart.series.push(new am4charts.LineSeries());
    series.dataFields.dateX = this.chart_Text;
    series.dataFields.categoryX = this.chart_Text;
    series.dataFields.valueY = this.fieldInfo["chart_ValueColName_" + i];
    series.yAxis = valueAxisForSeries;

    const name = this.fieldInfo["chart_ValueColName_" + i + "_Title"];
    const colName = this.fieldInfo["chart_ValueColName_" + i];
    series.name = name;

    // فرمت دهی مقادیر در تولتیپ
    series.tooltipText = "{valueY}";
    series.adapter.add("tooltipText", (text, target) => {
      const dataItem = target.tooltipDataItem;
      if (dataItem && typeof dataItem.valueY === 'number') {
        const formattedValue = this._formatValue(dataItem.valueY, colName);
        return series.name ? `${series.name}: ${formattedValue}` : formattedValue;
      }
      return text;
    });

    series.bullets.push(new am4charts.CircleBullet());
    series.strokeWidth = 2;
    series.snapTooltip = true;

    const bullet = series.bullets.push(new am4charts.CircleBullet());
    const interfaceColors = new am4core.InterfaceColorSet();
    bullet.circle.stroke = interfaceColors.getFor("background");
    bullet.circle.strokeWidth = 2;

    if (this.chart_idColName && this.props.setParameterControl && this.props.parameterControl_IsActive) {
      if (!this._hoveredDataContext) this._hoveredDataContext = null;

      bullet.events.on("over", (ev) => {
        this._hoveredDataContext = ev.target.dataItem && ev.target.dataItem.dataContext;
      });
      bullet.events.on("out", (ev) => {
        this._hoveredDataContext = null;
      });

      this.chart.events.on("hit", (ev) => {
        if (this._hoveredDataContext) {
          this._handleChartHit(this.chart_Type, {
            idColName: this.chart_idColName,
            fieldName: this.chart_FieldName,
            dataContext: this._hoveredDataContext
          });
        }
      });
    }

    // Hide valueAxisForSeries when series is hidden by legend
    series.events.on("hidden", function () {
      valueAxisForSeries.visible = false;
    });
    series.events.on("shown", function () {
      valueAxisForSeries.visible = true;
    });
  }
  //------------------------------------------------
  //endregion Line Chart
  //------------------------------------------------


  //------------------------------------------------
  //region Gantt Chart
  //------------------------------------------------

  _createTooltipText(name, value, isBold = false, fontSize = 12) {
    if (!value)
      return "";

    let resultText = ""
    if (fontSize)
      resultText += `[font-size: ${fontSize}px]`

    if (name && name !== "")
      resultText += `${name}:`

    if (isBold)
      resultText += "[bold]"

    resultText += ` ${value}`

    if (isBold)
      resultText += "[/]"
    if (fontSize)
      resultText += "[/]"
    resultText += "\n"
    return resultText;
  }

  _getTooltipOfGanttChart(target, text) {
    const start = target.dataItem.openDateX;
    const end = target.dataItem.dateX;

    if (start && end) {
      const GanttChart_Timesheet = this.chart_Options.GanttChart_Timesheet || {};

      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = Math.floor(durationMs / 60000);
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      let durationText = `${hours} ساعت و ${minutes} دقیقه`;
      if (minutes === 0) durationText = `${hours} ساعت`;

      const dataItem = target.dataItem.dataContext;
      let resultText = this._createTooltipText("", dataItem[this.chart_Text], true)
      resultText += this._createTooltipText(this.fieldInfo.chart_ValueColName_1_Title, dataItem[this.fieldInfo.chart_ValueColName_1], true)
      resultText += this._createTooltipText(this.fieldInfo.chart_ValueColName_2_Title, "{openDateX.formatDate('HH:mm')}")
      resultText += this._createTooltipText(this.fieldInfo.chart_ValueColName_3_Title, "{dateX.formatDate('HH:mm')}")
      resultText += this._createTooltipText("مدت زمان", durationText, true)
      resultText += this._createTooltipText(this.fieldInfo.chart_ValueColName_4_Title, this._leftOfString(dataItem[this.fieldInfo.chart_ValueColName_4]))

      const chart_ShowInTooltip_Count = GanttChart_Timesheet.chart_ShowInTooltip_Count || 5;
      for (let i = 1; i <= chart_ShowInTooltip_Count; i++) {
        const colName = GanttChart_Timesheet["chart_ShowInTooltip_ColName_" + i];
        if (colName && dataItem[colName]) {
          resultText += this._createTooltipText(GanttChart_Timesheet["chart_ShowInTooltip_ColName_" + i + "_Title"], this._leftOfString(dataItem[colName]), false, 10)
        }
      }
      return resultText;
    }

    return text
  }

  _setupGanttChart() {
    this.chart.paddingRight = 30;

    let categoryAxis = this.chart.yAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = this.chart_Text;
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.inversed = true;
    categoryAxis.renderer.minGridDistance = 20;

    let dateAxis = this.chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.minGridDistance = 70;
    dateAxis.baseInterval = { timeUnit: "minute", count: 1 };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dateAxis.min = today.getTime();
    today.setHours(23, 59, 59, 999);
    dateAxis.max = today.getTime();
    dateAxis.strictMinMax = true;
    dateAxis.renderer.tooltipLocation = 0;
    dateAxis.tooltip.label.text = "{dateX.formatDate('HH:mm')}";

    this._updateGanttChart(true);

    this.chart.scrollbarY = new am4core.Scrollbar();
  }

  _updateGanttChart(firstTime = false) {
    const seriesColumn = this.fieldInfo.chart_ValueColName_1;
    const colorColumn = this.fieldInfo.chart_ValueColName_4;
    const uniqueCategories = [...new Set(this.chart.data.map(item => item[seriesColumn]))];

    if (firstTime) {
      this.chart.legend = new am4charts.Legend();
    }

    const activeSeries = new Set();

    uniqueCategories.forEach(category => {
      let series = this.chart.series.values.find(s => s.name === category);
      if (!series) {
        series = this.chart.series.push(new am4charts.ColumnSeries());
        series.name = category;

        series.dataFields.openDateX = this.fieldInfo.chart_ValueColName_2;
        series.dataFields.dateX = this.fieldInfo.chart_ValueColName_3;
        series.dataFields.categoryY = this.chart_Text;
        series.columns.template.height = am4core.percent(70);
        series.sequencedInterpolation = true;

        series.columns.template.propertyFields.fill = "fillColor";
        series.columns.template.propertyFields.stroke = "fillColor";

        if (colorColumn) {
          let labelBullet = series.bullets.push(new am4charts.LabelBullet());
          labelBullet.label.text = "{name}";
          labelBullet.locationX = 1;
          labelBullet.label.horizontalCenter = "left";
          labelBullet.label.dx = -100;
          labelBullet.label.fontSize = 12;
          labelBullet.label.truncate = false;
        }
      }
      if (colorColumn) {
        series.bullets.each(bullet => {
          if (bullet instanceof am4charts.LabelBullet) {
            bullet.adapter.clear();
            bullet.label.adapter.clear();

            bullet.label.adapter.add("textOutput", (textOutput, target) => {
              if (target.dataItem && target.dataItem.dataContext) {
                if (target.dataItem.dataContext.labelBullet_IsDisabled)
                  return ""
              }
              return textOutput;
            });
          }
        });
      }

      series.columns.template.events.on("over", (ev) => {
        // this._hoveredDataContext = ev.target.dataItem && ev.target.dataItem.dataContext;
      });

      series.columns.template.events.on("out", (ev) => {
        // this._hoveredDataContext = ev.target.dataItem && ev.target.dataItem.dataContext;
      });

      series.columns.template.adapter.add("tooltipText", (text, target) => {
        if (target.dataItem && target.dataItem.dataContext) {
          return this._getTooltipOfGanttChart(target, text);
        }
        return text;
      });

      activeSeries.add(series);

      let seriesData = this.chart.data.filter(item => item[seriesColumn] === category);

      if (seriesData.length > 1) {
        let baseColor = seriesData[0].color;
        if (this.fieldInfo.chart_ValueColName_4) {
          baseColor = am4core.color("#f5f5f5")
        }
        series.fill = baseColor;
        series.stroke = baseColor;

        if (series.legendDataItem) {
          series.legendDataItem.marker.fill = baseColor;
          series.legendDataItem.marker.stroke = baseColor;
        }

        seriesData.forEach((item, index) => {
          if (index % 2 === 0) {
            item.fillColor = seriesData[index].color.lighten(0.2);
          } else {
            item.fillColor = seriesData[index].color;
          }
        });
      }

      series.data = seriesData;
    });

    const seriesToRemove = [];
    this.chart.series.each(series => {
      if (!activeSeries.has(series)) {
        seriesToRemove.push(series);
      }
    });

    seriesToRemove.forEach(series => {
      this.chart.series.removeValue(series);
      series.dispose();
    });


    
    const categoryAxis = this.chart.yAxes.getIndex(0);
    if (categoryAxis) {
      const GanttChart_Timesheet = this.chart_Options.GanttChart_Timesheet || {};
      const uniqueCategoriesBase = [...new Set(this.chart.data.map(item => item[this.chart_Text]))];
      if (uniqueCategories && uniqueCategoriesBase) {
        const count = uniqueCategories.length * uniqueCategoriesBase.length;
        if (count > 0) {
          let chart_RowCount_ToShowInScrollbar = GanttChart_Timesheet.chart_RowCount_ToShowInScrollbar || 10;
          if (chart_RowCount_ToShowInScrollbar > count)
            chart_RowCount_ToShowInScrollbar = count
          categoryAxis.start = 0;
          categoryAxis.end = count > chart_RowCount_ToShowInScrollbar ? chart_RowCount_ToShowInScrollbar / count : 1;
        }
      }
      else {
        categoryAxis.start = 0;
        categoryAxis.end = 1;
      }
    }
  }

  _fixDataSource_ForGanttChart(updateChart, dataSourceCopy) {
    const startField = this.fieldInfo.chart_ValueColName_2;
    const endField = this.fieldInfo.chart_ValueColName_3;

    const predefinedColors = [
      am4core.color("#1f77b4"), am4core.color("#ff7f0e"), am4core.color("#2ca02c"),
      am4core.color("#d62728"), am4core.color("#9467bd"), am4core.color("#8c564b"),
      am4core.color("#e377c2"), am4core.color("#7f7f7f"), am4core.color("#bcbd22"),
      am4core.color("#17becf"), am4core.color("#aec7e8"), am4core.color("#ffbb78"),
      am4core.color("#98df8a"), am4core.color("#ff9896"), am4core.color("#c5b0d5"),
      am4core.color("#c49c94"), am4core.color("#f7b6d2"), am4core.color("#c7c7c7"),
      am4core.color("#dbdb8d"), am4core.color("#9edae5")
    ];

    const colorSet = new am4core.ColorSet();
    const colorColumn = this.fieldInfo.chart_ValueColName_4 || this.fieldInfo.chart_ValueColName_1;
    const uniqueColorValues = [...new Set(dataSourceCopy.map(item => item[colorColumn]))];

    const colorMap = uniqueColorValues.reduce((acc, val, i) => {
      if (i < predefinedColors.length) {
        acc[val] = predefinedColors[i];
      } else {
        acc[val] = colorSet.getIndex(i - predefinedColors.length);
      }
      return acc;
    }, {});

    dataSourceCopy.forEach(item => {
      item.color = colorMap[item[colorColumn]];
    });


    const valueCol1 = this.fieldInfo.chart_ValueColName_1;
    const textCol = this.chart_Text;
    const seenCombinations = new Set();



    const sortedData = this._sortChartData(dataSourceCopy);
    // console.log(sortedData)
    sortedData.forEach(item => {
      const key = `${item[valueCol1]}|~|${item[textCol]}`;
      if (seenCombinations.has(key)) {
        item["labelBullet_IsDisabled"] = true;
      } else {
        seenCombinations.add(key);
        item["labelBullet_IsDisabled"] = false;
      }

      if (item[startField] !== undefined) {
        item[startField] = this._convertToDate(item[startField]);
      }
      if (item[endField] !== undefined) {
        item[endField] = this._convertToDate(item[endField]);
      }
    });



    this.chart.data = sortedData;
    if (updateChart) {
      this._updateGanttChart()
      this.chart.invalidateData();
    }
  }

  //------------------------------------------------
  //endregion Gantt Chart
  //------------------------------------------------


  //------------------------------------------------
  //region Grid Chart
  //------------------------------------------------

  _setupGridChart() {
    const columns = [];
    if (this.chart_Text) columns.push(this.chart_Text);
    for (let i = 1; i <= this.chart_Value_Count; i++) {
      const valueCol = this.fieldInfo["chart_ValueColName_" + i];
      if (valueCol) columns.push(valueCol);
    }
    this.gridColumns = columns;
    this._setChartData(this.dataSource && this.dataSource.dataArray ? this.dataSource.dataArray : [])
  }

  _gridChartRender() {
    const gridMainStyle = {
      position: "absolute",
      width: "100%",
      top: 5,
      bottom: -5
    }
    const gridStyle = {
      border: "1px solid #2196f3",
      borderRadius: "6px",
      overflow: "auto",
      boxShadow: "0 2px 8px rgba(33,150,243,0.08)",
      background: "#f5faff",
      maxHeight: "95%",
      maxWidth: "98%"
    };
    const thStyle = {
      background: "#2196f3",
      color: "#fff",
      // fontWeight: "bold",
      border: "1px solid #2196f3",
      padding: "0",
      textAlign: "center",
      fontSize: "smaller"
    };
    const tdStyle = {
      border: "1px solid #90caf9",
      padding: "0",
      textAlign: "center",
      fontSize: "smaller"
    };

    const showClearIcon = this.selectedRowIds.length > 0;
    const clearIconStyle = {
      position: "absolute",
      top: -2,
      right: 4,
      cursor: "pointer",
      zIndex: 2,
      fontSize: "22px",
      color: "#f44336",
      padding: "3px 7px 0px 7px"
    };

    const getColTitle = (col, idx) => {
      let index = idx;
      if (!this.chart_Text) {
        index = index + 1;
      }
      else if (index < 1) {
        return this.chart_Text_Title;
      }
      const title = this.fieldInfo["chart_ValueColName_" + (index) + "_Title"];
      return title || col;
    };

    return (
      <div
        ref={this.chartContainerRef}
        className="ChartFieldInfo__gridMain"
        style={gridMainStyle}
        onClick={this.handleDivClick}
      >
        <div className="ChartFieldInfo__grid" style={{ ...gridStyle, position: "relative" }}>
          {showClearIcon && (
            <span
              style={clearIconStyle}
              title="پاک کردن انتخاب ها"
              onClick={this.handleClearSelectedRow}
            >
              &#10006;
            </span>
          )}
          <table style={{ borderCollapse: "collapse", width: "100%" }}>
            <thead>
              <tr>
                {this.gridColumns.map((col, idx) => (
                  <th key={col} style={thStyle}>
                    {getColTitle(col, idx)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {this.gridData && this.gridData.map((row, rowIdx) => {
                const isSelected = this.selectedRowIds.includes(row[this.chart_idColName]);
                const trStyle = isSelected
                  ? { background: "#ffe082" }
                  : { background: "#e3f2fd" };
                return (
                  <tr
                    key={rowIdx}
                    style={trStyle}
                    onClick={() => this._handleChartHit("Grid", {
                      idColName: this.chart_idColName,
                      fieldName: this.chart_FieldName,
                      rowData: row
                    })}
                  >
                    {this.gridColumns.map((col, colIdx) => (
                      <td key={col} style={tdStyle}>{row[col]}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  //------------------------------------------------
  //endregion Grid Chart
  //------------------------------------------------


  //------------------------------------------------
  //region Convert Data
  //------------------------------------------------ 

  _convertNumericToDate(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      return null;
    }
    const baseDate = new Date();
    baseDate.setHours(0, 0, 0, 0);
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    baseDate.setHours(hours, minutes, 0, 0);
    return baseDate;
  }

  _convertStringToDate(timeString) {
    if (typeof timeString !== 'string' || !timeString.match(/^\d{1,2}:\d{1,2}:\d{1,2}$/)) {
      return null;
    }
    const parts = timeString.split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    const seconds = parseInt(parts[2], 10);

    const baseDate = new Date();
    baseDate.setHours(hours, minutes, seconds, 0);
    return baseDate;
  }

  _convertToDate(value) {
    if (typeof value === 'string') {
      return this._convertStringToDate(value);
    }
    else if (typeof value === 'number') {
      return this._convertNumericToDate(value);
    }
    return null;
  }

  _leftOfString(text, leftCharCount = 50) {
    if (text && text.length > leftCharCount)
      return text.slice(0, leftCharCount) + "...";
    return text;
  }

  _formatTimeValue(value) {
    if (typeof value !== 'number' || isNaN(value)) {
      return value;
    }
    const hours = Math.floor(value);
    const minutes = Math.round((value - hours) * 60);
    const paddedMinutes = String(minutes).padStart(2, '0');
    return `${hours}:${paddedMinutes}`;
  }

  _formatValue(value, colName = null) {
    if (typeof value !== 'number') {
      return value;
    }
    if (this.chart_ShowValues_AsTime) {
      return this._formatTimeValue(value);
    }
    if (value > 100) {
      return new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 0 }).format(value);
    } else {
      return new Intl.NumberFormat('fa-IR', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(value);
    }
  }

  //------------------------------------------------
  //endregion Convert Data
  //------------------------------------------------


  //------------------------------------------------
  //region Update Data
  //------------------------------------------------ 

  _setGridData(dataSource) {
    const data_Id = this.fieldInfo.chart_IdColName_1;
    let groupedData;
    if (data_Id) {
      groupedData = this._groupDataSourceWith_IdColName(data_Id, dataSource);
    } else {
      groupedData = dataSource;
    }
    const sortedData = this._sortChartData(groupedData);
    let gridData = this._deepCopy(sortedData)
    let Rowlength = gridData.length;

    const gridMaxRow = this.fieldInfo.chart_GridMaxRow || 30;
    if (gridData.length > gridMaxRow)
      Rowlength = gridMaxRow;

    let gridDataTemp = []
    for (let index = 0; index < Rowlength; index++) {
      gridDataTemp.push(gridData[index]);
    }

    for (let i = 1; i <= this.chart_Value_Count; i++) {
      const valueCol = this.fieldInfo["chart_ValueColName_" + i];
      if (!valueCol) continue;

      const isTimeColumn = valueCol.toLowerCase().includes("time");
      const isMoneyColumn = this._getFieldTypeByColName(valueCol) === "MONEY";

      if (isTimeColumn) {
        gridDataTemp.forEach(row => {
          const numberValue = Number(row[valueCol]);
          if (row[valueCol] !== null && !isNaN(numberValue)) {
            row[valueCol] = this._formatTimeValue(numberValue);
          }
        });
      } else if (isMoneyColumn) {
        gridDataTemp.forEach(row => {
          const numberValue = Number(row[valueCol]);
          if (row[valueCol] !== null && !isNaN(numberValue)) {
            row[valueCol] = numberValue.toLocaleString('fa-IR');
          }
        });
      }
    }

    this.gridData = gridDataTemp;
  }

  _setChartData(dataSource, updateChart = true) {
    const data_Id = this.fieldInfo.chart_IdColName_1;
    var dataSourceCopy = this._deepCopy(dataSource)
    this._current_DataSource = dataSourceCopy;
    if (this.isGrid) {
      this._setGridData(dataSourceCopy);
      if (updateChart) {
        this.forceUpdate && this.forceUpdate();
      }
      return;
    }

    if (this.chart_Type === "GanttChart_Timesheet") {
      this._fixDataSource_ForGanttChart(updateChart, dataSourceCopy);
      return;
    }

    if (this.chart) {
      if (data_Id) {
        const groupedData = this._groupDataSourceWith_IdColName(data_Id, dataSourceCopy);
        const sortedData = this._sortChartData(groupedData);
        this.chart.data = sortedData;
      } else {
        const sortedData = this._sortChartData(dataSourceCopy);
        this.chart.data = sortedData;
      }
    }

    if (updateChart) {
      this.chart.invalidateData();
      setTimeout(() => {
        this._restorePieSelection();
        this._restoreCategoryScrollbar();
      }, 500);
    }
  }

  _restoreCategoryScrollbar() {
    // Fix category axis scrollbar to top 10 items if more than 10 rows exist
    if (
      this.chart &&
      (this.fieldInfo.chartType === "XyChart_Category_Inversed" || this.fieldInfo.chartType === "XyChart_Category") &&
      this.chart.yAxes && this.chart.yAxes.length > 0
    ) {
      const categoryAxis = this.chart.yAxes.getIndex(0);
      if (categoryAxis && this.chart.data && this.chart.data.length > 10) {
        categoryAxis.start = 0;
        categoryAxis.end = 10 / this.chart.data.length;
      } else if (categoryAxis) {
        categoryAxis.start = 0;
        categoryAxis.end = 1;
      }
    }
  }

  //------------------------------------------------
  //endregion Update Data
  //------------------------------------------------


  //------------------------------------------------
  //region Sort And Grouped
  //------------------------------------------------ 

  _groupDataSourceWith_IdColName(data_Id, dataSource) {
    const chartType = this.fieldInfo.chartType;

    const groupedData = dataSource.reduce((acc, item) => {
      if (!acc[item[data_Id]]) {
        acc[item[data_Id]] = item;
      } else {
        for (let i = 1; i <= this.chart_Value_Count; i++) {
          if (!this.fieldInfo["chart_ValueColName_" + i]) break;
          acc[item[data_Id]][this.fieldInfo["chart_ValueColName_" + i]] += item[this.fieldInfo["chart_ValueColName_" + i]];
        }
      }
      return acc;
    }, {});

    if (this.chart_AggregateValues
      && chartType === "XyChart_ByDate"
    ) {
      const groupedDataArray = Object.values(groupedData).sort((a, b) => {
        const textCol = this.fieldInfo.chart_TextColName_1 || this.fieldInfo.chart_DateColName_1;
        return a[textCol].localeCompare(b[textCol]);
      });
      let aggregatedRows = [];
      for (let i = 0; i < groupedDataArray.length; i++) {
        let row = { ...groupedDataArray[i] };
        for (let j = 1; j <= this.chart_Value_Count; j++) {
          const colName = this.fieldInfo["chart_ValueColName_" + j];
          if (!colName) break;
          row[colName] = groupedDataArray.slice(0, i + 1).reduce((sum, r) => sum + (r[colName] || 0), 0);
        }
        aggregatedRows.push(row);
      }
      return aggregatedRows;
    }

    return Object.values(groupedData);
  }

  _sortChartData(chartData) {
    const text = this.fieldInfo.chart_TextColName_1 || this.fieldInfo.chart_DateColName_1;
    const value = this.fieldInfo.chart_ValueColName_1;
    const sort_config = [];
    const chartType = this.fieldInfo.chartType;

    const dynamicSort = (columns) => {
      return function (a, b) {
        for (let { key, asc = true } of columns) {
          const order = asc ? 1 : -1;
          if (a[key] > b[key]) return order;
          if (a[key] < b[key]) return -order;
        }
        return 0;
      };
    };

    if (chartType == "PieChart") {
      const sort_config_item_1 = { key: value, asc: false };
      sort_config.push(sort_config_item_1);
    }
    else if (
      chartType == "XyChart_Category_Inversed" ||
      chartType == "XyChart_Category"
    ) {
      for (let i = 1; i <= this.chart_Value_Count; i++) {
        if (this.fieldInfo["chart_ValueColName_" + i]) {
          const sort_config_item = {
            key: this.fieldInfo["chart_ValueColName_" + i],
            asc: false,
          };
          sort_config.push(sort_config_item);
        }
      }
    }
    else if (chartType == "GridChart") {
      let sortKey = value;
      let sortKeyFound = false;
      for (let i = 1; i <= this.chart_Value_Count; i++) {
        const valueCol = this.fieldInfo["chart_ValueColName_" + i];
        if (valueCol && valueCol.startsWith("mablagh")) {
          sortKey = valueCol;
          sortKeyFound = true;
          break;
        }
      }
      if (sortKeyFound === false) {
        for (let i = 1; i <= this.chart_Value_Count; i++) {
          const valueCol = this.fieldInfo["chart_ValueColName_" + i];
          if (valueCol && valueCol.startsWith("tarikh")) {
            sortKey = valueCol;
            sortKeyFound = true;
            break;
          }
        }
      }
      const sort_config_item = { key: sortKey, asc: false };
      sort_config.push(sort_config_item);
    }
    else if (
      chartType == "GanttChart_Timesheet"
    ) {
      const sort_config_item_1 = { key: text, asc: false };
      sort_config.push(sort_config_item_1);
      for (let i = 1; i <= this.chart_Value_Count; i++) {
        if (this.fieldInfo["chart_ValueColName_" + i]) {
          const sort_config_item = {
            key: this.fieldInfo["chart_ValueColName_" + i]
          };
          sort_config.push(sort_config_item);
        }
      }
    }
    else {
      const sort_config_item_1 = { key: text };
      sort_config.push(sort_config_item_1);
    }

    chartData.sort(dynamicSort(sort_config));
    return chartData;
  }

  //------------------------------------------------
  //endregion Sort And Grouped
  //------------------------------------------------


  //------------------------------------------------
  //region Filter Function
  //------------------------------------------------ 

  applyCrossComponentFilters(filters) {
    if (!filters || filters.length === 0) {
      if (this._original_DataSource) {
        const original_DataSource = this._original_DataSource.slice();
        this.selectedPieIds = [];
        this._setChartData(original_DataSource);
        // this.forceUpdate && this.forceUpdate();
      }
      return;
    }
    if (!this._original_DataSource) {
      this._original_DataSource = this.dataSource.dataArray.slice();
    }
    let filteredDataSource = this._original_DataSource;
    Object.entries(filters).forEach(([col, values]) => {
      if (filteredDataSource.some(row => col in row)) {
        filteredDataSource = filteredDataSource.filter(row => values.includes(row[col]));
      }
    });
    this._setChartData(filteredDataSource);
    // this._restorePieSelection();
    // this.forceUpdate && this.forceUpdate();
  }

  _handleChartHit = (chartTypeStr, params) => {
    if (!this.props.parameterControl_IsActive) {
      return;
    }
    this._mainChartClicked = true;
    if (this.isGrid) {
      const { idColName, fieldName, rowData } = params;
      if (!rowData) return;
      const rowId = rowData[idColName];
      if (this.selectedRowIds.includes(rowId)) {
        this.selectedRowIds = this.selectedRowIds.filter(id => id !== rowId);
      } else {
        this.selectedRowIds = [...this.selectedRowIds, rowId];
      }
      const selectedRows = this.gridData.filter(row => this.selectedRowIds.includes(row[idColName]));
      this.props.setParameterControl(fieldName, idColName, selectedRows);
      this.forceUpdate();
    } else if (chartTypeStr === "PieChart") {
      const { pieSeries, idColName, fieldName } = params;
      // ذخیره selected ids
      this.selectedRowIds = pieSeries.slices.values
        .filter(slice => slice.isActive)
        .map(slice => slice.dataItem && slice.dataItem.dataContext && slice.dataItem.dataContext[idColName])
        .filter(val => val !== undefined);

      const selected = pieSeries.slices.values
        .filter(slice => slice.isActive)
        .map(slice => slice.dataItem && slice.dataItem.dataContext)
        .filter(dataContext => dataContext !== undefined);

      this.props.setParameterControl(fieldName, idColName, selected);
    } else if (
      chartTypeStr === "XyChart_Category_Inversed" ||
      chartTypeStr === "XyChart_Category" ||
      chartTypeStr === "XyChart_ByDate" ||
      chartTypeStr === "GanttChart_Timesheet"
    ) {
      const { idColName, fieldName, dataContext } = params;
      if (!dataContext) return;
      this.selectedRowIds = [dataContext[idColName]];
      this.props.setParameterControl(fieldName, idColName, [dataContext]);
    }
  };

  handleDivClick = (e) => {
    if (this._mainChartClicked) {
      this._mainChartClicked = false;
      return;
    }
    if (!this.props.parameterControl_IsActive) {
      return;
    }
    this.selectedRowIds = [];
    this.props.setParameterControl(this.fieldInfo.fieldName, this.fieldInfo.chart_IdColName_1, []);
  };

  handleClearSelectedRow = (e) => {
    if (!this.props.parameterControl_IsActive) {
      return;
    }
    this.selectedRowIds = [];
    this.props.setParameterControl(this.fieldInfo.fieldName, this.fieldInfo.chart_IdColName_1, []);
  };

  _restorePieSelection() {
    // Restore selected slices after data update
    if (this.pieSeries && this.selectedRowIds && this.pieIdColName) {
      this.pieSeries.slices.values.forEach(slice => {
        const dataContext = slice.dataItem && slice.dataItem.dataContext;
        if (dataContext && this.selectedRowIds.includes(dataContext[this.pieIdColName])) {
          slice.isActive = true;
        } else {
          slice.isActive = false;
        }
      });
    }
  }
  //------------------------------------------------
  //endregion Filter Function
  //------------------------------------------------

  //------------------------------------------------
  //region render
  //------------------------------------------------

  render() {
    const labelPositionClass =
      this.fieldInfo.labelPosition === LabelPosition.LabelOnTop &&
      "TextFieldInfo--column";
    const sliceWidths = this._getLabelWidthStyles();

    const styleLabel = {
      maxWidth: sliceWidths.slice1,
      minWidth: sliceWidths.slice1,
    };
    const styleInput = {
      maxWidth: sliceWidths.slice2,
      minWidth: sliceWidths.slice2,
    };
    const styleLabelAfter = {
      maxWidth: sliceWidths.slice3,
      minWidth: sliceWidths.slice3,
    };

    const icon = this.fieldInfo.button_IconName;
    const image = this.fieldInfo.button_ImageName;
    const hideText = !this.fieldInfo.button_ShowText && !!icon;

    const iconButton = icon && !image && hideText;

    const hideLabel = this.fieldInfo.label_HideLabel;

    const button_ShowNumber_FieldName = this.fieldInfo
      .button_ShowNumber_FieldName;
    const number =
      this.fieldInfo._row && this.fieldInfo._row[button_ShowNumber_FieldName];

    //number exit and not Zero
    const numberElement = !number ? (
      ""
    ) : (
      <span className={"ButtonFieldInfo__number"}>{number}</span>
    );

    if (this.fieldInfo.fontColor) {
      styleInput.color = this.fieldInfo.fontColor;
    }

    const style = {
      minHeight: "100%"
    };
    const chartType = ChartType[this.fieldInfo.chartType];
    if (
      chartType == ChartType.XyChart_Category_Inversed ||
      chartType == ChartType.XyChart_Category
    ) {
      style.minHeight = "100%";
    }

    if (this.fieldInfo.height_Total) {
      style.minHeight = this.fieldInfo.height_Total + "px";
    }

    const showClearIcon = this.selectedRowIds.length > 0;
    const clearIconStyle = {
      position: "absolute",
      top: -2,
      right: 4,
      cursor: "pointer",
      zIndex: 2,
      fontSize: "22px",
      color: "#f44336",
      padding: "3px 7px 0px 7px"
    };

    if (this.isGrid) {
      return this._gridChartRender();
    }

    return (
      <div
        ref={this.chartContainerRef}
        className={"ChartFieldInfo"}
        style={style}
        onClick={!this.isCategoryChart ? this.handleDivClick : null}
      >
        {showClearIcon && (
          <span
            style={clearIconStyle}
            title="پاک کردن انتخاب"
            onClick={this.handleClearSelectedRow}
          >
            &#10006;
          </span>
        )}
      </div >
    );
  }

  //------------------------------------------------
  //endregion render
  //------------------------------------------------


}

export default ChartFieldInfo;