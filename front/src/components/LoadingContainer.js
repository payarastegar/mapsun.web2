import React from "react";
import BaseComponent from "./BaseComponent";
import SystemClass from "../SystemClass";

class LoadingContainer extends BaseComponent {
  constructor(props) {
    super(props);
    this.nodeRef = React.createRef();
    this.state = {};
    this.data = {};
  }

  componentDidMount() {
  }

  componentWillUnmount() {
    // Cleanup if needed
  }

  _handleEvents = (event) => {
    if (SystemClass.loading || this.props.showCustomLoading) {
      event && event.stopPropagation();
      event && event.preventDefault();
    }
  };

  renderCustomLoader = () => {
        return (
            <div className="spinner-container">
                {/* Follower dots are first in the HTML to be visually behind the leader */}
                <div className="dot-wrapper follower follower-1"><div className="dot small"></div></div>
                <div className="dot-wrapper follower follower-2"><div className="dot small"></div></div>
                <div className="dot-wrapper follower follower-3"><div className="dot small"></div></div>
                <div className="dot-wrapper follower follower-4"><div className="dot small"></div></div>

                {/* The leader dot is last in the HTML to appear on top of the others */}
                <div className="dot-wrapper leader"><div className="dot big"></div></div>
            </div>
        );
    }

  render() {
    const { showCustomLoading } = this.props;

    return (
      <div
        ref={this.nodeRef}
        onKeyDown={this._handleEvents}
        onTouchStart={this._handleEvents}
        onKeyPress={this._handleEvents}
        id="maskDisable"
        className={"maskDisable"}
      >
        {showCustomLoading && this.renderCustomLoader()}
      </div>
    );
  }
}

export default LoadingContainer;