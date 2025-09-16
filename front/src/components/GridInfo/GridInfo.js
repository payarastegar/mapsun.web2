import "./GridInfo.css";
import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import React, { Fragment } from "react";
import FontAwesome from "react-fontawesome";
import SystemClass from "../../SystemClass";
import GridInfo_Core from "./GridInfo_Core";
import { UncontrolledPopover, PopoverBody } from "reactstrap";
import UiSetting from "../../UiSetting";
import Utils from "../../Utils";
import ComponentUtils from "../ComponentUtils";
import ButtonFieldInfo from "../ButtonFieldInfo/ButtonFieldInfo";
import FieldType from "../../class/enums/FieldType";

class GridInfo extends GridInfo_Core {
  constructor(props) {
    super(props);
    this.containerRef = React.createRef();
  }

  //------------------------------------------------
  //region public methods
  //------------------------------------------------

  componentDidMount() {
    super.componentDidMount();
    window.addEventListener("resize", this._handleWindowResize);
    this._updateColumnVisibility();
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    window.removeEventListener("resize", this._handleWindowResize);
  }

  //------------------------------------------------
  //endregion public methods
  //------------------------------------------------

  _updateColumnVisibility = () => {
    const container = this.containerRef.current;
    if (!container) return;
    const columnList = this.data.columnInfo_List.filter(
      (c) => c.gridColumn_PriorityForSmallWidth
    );
    if (columnList.length === 0) return;

    this.data.columnsHide = {};
    columnList.sort((colA, colB) => {
      colA = colA.gridColumn_PriorityForSmallWidth;
      colB = colB.gridColumn_PriorityForSmallWidth;
      return colA > colB ? -1 : colA < colB ? 1 : 0;
    });

    let scrollWidth = container.scrollWidth - container.clientWidth;
    for (let i = 0; i < columnList.length; i++) {
      if (scrollWidth <= 0) {
        break;
      }
      const headerCell = container.querySelector(
        `[data-key="${columnList[i].fieldName}"]`
      );
      if (headerCell) {
        scrollWidth -= +headerCell.clientWidth;
        this.data.columnsHide[columnList[i].fieldName] = true;
      }
    }

    this.forceUpdate();
  };

  clickOnItem = (row, fieldName, level) => {
    const container = this.containerRef.current;
    if (!container) return;

    const idColName = this.dataSource.idColName;
    const rowKey = this._getRowKey(row[idColName], level);
    const trNode = container.querySelector(`tr[data-key="${rowKey}"]`);
    if (trNode) {
      const tdNode = trNode.querySelector(`td[data-key="${fieldName}"]`);
      tdNode?.querySelector(`button`)?.click();
    }
  };

  //------------------------------------------------
  //region render element
  //------------------------------------------------

  _elementToggleSelectAll = (selectAll) => {
    const table = this.containerRef.current?.querySelector(".GridInfo__table");
    if (!table) return;

    const tdElements = table.querySelectorAll('tbody tr td[data-key="chbSelect"]');
    tdElements.forEach((td) => {
      const input = td.querySelector('input[type="checkbox"]');
      if (input && input.checked !== selectAll) {
        td.click();
      }
    });
    this.forceUpdate();
  };

