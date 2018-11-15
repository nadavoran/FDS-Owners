import React, { Component } from 'react';
import {
    StyleSheet,
    TouchableHighlight,
    ActivityIndicator,
    TextInput,
    Keyboard,
    FlatList,
    Text,
    View
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ownersDataApi } from "../api/OwnersDataApi";

export class MetaData extends Component {


    static navigationOptions = ({ navigation }) => {
        return {
            headerLeft: (
                <TouchableHighlight
                    underlayColor={"transparent"}
                    activeOpacity={0.5}
                    style={{ paddingLeft: 15 }}
                    onPress={() => {
                        Keyboard.dismiss();
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
            metaData: [],
            loading: true,
        };
        this.getMetaData();
    }

    async getMetaData(){
        try {
            let metaData = await ownersDataApi.getMetaData();
            this.setState({ metaData, loading: false });
        } catch(e){
            this.setState({ errorMessage: e, loading: false });
        }
    }


    renderResult = ({ item , index}) => {
        return <View style={styles.rowsItem}>
                <View style={styles.pair}>
                    {/*{this.getHighlight(item.scriptName, "scriptName", styles.topLeft)}*/}
                    <Text selectable={true} style={styles.topRight}>{JSON.stringify(item)}</Text>
                    {/*<Text selectable={true} style={styles.topRight}>{item.scriptName}</Text>*/}
                    {/*<Text selectable={true} style={styles.topRight}>{item.scriptName}</Text>*/}
                </View>
            </View>;
    };
    keyExtractor = (item, index) => {
        return `result-metaData-${index}`;
    };

    emptyList = () => {
        if (this.state.loading){
            return null;
        }
        return <View>
            <Text>No meta data, there might be some problem with connection or with retrieving data.</Text>
            <Text>Please contact Galit for more info</Text>
            {this.state.errorMessage ? <Text>Error loading data: {this.state.errorMessage}</Text> : null}
        </View>
    };

    render() {
        let version = this.state.metaData[0];
        let date = this.state.metaData[1];
        if (!version && !date){
            return <View style={styles.container}><Text style={styles.title}>MetaData not loading</Text></View>
        }
        return (
            <View style={styles.container}>
                <View >
                    <Text style={styles.title}>Script Ownership Combined:</Text>
                    <Text style={styles.content}>Version: {version ? version.ScriptOwnershipCombined : "**** no version ***"} ({date ? date.ScriptOwnershipCombined : "no date"})</Text>
                </View>
                <View>
                    <Text style={styles.title}>Mint Channel Details</Text>
                    <Text style={styles.content}>Version: {version ? version.MintChannelDetails : "**** no version ***"} ({date ? date.MintChannelDetails : "no date"})</Text>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 20
    },
    title: {
        fontSize: 16
    },
    content: {
        fontSize: 14,
        marginTop: 5,
        marginBottom: 15,
        marginLeft: 10
    }
});