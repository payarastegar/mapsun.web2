import React, { Component } from 'react';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/dhtmlxgantt.css';
import './Gantt.css';
import SystemClass from "../../SystemClass";
import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import Utils from "../../Utils";
import moment from "moment-jalaali";

export default class GanttFieldInfo extends TextFieldInfo {

    // instance of gantt.dataProcessor
    dataProcessor = null;

    initialize() {
        // this.setPersianTimeScale();
        this.initZoom();

        const zoom = this.zoom;
        const zoomToFit = this.zoomToFit;

        // zoom.setZoom(2)
        // gantt.config.scales = this.getPersianTimeScale().find(t => t.name === "months").scales

        gantt.config.rtl = true;
        // gantt.i18n.setLocale("fa");
        // gantt.config.jalali = true;
        const ganttModules = gantt

        function addClass(node, className) {
            if (!node) return;
            node.classList.add(className);
        }

        function removeClass(node, className) {
            if (!node) return;
            node.classList.remove(className);
        }

        function getButton(name) {
            return document.querySelector(".gantt-controls [data-action='" + name + "']");
        }

        function highlightButton(name) {
            addClass(getButton(name), "menu-item-active");
        }

        function unhighlightButton(name) {
            removeClass(getButton(name), "menu-item-active");
        }

        function disableButton(name) {
            addClass(getButton(name), "menu-item-disabled");
        }

        function enableButton(name) {
            removeClass(getButton(name), "menu-item-disabled");
        }

        function refreshZoomBtns() {
            if (zoom.canZoomIn()) {
                enableButton("zoomIn");
            } else {
                disableButton("zoomIn");
            }
            if (zoom.canZoomOut()) {
                enableButton("zoomOut");
            } else {
                disableButton("zoomOut");
            }
        }

        function toggleZoomToFitBtn() {
            if (zoomToFit.isEnabled()) {
                highlightButton("zoomToFit");
            } else {
                unhighlightButton("zoomToFit");
            }
        }

        this.menu = {
            setZoom: function (level) {
                zoom.setZoom(level);
                refreshZoomBtns();
                toggleZoomToFitBtn()
            },
            zoomIn: function () {
                zoom.zoomIn();
                refreshZoomBtns();
                toggleZoomToFitBtn()
            },
            zoomOut: function () {
                zoom.zoomOut();
                refreshZoomBtns();
                toggleZoomToFitBtn()
            },
            zoomToFit: function () {
                zoom.deactivate();
                zoomToFit.toggle();
                toggleZoomToFitBtn();
                refreshZoomBtns();
            },
            zoomToFit_forceEnable: function () {
                zoom.deactivate();
                zoomToFit.enable();
                toggleZoomToFitBtn();
                refreshZoomBtns();
            },
            zoomToFit_forceDisable: function () {
                zoom.deactivate();
                zoomToFit.disable();
                toggleZoomToFitBtn();
                refreshZoomBtns();
            },
            fullscreen: function () {
                gantt.expand();
            },
            collapseAll: function () {
                gantt.eachTask(function (task) {
                    task.$open = false;
                });
                gantt.render();

            },
            expandAll: function () {
                gantt.eachTask(function (task) {
                    task.$open = true;
                });
                gantt.render();
            },
            toggleAutoScheduling: function () {
                gantt.config.auto_scheduling = !gantt.config.auto_scheduling;
                if (gantt.config.auto_scheduling) {
                    gantt.autoSchedule();
                    highlightButton("toggleAutoScheduling");
                } else {
                    unhighlightButton("toggleAutoScheduling")
                }
            },
            toggleCriticalPath: function () {
                gantt.config.highlight_critical_path = !gantt.config.highlight_critical_path;
                if (gantt.config.highlight_critical_path) {
                    highlightButton("toggleCriticalPath");
                } else {
                    unhighlightButton("toggleCriticalPath")
                }
                gantt.render();
            },
            toPDF: function () {
                gantt.exportToPDF();
            },
            toPNG: function () {
                gantt.exportToPNG();
            },
            toExcel: function () {
                gantt.exportToExcel();
            },
            toMSProject: function () {
                gantt.exportToMSProject();
            }
        };

        gantt.plugins({
            fullscreen: true,
            zoom: true,
            tooltip: true
        });

        // Highlight 1st Farvardin (Jalali New Year)
        // gantt.templates.scale_cell_class = (date) => {
        //     const jalaliDate = moment(date).format('jM-jD'); // Convert to Jalali month and day
        //     const [Month, Day] = jalaliDate.split('-').map(Number); // Extract month and day as numbers

        //     if (Month === 1 && Day === 1) {
        //         return "gantt-jalali-newyear";
        //     }
        //     return "";
        // };

        gantt.config.columns = this._getGanttColumns();

        gantt.config.min_column_width = 64;
        gantt.config.grid_width = this._getAllColums_width();

        gantt.config.layout = {
            css: "gantt_container",
            rows: [
                {
                    cols: [
                        { view: "timeline", resizer: true, scrollX: "scrollHor", scrollY: "scrollVer" },
                        { resizer: true, width: 1 },
                        { view: "grid", resizer: true, scrollX: "scrollHor", scrollY: "scrollVer" },
                        { view: "scrollbar", id: "scrollVer" }
                    ]
                },
                { view: "scrollbar", id: "scrollHor", height: 20 }
            ]
        };

        gantt.templates.task_text = (start, end, task) => {
            if (task.duration === 0) {
                return null;
            }
            return `${task.text}`;
        };

        gantt.templates.leftside_text = (start, end, task) => {
            if (task.duration === 0) {
                return task.text;
            }
            return null;
        };

        gantt.templates.tooltip_text = (start, end, task) => {
            return `
                نام: ${task.text}<br/>
                تاریخ شروع: ${task.start_date_Shamsi}<br/>
                تاریخ اتمام: ${task.end_date_Shamsi}<br/>
                درصد پیشرفت: ${parseInt(task.progress * 100)}%<br/>
            `;
        };

        gantt.attachEvent("onBeforeLightbox", function (id) {
            return false;
        });
    }


