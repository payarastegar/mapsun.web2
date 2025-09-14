import React from "react";
import "./ImageViewerFieldInfo.css";
import Utils from "../../Utils";
import { Button } from "reactstrap";
import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import WebService from "../../WebService";
import SystemClass from "../../SystemClass";
import FileUtils from "../../file/FileUtils";
import ImgsViewer from "../ImageViewer/ImgsViewer";
import FontAwesome from "react-fontawesome";
import UiSetting from "../../UiSetting";

// import Utils from '.././Utils.js';

class ImageViewerFieldInfo extends TextFieldInfo {
  initialize() {
    //for binding
    this.state = {
      srcSet: [],
      isOpen: false,
    };

    this.data = {};

    this.gotoNext = this.gotoNext.bind(this);
    this.gotoPrev = this.gotoPrev.bind(this);
    this.gotoImg = this.gotoImg.bind(this);
    this.handleClickImg = this.handleClickImg.bind(this);
    this.closeImgsViewer = this.closeImgsViewer.bind(this);
    this.openImgsViewer = this.openImgsViewer.bind(this);
  }

  update() {
    // const ds = this._dataGetDataSource()
    // ds.
  }

  _getUrl() {
    return WebService.getFileUrl(this.fieldInfo._value);
  }

  isValid() {
    return true;
  }

  open(row) {
    this._initData(row);
  }

  componentDidMount() {}

  _initData(row) {
    const {
      imageViewer_Grid_FieldName,
      dataSource_Icon_FieldName,
      dataSource_TarikheEijad_FieldName,
      dataSource_btnDownload_FieldName,
      dataSource_btnDelete_FieldName,
      dataSource_documentHyperlink_FieldName,
      dataSource_FileName_FieldName,
      dataSource_FileSize_FieldName,
      imgDocumentThumbnail,
    } = this.fieldInfo;

    const gridInfo = this.getFieldInfo(imageViewer_Grid_FieldName);
    if (!gridInfo) {
      SystemClass.showErrorMsg("فیلد Grid یافت نشد!");
      return;
    }
    const gridDataSource = gridInfo.getDataSource();
    const items = gridDataSource.dataArray.filter(
      (row) => row[dataSource_documentHyperlink_FieldName]
    );

    // ] && FileUtils.IsImage(row[dataSource_FileName_FieldName])

    this.state.currImg = items.indexOf(row);
    if (this.state.currImg === -1) {
      SystemClass.showErrorMsg(
        UiSetting.GetSetting("language") === "fa"
          ? "فایل مورد نظر پیدا نشد!"
          : "Your file doesn't exist!"
      );
      return;
    }

    const onDeleteClick = (event) => {
      gridInfo.component._handleOnTdClick(
        this.state.srcSet[this.state.currImg].row,
        dataSource_btnDelete_FieldName
      );

      this.closeImgsViewer();
    };

    const onDownloadClick = (event) => {
      gridInfo.component._handleOnTdClick(
        this.state.srcSet[this.state.currImg].row,
        dataSource_btnDownload_FieldName
      );
    };

    this.state.customControls = [
      <div key="headerBtns" className={"ImageViewer__header"}>
        {dataSource_btnDownload_FieldName && (
          <Button
            onClick={onDownloadClick}
            className={"ImageViewer__button"}
            color="primary"
          >
            {UiSetting.GetSetting("language") === "fa" ? "دریافت" : "Download"}
            <FontAwesome className="ButtonFieldInfo__icon" name={"download"} />
          </Button>
        )}
        {dataSource_btnDelete_FieldName && (
          <Button
            onClick={onDeleteClick}
            className={"ImageViewer__button"}
            color="primary"
          >
            {UiSetting.GetSetting("language") === "fa" ? "حذف" : "Delete"}
            <FontAwesome className="ButtonFieldInfo__icon" name={"trash"} />
          </Button>
        )}
      </div>,
    ];

    ///images/icons/doc.svg
    this.state.isOpen = true;
    this.state.srcSet = items.map((row) => {
      const name = row[dataSource_FileName_FieldName];
      const src = FileUtils.IsImage(name)
        ? row[dataSource_documentHyperlink_FieldName]
        : "/images/icons/" + row[dataSource_Icon_FieldName];

      const caption = {
        name: name,
        date: Utils.getFileSizeTitle(
          row[dataSource_FileSize_FieldName],
          UiSetting.GetSetting("language") === "fa" ? 0 : 1
        ),
        size: Utils.getDateLocalFormat(
          row[dataSource_TarikheEijad_FieldName],
          UiSetting.GetSetting("language") === "fa" ? 0 : 1
        ),
      };

      const captionElement = (
        <div
          className={"ImageViewer__footer"}
          style={{
            textAlign:
              UiSetting.GetSetting("language") === "fa" ? "right" : "left",
          }}
        >
          <div>{caption.name}</div>
          <div
            className={"ImageViewer__footerDetail"}
            style={{
              direction:
                UiSetting.GetSetting("language") === "fa" ? "right" : "left",
            }}
          >
            <span>{caption.date}</span>
            <span>{caption.size}</span>
          </div>
        </div>
      );

      return {
        src: WebService.getFileUrl(src),
        caption: captionElement,
        thumbnail: WebService.getFileUrl(row["imgDocumentThumbnail"]),
        row,
      };
    });
    this.forceUpdate();
  }

  openImgsViewer(index, event) {
    event.preventDefault();
    this.setState({
      currImg: index,
      isOpen: true,
    });
  }

  closeImgsViewer() {
    this.setState({
      currImg: 0,
      isOpen: false,
    });
  }

  gotoPrev() {
    this.setState({
      currImg: this.state.currImg - 1,
    });
  }

  gotoNext() {
    this.setState({
      currImg: this.state.currImg + 1,
    });
  }

  gotoImg(index) {
    this.setState({
      currImg: index,
    });
  }

  handleClickImg() {}

  render() {
    return (
      <ImgsViewer
        imgs={this.state.srcSet}
        isOpen={this.state.isOpen}
        currImg={this.state.currImg}
        onClickImg={this.handleClickImg}
        onClickNext={this.gotoNext}
        onClickPrev={this.gotoPrev}
        onClickThumbnail={this.gotoImg}
        onClose={this.closeImgsViewer}
        customControls={this.state.customControls}
        preventScroll2={this.props.preventScroll}
        showThumbnails={true}
        spinner2={this.props.spinner}
        spinnerColor2={this.props.spinnerColor}
        spinnerSize2={this.props.spinnerSize}
        theme={{}}
        src={this.state.srcSet[this.state.currImg]}
      />
    );
  }
}

export default ImageViewerFieldInfo;
