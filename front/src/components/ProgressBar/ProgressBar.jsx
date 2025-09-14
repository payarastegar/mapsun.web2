import React from 'react';
import './ProgressBar.css';
import BaseComponent from "../BaseComponent";

class ProgressBar extends BaseComponent {

    constructor(props) {
        super(props)
        this.state = {}
        this.data = {}
        this.initialize()
    }


    initialize() {
    }

    render() {

        return (
            <div className="ProgressBar ProgressBar--small search_bar__progress">
                <div className="ProgressBar__bar ProgressBar__bar--back"/>
                <div className="ProgressBar__bar ProgressBar__bar--front"/>
            </div>
        )
    }
}

export default ProgressBar;