    getPersianTimeScale() {
        // تعریف توابع واحدهای سفارشی
        gantt.date.shamsi_year_start = function (date) {
            const m = moment(date).startOf('jYear');
            return m.toDate();
        };

        gantt.date.add_shamsi_year = function (date, inc) {
            const m = moment(date).add(inc, 'jYear');
            return m.toDate();
        };

        gantt.date.shamsi_month_start = function (date) {
            const m = moment(date).startOf('jMonth');
            return m.toDate();
        };

        gantt.date.add_shamsi_month = function (date, inc) {
            const m = moment(date).add(inc, 'jMonth');
            return m.toDate();
        };

        // تعریف توابع هفته شمسی
        gantt.date.shamsi_week_start = function (date) {
            const m = moment(date).startOf('week');
            return m.toDate();
        };

        gantt.date.add_shamsi_week = function (date, inc) {
            return moment(date).add(inc, 'weeks').toDate();
        };

        return [
            // hours
            {
                name: 'hours',
                scales: [
                    {
                        subscale_unit: "hour",
                        unit: "day",
                        step: 1,
                        format: function (date) {
                            return Utils.DateUtil(date).day;
                        }
                    },
                    { unit: "hour", step: 1, format: "%H:%i" }
                ]
            },
            // days
            {
                name: 'days',
                scales: [
                    {
                        subscale_unit: "day",
                        unit: "shamsi_month",
                        step: 1,
                        format: function (date) {
                            return "<strong>" + Utils.DateUtil(date).month + "</strong>";
                        }
                    },
                    {
                        unit: "day",
                        step: 1,
                        format: function (date) {
                            return "<strong>" + Utils.DateUtil(date).day + "</strong>";
                        }
                    }
                ]
            },
            // weeks
            {
                name: 'weeks',
                // scale_height: 60,
                scales: [
                    {
                        subscale_unit: "shamsi_month",
                        unit: "shamsi_year",
                        step: 1,
                        format: function (date) {
                            return "<strong>" + Utils.DateUtil(date).year + "</strong>";
                        }
                    },
                    {
                        subscale_unit: "week",
                        unit: "shamsi_month",
                        step: 1,
                        format: function (date) {
                            return Utils.DateUtil(date).month;
                        }
                    },
                    {
                        unit: "shamsi_week",
                        step: 1,
                        template: function (date) {
                            const startDateStr = Utils.DateUtil(date).day;
                            const endDate = gantt.date.add(gantt.date.add(date, 1, "week"), -1, "day");
                            const endDateStr = Utils.DateUtil(endDate).day;
                            return endDateStr + " - " + startDateStr;
                        }
                    }
                ]
            },
            // months
            {
                name: 'months',
                scales: [
                    {
                        subscale_unit: "shamsi_month",
                        unit: "shamsi_year",
                        step: 1,
                        format: function (date) {
                            return "<strong>" + Utils.DateUtil(date).year + "</strong>";
                        }
                    },
                    {
                        unit: "shamsi_month",
                        step: 1,
                        format: function (date) {
                            return "<strong>" + Utils.DateUtil(date).month + "</strong>";
                        }
                    }
                ]
            },
            // years
            {
                name: 'years',
                scales: [
                    {
                        subscale_unit: "shamsi_year",
                        unit: "shamsi_year",
                        step: 1,
                        format: function (date) {
                            return Utils.DateUtil(date).year;
                        }
                    }
                ]
            }
        ];
    }

