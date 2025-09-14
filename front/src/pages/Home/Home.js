import React from "react";
import "./Home.css";
import SystemClass from "../../SystemClass";

export default () => {
  //   window.location.assign("/auth/login");
  SystemClass.pushLink("/auth/login");
  return (
    <>
      <div className={"scroll__container"}>
        <div style={{ padding: "0 1.5rem" }}>
          {/* <FirstView height={550} />
          <div />
          <SecondView />
          <div />
          <ThirdView />
          <div />
          <FourthView />
          <div />
          <FifthView />
          <div style={{ padding: "0 0 2rem 0" }} /> */}
        </div>
      </div>
    </>
  );
};
