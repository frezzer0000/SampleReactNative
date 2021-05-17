import React from 'react';
import {View, Text} from 'react-native';
import {useSelector} from 'react-redux';
const BLE = () => {
  const status = useSelector(state => state.bles.status);
  const connectedDevice = useSelector(state => state.bles.connectedDevice);

  return (
    <View>
      <Text>Status: {status}</Text>
      {connectedDevice && <Text>Device: {connectedDevice.name}</Text>}
    </View>
  );
};

export default BLE;
