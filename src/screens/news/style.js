import React from 'react-native';
const { StyleSheet } = React;
import * as device from '../../utils/device';
import {baseStyleLayoutsContainer} from '../../styles/base';

export default StyleSheet.create({
  container : {
    ...baseStyleLayoutsContainer
  },
  title : {
    marginTop: device.size(5),
    marginBottom: device.size(12),
    fontSize: 18
  },
  marginBottomItem: {
    marginBottom: 10
  }
});