    initZoom() {
        var levels_shamsi = this.getPersianTimeScale();
        this.zoom = (function (gantt) {
            gantt.ext.zoom.init({
                levels: levels_shamsi
            });

            var isActive = true;
            var max_level = levels_shamsi.length - 1;

            return {
                deactivate: function () {
                    isActive = false;
                },
                setZoom: function (level) {
                    isActive = true;
                    // Disable zoomToFit when zoom is used
                    this.zoomToFit.disable();
                    gantt.ext.zoom.setLevel(level);
                }.bind(this),
                zoomOut: function () {
                    isActive = true;
                    // Disable zoomToFit when zoom is used
                    this.zoomToFit.disable();
                    gantt.ext.zoom.zoomOut();
                    gantt.render();
                }.bind(this),
                zoomIn: function () {
                    isActive = true;
                    // Disable zoomToFit when zoom is used
                    this.zoomToFit.disable();
                    gantt.ext.zoom.zoomIn();
                    gantt.render();
                }.bind(this),
                canZoomOut: function () {
                    var level = gantt.ext.zoom.getCurrentLevel();
                    return !isActive || !(level >= max_level);
                },
                canZoomIn: function () {
                    var level = gantt.ext.zoom.getCurrentLevel();
                    return !isActive || !(level === 0);
                }
            };
        }).call(this, gantt);

        this.zoomToFit = (function (gantt) {
            var cachedSettings = {};

            function saveConfig() {
                var config = gantt.config;
                cachedSettings = {};
                cachedSettings.scales = config.scales;
                cachedSettings.template = gantt.templates.date_scale;
                cachedSettings.start_date = config.start_date;
                cachedSettings.end_date = config.end_date;
            }

            function restoreConfig() {
                applyConfig(cachedSettings);
            }

            function applyConfig(config, dates) {
                if (config.scales[0].date) {
                    gantt.templates.date_scale = null;
                } else {
                    gantt.templates.date_scale = config.scales[0].template;
                }

                gantt.config.scales = config.scales;

                if (dates && dates.start_date && dates.start_date) {
                    gantt.config.start_date = gantt.date.add(dates.start_date, -1, config.scales[0].subscale_unit);
                    gantt.config.end_date = gantt.date.add(gantt.date[config.scales[0].subscale_unit + "_start"](dates.end_date), 2, config.scales[0].subscale_unit);
                } else {
                    gantt.config.start_date = gantt.config.end_date = null;
                }
            }


            function zoomToFit() {
                var project = gantt.getSubtaskDates(),
                    areaWidth = gantt.$task.offsetWidth;

                const unit = ["hour","day","week","month","year"]    

                for (var i = 0; i < scaleConfigs.length; i++) {
                    var columnCount = getUnitsBetween(project.start_date, project.end_date, unit[i], scaleConfigs[i].scales[0].step);
                    if ((columnCount + 2) * gantt.config.min_column_width <= areaWidth) {
                        break;
                    }
                }

                if (i == scaleConfigs.length) {
                    i--;
                }

                applyConfig(scaleConfigs[i], project);
                gantt.render();
            }

            // get number of columns in timeline
            function getUnitsBetween(from, to, unit, step) {
                var start = new Date(from),
                    end = new Date(to);
                var units = 0;
                while (start.valueOf() < end.valueOf()) {
                    units++;
                    start = gantt.date.add(start, step, unit);
                }
                return units;
            }

            //Setting available scales
            var scaleConfigs = levels_shamsi;

            var enabled = false;
            return {
                enable: function () {
                    if (!enabled) {
                        enabled = true;
                        saveConfig();
                        zoomToFit();
                        gantt.render();
                    }
                },
                isEnabled: function () {
                    return enabled;
                },
                toggle: function () {
                    if (this.isEnabled()) {
                        this.disable();
                    } else {
                        this.enable();
                    }
                },
                disable: function () {
                    if (enabled) {
                        enabled = false;
                        restoreConfig();
                        gantt.render();
                    }
                }
            };

        })(gantt);
    }


