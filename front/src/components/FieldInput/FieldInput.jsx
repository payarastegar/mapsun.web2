import React, { Component } from "react";
import "./FieldInput.css";

class FieldInput extends Component {
  constructor(props) {
    super(props);
    //config for validation
    this.config = {
      minValue: -1000,
      maxValue: 1000,
      minDigit: 0,
      maxDigit: 5,
      floatAllowed: 1,
      floatMaxPrecision: 4,
      comma: 3,
      minLength: "",
      maxLength: "4",
      allowedChars: "abc", //empty for all
      notAllowedChars: "", //empty for none
      regExp: "[a-z]", //only aliphatic characters a to z
      //custom
      fixValidation: true,
    };
    //for binding
    this.state = {
      placeholder: "test for placeholder...",
      label: "test for label...",
      type: "text", //text or number
      error: "",
      value: "",
    };
  }

  //region validation check
  inputNumberValidationCheck = (value) => {
    if (!value) {
      return ["require"];
    }

    value = parseFloat(value);
    if (isNaN(value)) {
      // Not A Number
      return ["number"];
    }

    let errorList = [];
    if (!this.config.floatAllowed && value % 1 !== 0) {
      //error floated
      errorList.push("floatAllowed");
    }

    if (this.config.floatMaxPrecision) {
      if (
        ((value + "").split(".")[1] || "").length >
        +this.config.floatMaxPrecision
      ) {
        errorList.push("floatMaxPrecision");
      }
    }

    if (!isNaN(this.config.maxDigit)) {
      (Math.abs(parseInt(value)) + "").length > +this.config.maxDigit &&
        errorList.push("maxDigit");
    }

    if (!isNaN(this.config.minDigit)) {
      (Math.abs(parseInt(value)) + "").length < +this.config.minDigit &&
        errorList.push("minDigit");
    }

    if (this.config.minValue) {
      value < +this.config.minValue && errorList.push("minValue");
    }

    if (this.config.maxValue) {
      value > +this.config.maxValue && errorList.push("maxValue");
    }

    return errorList;
  };

  inputTextValidationCheck = (value) => {
    if (!value) {
      return ["require"];
    }

    value = value + "";

    let errorList = [];
    if (!isNaN(this.config.maxLength)) {
      value.length > +this.config.maxLength && errorList.push("maxLength");
    }
    if (!isNaN(this.config.minLength)) {
      value.length < +this.config.minLength && errorList.push("minLength");
    }

    if (this.config.allowedChars) {
      value.match(new RegExp(`[^${this.config.allowedChars}]`, "g")) &&
        errorList.push("allowedChars");
    }

    if (this.config.notAllowedChars) {
      value.match(new RegExp(`[${this.config.notAllowedChars}]`, "g")) &&
        errorList.push("notAllowedChars");
    }

    if (this.config.regExp) {
      !value.match(new RegExp(this.config.regExp, "g")) &&
        errorList.push("regExp");
    }

    return errorList;
  };

  inputValidationCheck = (value) => {
    let errorList = [];
    if (this.state.type === "number") {
      errorList = this.inputNumberValidationCheck(value);
    }

    if (this.state.type === "text") {
      errorList = this.inputTextValidationCheck(value);
    }

    return errorList;
  };

  isValid = (value) => {
    let errorList = this.inputValidationCheck(value);
    return { isValid: errorList.length === 0, errorList: errorList };
  };

  //endregion

  //region fix validation
  inputNumberFixValidate = (value) => {
    value = value + "";
    let convertNumbers2English = (string) =>
      string.replace(
        /[\u0660-\u0669\u06f0-\u06f9]/g,
        (c) => c.charCodeAt(0) & 0xf
      );
    value = convertNumbers2English(value);
    //delete non digit and dot and -
    value = value
      .replace(/[^0-9.-]/g, "")
      .replace(/(\..*)\./g, "$1")
      .replace(/(?!^)-/g, "");

    if (!this.config.floatAllowed) {
      value = value.replace(".", "");
    }

    let splitValue = value.split(".");
    let decimalPart = splitValue[0] || "";
    let floatPart = splitValue[1] || "";

    let dot = value.includes(".") ? "." : "";
    if (this.config.floatMaxPrecision && floatPart) {
      floatPart = floatPart.substr(0, +this.config.floatMaxPrecision);
    }

    let sign = decimalPart[0] === "-" ? "-" : "";
    if (sign) {
      //remove sign from decimal part
      decimalPart = decimalPart.slice(1);
    }

    if (!isNaN(this.config.maxDigit)) {
      decimalPart = decimalPart.slice(0, +this.config.maxDigit);
    }

    if (this.config.comma) {
      decimalPart = decimalPart.replace(
        new RegExp(`\\B(?=(\\d{${+this.config.comma}})+(?!\\d))`, "g"),
        ","
      );
    }

    return sign + decimalPart + dot + floatPart;
  };

  inputTextFixValidate = (value) => {
    if (!isNaN(this.config.maxLength)) {
      value = value.slice(0, +this.config.maxLength);
    }

    if (this.config.allowedChars) {
      value = value.replace(
        new RegExp(`[^${this.config.allowedChars}]`, "g"),
        ""
      );
    }

    if (this.config.notAllowedChars) {
      value = value.replace(
        new RegExp(`[${this.config.notAllowedChars}]`, "g"),
        ""
      );
    }

    return value;
  };

  inputFixValidation = (value) => {
    if (this.state.type === "number") {
      value = this.inputNumberFixValidate(value);
    }

    if (this.state.type === "text") {
      value = this.inputTextFixValidate(value);
    }

    return value;
  };

  //endregion

  handleChange = (event) => {
    let value = event ? event.target.value : this.state.value;

    if (this.config.fixValidation) {
      value = this.inputFixValidation(value);
    }

    let isValid = this.isValid(value);
    this.setState({ value: value, error: isValid.errorList.toString() });
  };

  componentDidMount() {
    this.handleChange();
  }

  render() {
    return (
      <div className="field-input">
        <input
          className="field-input__input"
          type={this.state.type === "number" ? "tel" : this.state.type}
          value={this.state.value}
          placeholder={this.state.placeholder}
          onChange={this.handleChange.bind(this)}
        />
        <span className="field-input__focus" />
        <span className="field-input__icon">
          <span className="fa fa-envelope" aria-hidden="true">
            ⌚
          </span>
        </span>

        <span className="field-input__error">{this.state.error}</span>
      </div>
    );
  }
}

export default FieldInput;