  _elementGetHeader(columnInfo, index) {
    const style = {
      minWidth: columnInfo.gridColumn_Width_ByPixel
        ? columnInfo.gridColumn_Width_ByPixel + "px"
        : "",
      display: this._isColumnVisible(columnInfo) ? "" : "none",
      cursor: columnInfo.gridColumn_IsRowNumber ? "not-allowed" : "pointer",
    };

    const sortIcon = {
      show: this.data.tartib_FieldName === columnInfo.fieldName,
      icon: this.data.tartib_IsDescending ? "caret-down" : "caret-up",
    };

    const hideLabel = columnInfo.gridColumn_HideTitle;
    const headerId = `grid-header-${columnInfo.fieldName}`;

    const header = (
      <th
        key={columnInfo.fieldName}
        id={headerId}
        data-key={columnInfo.fieldName}
        className={"GridInfo__table__th"}
        style={style}
        onClick={this._handleOnHeaderClick.bind(this, columnInfo)}
      >
        <span className={"GridInfo__table__th__label"}>
          {!hideLabel && (columnInfo.label || columnInfo.fieldName)}
        </span>
        {sortIcon.show && (
          <FontAwesome
            className={"GridInfo__table__th__icon"}
            name={sortIcon.icon}
          />
        )}
      </th>
    );

    const showMenu =
      index ===
      this.data.columnInfo_List.findIndex((c) => this._isColumnVisible(c));

    if (showMenu) {
      const hasCheckboxColumn = this.data.columnInfo_List.some(
        (col) => col.fieldName === "chbSelect"
      );

      return (
        <Fragment key={columnInfo.fieldName}>
          {header}
          <UncontrolledPopover
            placement="bottom-start"
            target={headerId}
            trigger="legacy"
          >
            <PopoverBody>
              <button
                className="MenuItem__item d-block w-100"
                onClick={this._exportToExcel}
              >
                <FontAwesome
                  className={"MenuItem__button__icon"}
                  name="file-excel"
                />
                <span className={"MenuItem__displayName"}>
                  {UiSetting.GetSetting("language") === "fa"
                    ? "دریافت خروجی اکسل"
                    : "Export to excel"}
                </span>
              </button>
              {hasCheckboxColumn && (
                <>
                  <button
                    className="MenuItem__item d-block w-100"
                    onClick={() => this._elementToggleSelectAll(true)}
                  >
                    <FontAwesome
                      className={"MenuItem__button__icon"}
                      name="check-square"
                    />
                    <span className={"MenuItem__displayName"}>
                      {UiSetting.GetSetting("language") === "fa"
                        ? "انتخاب همه"
                        : "Select All"}
                    </span>
                  </button>
                  <button
                    className="MenuItem__item d-block w-100"
                    onClick={() => this._elementToggleSelectAll(false)}
                  >
                    <FontAwesome
                      className={"MenuItem__button__icon"}
                      name="square"
                    />
                    <span className={"MenuItem__displayName"}>
                      {UiSetting.GetSetting("language") === "fa"
                        ? "لغو انتخاب همه"
                        : "Deselect All"}
                    </span>
                  </button>
                </>
              )}
            </PopoverBody>
          </UncontrolledPopover>
        </Fragment>
      );
    }
    return header;
  }

  _elementGetProgress(row) {
    const showProgressBar = this.fieldInfo
      .mobileGrid_ProgressBar_ShowProgressBar;
    const visible_FieldValue =
      row[this.fieldInfo.mobileGrid_ProgressBar_Visible_FieldName];
    if (!showProgressBar || !visible_FieldValue) return;

    let progress1 = +row[this.fieldInfo.mobileGrid_ProgressBar_FieldName_1];
    let progress2 = +row[this.fieldInfo.mobileGrid_ProgressBar_FieldName_2];

    //enable upload progress
    const idColName = this.dataSource.idColName;
    if (idColName == "documentCid") {
      const documentCid = row.documentCid;
      const uploadModel = SystemClass.getUpload(documentCid);
      if (uploadModel) {
        progress1 = uploadModel.percent;
        progress2 = 0;
      }
    }
    //

    progress1 = progress1 > 100 ? 100 : progress1;
    progress2 = progress2 > 100 ? 100 : progress2;

    let backgroundColor = this.fieldInfo.mobileGrid_ProgressBar_Color_2;
    if (this.fieldInfo.mobileGrid_ProgressBar_FieldName_2) {
      backgroundColor = this.fieldInfo.mobileGrid_ProgressBar_Color_3;
    }

    const styleContainer = {
      backgroundColor: backgroundColor,
    };

    const styleBarList = [
      {
        backgroundColor: this.fieldInfo.mobileGrid_ProgressBar_Color_1,
        width: +progress1 + "%",
        progress: progress1,
      },
      {
        backgroundColor: this.fieldInfo.mobileGrid_ProgressBar_Color_2,
        width: +progress2 + "%",
        progress: progress2,
      },
    ];

    //Not need now
    // styleBarList.sort((s1, s2) => {
    //     return s1.progress > s2.progress ? -1 : (s1.progress < s2.progress ? 1 : 0)
    // })

    return (
      <div style={styleContainer} className="GridInfo__progressContainer">
        <div style={styleBarList[0]} className="GridInfo__progressBar" />
        <div style={styleBarList[1]} className="GridInfo__progressBar" />
      </div>
    );
  }

