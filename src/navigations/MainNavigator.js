import React from "react";
import { createStackNavigator, createDrawerNavigator, DrawerView } from 'react-navigation';
import { OwnerView, DetailsView, OwnershipHistory, MetaData } from "../screens";

const OwnershipNavigator = createStackNavigator({
	Home: {
		screen: OwnerView,
		navigationOptions: {
			title: "FDS Ownership",
			headerTintColor: "red",
			headerStyle: {
				backgroundColor: "#0077C5",
			},
			headerTitleStyle: {
				color: "#ededed"
			}
		}
	},
	DetailsView: {
		screen: DetailsView,
		navigationOptions: {
			headerStyle: {
				backgroundColor: "#0077C5",
			},
			headerTitleStyle: {
				color: "#ededed"
			},
			headerTintColor: "#ededed",
			// headerLeft: {
			// 	color: "#ededed"
			// }
		}
	}
});
const OwnershipHistoryNavigator = createStackNavigator({
	Home: {
		screen: OwnershipHistory,
		navigationOptions: {
			title: "Ownership History",
			headerTintColor: "red",
			headerStyle: {
				backgroundColor: "#0077C5",
			},
			headerTitleStyle: {
				color: "#ededed"
			}
		}
	}
});
const MetaDataNavigator = createStackNavigator({
	Home: {
		screen: MetaData,
		navigationOptions: {
			title: "Meta Data",
			headerTintColor: "red",
			headerStyle: {
				backgroundColor: "#0077C5",
			},
			headerTitleStyle: {
				color: "#ededed"
			}
		}
	}
});


const MainNavigator = createDrawerNavigator({
	Ownership: {
		screen: OwnershipNavigator,
		navigationOptions: {
			drawerLabel: 'FDS Ownership',
			// drawerIcon: ({ tintColor }) => (
			// 	<Image
			// 		source={require('./chats-icon.png')}
			// 		style={[styles.icon, {tintColor: tintColor}]}
			// 	/>
			// ),
		}
	},
	History: {
		screen: OwnershipHistoryNavigator,
		navigationOptions: {
			drawerLabel: 'Ownership History',
			// drawerIcon: ({ tintColor }) => (
			// 	<Image
			// 		source={require('./chats-icon.png')}
			// 		style={[styles.icon, {tintColor: tintColor}]}
			// 	/>
			// ),
		}
	},
	MetaData: {
		screen: MetaDataNavigator,
		navigationOptions: {
			drawerLabel: 'Meta Data',
		}
	}
}, {
	contentOptions: {
		activeTintColor: '#0077C5',
		itemsContainerStyle: {
			marginTop: 40
		}
	}
});

export default MainNavigator;
