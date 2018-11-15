import React, { Component } from 'react';
import {
    StyleSheet,
	TouchableHighlight,
	ActivityIndicator,
	TextInput,
	FlatList,
    Keyboard,
	Text,
    View
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ownersDataApi } from "../api/OwnersDataApi";


export class OwnershipHistory extends Component {

	static navigationOptions = ({ navigation }) => {
		return {
			headerLeft: (
				<TouchableHighlight
					underlayColor={"transparent"}
					activeOpacity={0.5}
					style={{ paddingLeft: 15 }}
					onPress={() => {
                        Keyboard.dismiss()
						navigation.openDrawer();
					}}>
					<MaterialCommunityIcons
						backgroundColor={"transparent"}
						name={"menu"}
						size={24}
						color="#ededed"/>
				</TouchableHighlight>
			),
		}
	};

	constructor(props){
		super(props);
		this.state = {
			selectedType: "scriptName",
			searchValue:"",
			filteredData: [],
			loading: true
		};
		this.history = [];
		this.getHistory();
	}

	async getHistory(){
		this.history = await ownersDataApi.getOwnershipHistory();
		let filteredData = this.searchAndFilter();
		this.setState({filteredData, loading: false});
	}

	searchAndFilter = (text, type, exactMatch) => {
		let filteredData = [];
		if (text && this.history ) {
			let regexPattern = text;
			if (exactMatch){
				regexPattern = "^"+text+"(\\.\\w*)?$";
			}
			let regexText = new RegExp(regexPattern, "i");
			filteredData = this.history.filter(data => {
				return regexText.test(data[type]);
			});
			let textChanged = text.toUpperCase();
			if (!exactMatch){
				filteredData.sort((data1, data2)=>{
					let d1ScriptName = (data1.scriptName || "").toUpperCase();
					let d1FiName = (data1.fiName || "").toUpperCase();
					let d2ScriptName = (data2.scriptName || "").toUpperCase();
					let d2FiName = (data2.fiName || "").toUpperCase();
					if (d1ScriptName === textChanged || d1FiName === textChanged){
						return -1;
					} else if (d2ScriptName === textChanged || d2FiName === textChanged){
						return 1;
					} if ((d1ScriptName && d1ScriptName.indexOf(textChanged) === 0) || (d1FiName && d1FiName.indexOf(textChanged) === 0)) {
						return -1;
					} else if ((d2ScriptName && d2ScriptName.indexOf(textChanged) === 0) || (d2FiName && d2FiName.indexOf(textChanged) === 0)){
						return 1;
					} else {
						return 0;
					}
				});
			}
		}
		return text ? filteredData : this.history;
	};

	onSearchChange = (text) => {
		let filteredData = this.searchAndFilter(text, this.state.selectedType, this.state.exactMatch);
		this.setState({ searchValue: text, filteredData });
	};
	// selectType = (newType) => {
	// 	this.setDataList(newType);
	// 	let filteredData = this.searchAndFilter(this.state.searchValue, newType, this.state.exactMatch);
	// 	this.setState({ selectedType: newType, filteredData });
	// };

	changeMatch = () => {
		let exactMatch = !this.state.exactMatch;
		if (this.state.exactMatch !== exactMatch) {
			let filteredData = this.searchAndFilter(this.state.searchValue, this.state.selectedType, exactMatch);
			this.setState({ exactMatch, filteredData });
		}
	};

	renderResult = ({ item , index}) => {
		return <View style={styles.rowsItem}>
				<View style={styles.pair}>
					{/*{this.getHighlight(item.scriptName, "scriptName", styles.topLeft)}*/}
					<Text selectable={true} style={styles.topRight}>{item.scriptName}</Text>
				</View>
				<View style={styles.extraData}>
					{
						item.history ? item.history.map((historyData, i)=>{
							return (<View
										  style={styles.namePair}
										  key={`extraData-${index}-${i}`}>
								<Text
									selectable={true}>{historyData.owner}</Text>
								<Text
									selectable={true}>{new Date(historyData.date).toDateString()}</Text>
							</View>);
						}) : <Text>No History</Text>
					}
				</View>
			</View>;
	};
	keyExtractor = (item, index) => {
		return `result-${item}${index}`;
	};

	emptyList = () => {
		if (this.state.loading){
			return null;
		}
		if (this.history.length && this.state.searchValue.length > 1){
			return <Text>No matching result</Text>
		}
		return <Text>Search to see results</Text>
	};

