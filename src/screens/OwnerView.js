import React from 'react';
import { StyleSheet, Text, View, TextInput, TouchableHighlight, FlatList } from 'react-native';
import { ownersDataApi } from "../api/OwnersDataApi";

const dataList = [
    {
        CheckCred: "",
        Country: "USA",
        Owner: "Ziv",
        Provider_Name: "N/A",
        Status: "",
        Team: "US",
        manager: "Galit",
        script_name: "commercebank.scr"
    }, {
        CheckCred: "",
        Country: "USA",
        Owner: "Ziv",
        Provider_Name: "N/A",
        Status: "",
        Team: "US",
        manager: "Galit",
        script_name: "desjardin_canada.scr"
    }, {
        CheckCred: "",
        Country: "USA",
        Owner: "Ziv",
        Provider_Name: "N/A",
        Status: "",
        Team: "US",
        manager: "Galit",
        script_name: "desjardinbrok.scr"
    } ];

export default class App extends React.Component {

    constructor() {
        super();
        this.getData();

        this.state = {
            searchValue: "",
            selectedType: "Script",
            filteredData: null
        }
    }

    async getData() {

        console.log("----------- Data, before");
        this.scriptOwnersData = await ownersDataApi.getScriptOwnersData();
        this.mintDetails = await ownersDataApi.getMintDetails();
        this.setDataList(this.state.selectedType);
        this.searchAndFilter(this.state.searchValue, this.selectedType);
        // console.log("----------- Data, after", JSON.stringify(data));
        // this.setState({ data });
    }

    getOwnerById = (id) => {

    };
    setDataList= (type) =>{
        switch (type) {
            case "FI-ID":
                this.dataList = this.mintDetails.result;
                break;
            case "Script":
                this.dataList = this.scriptOwnersData.result;
                break;
            case "FI-Name":
                this.dataList = this.mintDetails.result;
        }
    };