  _elementGetRowData(
    columnInfo,
    row,
    rowIndex,
    levelingPercent,
    columnLevelingClass,
    groupOption,
    cardInfo
  ) {
    const idColName = this.dataSource.idColName;
    const isGrouping = this.fieldInfo.grouping_IsGrouped;

    let marginRight = "";
    const style = {
      display: this._isColumnVisible(columnInfo) ? "" : "none",
      paddingRight: levelingPercent ? levelingPercent + "%" : "",
      maxHeight: columnInfo.image_MaxHeight,
      maxWidth: columnInfo.image_MaxWidth,
      minHeight: columnInfo.image_MaxHeight,
      minWidth: columnInfo.image_MaxWidth,
      textAlign: "center",
    };

    if (UiSetting.GetSetting("textAlign").toLocaleLowerCase() === "left") {
      style.paddingLeft = levelingPercent ? levelingPercent + "%" : "";
      style.paddingRight = "";
    }

    if (columnInfo.align) {
      style.textAlign = columnInfo.align.toLocaleLowerCase();
    }

    const fontColor =
      row[columnInfo.fieldName + "_FontColor"] || columnInfo.fontColor;
    if (fontColor) {
      style.color = fontColor;
    }

    marginRight = levelingPercent ? levelingPercent + "%" : "";
    if (this._isGroupColumn(columnInfo) && groupOption.groupIndent) {
      style.paddingRight = groupOption.groupIndent
        ? groupOption.groupIndent + "%"
        : "";
      marginRight = groupOption.groupIndent
        ? groupOption.groupIndent + "%"
        : "";
    }

    marginRight = "";

    let onHyperLinkClick;
    const button_FieldName = columnInfo.dataSource_OnClick_Button_FieldName;
    if (button_FieldName) {
      const button_FieldInfo = row[button_FieldName];
      if (button_FieldInfo) {
        onHyperLinkClick = this._handleOnTdClick.bind(
          this,
          row,
          button_FieldName,
          groupOption.level,
          columnInfo
        );
      }
    }

    let className = [
      "GridInfo__table__td",
      columnLevelingClass,
      onHyperLinkClick && "GridInfo__td__link",
    ]
      .filter((i) => i)
      .join(" ");

    const tdKey = columnInfo.fieldName;

    let leveling = false;
    if (
      this._isGroupColumn(columnInfo) ||
      this.fieldInfo.leveling_ApplyToField === tdKey
    ) {
      className += " GridInfo__table__td--leveling";
      leveling = true;
    }

    const canDrag = this._isDragColumn(columnInfo);

    let tdValue;

    const Tag = cardInfo ? "div" : "td";

    if (columnInfo.gridColumn_IsRowNumber) {
      let paged = this.fieldInfo.paging_IsPaged;
      let startNumber = 0;
      if (paged) {
        let pageSize = +this.fieldInfo.paging_pageSize;
        let currentPage = +this.state.currentPage - 1;
        startNumber = +(paged && pageSize * currentPage);
      }
      tdValue = +startNumber + rowIndex + 1;
      if (isGrouping) {
        tdValue = +startNumber + groupOption.groupRowIndex;
      }
    } else if (this._columnIsFieldInfo(columnInfo)) {
      let CompTag = ComponentUtils.getComponentTag(columnInfo);
      const fieldInfo =
        this.data.componentFields[row[idColName]] &&
        this.data.componentFields[row[idColName]][columnInfo.fieldName];
      let key = this.data.needUpdate ? 1 : 2;

      tdValue = fieldInfo && fieldInfo.visible && (
        <CompTag
          style={{ marginRight: marginRight }}
          key={key}
          fieldInfo={fieldInfo}
          onChange={(value) => this.forceUpdate()}
        />
      );

      if (!tdValue) tdValue = "";

      const _width = this._styleGetColumnWidth(fieldInfo || columnInfo);
      style.width = style.width || _width;
      return (
        <Tag 
          onDragStart={this._handleTdDragStart.bind(this, columnInfo, row)}
          draggable={canDrag}
          data-key={tdKey}
          key={tdKey}
          className={className}
          style={style}
          onClick={onHyperLinkClick}
        >
          {tdValue}
        </Tag>
      );
    } else {
      if (isGrouping && this._isGroupColumn(columnInfo)) {
        if (groupOption.showIcon) {
          className += " GridInfo__table__td__group";
        }
        const icon = groupOption.groupCollapse
          ? this.fieldInfo.grouping_IconName_Collapsed
          : this.fieldInfo.grouping_IconName_Expanded;
        tdValue = (
          <span>
            {groupOption.showIcon && (
              <FontAwesome
                className={"GridInfo__table__td__icon"}
                name={icon}
              />
            )}
            {this._getRowDataForColumn(
              row[groupOption.groupName],
              columnInfo,
              cardInfo
            )}
          </span>
        );
        return (
          <Tag 
            draggable={canDrag}
            data-key={tdKey}
            onClick={groupOption.onClick}
            key={tdKey}
            className={className}
            style={style}
          >
            <span style={{ marginRight: marginRight }}>{tdValue}</span>
            {groupOption.childSize && (
              <span className={"GridInfo__table__td__childSize"}>
                {`(${groupOption.childSize})`}{" "}
              </span>
            )}
          </Tag>
        );
      } else {
        if (columnInfo.number_ShowZero_IfValueIsZero) {
          tdValue = row[columnInfo.fieldName]
            ? this._getRowDataForColumn(
                row[columnInfo.fieldName],
                columnInfo,
                cardInfo
              )
            : row[columnInfo.fieldName];
        } else {
          tdValue = row[columnInfo.fieldName]
            ? this._getRowDataForColumn(
                row[columnInfo.fieldName],
                columnInfo,
                cardInfo
              )
            : columnInfo.gridColumn_Template.replace(
                /{.*?}/g,
                (gridColumn_TemplateIndex) =>
                  row[gridColumn_TemplateIndex.slice(1, -1)]
              );
        }
      }
    }

    tdValue = (
      <Fragment>
        <span
          className={"GridInfo__table__td__Span"}
          style={{
            marginRight: marginRight,
            textAlign: Utils.isMobile()
              ? "center"
              : UiSetting.GetSetting("textAlign"),

            maxWidth: columnInfo.gridColumn_Width_ByPixel
              ? columnInfo.gridColumn_Width_ByPixel + "px"
              : "",
          }}
          dangerouslySetInnerHTML={{ __html: tdValue }}
        />
      </Fragment>
    );

    return (
      <Tag
        draggable={canDrag}
        data-key={tdKey}
        key={tdKey}
        className={className}
        style={style}
        onClick={onHyperLinkClick}
      >
        {tdValue}
      </Tag>
    );
  }

