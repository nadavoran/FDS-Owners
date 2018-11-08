import React, { Component } from 'react';
import {
    StyleSheet,
    TouchableHighlight,
    ActivityIndicator,
    TextInput,
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
        return (
            <View>
                <Text>MetaData {this.state.metaData.length}</Text>
                <View>
                    <Text>Script Ownership Combined:</Text>
                    <Text>{version.ScriptOwnershipCombined}</Text>
                    <Text>{date.ScriptOwnershipCombined}</Text>
                </View>
                <View>
                    <Text>Mint Channel Details</Text>
                    <Text>{version.MintChannelDetails}</Text>
                    <Text>{date.MintChannelDetails}</Text>
                </View>
                <Text>{JSON.stringify(date)}</Text>
                <FlatList
                    showsVerticalScrollIndicator={false}
                    showsHorizontalScrollIndicator={false}
                    style={styles.resultsContainer}
                    data={this.state.metaData}
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
    container: {}
});