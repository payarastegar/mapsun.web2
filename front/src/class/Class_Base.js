class Class_Base {
    /** @param {Object} jsFieldInfo*/

    constructor(jsFieldInfo) {
        //this._src = jsFieldInfo
    }

    _initPropertyGetter(src) {
        const self = this;
        [].concat(Object.keys(self), Object.keys(src)).forEach(key => {
            if (key.startsWith('_') || (self[key] && self[key].apply) || (Object.getOwnPropertyDescriptor(self, key) && Object.getOwnPropertyDescriptor(self, key)['get'])) return

            const defaultValue = self[key]
            const attributes = {
                get: () => src[key] === undefined ? defaultValue : src[key],
                set: (v) => { src[key] = v},
                enumerable: true,
            }

            // if (key === "formId") {
            //     attributes.set = (value) => src["formId"] = value
            // }

            Object.defineProperty(self, key, attributes);
        })

    }

    _load() {
        //Object.keys(this._src).forEach(key => this[key] = this._src[key])
    }
}

export default Class_Base;