  _elementGetGroupRowOptions(dataRow) {
    const idColName = this.dataSource.idColName;
    const isGrouping = this.fieldInfo.grouping_IsGrouped;

    let groupClass = "";
    let visibility = true;
    let groupName = "";
    let groupIndent = 0;
    let groupCollapse = false;
    let showIcon = false;
    let groupRowIndex = 0;
    let childSize = "";
    let groupLevel = null;
    let backgroundColor = "";
    let onClick = () => {};

    visibility = dataRow.visibility;

    if (visibility && isGrouping) {
      groupClass = dataRow.className;
      groupName = dataRow.name;
      groupIndent =
        dataRow.level * this.fieldInfo.grouping_PercentIndentedForEachLevel;
      groupCollapse = dataRow.collapse;
      groupRowIndex = dataRow.rowIndex;
      groupLevel = dataRow.level;
      childSize = dataRow.childSize;

      const groupNames = this._getGroupingArray();
      if (groupNames.length > dataRow.level + 1) {
        showIcon = true;
        onClick = this._handleOnClickItemCollapse.bind(this, dataRow);
      }

      backgroundColor = this.fieldInfo[
        "grouping_BackColor_" + (+dataRow.level + 1)
      ];
    }

    return {
      groupClass,
      visibility,
      groupName,
      groupIndent,
      groupCollapse,
      showIcon,
      groupRowIndex,
      childSize,
      groupLevel,
      backgroundColor,

      onClick,
    };
  }