    searchAndFilter = (text, type) => {
        let filteredData = [];
        if (text && (text.length > 2 || type === "FI-ID") && this.dataList && this.scriptOwnersData && this.mintDetails ) {
            let tempFilteredData = {};
            let regexText = new RegExp(text, "i");
            this.dataList.filter(data => {
                switch (type) {
                    case "FI-ID":
                        return text == data.id;
                    case "Script":
                        return regexText.test(data.scriptName);
                    case "FI-Name":
                        return regexText.test(data.fiName);
                }
            }).forEach((data, index) => {
                filteredData.push({
                    scriptName: data.scriptName,
                    Owner: this.scriptOwnersData.resultByKey[data.scriptName][0].Owner,
                    extraData: this.mintDetails.resultByKey[data.scriptName]
                });
            });
            if (["FI-Name", "Script"].indexOf(type) > -1){
                let textChanged = text.toUpperCase();
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
        let filteredData = this.searchAndFilter(text, this.state.selectedType);
        // if (text){
        //     let tempFilteredData = {};
        //     let regexText = new RegExp(text, "i");
        //     dataList.filter(data=>{
        //         switch (this.state.selectedType){
        //             case "FI-ID":
        //                 return text == data.id;
        //             case "FI-Script":
        //                 return regexText.test(data.scriptName);
        //             case "FI-Name":
        //                 return regexText.test(data.fiName);
        //         }
        //     }).forEach((data, index) => {
        //         if (tempFilteredData[data.scriptName + data.Owner] || tempFilteredData[data.scriptName + data.Owner] === 0){
        //             filteredData[tempFilteredData[data.scriptName + data.Owner]].extraData.push({
        //                 fiName: data.fiName,
        //                 id: data.id
        //             })
        //         } else {
        //             tempFilteredData[ data.scriptName + data.Owner ] = index;
        //             filteredData.push({
        //                 scriptName: data.scriptName,
        //                 Owner: data.Owner,
        //                 extraData: [{
        //                     fiName: data.fiName,
        //                     id: data.id
        //                 }]
        //             });
        //         }
        //     });
        // }
        this.setState({ searchValue: text, filteredData });
    };
    //INSTITUTION_ID
    selectType = (newType) => {
        this.setDataList(newType);
        // this.dataList = this.state.data
        let filteredData = this.searchAndFilter(this.state.searchValue, newType);
        this.setState({ selectedType: newType, filteredData });
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
                return <Text selectable={true}
                             key={`extraData-${data.id}-${index}-${i}`}>{this.getHighlight(data.id, "FI-ID", styles.extraData) ||
                "no ID"} - {this.getHighlight(data.fiName, "FI-Name", styles.extraData) || "no Name"}</Text>
            });
            if (item.extraData.length > 4){
                if (["FI-ID", "FI-Name"].indexOf(this.state.selectedType) > -1 ){
                    let regexText = new RegExp(this.state.searchValue, "i");
                    let matchResult =  item.extraData.findIndex(data=>{
                        switch (this.state.selectedType){
                            case "FI-ID":
                                return data.id === this.state.searchValue;
                            case "FI-Name":
                                return regexText.test(data.fiName);
                        }
                    });
                    if (matchResult > 4){
                        let data = item.extraData[matchResult];
                        res.push(<Text selectable={true}
                                       key={`extraData-${data.id}-${index}-${matchResult}`}>{this.getHighlight(data.id, "FI-ID", styles.extraData) ||
                        "no ID"} - {this.getHighlight(data.fiName, "FI-Name", styles.extraData) || "no Name"}</Text>);
                    }
                }
                res.push(<Text key={`extraData-${index}-5`}>...</Text>);
            }
            return res;
        }
        return <Text key={`extraData-${index}`}>N/A</Text>
    };
    //<Text selectable={true} style={styles.topLeft}>{item.scriptName}</Text>
    renderResult = ({ item , index}) => {
        // Script      Owner
        // name
        // id

        return <View style={styles.rowsItem}>
            <View style={styles.pair}>
                {this.getHighlight(item.scriptName, "Script", styles.topLeft)}
                <Text selectable={true} style={styles.topRight}>{item.Owner}</Text>
            </View>
            <View style={styles.extraData}>
                {
                    this.getIdNameValues(item, index)
                }
            </View>
        </View>;
        // return <View style={styles.pair}>
        //         <Text>{item.id || "no ID"}</Text>
        //         <Text>{item.fiName || "no Name"}</Text>
        //         <Text>{item.scriptName || "no Script"}</Text>
        //         <Text>{item.Owner || "no Owner"}</Text>
        //     </View>;
        //
        // return <View>
        //     <View style={styles.pair}>
        //         <Text>FI ID: </Text>
        //         <Text>{item.id || "no ID"}</Text>
        //     </View>
        //     <View style={styles.pair}>
        //         <Text>FI Name: </Text>
        //         <Text>{item.fiName || "no Name"}</Text>
        //     </View>
        //     <View style={styles.pair}>
        //         <Text>FI Script: </Text>
        //         <Text>{item.scriptName || "no Script"}</Text>
        //     </View>
        //     <View style={styles.pair}>
        //         <Text>FI Owner: </Text>
        //         <Text>{item.Owner || "no Owner"}</Text>
        //     </View>
        // </View>;
    };
    keyExtractor = (item, index) => {
        return `result-${item}${index}`;
    };

    render() {
        return (
            <View style={styles.container}>
                <Text style={styles.header}>FDS Owners</Text>

                <View style={styles.bodyContainer}>
                <TextInput
                    style={styles.searchInput}
                    value={this.state.searchValue}
                    onChangeText={this.onSearchChange}
                    underlineColorAndroid={"#0077C5"}
                    placeholder={"search"}/>
                <View style={styles.typeSelection}>
                    {/*<Button*/}
                    {/*style={styles.typeButton}*/}
                    {/*color={this.state.selectedType === "FI-ID" ? "#0077C5" : "#ababab"}*/}
                    {/*title={"FI ID"}*/}
                    {/*onPress={()=>this.selectType("FI-ID")}/>*/}
                    <TouchableHighlight
                        underlayColor={"#0077C5"}
                        activeOpacity={0.5}
                        style={[ styles.typeButton, this.state.selectedType === "Script" ? styles.selectedButton : null ]}
                        // title={"FI ID"}
                        onPress={() => this.selectType("Script")}>
                        <Text style={styles.buttonText}>Script</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        underlayColor={"#0077C5"}
                        activeOpacity={0.5}
                        style={[ styles.typeButton, this.state.selectedType === "FI-ID" ? styles.selectedButton : null ]}
                        // title={"FI ID"}
                        onPress={() => this.selectType("FI-ID")}>
                        <Text style={styles.buttonText}>FI ID</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        underlayColor={"#0077C5"}
                        activeOpacity={0.5}
                        style={[ styles.typeButton, this.state.selectedType === "FI-Name" ? styles.selectedButton : null ]}
                        // title={"FI ID"}
                        onPress={() => this.selectType("FI-Name")}>
                        <Text style={styles.buttonText}>FI Name</Text>
                    </TouchableHighlight>
                </View>
                <FlatList
                    style={styles.resultsContainer}
                    data={this.state.filteredData}
                    keyExtractor={this.keyExtractor}
                    renderItem={this.renderResult}
                />
                {this.state.selectedData ? (
                        <View>
                            <View style={styles.pairs}>
                                <Text>Owner: </Text>
                                <Text>{this.state.owner}</Text>
                            </View>
                            <View>
                                <Text>FI ID: </Text>
                                <Text>{this.state.selectedData.Owner}</Text>
                            </View>
                            <View>
                                <Text>FI Name: </Text>
                                <Text>{this.state.selectedData.fiName}</Text>
                            </View>
                            <View>
                                <Text>FI Script: </Text>
                                <Text>{this.state.selectedData.scriptName}</Text>
                            </View>
                        </View>
                    ) :
                    null
                }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        // alignItems: 'center',
    },
    header: {
        alignSelf: "center",
        height: 44,
        textAlign: "center",
        backgroundColor: "#0077C5",
        width: "100%",
        marginTop: 24,
        elevation: 4
    },
    bodyContainer: {
        flex: 1,
        backgroundColor: '#fff',
        // alignItems: 'center',
        marginHorizontal: 22,
    },
    searchInput: {
        padding: 5,
        marginTop: 10,
        fontSize: 16,
        width: "75%",
        alignSelf: "center"
    },
    typeSelection: {
        flexDirection: "row",
        alignSelf: "center",
        width: "80%",
        marginTop: 10,
        justifyContent: "space-around",
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "transparent",
        overflow: "hidden"
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
        borderBottomWidth: 0.5
    },
    pair: {
        flexDirection: "row",
        width: "90%",
        justifyContent: "space-between",
    },
    highlight:{
        fontWeight: "bold"
    },
    topLeft: {
        fontSize: 16,
        color: "#0077C5",
    },
    topRight: {
        fontSize: 16,
        color: "#0077C5",
        fontWeight: "bold"
    },
    extraData: {
        paddingVertical: 5,
        paddingHorizontal: 20
    },
    details: {
        fontSize: 12
    }
});
