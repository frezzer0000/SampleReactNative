import {combineReducers} from 'redux';
import countriesReducer from '../redux/countries/countriesReducer';
import bleReducer from '../redux/ble/bleReducer';

const rootReducer = combineReducers({
  countries: countriesReducer,
  bles: bleReducer,
});

export default rootReducer;
