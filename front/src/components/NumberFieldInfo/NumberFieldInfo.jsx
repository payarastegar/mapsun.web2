import './NumberFieldInfo.css';
import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
import Utils from "../../Utils";

class NumberFieldInfo extends TextFieldInfo {


    initialize() {
        super.initialize()
        this.state.inputType = "tel"
    }

    /***
     * return errorList
     * @param value
     * @return array {[...errorText]}
     */
    _validationCheck(value) {
        let errorList = super._validationCheck(value)

        if (!value || errorList.indexOf('require') !== -1) {
            return errorList
        }

        const comma = ','
        value = value + ''
        value = parseFloat(value.replace(new RegExp(`${comma}`, 'g'), ''))
        if (isNaN(value)) {
            // Not A Number
            return ['number']
        }

        if (!this.fieldInfo.number_FloatAllowed && value % 1 !== 0) {
            //error floated
            errorList.push('number_FloatAllowed')
        }

        if (this.fieldInfo.number_FloatMaxPrecision) {
            if (((value + "").split(".")[1] || '').length > +this.fieldInfo.number_FloatMaxPrecision) {
                errorList.push('number_FloatMaxPrecision')
            }
        }

        if (Utils.isNumber(this.fieldInfo.number_MaxDigit)) {
            (Math.abs(parseInt(value)) + '').length > +this.fieldInfo.number_MaxDigit && errorList.push('number_MaxDigit')
        }

        if (Utils.isNumber(this.fieldInfo.number_MinDigit)) {
            (Math.abs(parseInt(value)) + '').length < +this.fieldInfo.number_MinDigit && errorList.push('number_MinDigit')
        }

        if (this.fieldInfo.number_MinValue) {
            value < +this.fieldInfo.number_MinValue && errorList.push('number_MinValue')
        }

        if (this.fieldInfo.number_MaxValue) {
            value > +this.fieldInfo.number_MaxValue && errorList.push('number_MaxValue')
        }

        const customError = this.getCustomError()
        customError && errorList.push(customError)

        return errorList
    }

    /***
     * return fixed value by validation and config
     * @param value
     * @param fieldInfo
     * @return value {value}
     */
    _validationFix(value, fieldInfo) {
        return NumberFieldInfo.validationFix(value, fieldInfo)
    }

    static validationFix(value, fieldInfo) {
        value = TextFieldInfo.validationFix(value, fieldInfo)

        let convertNumbers2English = (string) => string.replace(/[\u0660-\u0669\u06f0-\u06f9]/g, c => c.charCodeAt(0) & 0xf);
        value = convertNumbers2English(value)
        //delete non digit and dot and -

        value = value.replace(/\//g, '.')
        value = value.replace(/[^0-9.-]/g, '').replace(/(\..*)\./g, '$1').replace(/(?!^)-/g, '');

        if (!fieldInfo.number_FloatAllowed) {
            value = value.split('.')[0]
        }

        let splitValue = value.split('.')
        let decimalPart = splitValue[0] || ''
        let floatPart = splitValue[1] || ''

        let dot = value.includes('.') ? '.' : ''
        if (fieldInfo.number_FloatMaxPrecision && floatPart) {
            floatPart = floatPart.substr(0, +fieldInfo.number_FloatMaxPrecision)
        }

        let sign = decimalPart[0] === '-' ? '-' : ''
        if (sign) {
            //remove sign from decimal part
            decimalPart = decimalPart.slice(1)
        }

        if (Utils.isNumber(fieldInfo.number_MaxDigit)) {
            decimalPart = decimalPart.slice(0, +fieldInfo.number_MaxDigit)
        }

        if (fieldInfo.number_CommaGozari) {
            const commaSize = 3
            const comma = ','
            decimalPart = decimalPart.replace(new RegExp(`\\B(?=(\\d{${commaSize}})+(?!\\d))`, 'g'), comma)
        }

        return sign + decimalPart + dot + floatPart

    }

    /***
     * return component value
     * @return number
     */
    getValue() {
        let value = super.getValue() + ''
        const comma = ','
        value = parseFloat(value.replace(new RegExp(`${comma}`, 'g'), ''))
        return isNaN(value) ? '' : value
    }


    //inherit
    // render() {}
}

export default NumberFieldInfo;
