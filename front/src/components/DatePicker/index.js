import './style.min.css';
import './react-datepicker2.min.css';
import './react-datepicker2-mapsun.css';
import momentJalaali from 'moment-jalaali';
import DatePicker from './components/DatePicker';

momentJalaali.loadPersian({ dialect: 'persian-modern' });
export { default as Calendar } from './components/Calendar';

export default DatePicker;
