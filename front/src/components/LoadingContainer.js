import React, { useState, forwardRef, useImperativeHandle, useCallback } from "react";
import SystemClass from "../SystemClass";

const LoadingContainer = forwardRef((props, ref) => {
  const [show, setShow] = useState(false);

  useImperativeHandle(ref, () => ({
    setShowCustomLoading: (isVisible) => {
      setShow(isVisible);
    },
  }));

  const _handleEvents = useCallback(
    (event) => {
      if (SystemClass.loading || show) {
        event && event.stopPropagation();
        event && event.preventDefault();
      }
    },
    [show]
  );

  const renderCustomDot = (index,delay,size = 10 ) => {
    const wrapper = {
      position: "absolute",
      width: "100%",
      height: "100%",
      animation: "chase-and-gather 2s infinite linear",
      animationDelay: `${delay}s`
    }
    const styleDot = {
      width: `${size}px`,
      height: `${size}px`,
      position: "absolute",
      top: "0",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "#4285F4",
      borderRadius: "50%",
    }
    return (
      <div style={wrapper} key={`spinner_wrapper_${index}`}>
        <div style={styleDot} key={`spinner_dot_${index}`}></div>
      </div>
    );
  };

  const renderCustomLoader = () => {
    let followers = []
    for (let i = 5; i >= 0; i--) {
      // const size = 15 - (i * 2)
      // followers.push(renderCustomDot(i,i * 0.12,size))
      followers.push(renderCustomDot(i,i * 0.12))
    }
    return (
      <div className="spinner-container" key="spinner_1">
        {followers}
      </div>
    );
  };

  const { showFullLoading } = props;

  const style = showFullLoading ? {} : { top: "3.75rem" }

  return (
    <div
      onKeyDown={_handleEvents}
      onTouchStart={_handleEvents}
      onKeyPress={_handleEvents}
      id="maskDisable"
      className={"maskDisable"}
      style={style}
    >
      {(show) && renderCustomLoader()}
    </div>
  );
});

export default LoadingContainer;