    render() {
        return (
            <View>
				<View style={styles.typeRow}>
					<TouchableHighlight
						underlayColor={"transparent"}
						activeOpacity={0.5}
						onPress={this.changeMatch}>
						<View style={styles.exactMatch}>
							{this.state.exactMatch ?
								<MaterialCommunityIcons
									backgroundColor={"transparent"}
									name={"target"}
									size={20}
									color="#333"/> :
								<MaterialCommunityIcons
									backgroundColor={"transparent"}
									name={"regex"}
									size={20}
									color="#333"/>
							}
							<Text style={styles.matchText}>{this.state.exactMatch? "Match" : "Regex"}</Text>
						</View>
					</TouchableHighlight>

					<TextInput
						style={styles.searchInput}
						value={this.state.searchValue}
						onChangeText={this.onSearchChange}
						autoFocus={true}
						underlineColorAndroid={"#0077C5"}
						returnKeyType={"search"}
						placeholder={"search"}/>
					{/*<View style={styles.typeSelection}>*/}
						{/*<TouchableHighlight*/}
							{/*underlayColor={"#0077C5"}*/}
							{/*activeOpacity={0.5}*/}
							{/*style={[ styles.typeButton, this.state.selectedType === "scriptName" ? styles.selectedButton : null ]}*/}
							{/*onPress={() => this.selectType("scriptName")}>*/}
							{/*<Text style={styles.buttonText}>Script</Text>*/}
						{/*</TouchableHighlight>*/}
						{/*<TouchableHighlight*/}
							{/*underlayColor={"#0077C5"}*/}
							{/*activeOpacity={0.5}*/}
							{/*style={[ styles.typeButton, this.state.selectedType === "owner" ? styles.selectedButton : null ]}*/}
							{/*onPress={() => this.selectType("owner")}>*/}
							{/*<Text style={styles.buttonText}>Owner</Text>*/}
						{/*</TouchableHighlight>*/}
					{/*</View>*/}
				</View>
				<FlatList
					showsVerticalScrollIndicator={false}
					showsHorizontalScrollIndicator={false}
					refreshing={this.state.loading}
					style={styles.resultsContainer}
					data={this.state.filteredData}
					keyExtractor={this.keyExtractor}
					renderItem={this.renderResult}
					ListEmptyComponent={this.emptyList}
				/>
				{
					this.state.loading?
						<View style={styles.loadingIndicator}>
							<ActivityIndicator size="large"/>
						</View>: null
				}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {},
	topRight: {
		fontSize: 16,
		color: "#0077C5",
		fontWeight: "bold"
	},
	searchInput: {
		padding: 5,
		marginTop: 10,
		fontSize: 16,
		width: "72%",
		alignSelf: "center"
	},
	typeRow: {
		flexDirection: "row",
		// justifyContent: "center",
		// alignItems: "center",
		marginTop: 10,
		width: "100%",
		// left: -20
	},
	exactMatch: {
		paddingTop: 15,
		marginHorizontal: 15,
		alignItems: "center",
		justifyContent: "center"
	},
	matchText: {
		fontSize: 9
	},
	typeSelection: {
		flexDirection: "row",
		alignSelf: "center",
		width: "80%",
		justifyContent: "space-around",
		borderRadius: 25,
		borderWidth: 1,
		borderColor: "transparent",
		overflow: "hidden",
		marginLeft: 15
	},
	typeButton: {
		flex: 1,
		borderRadius: 0,
		backgroundColor: "#ababab",
		alignItems: "center",
		justifyContent: "center",
		height: 44
		// borderLeftWidth: 1,
	},
	selectedButton: {
		backgroundColor: "#0077C5"
	},
	buttonText: {
		color: "#ededed",
		fontWeight: "bold"
	},
	resultsContainer: {
		margin: 20,
	},
	rowsItem: {
		marginTop: 10,
		paddingBottom: 10,
		borderBottomWidth: 0.25
	},
	extraData: {
		paddingTop: 10,
		paddingBottom: 5,
		paddingHorizontal: 20
	},
	details: {
		fontSize: 12
	},
	more: {
		fontSize: 11
	},
	pair: {
		flexDirection: "row",
		width: "90%",
		justifyContent: "space-between",
	},
	namePair: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	loadingIndicator: {
		position: "absolute",
		justifyContent: "center",
		alignItems: "center",
		width: "100%",
		top: 140,
		flex: 1
	}
});
