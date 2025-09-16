import React, { Component } from "react";
import PropsTypes from "prop-types";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import { createRoot } from "react-dom/client";

export default class Portal extends Component {
  constructor() {
    super();
    this.portalElement = null;
    this.portalRoot = null;
  }

  componentDidMount() {
    const p = document.createElement("div");
    document.body.appendChild(p);
    this.portalElement = p;
    this.portalRoot = createRoot(this.portalElement);
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    if (!this.portalRoot) return; // اگر root هنوز ساخته نشده، خارج شو

    const duration = 200;
    const styles = `
      .fade-enter { opacity: 0.01; }
      .fade-enter.fade-enter-active { opacity: 1; transition: opacity ${duration}ms; }
      .fade-leave { opacity: 1; }
      .fade-leave.fade-leave-active { opacity: .01; transition: opacity ${duration}ms; }
    `;

    this.portalRoot.render(
      <div>
        <style>{styles}</style>
        <TransitionGroup {...this.props}>
          <CSSTransition
            timeout={{ enter: duration, exit: duration }}
            className="fade"
          >
            {this.props.children}
          </CSSTransition>
        </TransitionGroup>
      </div>
    );
  }

  componentWillUnmount() {
    if (this.portalRoot) {
      this.portalRoot.unmount();
    }
    if (this.portalElement) {
      document.body.removeChild(this.portalElement);
    }
  }

  render() {
    return null;
  }
}

Portal.propTypes = {
  children: PropsTypes.element,
};