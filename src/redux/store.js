import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer';
import {BleManager} from 'react-native-ble-plx';
const DeviceManager = new BleManager();
const configureStore = () => {
  return createStore(
    rootReducer,
    applyMiddleware(thunk.withExtraArgument(DeviceManager)),
  );
};

export default configureStore;
