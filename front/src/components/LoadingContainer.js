import React from 'react';
import BaseComponent from "./BaseComponent";
import * as ReactDOM from "react-dom";
import SystemClass from "../SystemClass";

class LoadingContainer extends BaseComponent {
    constructor(props) {
        super(props);
        this.state = {};
        this.data = {};
    }

    componentDidMount() {
        // findDOMNode is deprecated in StrictMode. Consider using refs instead if possible.
        this.data.node = ReactDOM.findDOMNode(this);
    }

    componentWillUnmount() {
        // Cleanup if needed
    }

    _handleEvents = (event) => {
        // Block user interaction when any loader is active
        if (SystemClass.loading || this.props.showCustomLoading) {
            event && event.stopPropagation();
            event && event.preventDefault();
        }
    };

    /**
     * Renders the custom animated spinner based on the provided image.
     */
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