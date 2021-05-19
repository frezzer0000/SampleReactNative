/**
 * Sample BLE React Native App
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  StatusBar,
  NativeModules,
  NativeEventEmitter,
  Button,
  Platform,
  PermissionsAndroid,
  FlatList,
  TouchableHighlight,
} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';

// import and setup react-native-ble-manager
import BleManager from 'react-native-ble-manager';
const BleManagerModule = NativeModules.BleManager;
const bleEmitter = new NativeEventEmitter(BleManagerModule);

// import stringToBytes from convert-string package.
// this func is useful for making string-to-bytes conversion easier
import {stringToBytes} from 'convert-string';

// import Buffer function.
// this func is useful for making bytes-to-string conversion easier
const Buffer = require('buffer/').Buffer;

const BleManagerScreen = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [list, setList] = useState([]);
  const peripherals = new Map();
  const [testMode, setTestMode] = useState('read');

  // start to scan peripherals
  const startScan = () => {
    // skip if scan process is currenly happening
    if (isScanning) {
      return;
    }

    // first, clear existing peripherals
    peripherals.clear();
    setList(Array.from(peripherals.values()));

    // then re-scan it
    BleManager.scan([], 3, false)
      .then(() => {
        console.log('Scanning...');
        setIsScanning(true);
      })
      .catch(err => {
        console.error(err);
      });
  };
  const stopScan = () => {
    BleManager.stopScan([], 3, false).then(() => {
      console.log('Scan stopped');
    });
  };

  // handle discovered peripheral
  const handleDiscoverPeripheral = peripheral => {
    console.log('Got ble peripheral', peripheral);

    if (!peripheral.name) {
      peripheral.name = 'NO NAME';
    }

    peripherals.set(peripheral.id, peripheral);
    setList(Array.from(peripherals.values()));
  };

  // handle stop scan event
  const handleStopScan = () => {
    console.log('Scan is stopped');
    setIsScanning(false);
  };

  // handle disconnected peripheral
  const handleDisconnectedPeripheral = data => {
    console.log('Disconnected from ' + data.peripheral);

    let peripheral = peripherals.get(data.peripheral);
    if (peripheral) {
      peripheral.connected = false;
      peripherals.set(peripheral.id, peripheral);
      setList(Array.from(peripherals.values()));
    }
  };

  // handle update value for characteristic
  const handleUpdateValueForCharacteristic = data => {
    console.log(
      'Received data from: ' + data.peripheral,
      'Characteristic: ' + data.characteristic,
      'Data: ' + data.value,
    );
  };

  // retrieve connected peripherals.
  // not currenly used
  const retrieveConnectedPeripheral = () => {
    BleManager.getConnectedPeripherals([]).then(results => {
      peripherals.clear();
      setList(Array.from(peripherals.values()));

      if (results.length === 0) {
        console.log('No connected peripherals');
      }

      for (var i = 0; i < results.length; i++) {
        var peripheral = results[i];
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setList(Array.from(peripherals.values()));
      }
    });
  };

  // update stored peripherals
  const updatePeripheral = (peripheral, callback) => {
    let p = peripherals.get(peripheral.id);
    console.log('🚀  line 134', p);
    if (!p) {
      return;
    }

    p = callback(p);
    peripherals.set(peripheral.id, p);
    setList(Array.from(peripherals.values()));
  };

  // get advertised peripheral local name (if exists). default to peripheral name
  const getPeripheralName = item => {
    if (item.advertising) {
      if (item.advertising.localName) {
        return item.advertising.localName;
      }
    }

    return item.name;
  };

  // connect to peripheral then test the communication
  const connectAndTestPeripheral = peripheral => {
    // debugger;
    console.log(
      '🚀 ~ file: BLEManager.js ~ line 156 ~ BleManagerScreen ~ peripheral',
      peripheral,
    );
    if (!peripheral) {
      return;
    }

    if (peripheral.connected) {
      BleManager.disconnect(peripheral.id);
      return;
    }

    // connect to selected peripheral
    BleManager.connect(peripheral.id)
      .then(() => {
        console.log('Connected to12312312ß ');
        updatePeripheral(peripheral, p => {
          p.connected = true;
          return p;
        });

        // setTimeout(() => {
        console.log('Connected to12312312ß ' + peripheral.id, peripheral);
        BleManager.retrieveServices(peripheral.id).then(peripheralInfo => {
          console.log(' line 182', peripheralInfo);
          console.log('Retrieved peripheral services', peripheralInfo);

          // test read current peripheral RSSI value
          BleManager.readRSSI(peripheral.id)
            .then(rssi => {
              console.log('Retrieved actual RSSI value', rssi);

              // update rssi value
              updatePeripheral(peripheral, p => {
                p.rssi = rssi;
                return p;
              });
            })
            .catch(e => {
              console.log(e);
            });

          // test read and write data to peripheral
          const serviceUUID = 'D787A05D-43C5-B3C1-A600-E9794439A53A';
          const charasteristicUUID = '20000000-0000-0000-0000-000000000001';

          console.log('peripheral id:', peripheral.id);
          console.log('service:', serviceUUID);
          console.log('characteristic:', charasteristicUUID);
        });
        // }, 900);
        console.log('Connected ewrtßwetto ' + peripheral.id, peripheral);
      })
      .catch(error => {
        console.log('Connection error', error);
      });
  };

  // mount and onmount event handler
  useEffect(() => {
    console.log('Mount');

    // initialize BLE modules
    BleManager.start({showAlert: false});

    // add ble listeners on mount
    bleEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      handleDiscoverPeripheral,
    );
    bleEmitter.addListener('BleManagerStopScan', handleStopScan);
    bleEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      handleDisconnectedPeripheral,
    );
    bleEmitter.addListener(
      'BleManagerDidUpdateValueForCharacteristic',
      handleUpdateValueForCharacteristic,
    );

    // check location permission only for android device
    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(r1 => {
        if (r1) {
          console.log('Permission is OK');
          return;
        }

        PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ).then(r2 => {
          if (r2) {
            console.log('User accept');
            return;
          }

          console.log('User refuse');
        });
      });
    }

    // remove ble listeners on unmount
    return () => {
      console.log('Unmount');

      // bleEmitter.removeListener(
      //   'BleManagerDiscoverPeripheral',
      //   handleDiscoverPeripheral,
      // );
      // bleEmitter.removeListener('BleManagerStopScan', handleStopScan);
      // bleEmitter.removeListener(
      //   'BleManagerDisconnectPeripheral',
      //   handleDisconnectedPeripheral,
      // );
      // bleEmitter.removeListener(
      //   'BleManagerDidUpdateValueForCharacteristic',
      //   handleUpdateValueForCharacteristic,
      // );
    };
  }, []);

  // render list of devices
  const renderItem = item => {
    const color = item.connected ? 'green' : '#fff';
    return (
      <TouchableHighlight onPress={() => connectAndTestPeripheral(item)}>
        <View style={[styles.row, {backgroundColor: color}]}>
          <Text
            style={{
              fontSize: 12,
              textAlign: 'center',
              color: '#333333',
              padding: 10,
            }}>
            {getPeripheralName(item)}
          </Text>
          <Text
            style={{
              fontSize: 10,
              textAlign: 'center',
              color: '#333333',
              padding: 2,
            }}>
            RSSI: {item.rssi}
          </Text>
          <Text
            style={{
              fontSize: 8,
              textAlign: 'center',
              color: '#333333',
              padding: 2,
              paddingBottom: 20,
            }}>
            {item.id}
          </Text>
        </View>
      </TouchableHighlight>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeAreaView}>
        {/* header */}
        <View style={styles.body}>
          <View style={styles.scanButton}>
            <Button
              title={'Scan Bluetooth Devices'}
              onPress={() => startScan()}
            />
          </View>
          <View style={styles.scanButton}>
            <Button
              title={'Stop Scan Bluetooth Devices'}
              onPress={() => stopScan()}
            />
          </View>

          {list.length === 0 && (
            <View style={styles.noPeripherals}>
              <Text style={styles.noPeripheralsText}>No peripherals</Text>
            </View>
          )}
        </View>

        {/* ble devices */}
        <FlatList
          data={list}
          renderItem={({item}) => renderItem(item)}
          keyExtractor={item => item.id}
        />

        {/* bottom footer */}
        {/* <View style={styles.footer}>
          <TouchableHighlight onPress={() => setTestMode('write')}>
            <View style={[styles.row, styles.footerButton]}>
              <Text>Store pizza</Text>
            </View>
          </TouchableHighlight>
          <TouchableHighlight onPress={() => setTestMode('read')}>
            <View style={[styles.row, styles.footerButton]}>
              <Text>Get stored food</Text>
            </View>
          </TouchableHighlight>
        </View> */}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
  },
  body: {
    backgroundColor: Colors.white,
  },
  scanButton: {
    margin: 10,
  },
  noPeripherals: {
    flex: 1,
    margin: 20,
  },
  noPeripheralsText: {
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 30,
  },
  footerButton: {
    alignSelf: 'stretch',
    padding: 10,
    backgroundColor: 'grey',
  },
});

export default BleManagerScreen;
