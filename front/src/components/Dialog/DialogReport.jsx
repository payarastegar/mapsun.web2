import React, {Component} from 'react';
import {Button, Modal, ModalHeader, ModalBody, ModalFooter} from 'reactstrap';

import './Dialog.css';
import BaseComponent from "../BaseComponent";
import Class_Base from "../../class/Class_Base";
import SystemClass from "../../SystemClass";
import Utils from "../../Utils";
import FormInfo from "../FormInfo/FormInfo";
import FieldInfo from "../../class/FieldInfo";
import {conditionallyUpdateScrollbar, setScrollbarWidth} from "reactstrap/es/utils";
import FontAwesome from 'react-fontawesome';


class DialogReport extends BaseComponent {

    constructor(props) {
        super(props);
        this.state = {
        };

        this.data = {
        }

        SystemClass.DialogReportComponent = this
        SystemClass.browserHistory.listen((location, action, sd) => {
            console.log(action, location.pathname, location.state)
            if (action === "POP") {
                //close this
            }
        })
    }

    //endregion

    //region events
    _handleOnDialogKeyPress = (event) => {
        if (event.keyCode === 27 && !SystemClass.loading) {
            //Do whatever when esc is pressed

            //close this
        }
    }

    // region element

    // endregion element
    render() {
        //
        // const style = {
        //     width: width && width + 'px',
        //     maxWidth: width && width + 'px',
        //     //TODO CHECK
        //     height2: modelItem.formFieldInfo.defaultHeightInPixel + 'px',
        //     marginRight: width && 'auto',
        //     marginLeft: width && 'auto',
        //     marginTop: modelIndex === 0 ? '' : (2.5 + (modelIndex * 3)) + 'rem'
        // }
        //
        // return (
        //     <div id="DialogContainer" className={["dialog"].filter(c => c).join(' ')}
        //          onKeyDown={this._handleOnDialogKeyPress}>
        //
        //         modelItem.isOpen && <Modal size="xl" isOpen={modelItem.isShow} modalClassName={"scroll__container"}
        //                                    className={["dialog__container"].filter(c => c).join(' ')}
        //                                    onClosed={this._handleOnDialogClose.bind(this, (modelItem))}
        //                                    key={modelItem.formName + index} centered={false} style={style}
        //     >
        //         <ModalHeader>
        //
        //             <div style={{display: 'flex', width: '100%'}}>
        //
        //             <span>
        //                 {this._getModalItemHeader(modelItem)}
        //             </span>
        //
        //                 <div style={{flex: '1', width: '100%'}}/>
        //
        //                 <Button className={'Menu__icon dialog__closeIcon'} outline color="light"
        //                         onClick={this._handleOnCancelClick.bind(this, (modelItem))}>
        //                     <FontAwesome className={''} name="times-circle"/>
        //                 </Button>
        //             </div>
        //         </ModalHeader>
        //
        //         <ModalBody className={["dialog__body"].filter(c => c).join(' ')}>
        //             <FormInfo fieldInfo={modelItem.formFieldInfo}/>
        //         </ModalBody>
        //     </Modal>
        //
        //     </div>
        // );
    }
}

export default DialogReport;