  _elementGetCardRow(row, rowIndex, groupOption) {
    const idColName = this.dataSource.idColName;
    //card view rendering
    const columnInfo_List = this.data.gridColumnInfo_List;
    const parentCardItem = this.fieldInfo.row_CardView_Definition;

    let tempKey = 0;

    const _getCardElement = (cardItem, level) => {
      level = level || 0;

      let className = "";
      let Tag = "";
      let flexDirection = "";

      let padding = cardItem.padding + "";
      let maxWidth = cardItem.maxWidth + 50 + "";
      let maxHeight = cardItem.maxHeight + "";

      if (parentCardItem == cardItem) {
        padding = "";
      }

      let fontColor = cardItem.fontColor;
      let fontSize = cardItem.fontSize;
      let align =
        UiSetting.GetSetting("textAlign") || cardItem.align || "right";

      let direction =
        UiSetting.GetSetting("DefaultPageDirection") ||
        cardItem.direction ||
        "r2l";
      direction = direction.replace("2", "t");

      if (padding) {
        padding = padding.match(/\D/g, "") ? padding : padding + "px";
      }

      if (maxWidth) {
        maxWidth = maxWidth.match(/\D/g, "") ? maxWidth : maxWidth + "px";
      }

      if (maxHeight) {
        maxHeight = maxHeight.match(/\D/g, "") ? maxHeight : maxHeight + "px";
      }

      let justifyContent = align;
      let alignItems = "flex-Start";

      if (align === "right") {
        justifyContent = direction === "rtl" ? "flex-start" : "flex-end";
        // justifyContent = "center";
      }

      if (align === "left") {
        justifyContent = direction !== "rtl" ? "center" : "flex-end";
        alignItems = "flex-start";
        // justifyContent = "center";
      }

      if (align === "center") {
        justifyContent = "center";
      }

      let buttonElement;

      let onClick = () => {};

      const dataKey = row[idColName] + "__tempId_" + ++tempKey;

      if (cardItem.onClick) {
        let buttonColumnFieldInfo = columnInfo_List.find(
          (ci) => ci.fieldName == cardItem.onClick
        );

        className += "GridInfo__Card__item ";

        // buttonElement =
        //     <div style={{display: "none"}}
        //          data-key={dataKey}>{this._elementGetRowData(buttonColumnFieldInfo, row, rowIndex,)}</div>
        //

        // console.log(this)
        const buttonFieldInfo =
          this.data.componentFields[row[idColName]] &&
          this.data.componentFields[row[idColName]][
            buttonColumnFieldInfo.fieldName
          ];
        if (buttonFieldInfo) {
          buttonFieldInfo.component = new ButtonFieldInfo({
            fieldInfo: buttonFieldInfo,
          });

          onClick = (row, fieldName, level) => {
            buttonFieldInfo.click();
          };
        }
      }

      const style = {
        color: fontColor,
        fontSize: fontSize === "small" ? "12px" : "",
        textAlign: align,
        padding: padding,
        direction: direction,
        justifyContent: justifyContent,
        cursor: cardItem.onClick && "pointer",
        // maxHeight: maxHeight,
        // maxWidth: maxWidth,
      };

      switch (cardItem.layout) {
        case "horizontal":
          className += "GridInfo__Card__horizontal";
          return (
            <div
              key={dataKey}
              style={style}
              className={className}
              onClick={onClick}
            >
              {buttonElement}
              {cardItem.items.map((card) => _getCardElement(card, level + 1))}
            </div>
          );

          break;

        case "vertical":
          className += "GridInfo__Card__vertical";

          return (
            <div
              key={dataKey}
              style={style}
              className={className}
              onClick={onClick}
            >
              {buttonElement}
              {cardItem.items.map((card) => _getCardElement(card, level + 1))}
            </div>
          );

          break;

        case "single":
          if (!cardItem.fieldName) return;

          const columnFieldInfo = columnInfo_List.find(
            (ci) => ci.fieldName == cardItem.fieldName
          );

          if (!columnFieldInfo) {
            SystemClass.showErrorMsg(
              "ستون مورد نظر پیدا نشد : " + cardItem.fieldName
            );
            return;
          }

          className += "";
          return (
            <div
              style={style}
              key={dataKey}
              className={className}
              onClick={onClick}
            >
              {buttonElement}
              {this._elementGetRowData(
                Object.assign({}, columnFieldInfo, cardItem),
                row,
                rowIndex,
                "",
                "",
                groupOption,
                cardItem
              )}
            </div>
          );

          break;

        case "text":
          className += "GridInfo__Card__text";

          return (
            <div
              style={style}
              key={dataKey}
              className={className}
              onClick={onClick}
            >
              {buttonElement}
              {cardItem.items.map((card) => _getCardElement(card, level + 1))}
            </div>
          );

          break;

        case "none":
          className += "GridInfo__Card__text";

          return (
            <div style={{ display: "none" }} key={dataKey}>
              {/* {buttonElement}
              {cardItem.items.map((card) => _getCardElement(card, level + 1))} */}
            </div>
          );

          break;

        default:
          SystemClass.showErrorMsg(
            "نوع " + cardItem.layout + "در کارت ها موجود نمی باشد!"
          );
      }
    };

    let cardPadding = parentCardItem.padding + "";

    let cardWidth = parentCardItem.width + "";

    if (cardPadding) {
      cardPadding = cardPadding.match(/\D/g, "")
        ? cardPadding
        : cardPadding + "px";
    }

    if (cardWidth) {
      cardWidth = cardWidth.match(/\D/g, "") ? cardWidth : cardWidth + "px";
    }

    const isGallery = this.fieldInfo.grid_IsGallery;

    return (
      <div
        className={isGallery ? "GridInfo_Card_Gallery" : "GridInfo__Card"}
        key={row[idColName]}
        style={
          isGallery ? {} : { width: Utils.isMobile() ? "100%" : cardWidth }
        }
      >
        {_getCardElement(parentCardItem, 0)}
      </div>
    );
  }

