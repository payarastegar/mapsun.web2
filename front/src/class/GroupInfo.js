import Class_Base from "./Class_Base";

/** ColumnInfo Class */
class GroupInfo extends Class_Base {

    constructor(json) {
        super(json)
        this._initPropertyGetter(json)
    }

   groupFieldName
   groupClassName

}

export default GroupInfo;