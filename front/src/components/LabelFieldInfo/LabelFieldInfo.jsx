import React from 'react';
import './LabelFieldInfo.css';
import LabelPosition from "../../class/enums/LabelPosition";
import SystemClass from "../../SystemClass";
import FieldType from "../../class/enums/FieldType";
import LabelFieldInfo_Core from "./LabelFieldInfo_Core";

class LabelFieldInfo extends LabelFieldInfo_Core {

    //------------------------------------------------
    //region render different for react native
    //------------------------------------------------
    render() {

        const labelPositionClass = this.fieldInfo.labelPosition === LabelPosition.LabelOnRight && "FieldInfo--column"

        return (
            <div className={["FieldInfo", labelPositionClass].filter(c => c).join(' ')}>

                {
                    this.fieldInfo.label &&
                    <label className={'FieldInfo__label'}>
                        {this.fieldInfo.label}
                    </label>
                }

            </div>
        );
    }

    //------------------------------------------------
    //endregion render
    //------------------------------------------------
}

export default LabelFieldInfo;