  _elementGetRow(dataRow, rowIndex) {
    const style = {};
    const idColName = this.dataSource.idColName;
    const isGrouping = this.fieldInfo.grouping_IsGrouped;

    // TODO
    let columnLevelingClass = "";

    //option of grouping
    const groupOption = this._elementGetGroupRowOptions(dataRow);

    //get row in data source if grouping must use dataRow.row

    if (isGrouping) {
      if (!dataRow.visibility) return;
    }

    const row = isGrouping ? dataRow.dataRow : dataRow;

    const fieldNames = this._getGroupingArray();
    const lastLevel = fieldNames.length - 1;

    if (groupOption.backgroundColor) {
      style.backgroundColor = groupOption.backgroundColor;
    }

    if (
      this.fieldInfo.row_BackColor_FieldName &&
      (groupOption.groupLevel == null || groupOption.groupLevel == lastLevel)
    ) {
      const backColorName = row[this.fieldInfo.row_BackColor_FieldName];
      style.backgroundColor = this.fieldInfo["row_BackColor_" + +backColorName];
    }

    //leveling
    let levelingPercent = 0;
    let levelingClass = "";
    if (this.fieldInfo.leveling_IsLeveled && !isGrouping) {
      let levelIndent = row[this.fieldInfo.leveling_LevelNumberFieldName];
      levelingClass = this.fieldInfo.leveling_ClassName_Array[levelIndent - 1];
      levelingPercent =
        levelIndent * this.fieldInfo.leveling_PercentIndentedForEachLevel;
    }
    //

    // class names
    let row_ClassName_Default = this.fieldInfo.row_ClassName_Default;
    let row_ClassName_Odd =
      rowIndex % 2 !== 0 && this.fieldInfo.row_ClassName_Odd;
    let row_ClassName_Even =
      rowIndex % 2 === 0 && this.fieldInfo.row_ClassName_Even;
    let row_ClassName_FieldName = row[this.fieldInfo.row_ClassName_FieldName];

    const className = [
      "GridInfo__table__tr",
      levelingClass,
      row_ClassName_Default,
      row_ClassName_Odd,
      row_ClassName_Even,
      row_ClassName_FieldName,
      groupOption.groupClass,
    ]
      .filter((i) => i)
      .join(" ");

    const leveling_ApplyToField = this.fieldInfo.leveling_ApplyToField;

    let key = this._getRowKey(row[idColName], isGrouping && dataRow.level);

    const isSelectedRow = this._rowIsSelected(row);
    if (isSelectedRow) {
      let bg = style.backgroundColor
        ? Utils.pSBC(-0.2, style.backgroundColor.trim())
        : "#f0f0f0";
      style.backgroundColor = bg || "#f0f0f0";
    }

    const showProgressBar = this.fieldInfo
      .mobileGrid_ProgressBar_ShowProgressBar;
    let progressBar;
    if (showProgressBar) {
      progressBar = this._elementGetProgress(row);
    }

    //if card view return card row
    if (this._isCardView()) {
      //card view rendering
      return this._elementGetCardRow(row, rowIndex, groupOption);
    }

    return (
      <Fragment key={key}>
        {progressBar}
        <tr
          key={key}
          onDragOver={this._handleTrDropMove}
          onDrop={this._handleTrOnDrop.bind(this, row)}
          data-key={key}
          className={className}
          style={style}
          onClick={this._handleOnRowClick.bind(this, row, rowIndex)}
        >
          {this.data.columnInfo_List.map((columnInfo) => {
            //group columns is hidden only last of them is shown
            if (
              isGrouping &&
              groupOption.showIcon &&
              !this._isGroupColumn(columnInfo)
            ) {
              const visible = this._isColumnVisible(columnInfo);
              return <td key={columnInfo.fieldName} />;
            }

            //get td for column
            const columnLevelingPercent =
              columnInfo.fieldName == leveling_ApplyToField && levelingPercent;
            return this._elementGetRowData(
              columnInfo,
              row,
              rowIndex,
              columnLevelingPercent,
              columnLevelingClass,
              groupOption
            );
          })}
        </tr>
      </Fragment>
    );
  }

