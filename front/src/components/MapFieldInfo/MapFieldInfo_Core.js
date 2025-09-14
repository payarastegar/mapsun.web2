import Utils from "../../Utils";
import TextFieldInfo from "../TextFieldInfo/TextFieldInfo";
// import ButtonActionTypes from "../../class/enums/ButtonActionTypes";
// import SystemClass from "../../SystemClass";
// import WebService from "../../WebService";
// import FieldType from "../../class/enums/FieldType";
// import FileUtils from "../../file/FileUtils";


// import * as am4core from "@amcharts/amcharts4/core";
// import * as am4charts from "@amcharts/amcharts4/charts";
// import am4themes_animated from "@amcharts/amcharts4/themes/animated";

// am4core.useTheme(am4themes_animated);

class MapFieldInfo_Core extends TextFieldInfo {

    //------------------------------------------------
    //region component public method
    //------------------------------------------------
    initialize() {
        //for binding
        this.state = {
            error: '',
            value: '',
            inputType: 'text',
            validationEffect: false
        }

        this.data = {
            isValid: true,
            isTouched: false,
            isDirty: false,
            _validationEffectTimeoutId: '',
            node: '',

        }
    }

}

export default MapFieldInfo_Core;