    initGanttDataProcessor() {
        /**
         * type: "task"|"link"
         * action: "create"|"update"|"delete"
         * item: data object object
         */
        const onDataUpdated = this.props.onDataUpdated;
        this.dataProcessor = gantt.createDataProcessor((type, action, item, id) => {
            return new Promise((resolve, reject) => {
                if (onDataUpdated) {
                    onDataUpdated(type, action, item, id);
                }

                // if onDataUpdated changes returns a permanent id of the created item, you can return it from here so dhtmlxGantt could apply it
                // resolve({id: databaseId});
                return resolve();
            });
        });
    }

    shouldComponentUpdate(nextProps) {
        return this.props.zoom !== nextProps.zoom;
    }



    _validateGanttColumns(columnsJsonString) {
        let columns;

        try {
            columns = JSON.parse(columnsJsonString);
        } catch (error) {
            SystemClass.showWarningMsg('ساختار JSON ورودی نامعتبر است.');
            return false;
        }

        if (!Array.isArray(columns) || columns.length === 0) {
            SystemClass.showWarningMsg('ورودی باید یک آرایه غیرخالی از ستون‌ها باشد.');
            return false;
        }

        const tasks_column_keys = this._getTasks_column_keys();

        const allowedKeys = ['name', 'label', 'align', 'width', 'tree'];
        let treeCount = 0;


        for (const column of columns) {
            if (!column.name || typeof column.name !== 'string' || !column.label || typeof column.label !== 'string') {
                SystemClass.showWarningMsg('هر ستون باید دارای خصوصیت name و label معتبر باشد.');
                return false;
            }

            if (!tasks_column_keys.includes(column.name)) {
                SystemClass.showWarningMsg(`ستون "${column.name}" در دیتاسورس موجود نیست.`);
                return false;
            }

            for (const key in column) {
                if (!allowedKeys.includes(key)) {
                    SystemClass.showWarningMsg(`خصوصیت "${key}" در تعریف ستون مجاز نیست.`);
                    return false;
                }
            }
            if (column.hasOwnProperty('width')) {
                if (typeof column.width !== 'number' && column.width !== '*') {
                    SystemClass.showWarningMsg('مقدار خصوصیت width باید یک عدد یا "*" باشد.');
                    return false;
                }
            }

            if (column.tree === true) {
                treeCount++;
            }
        }

        if (treeCount > 1) {
            SystemClass.showWarningMsg('بیش از یک ستون نمی‌تواند خصوصیت tree: true را داشته باشد.');
            return null;
        }

        if (treeCount === 0) {
            columns[0].tree = true;
        }

        return true;
    }