  _elementGetPageItem(value, index) {
    let className = "GridInfo__paging-item ";
    if (this.state.currentPage === value) {
      className += "GridInfo__paging-item--active";
    }
    return (
      <li
        key={index}
        className={className}
        onClick={this._handleOnPageItemClick.bind(this, value)}
      >
        {" "}
        {value}{" "}
      </li>
    );
  }

  //endregion

  _styleGetColumnWidth = (fieldInfo) => {
    if (!fieldInfo) return;

    switch (fieldInfo.fieldType) {
      case FieldType.Button:
        const icon = fieldInfo.button_IconName;
        const image = fieldInfo.button_ImageName;
        const hideText = !fieldInfo.button_ShowText && !!icon;

        const iconButton = icon && !image && hideText;
        if (iconButton) return "3rem";
        break;

      case FieldType.CheckBox:
        const label_HideLabel = fieldInfo.label_HideLabel;
        const checkBoxLabel =
          !label_HideLabel &&
          (fieldInfo.checkBox_TrueText ||
            fieldInfo.checkBox_FalseText ||
            fieldInfo.label);
        if (!checkBoxLabel) return "2rem";
        break;
    }
  };

  _exportToExcel = () => {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");

    this.data.columnInfo_List.forEach((columnInfo) => {
      if (this._columnIsFieldInfo(columnInfo)) return;

      const th = document.createElement("th");
      th.innerText = columnInfo.label || columnInfo.fieldName || "";
      tr.append(th);
    });

    thead.append(tr);

    const tbody = document.createElement("tbody");
    const rowList = this._dataGetRowList();

    rowList.forEach((row) => {
      const tr = document.createElement("tr");

      if (this.fieldInfo.row_BackColor_FieldName) {
        const backColorName = row[this.fieldInfo.row_BackColor_FieldName];
        tr.style.backgroundColor = this.fieldInfo[
          "row_BackColor_" + +backColorName
        ];
      }

      this.data.columnInfo_List.forEach((columnInfo) => {
        if (this._columnIsFieldInfo(columnInfo)) return;

        const td = document.createElement("td");
        td.innerText =
          this._getRowDataForColumn(row[columnInfo.fieldName], columnInfo) ||
          "";
        if (td.innerText == "undefined") td.innerText = "";
        td.innerHTML = td.innerHTML.replace(
          /<br\s*\/?>/gi,
          '<br style="mso-data-placement:same-cell;" />'
        );
        tr.append(td);
      });

      tbody.append(tr);
    });

    table.append(thead);
    table.append(tbody);

    //remove grid from name
    //addd uniqe id to it like time and date
    Utils.TableToExcel(table, this.fieldInfo.fieldName);
  };
  
