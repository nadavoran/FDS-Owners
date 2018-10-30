import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import OwnerView from "./src/screens/OwnerView";

export default class App extends React.Component {
  render() {
    return (
        <OwnerView/>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
