import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import momentJalaali from "moment-jalaali";
import DaysViewHeading from "./DaysViewHeading";
import DaysOfWeek from "./DaysOfWeek";
import MonthSelector from "./MonthSelector";
import YearSelector from "./YearSelector";
import Day from "./Day";
import { getDaysOfMonth, checkToday } from "../utils/moment-helper";
import { defaultStyles } from "./DefaultStyles";
import RangeList from "../utils/RangesList";

function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const Calendar = ({
  styles = defaultStyles, 
  min,
  max,
  selectedDay: initialSelectedDay,
  defaultYear,
  defaultMonth,
  onSelect,
  onYearChange,
  onMonthChange,
  onClickOutside,
  containerProps,
  isGregorian: initialIsGregorian = true,
  calendarClass,
  showToggleButton = false,
  toggleButtonText = ["تاریخ شمسی", "تاریخ میلادی"],
  showTodayButton = true,
  disableYearSelector,
  timePicker,
  ranges: initialRanges,
  value,
  onChange,
  toggleMode,
  className,
}) => {

  const [year, setYear] = useState(defaultYear || initialSelectedDay || momentJalaali(min));
  const [month, setMonth] = useState(defaultMonth || initialSelectedDay || momentJalaali(min));
  const [selectedDay, setSelectedDay] = useState(initialSelectedDay || value || momentJalaali());
  const [mode, setMode] = useState("days");
  const [isGregorian, setIsGregorian] = useState(initialIsGregorian);
  const [ranges, setRanges] = useState(new RangeList(initialRanges));

  const calendarRef = useRef(null);

  useOnClickOutside(calendarRef, onClickOutside);

  useEffect(() => {
    if (typeof initialIsGregorian !== "undefined" && initialIsGregorian !== isGregorian) {
      setIsGregorian(initialIsGregorian);
    }

    if (initialSelectedDay !== selectedDay) {
      selectDay(initialSelectedDay || momentJalaali());
    } else if (defaultYear && defaultYear !== year) {
      setYear(defaultYear);
    } else if (defaultMonth && defaultMonth !== month) {
      setMonth(defaultMonth);
    } else if (min && !month.isSame(min)) {
      setMonth(min.clone());
    }

    if (JSON.stringify(initialRanges) !== JSON.stringify(ranges.ranges)) {
      setRanges(new RangeList(initialRanges));
    }
  }, [initialSelectedDay, defaultYear, defaultMonth, min, initialIsGregorian, initialRanges]);

  const nextMonth = () => {
    const monthFormat = isGregorian ? "Month" : "jMonth";
    const newMonth = month.clone().add(1, monthFormat);
    setMonth(newMonth);
    if (onMonthChange) onMonthChange(newMonth);
  };

  const prevMonth = () => {
    const monthFormat = isGregorian ? "Month" : "jMonth";
    const newMonth = month.clone().subtract(1, monthFormat);
    setMonth(newMonth);
    if (onMonthChange) onMonthChange(newMonth);
  };

  const selectDay = (dayToSelect) => {
    const yearMonthFormat = isGregorian ? "YYYYMM" : "jYYYYjMM";
    if (!dayToSelect) {
      setYear(defaultYear || initialSelectedDay || momentJalaali(min));
      setMonth(defaultMonth || initialSelectedDay || momentJalaali(min));
      setSelectedDay(null);
      return;
    }
    if (dayToSelect.format(yearMonthFormat) !== month.format(yearMonthFormat)) {
      setMonth(dayToSelect);
    }
    setSelectedDay(dayToSelect);
  };

  const handleClickOnDay = (dayToSelect) => {
    selectDay(dayToSelect);
    if (onSelect) onSelect(dayToSelect);
    if (onChange) onChange(dayToSelect);
  };

  const renderDays = () => {
    const days = getDaysOfMonth(month, isGregorian);
    const monthFormat = isGregorian ? "MM" : "jMM";
    const dateFormat = isGregorian ? "YYYYMMDD" : "jYYYYjMMjDD";

    return (
      <div className={calendarClass}>
        <DaysViewHeading
          timePicker={timePicker}
          isGregorian={isGregorian}
          styles={styles}
          month={month}
          setCalendarMode={setMode}
          nextMonth={nextMonth}
          prevMonth={prevMonth}
        />
        <DaysOfWeek styles={styles} isGregorian={isGregorian} />
        <div className={styles.dayPickerContainer}>
          {days.map((day) => {
            const isCurrentMonth = day.format(monthFormat) === month.format(monthFormat);
            const isSelected = selectedDay ? selectedDay.isSame(day, "day") : false;
            const key = day.format(dateFormat);
            const isToday = checkToday(day.format("YYYYMMDD"));
            const dayState = ranges.getDayState(day);
            const isDisabled = (min && day.isBefore(min)) || (max && day.isAfter(max)) || dayState.disabled;

            return (
              <Day
                isGregorian={isGregorian}
                key={key}
                onClick={handleClickOnDay}
                day={day}
                isToday={isToday}
                colors={dayState.colors}
                disabled={isDisabled}
                selected={isSelected}
                isCurrentMonth={isCurrentMonth}
                styles={styles}
              />
            );
})}
        </div>
      </div>
    );
  };

  const renderMonthSelector = () => (
    <MonthSelector
      disableYearSelector={disableYearSelector}
      styles={styles}
      isGregorian={isGregorian}
      selectedMonth={month}
      setMonth={setMonth}
      setCalendarMode={setMode}
    />
  );

  const renderYearSelector = () => (
    <YearSelector
      styles={styles}
      isGregorian={isGregorian}
      selectedYear={year}
      selectedMonth={month}
      setYear={setYear}
      setMonth={setMonth}
      setCalendarMode={setMode}
    />
  );

  const jalaaliClassName = isGregorian ? "" : "jalaali ";
  const today = momentJalaali().set({ hour: 0, minute: 0, second: 0, millisecond: 0 });
  const todayState = ranges.getDayState(today);
  const isTodayDisabled = (min && today.isBefore(min)) || (max && today.isAfter(max)) || todayState.disabled;

  return (
    <div ref={calendarRef} className={`${styles.calendarContainer} ${jalaaliClassName} ${className}`}>
      {showToggleButton && (
        <button className="calendarButton toggleButton" type="button" onClick={toggleMode}>
          {isGregorian ? toggleButtonText[0] : toggleButtonText[1]}
        </button>
      )}
      {mode === "days" && renderDays()}
      {mode === "monthSelector" && renderMonthSelector()}
      {mode === "yearSelector" && renderYearSelector()}
      {showTodayButton && (
        <button
          type="button"
          className="calendarButton selectToday"
          onClick={() => handleClickOnDay(today)}
          disabled={isTodayDisabled}
        >
          {isGregorian ? "Today" : "امروز"}
        </button>
      )}
    </div>
  );
};

Calendar.propTypes = {
  min: PropTypes.object,
  max: PropTypes.object,
  styles: PropTypes.object,
  selectedDay: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  defaultYear: PropTypes.object,
  defaultMonth: PropTypes.object,
  onSelect: PropTypes.func,
  onYearChange: PropTypes.func,
  onMonthChange: PropTypes.func,
  onClickOutside: PropTypes.func,
  containerProps: PropTypes.object,
  isGregorian: PropTypes.bool,
  calendarClass: PropTypes.string,
  showToggleButton: PropTypes.bool,
  toggleButtonText: PropTypes.any,
  showTodayButton: PropTypes.bool,
  disableYearSelector: PropTypes.bool,
  timePicker: PropTypes.bool,
  ranges: PropTypes.array,
  value: PropTypes.object,
  onChange: PropTypes.func,
  toggleMode: PropTypes.func,
  className: PropTypes.string,
};

export default Calendar;