import React, { Component, Fragment, PureComponent } from "react";
import BaseComponent from "./BaseComponent";
import WebService from "../WebService";
import FormInfo from "./FormInfo/FormInfo";
import SystemClass from "../SystemClass";
import { toast } from "react-toastify";
import FieldType from "../class/enums/FieldType";
import FieldInfo from "../class/FieldInfo";

class FrameContainer extends BaseComponent {
  constructor(props) {
    super(props);
    this.state = {};
    this.userInfo = WebService.getUserInfo();
    this.data = {
      frameUrl: props.match.params.frameUrl,
    };
    this.data.frameUrl = "https://mapsun.net";
    this.initialize();
  }

  initialize = () => {};

  render() {
    window.userInfo = "UserInfo";
    const urlParams = this.props.match.params.frameUrl;
    const serachParams = this.props.location.search;

    if (!urlParams) return;

    let frameSrc = urlParams.startsWith("buttonCid_")
      ? "/dashboard/ProjectDashboard.html" + "?" + urlParams
      : "https://" + this.props.location.pathname.slice(6) + serachParams;

    return (
      <div className="Frame__container scroll__container2">
        <iframe
          title="my"
          referrerPolicy="same-origin"
          className={"FormFrame"}
          src={frameSrc}
        />
      </div>
    );
  }
}

export default FrameContainer;
