import React, { Component } from "react";
import { StyleSheet, Text, View, TextInput, TouchableHighlight, FlatList, ActivityIndicator, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ownersDataApi } from "../api/OwnersDataApi";

class OwnerView extends Component {
    static navigationOptions = ({ navigation }) => {
        return {
            headerLeft: (
                <TouchableHighlight
                    underlayColor={"transparent"}
                    activeOpacity={0.5}
                    style={{ paddingLeft: 15}}
                    onPress={()=>{
                        navigation.openDrawer();
                    }}>
                    <MaterialCommunityIcons
                        backgroundColor={"transparent"}
                        name={"menu"}
                        size={24}
                        color="#ededed"/>
                </TouchableHighlight>
            ),
            headerRight: (
                <TouchableHighlight
                    underlayColor={"transparent"}
                    activeOpacity={0.5}
                    style={{ paddingRight: 15}}
                    onPress={navigation.getParam('refreshData')}>
                    <MaterialCommunityIcons
                        backgroundColor={"transparent"}
                        name={"refresh"}
                        size={24}
                        color="#ededed"/>
                </TouchableHighlight>
            ),
        };
    };

    constructor() {
        super();
        this.getData();

        this.state = {
            searchValue: "",
            selectedType: "scriptName",
            exactMatch: false,
            loading: true,
            filteredData: null
        }
    }
    componentDidMount(){
        this.props.navigation.setParams({ refreshData: this.refreshData });
    }

    refreshData = ()=> {
        this.setState({ loading: true}, async ()=> {
            this.scriptOwnersData = await ownersDataApi.getScriptOwnersData(true);
            this.mintDetails = await ownersDataApi.getMintDetails(true);
            this.setDataList(this.state.selectedType);
            let filteredData = this.searchAndFilter(this.state.searchValue, this.state.selectedType, this.state.exactMatch);
            this.setState({ filteredData, loading: false });
        });
    };

    async getData() {

        console.log("----------- Data, before");
        await ownersDataApi.storageData();
        await ownersDataApi.getMetaData();
        await ownersDataApi.syncIfNeeded();
        this.scriptOwnersData = await ownersDataApi.getScriptOwnersData();
        this.mintDetails = await ownersDataApi.getMintDetails();
        this.setDataList(this.state.selectedType);
        let filteredData = this.searchAndFilter(this.state.searchValue, this.state.selectedType, this.state.exactMatch);
        this.setState({ filteredData, loading: false });
    }
    setDataList= (type) =>{
        switch (type) {
            case "id":
                this.dataList = this.mintDetails && this.mintDetails.result;
                break;
            case "scriptName":
                this.dataList = this.scriptOwnersData && this.scriptOwnersData.result;
                break;
            case "fiName":
                this.dataList = this.mintDetails && this.mintDetails.result;
        }
    };

