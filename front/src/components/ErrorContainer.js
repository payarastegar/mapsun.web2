import React, { Component, Fragment, PureComponent } from 'react';
import BaseComponent from "./BaseComponent";
import FontAwesome from 'react-fontawesome'
// import {ReactComponent as Error404} from '../content/error-404.svg';
import error404Url from '../content/error-404.svg';

class ErrorContainer extends BaseComponent {
    constructor(props) {
        super(props)
        this.state = {}
        this.data = {}
        this.data.error = props.match.params.error
        console.log(this.data.error)
        this.initialize()
    }

    initialize = () => {

    }

    render() {

        window.location.assign('/')

        return (
            <div className="Error__container scroll__container2">
                <img src={error404Url} alt="Error 404" className={'Error__container__icon'} />
            </div>
        )
    }

}

export default ErrorContainer;