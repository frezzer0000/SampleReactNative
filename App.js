// if (__DEV__) {
//   import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
// }
import React from 'react';
import {Provider} from 'react-redux';
import BLEList from './src/screens/screen';
import BleManagerScreen from './src/screens/BLEManager';
import BLEservices from './src/screens/BLEservices';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {BleManager} from 'react-native-ble-plx';
import {createStore, applyMiddleware} from 'redux';
import rootReducer from './src/redux/rootReducer';
import thunk from 'redux-thunk';
const DeviceManager = new BleManager();
const Stack = createStackNavigator();
const store = createStore(
  rootReducer,
  applyMiddleware(thunk.withExtraArgument(DeviceManager)),
);
function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Scanning" component={BleManagerScreen} />
          <Stack.Screen name="Services" component={BLEservices} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
export default App;
// export {default} from './storybook';
