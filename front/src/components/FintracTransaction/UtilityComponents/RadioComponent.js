import React from "react";

function RadioComponent({
  fieldTitle,
  fieldName,
  firstSelectId,
  secondSelectId,
  radioValue,
  handleChangeInput,
  firstSelectTitle,
  secondSelectTitle,
}) {
  return (
    <div className="col-6 mt-3">
      <p className="mb-0">{fieldTitle}</p>
      <div className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name={fieldName}
          id={firstSelectId}
          checked={radioValue === "true" || radioValue === true ? true : false}
          value={true}
          onChange={(e) => handleChangeInput(e, e.target.name)}
        />
        <label className="form-check-label" for={firstSelectId}>
          {firstSelectTitle}
        </label>
      </div>
      <div className="form-check">
        <input
          className="form-check-input"
          type="radio"
          name={fieldName}
          id={secondSelectId}
          checked={radioValue === "true" || radioValue === true ? false : true}
          value={false}
          onChange={(e) => handleChangeInput(e, e.target.name)}
        />
        <label className="form-check-label" for={secondSelectId}>
          {secondSelectTitle}
        </label>
      </div>
    </div>
  );
}

export default RadioComponent;
