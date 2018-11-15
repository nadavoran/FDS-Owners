import React, { Component } from 'react';
import {
    StyleSheet,
	ScrollView,
	Text,
    View
} from 'react-native';

export class DetailsView extends Component {
	static navigationOptions = ({ navigation }) => {
		return {
			title: navigation.getParam('title', 'A Nested Details Screen'),
			// title: 'A Nested Details Screen',
		};
	};
    render() {
    	let {scriptName, Owner, extraData, Country, manager, Team} = this.props.navigation.getParam("item");
    	let left = `${Team} ${Country !== "USA" ? Country: ""}`;
        return (
        	<View style={styles.container}>
				<View style={styles.topPair}>
					<Text selectable={true} style={styles.topRight}>{scriptName}</Text>
					<Text selectable={true} style={styles.topRight}>{Owner}</Text>
				</View>
				<View style={styles.topPair}>
					<Text selectable={true} >{left}</Text>
					<Text selectable={true} >{manager}</Text>
				</View>
				<Text style={styles.more}>Total: {extraData.length}</Text>
				<ScrollView style={styles.scrollContainer}>
					<View style={styles.extraData}>
						{
							extraData.map((data, i) => {
								return <Text selectable={true} key={`extraData-${data.id}-${i}`} style={styles.pair}>
									<Text selectable={true} style={{fontWeight: "bold"}}>{data.id || "no ID"} - </Text>
									<Text selectable={true}>{data.fiName || "no Name"}</Text>
								</Text>;
							})
						}
					</View>
				</ScrollView>
			</View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
    	flex: 1,
		paddingTop: 15
	},
	scrollContainer: {
		flex: 1,
		paddingHorizontal: 20,
		marginTop: 5
	},
	topPair: {
		flexDirection: "row",
		justifyContent: "space-between",
		paddingHorizontal: 20,
	},
	pair: {
		flexDirection: "row",
	},
	topLeft: {
		fontSize: 18,
		color: "#0077C5",
		fontWeight: "bold"
	},
	topRight: {
		fontSize: 16,
		color: "#0077C5",
		fontWeight: "bold"
	},
	extraData: {
		paddingTop: 10,
		paddingBottom: 5,
	},
	details: {
		fontSize: 12
	},
	more: {
		fontSize: 11,
		paddingLeft: 40
	}
});
