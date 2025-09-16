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

  const renderCustomLoader = () => {
    return (
      <div className="spinner-container">
        <div className="dot-wrapper follower follower-1"><div className="dot small"></div></div>
        <div className="dot-wrapper follower follower-2"><div className="dot small"></div></div>
        <div className="dot-wrapper follower follower-3"><div className="dot small"></div></div>
        <div className="dot-wrapper follower follower-4"><div className="dot small"></div></div>
        <div className="dot-wrapper leader"><div className="dot big"></div></div>
      </div>
    );
  };

  return (
    <div
      onKeyDown={_handleEvents}
      onTouchStart={_handleEvents}
      onKeyPress={_handleEvents}
      id="maskDisable"
      className={"maskDisable"}
    >
      {show && renderCustomLoader()}
    </div>
  );
});

export default LoadingContainer;