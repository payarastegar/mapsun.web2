import Enum_Base from "./Enum_Base";

/** Enum Class FilterCondition */
class FilterCondition extends Enum_Base {
    /** Enum of FilterCondition
     * @typedef {string} FilterCondition */
    static equal = "equal"
    static notEqual = "notEqual"
    static lessThanOrEqual = "lessThanOrEqual"
    static greaterThanOrEqual = "greaterThanOrEqual"
    static lessThan = "lessThan"
    static greaterThan = "greaterThan"
    static contains = "contains"
}

export default FilterCondition;