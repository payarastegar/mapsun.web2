import Class_Base from "./Class_Base";

/** ColumnInfo Class */
class ColumnInfo extends Class_Base {

    constructor(json) {
        super(json)
        this._initPropertyGetter(json)
    }

    label = ''
    visible = true

    fieldName = ''
    fieldType = ''
    tartib

    gridColumn_Width_ByPixel = 0
    gridColumn_Template = ''
    gridColumn_HideLabel
    gridColumn_IsFieldInfo
    gridColumn_PriorityForSmallWidth
    gridColumn_IsRowNumber

    fieldInfo_Config = ''
    isGrouped

    //drag
    drag_CanDrag = false
    drag_AcceptDrag_FieldName
    //

}

export default ColumnInfo;