import "./GridInfo.css";
import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import React, { Fragment } from "react";
import * as ReactDOM from "react-dom";
import FilterCondition from "../../class/enums/FilterCondition";
import FieldInfo from "../../class/FieldInfo";
import ColumnInfo from "../../class/ColumnInfo";
import ComponentUtils from "../ComponentUtils";
import Utils from "../../Utils";
import UiSetting from "../../UiSetting";
import FontAwesome from "react-fontawesome";
import SystemClass from "../../SystemClass";
import GridInfo_Core from "./GridInfo_Core";
import ButtonFieldInfo from "../ButtonFieldInfo/ButtonFieldInfo";

class GridInfo extends GridInfo_Core {
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

  /**
   * hide some column for mobile
   * @private
   */
  _updateColumnVisibility = () => {
    //TODO must re implement
    const container = ReactDOM.findDOMNode(this).querySelector(
      ".GridInfo__container"
    );
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
        //scroll
        break;
      }
      scrollWidth -= +container.querySelector(
        `[data-key="${columnList[i].fieldName}"]`
      ).clientWidth;
      this.data.columnsHide[columnList[i].fieldName] = true;
    }

    this.forceUpdate();
  };

  //TODO remove if not need
  //must be arrow function (for this problems...)
  //not need for now
  /**
   * simulate click on button
   * @param row
   * @param fieldName
   * @param level
   */
  clickOnItem = (row, fieldName, level) => {
    const idColName = this.dataSource.idColName;
    const rowKey = this._getRowKey(row[idColName], level);

    const container = ReactDOM.findDOMNode(this).querySelector(
      ".GridInfo__container"
    );
    const trNode = container.querySelector(`tr[data-key="${rowKey}"]`);
    const tdNode = trNode.querySelector(`td[data-key="${fieldName}"]`);
    tdNode.querySelector(`button`).click();
  };

  //------------------------------------------------
  //region render element
  //------------------------------------------------

  _elementGetHeader(columnInfo, index) {
    const style = {
      minWidth: columnInfo.gridColumn_Width_ByPixel
        ? columnInfo.gridColumn_Width_ByPixel + "px"
        : "",
      display: this._isColumnVisible(columnInfo) ? "" : "none",
      cursor: columnInfo.gridColumn_IsRowNumber && "not-allowed",
    };

    const sortIcon = {
      show: this.data.tartib_FieldName == columnInfo.fieldName,
      icon: this.data.tartib_IsDescending ? "caret-down" : "caret-up",
    };

    const hideLabel =
      /*columnInfo.label_HideLabel ||*/ columnInfo.gridColumn_HideTitle;
    return (
      <th
        key={columnInfo.fieldName}
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
    };

    const fontColor = row[columnInfo.fieldName + "_FontColor"];
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

    // TODO
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

    if (
      this._isGroupColumn(columnInfo) ||
      this.fieldInfo.leveling_ApplyToField == tdKey
    ) {
      className += " GridInfo__table__td--leveling";
      className += " GridInfo__table__td--leveling";
    }

    const canDrag = this._isDragColumn(columnInfo);

    let tdValue;
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
      let Tag = ComponentUtils.getComponentTag(columnInfo.fieldType);
      const fieldInfo =
        this.data.componentFields[row[idColName]] &&
        this.data.componentFields[row[idColName]][columnInfo.fieldName];
      let key = this.data.needUpdate ? 1 : 2;

      tdValue = fieldInfo && fieldInfo.visible && (
        <Tag
          style={{ marginRight: marginRight }}
          key={key}
          fieldInfo={fieldInfo}
          onChange={(value) => this.forceUpdate()}
        />
      );
      return (
        <td
          onDragStart={this._handleTdDragStart.bind(this, columnInfo, row)}
          draggable={canDrag}
          data-key={tdKey}
          key={tdKey}
          className={className}
          style={style}
          onClick={onHyperLinkClick}
        >
          {tdValue}
        </td>
      );
    } else {
      if (isGrouping && this._isGroupColumn(columnInfo)) {
        // style.cursor = 'pointer'
        {
          /*<FontAwesomeIcon icon={'caret-left'} />*/
        }
        if (groupOption.showIcon) {
          className += " GridInfo__table__td__group";
        }
        const icon = groupOption.groupCollapse
          ? this.fieldInfo.grouping_IconName_Collapsed
          : this.fieldInfo.grouping_IconName_Expanded;
        tdValue = (
          <span>
            {" "}
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
          <td
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
          </td>
        );
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

    // if (marginRight) {
    //     tdValue = <span style={{marginRight: marginRight}}>
    //             {tdValue}
    //             </span>
    // }

    tdValue = (
      <span
        style={{ marginRight: marginRight }}
        dangerouslySetInnerHTML={{ __html: tdValue }}
      />
    );

    return (
      <td
        draggable={canDrag}
        data-key={tdKey}
        key={tdKey}
        className={className}
        style={style}
        onClick={onHyperLinkClick}
      >
        {tdValue}
      </td>
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

    const _getCardElement = (cardItem) => {
      let className = "";
      let Tag = "";
      let flexDirection = "";

      let padding = cardItem.padding + "";
      let maxWidth = cardItem.maxWidth + "";
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

      if (align === "right") {
        justifyContent = direction === "rtl" ? "flex-start" : "flex-end";
      }

      if (align === "left") {
        justifyContent = direction !== "rtl" ? "flex-start" : "flex-end";
      }

      if (align === "center") {
        justifyContent = "center";
      }

      let buttonElement;

      let onClick = () => {};

      if (cardItem.onClick) {
        let buttonColumnFieldInfo = columnInfo_List.find(
          (ci) => ci.fieldName == cardItem.onClick
        );
        let dataKey = buttonColumnFieldInfo.fieldName + row[idColName];

        className += "GridInfo__Card__item ";

        // buttonElement =
        //     <div style={{display: "none"}}
        //          data-key={dataKey}>{this._elementGetRowData(buttonColumnFieldInfo, row, rowIndex,)}</div>
        //

        const buttonFieldInfo =
          this.data.componentFields[row[idColName]] &&
          this.data.componentFields[row[idColName]][
            buttonColumnFieldInfo.fieldName
          ];
        buttonFieldInfo.component = new ButtonFieldInfo({
          fieldInfo: buttonFieldInfo,
        });

        onClick = (row, fieldName, level) => {
          buttonFieldInfo.click();
        };
      }

      const style = {
        color: fontColor,
        fontSize: fontSize === "small" ? "10px" : "",
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
            <div style={style} className={className} onClick={onClick}>
              {buttonElement}
              {cardItem.items.map(_getCardElement)}
            </div>
          );

          break;

        case "vertical":
          className += "GridInfo__Card__vertical";

          return (
            <div style={style} className={className} onClick={onClick}>
              {buttonElement}
              {cardItem.items.map(_getCardElement)}
            </div>
          );

          break;

        case "single":
          if (!cardItem.fieldName) return;

          const columnFieldInfo = columnInfo_List.find(
            (ci) => ci.fieldName == cardItem.fieldName
          );

          if (!cardItem.fieldName) {
            SystemClass.showErrorMsg(
              "ستون مورد نظر پیدا نشد : " + cardItem.fieldName
            );
            return;
          }

          className += "";
          return (
            <div style={style} className={className} onClick={onClick}>
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
            <div style={style} className={className} onClick={onClick}>
              {buttonElement}
              {cardItem.items.map(_getCardElement)}
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

    return (
      <div
        className={"GridInfo__Card"}
        style={{ margin: cardPadding, width: cardWidth }}
      >
        {_getCardElement(parentCardItem)}
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
      <Fragment>
        {progressBar}
        <tr
          onDragOver={this._handleTrDropMove}
          onDrop={this._handleTrOnDrop.bind(this, row)}
          data-key={key}
          key={key}
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

  render() {
    const pagingOptions = this._pagingGetOptions();
    const rowList = this._dataCurrentPageRowList();

    const isCardView = this._isCardView();

    const rendered = (
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
          <div className={"GridInfo__container scroll__container"}>
            <table className={"GridInfo__table"}>
              <thead>
                <tr className={"GridInfo__table__tr--header"}>
                  {this.data.columnInfo_List.map(
                    this._elementGetHeader.bind(this)
                  )}
                </tr>
              </thead>

              <tbody>{rowList.map(this._elementGetRow.bind(this))}</tbody>
            </table>

            {rowList.length === 0 && (
              <div className={"GridInfo__emptyContainer"}>
                <FontAwesome
                  className={"GridInfo__emptyIcon ml-2"}
                  name={"exclamation-circle"}
                />
                {UiSetting.GetSetting("language") === "en"
                  ? "There is nothing to display"
                  : "داده ای موجود نیست "}
              </div>
            )}
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

    //after fully
    this.data.needUpdate = false;

    console.log();

    return rendered;
  }

  //------------------------------------------------
  //endregion render element
  //------------------------------------------------
}

export default GridInfo;
