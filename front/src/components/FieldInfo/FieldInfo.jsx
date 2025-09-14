import React, {Component} from 'react';
import './FieldInfo.css';


class FieldInfo extends Component {
    constructor(props) {
        super(props)
    }

    /** @type {(FieldInfo)} */
    fieldInfo

    // region property
    /** @type {(FieldType)} */
    fieldType
    fieldName
    isValid_ErrorMsg
    //TODO ASK for Static
    systemObject

    /** array[onChangeFunction]
     * @type {array<Function>}  */
    onChange_Callees = []
    dataSourceName
    idValue
    label
    label_After
    /** @type {(LabelPosition)} */
    labelPosition
    value
    initialValue
    className_Label
    className_Field
    width_Total
    width_Slice1
    width_Slice2
    width_Slice3
    /** @type {(HorizontalAlign)} */
    align
    image_Url
    /** @type {(FormInfo)} */
    container_Form
    /** @type {(FormInfo)} */
    container_ParentForm
    /** @type {(Element)} */
    container_Div

    //endregion

    //region methods

    // constructor(in systemObject, in jsFieldInfo, in divContainer : Element, in formInfo : FormInfo, in idValue, in dataSourceName)
    isValid() {
        throw 'CustomError: Unimplemented!'
    }

    asInt() {
        throw 'CustomError: Unimplemented!'
    }

    asFloat() {
        throw 'CustomError: Unimplemented!'
    }

    asText() {
        throw 'CustomError: Unimplemented!'
    }

    asDate() {
        throw 'CustomError: Unimplemented!'
    }

    rebind() {
        throw 'CustomError: Unimplemented!'
    }

    rebindCombo() {
        throw 'CustomError: Unimplemented!'
    }

    rebindField() {
        throw 'CustomError: Unimplemented!'
    }

    rebindGrid() {
        throw 'CustomError: Unimplemented!'
    }

    /** @param {number} newParentId */
    changeParent_Combo(newParentId) {
        throw 'CustomError: Unimplemented!'
    }

    onSearchClick() {
        throw 'CustomError: Unimplemented!'
    }

    onChange() {
        throw 'CustomError: Unimplemented!'
    }

    /** @param {function} callee */
    addOnChange_Callee(callee) {
        throw 'CustomError: Unimplemented!'
    }

    /** @param  newValue */
    changeValue(newValue) {
        throw 'CustomError: Unimplemented!'
    }

    /** @return  array[NameValueObject] */
    getFieldValues() {
        throw 'CustomError: Unimplemented!'
    }

    button_CallWebSvc_AndRefreshForm() {
        throw 'CustomError: Unimplemented!'
    }

    button_OpenDialog_AndInitF() {
        throw 'CustomError: Unimplemented!'
    }

    /** react component method*/
    componentWillUnmount() {
        throw 'CustomError: Unimplemented!'
    }

    //endregion

}

export default FieldInfo;
