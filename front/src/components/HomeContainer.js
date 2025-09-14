import React, {Component, Fragment, PureComponent} from 'react';
import BaseComponent from "./BaseComponent";
import FontAwesome from 'react-fontawesome'
import {ReactComponent as Error404} from '../content/error-404.svg';

class HomeContainer extends BaseComponent {
    constructor(props) {
        super(props)
        this.state = {}
        this.data = {}
        this.initialize()
    }

    initialize = () => {

    }

    render() {

        return (
            <div className="Error__container scroll__container2">
                <h4>HOME</h4>
            </div>
        )
    }

}

export default HomeContainer;