  render() {
    const pagingOptions = this._pagingGetOptions();
    const rowList = this._dataCurrentPageRowList();
    const isCardView = this._isCardView();

    return (
      <div className={"GridInfo"}>
        <div style={{ marginBottom: ".5rem" }}>
          <TextFieldInfo
            fieldInfo={this.data._textFieldInfo}
            onChange={(component, value) => {
              this.setState({ inputText: value });
            }}
          />
        </div>

        {!isCardView ? (
          <div
            ref={this.containerRef}
            className={"GridInfo__container scroll__container"}
          >
            <table className={"GridInfo__table"}>
              <thead>
                <tr className={"GridInfo__table__tr--header"}>
                  {this.data.columnInfo_List.map(
                    this._elementGetHeader.bind(this)
                  )}
                </tr>
              </thead>
              <tbody>
                {rowList.map(this._elementGetRow.bind(this))}
                {rowList.length === 0 && (
                  <tr>
                    <td colSpan="100%">
                      <div className={"GridInfo__emptyContainer"}>
                        <FontAwesome
                          className={"GridInfo__emptyIcon ml-2"}
                          name={"exclamation-circle"}
                        />
                        {UiSetting.GetSetting("language") === "en"
                          ? "There is nothing to display"
                          : "داده ای موجود نیست "}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={"GridInfo__CardContainer"}>
            {rowList.map(this._elementGetRow.bind(this))}
          </div>
        )}

        <div>
          {pagingOptions.paging_IsPaged && (
            <nav className="row justify-content-center">
              <ul className={"GridInfo__paging-container"}>
                <li
                  className={"GridInfo__paging-item"}
                  onClick={this._handleOnPageItemClick.bind(this, 1)}
                >
                  {" "}
                  «
                </li>
                {pagingOptions.showStartDot && (
                  <li
                    className={
                      "GridInfo__paging-item GridInfo__paging-item--more-dot"
                    }
                    onClick={this._handleOnPageItemClick.bind(this, -1)}
                  >
                    {" "}
                    …
                  </li>
                )}
                {pagingOptions.list.map(this._elementGetPageItem.bind(this))}
                {pagingOptions.showEndDot && (
                  <li
                    className={
                      "GridInfo__paging-item GridInfo__paging-item--more-dot"
                    }
                    onClick={this._handleOnPageItemClick.bind(this, -1)}
                  >
                    {" "}
                    …
                  </li>
                )}
                <li
                  className={"GridInfo__paging-item"}
                  onClick={this._handleOnPageItemClick.bind(this, -1)}
                >
                  {" "}
                  »
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    );
  }
}

export default GridInfo;