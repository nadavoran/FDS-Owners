import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import MainNavigator from "./src/navigations/MainNavigator";
// import OwnerView from "./src/screens/OwnerView";
import { ownersDataApi } from "./src/api/OwnersDataApi";

export default class App extends React.Component {
  constructor(){
      super();
  }
  render() {
    return (
            <MainNavigator/>
    );
  }
}

// {/*<OwnerView/>*/}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
