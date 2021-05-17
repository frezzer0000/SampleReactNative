import Reactotron from 'reactotron-react-native';
import {NativeModules, Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import {reactotronRedux} from 'reactotron-redux';
// import sagaPlugin from 'reactotron-redux-saga';

const isIOS = Platform.OS === 'ios';
let scriptHostname;
if (__DEV__) {
  const scriptURL = NativeModules.SourceCode.scriptURL;
  scriptHostname = scriptURL.split('://')[1].split(':')[0];
}

const yeOldeConsoleLog = console.log;

// make a new one
console.log = (...args) => {
  // always call the old one, because React Native does magic swizzling too
  yeOldeConsoleLog(...args);

  // send this off to Reactotron.
  Reactotron.display({
    name: 'CONSOLE.LOG',
    value: args,
    preview: args.length > 0 && typeof args[0] === 'string' ? args[0] : null,
    important: true,
  });
};

if (isIOS) {
  Reactotron.configure({host: scriptHostname})
    .setAsyncStorageHandler(AsyncStorage) //controls connection & communication settings
    .useReactNative({
      // asyncStorage: false,
      networking: {
        ignoreUrls: /localhost/,
      },
    }) // add all built-in react native plugins
    .connect(); // let's connect!
} else {
  Reactotron.configure()
    .setAsyncStorageHandler(AsyncStorage)
    .useReactNative({
      // asyncStorage: false,
      networking: {
        ignoreUrls: /localhost/,
      },
    }) // add all built-in react native plugins
    .connect(); // let's connect!
}

Reactotron.clear();
export default Reactotron;