    _getGanttColumns() {
        const chart_Options = this.fieldInfo.chart_Options || {};
        const GanttChart = chart_Options.GanttChart || {};
        if (GanttChart.ganttColumns_JsonList && this._validateGanttColumns(GanttChart.ganttColumns_JsonList)) {
            return GanttChart.ganttColumns_JsonList;
        }

        if (GanttChart.ganttColumns_JsonList)
            SystemClass.showMsg('به دلیل خطا گانت به صورت پیش فرض باز میشود');

        let durationColumn = "duration";
        let durationColumnLabel = "مدت";
        const tasks_column_keys = this._getTasks_column_keys();
        if (tasks_column_keys && tasks_column_keys.includes("duration_JustWorkDay")) {
            durationColumn = "duration_JustWorkDay";
            durationColumnLabel = "مدت کاری";
        }

        return (
            [
                { name: "text", label: "نام وظیفه", width: "*", tree: true, width: "*" },
                { name: "start_date_Shamsi", label: "زمان شروع", align: "center", width: 100 },
                { name: durationColumn, label: durationColumnLabel, align: "center" },
            ]);

    }


    _getAllColums_width() {
        const chart_Options = this.fieldInfo.chart_Options || {};
        const GanttChart = chart_Options.GanttChart || {};

        if (GanttChart.chart_AllColums_Width && typeof GanttChart.chart_AllColums_Width === 'number')
            return GanttChart.chart_AllColums_Width;

        return 450;
    }

    _getTasks_column_keys() {
        const ds1 = this.fieldInfo.getDataSource(this.fieldInfo.dataSourceName);
        return ds1.dataArray.length > 0 ? Object.keys(ds1.dataArray[0]) : [];
    }



    componentDidMount() {
        gantt.config.xml_date = "%Y-%m-%d %H:%i";

        const ds1 = this.fieldInfo.getDataSource(this.fieldInfo.dataSourceName);
        const ds2 = this.fieldInfo.getDataSource(this.fieldInfo.dataSourceName_2);

        if (!ds1) {
            return SystemClass.showErrorMsg('دیتاسورس اول پیدا نشد!');
        }

        if (!ds2) {
            return SystemClass.showErrorMsg('دیتاسورس دوم پیدا نشد!');
        }
        gantt.clearAll();
        const tasks = {};

        tasks.tasks = ds1.dataArray;
        tasks.links = ds2.dataArray;

        gantt.init(this.ganttContainer);
        this.initGanttDataProcessor();
        gantt.parse(tasks);
        // Enable zoomToFit by default
        this.menu.setZoom(2);
        this.menu.zoomToFit_forceEnable();

        this.ganttContainer.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.margin = "0";
        gantt.refreshData();
    }

    componentWillUnmount() {
        if (this.dataProcessor) {
            this.dataProcessor.destructor();
            this.dataProcessor = null;
        }
    }

    render() {
        return (
            <div>

                <div className="header gantt-demo-header">
                    <ul className="gantt-controls">
                        <li className="gantt-menu-item gantt-menu-item-right" onClick={this.menu.collapseAll}><a
                            data-action="collapseAll"><img
                                src="demo/imgs/ic_collapse_all_24.png" /> بستن همه </a></li>
                        <li className="gantt-menu-item gantt-menu-item-right" onClick={this.menu.expandAll}><a
                            data-action="expandAll"><img
                                src="demo/imgs/ic_expand_all_24.png" /> بازکردن همه </a></li>

                        <li className="gantt-menu-item gantt-menu-item-right gantt-menu-item-last" onClick={this.menu.toggleCriticalPath}><a
                            data-action="toggleCriticalPath" className=""><img
                                src="demo/imgs/ic_critical_path_24.png" /> مسیر بحرانی </a>
                        </li>

                        <li className="gantt-menu-item gantt-menu-item-last" onClick={this.menu.zoomToFit}>
                            <a data-action="zoomToFit" className=""><img src="demo/imgs/ic_zoom_to_fit_24.png" /> زوم کامل</a>
                        </li>
                        <li className="gantt-menu-item" onClick={this.menu.zoomOut}>
                            <a data-action="zoomOut" className=""><i class="fa fa-search-minus" aria-hidden="true"></i></a>
                        </li>
                        <li className="gantt-menu-item" onClick={this.menu.zoomIn}><a
                            data-action="zoomIn" className=""><i class="fa fa-search-plus" aria-hidden="true"></i></a>
                        </li>
                    </ul>
                </div>

                <div
                    ref={(input) => {
                        this.ganttContainer = input
                    }}
                    style={{ width: '100%', height: '100%' }}
                ></div>
            </div>
        );
    }
}