    searchAndFilter = (text, type, exactMatch) => {
        let filteredData = [];
        if (text && (text.length > 2 || (type === "id" && text.length > 0)) && this.dataList ) {
            let tempFilteredData = {};
            let regexPattern = text;
            if (exactMatch){
                regexPattern = "^"+text+"(\\.\\w*)?$";
            }
            let regexText = new RegExp(regexPattern, "i");
            this.dataList.filter(data => {
                return regexText.test(data[type]);
            }).forEach((data, index) => {
                let scriptName = data.scriptName || data["CHANNEL_TYPE_NAME"];
                let scriptData = this.scriptOwnersData.resultByKey[scriptName];
                filteredData.push({
                    scriptName: scriptName,
                    Owner: scriptData ? scriptData[0].Owner : "N/A",
                    Country: scriptData ? scriptData[0].Country : "N/A",
                    Team: scriptData ? scriptData[0].Team : "N/A",
                    manager: scriptData ? scriptData[0].Manager : "N/A",
                    extraData: this.mintDetails.resultByKey[scriptName]
                });
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
        return filteredData;
    };

    onSearchChange = (text) => {
        let filteredData = this.searchAndFilter(text, this.state.selectedType, this.state.exactMatch);
        this.setState({ searchValue: text, filteredData });
    };
    selectType = (newType) => {
        this.setDataList(newType);
        let filteredData = this.searchAndFilter(this.state.searchValue, newType, this.state.exactMatch);
        this.setState({ selectedType: newType, filteredData, exactMatch: newType === "id" });
    };

    changeMatch = () => {
        let exactMatch = this.state.selectedType === "id" || !this.state.exactMatch;
        if (this.state.exactMatch !== exactMatch) {
            let filteredData = this.searchAndFilter(this.state.searchValue, this.state.selectedType, exactMatch);
            this.setState({ exactMatch, filteredData });
        }
    };

    getHighlight = (text, expectedType, style, key)=>{
        if (expectedType === this.state.selectedType){
            let upper = text.toUpperCase();
            let start = upper.indexOf(this.state.searchValue.toUpperCase());
            if (start === -1){
                return <Text selectable={true} key={key} style={style}>{text}</Text>
            }
            let startText = text.substr(0, start);
            let selected = text.substr(start, this.state.searchValue.length);
            let endText = text.substr(start + this.state.searchValue.length);
            return <Text selectable={true} style={style}>{startText}<Text style={styles.highlight}>{selected}</Text>{endText}</Text>
        }
        return <Text selectable={true} style={style}>{text}</Text>
    };
    getIdNameValues = (item, index)=>{
        if ( item.extraData && item.extraData.length > 0) {

            let res = item.extraData.slice(0, 4).map((data, i) => {
                return <Text
                    selectable={true}
                    style={styles.namePair}
                    key={`extraData-${data.id}-${index}-${i}`}>
                <Text selectable={true}>{this.getHighlight(data.id, "id", [styles.extraData, {fontWeight: "bold"}]) ||
                "no ID"} - </Text>
                    <Text selectable={true}>{this.getHighlight(data.fiName, "fiName", styles.extraData) || "no Name"}</Text>
                </Text>
            });
            if (item.extraData.length > 4){
                let missingOne = 0;
                if (["id", "fiName"].indexOf(this.state.selectedType) > -1 ){
                    let regexText = new RegExp(this.state.searchValue, "i");
                    let matchResult =  item.extraData.findIndex(data=>{
                        switch (this.state.selectedType){
                            case "id":
                                return data.id === this.state.searchValue;
                            case "fiName":
                                return regexText.test(data.fiName);
                        }
                    });
                    if (matchResult > 4){
                        let data = item.extraData[matchResult];
                        missingOne = 1;
                        res.push(
                            <Text
                                selectable={true}
                                style={styles.namePair}
                                key={`extraData-${data.id}-${index}-${matchResult}`}>
                                <Text selectable={true}>{this.getHighlight(data.id, "id", [styles.extraData, {fontWeight: "bold"}]) ||
                        "no ID"} -
                                </Text>
                                <Text selectable={true}>{this.getHighlight(data.fiName, "fiName", styles.extraData) || "no Name"}</Text>
                            </Text>);
                    }
                }
                res.push(<Text key={`extraData-${index}-5`}>... <Text style={styles.more}>+{item.extraData.length - 4 - missingOne}</Text></Text>);
            }
            return res;
        }
        return <Text key={`extraData-${index}`}>N/A</Text>
    };
    renderResult = ({ item , index}) => {

        //
        return <TouchableHighlight
            underlayColor={"transparent"}
            activeOpacity={0.5}
                onPress={() => this.props.navigation.navigate('DetailsView', {title: `${item.scriptName}`, item})}
                >
                    <View style={styles.rowsItem}>
                    <View style={styles.pair}>
                        {this.getHighlight(item.scriptName, "scriptName", styles.topLeft)}
                        <Text selectable={true} style={styles.topRight}>{item.Owner}</Text>
                    </View>
                    <View style={styles.extraData}>
                        {
                            this.getIdNameValues(item, index)
                        }
                    </View>
            </View>

        </TouchableHighlight>;
    };
    keyExtractor = (item, index) => {
        return `result-${item}${index}`;
    };
    emptyList = ()=>{
        if (this.state.loading){
            return null;
        }
        if (this.dataList && this.dataList.length && this.state.searchValue.length > 2){
            return <Text>No matching result</Text>
        }
        return <Text>Search to see results</Text>
    };

    render() {
        return (
            <View style={styles.container}>
                <TextInput
                    style={styles.searchInput}
                    value={this.state.searchValue}
                    onChangeText={this.onSearchChange}
                    autoFocus={true}
                    underlineColorAndroid={"#0077C5"}
                    returnKeyType={"search"}
                    placeholder={"search"}/>
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

                    <View style={styles.typeSelection}>
                        <TouchableHighlight
                            underlayColor={"#0077C5"}
                            activeOpacity={0.5}
                            style={[ styles.typeButton, this.state.selectedType === "scriptName" ? styles.selectedButton : null ]}
                            onPress={() => this.selectType("scriptName")}>
                            <Text style={styles.buttonText}>Script</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            underlayColor={"#0077C5"}
                            activeOpacity={0.5}
                            style={[ styles.typeButton, this.state.selectedType === "id" ? styles.selectedButton : null ]}
                            onPress={() => this.selectType("id")}>
                            <Text style={styles.buttonText}>FI ID</Text>
                        </TouchableHighlight>
                        <TouchableHighlight
                            underlayColor={"#0077C5"}
                            activeOpacity={0.5}
                            style={[ styles.typeButton, this.state.selectedType === "fiName" ? styles.selectedButton : null ]}
                            onPress={() => this.selectType("fiName")}>
                            <Text style={styles.buttonText}>FI Name</Text>
                        </TouchableHighlight>
                    </View>
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
    container: {
        flex: 1,
        backgroundColor: '#fff',
        paddingHorizontal: 22
    },
    searchInput: {
        padding: 5,
        marginTop: 10,
        fontSize: 16,
        width: "72%",
        alignSelf: "center",
        borderBottomWidth: Platform.select({ios: 1}),
        borderBottomColor: "#0077C5"
    },
    typeRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        width: "100%",
        left: -20
    },
    exactMatch: {
        paddingTop: 4,
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
        marginTop: 20,
    },
    rowsItem: {
        marginTop: 10,
        paddingBottom: 10,
        borderBottomWidth: 0.25
    },
    pair: {
        flexDirection: "row",
        width: "90%",
        justifyContent: "space-between",
    },
    namePair: {
        flexDirection: "row",
    },
    highlight:{
        fontWeight: "bold"
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
        paddingHorizontal: 20
    },
    details: {
        fontSize: 12
    },
    more: {
        fontSize: 11
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


export default OwnerView;
export { OwnerView };