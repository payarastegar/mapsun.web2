import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";

function InputFieldComponent({
  lableTxt,
  placeholder,
  maxWidth,
  type,
  isMandatory,
  className,
  rows,
  cols,
  value,
  handleChangeInput,
  name,
  step,
  disabled,
  children,
  max,
}) {
  return (
    <div class={className} style={{ maxWidth: maxWidth }}>
      <label for={name} class="form-label" style={{ marginBottom: "8px" }}>
        {lableTxt}
      </label>
      {isMandatory && (
        <p
          style={{
            fontSize: "0.7rem",
            marginBottom: "2px",
            padding: "1px 3px",
            backgroundColor: "#96EFFF",
            borderLeft: "4px solid dodgerblue",
          }}
        >
          Mandatory
        </p>
      )}
      <input
        type={type}
        class="form-control"
        id={name}
        placeholder={placeholder}
        rows={rows}
        cols={cols}
        value={value}
        name={name}
        step={step}
        onChange={(e) => handleChangeInput(e, e.target.name)}
        // onChange={(e) => handleChangeInput(e.target.value)}
        disabled={disabled}
        max={max}
      >
        {children}
      </input>
    </div>
  );
}

export default InputFieldComponent;
