import { AsyncStorage } from "react-native";
const metaDataLink =    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtCv7C5S-7EgZGEDKNPSWmpK49IRr4zcAxQVfN6RFCoJvNX-mMbys0YKFE5qhv6Cg6h5_5uwbSmoqc/pub?gid=1597171652&single=true&output=csv";
const scriptOwnerLink = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtCv7C5S-7EgZGEDKNPSWmpK49IRr4zcAxQVfN6RFCoJvNX-mMbys0YKFE5qhv6Cg6h5_5uwbSmoqc/pub?gid=1883684353&single=true&output=csv";
const mintLink =        "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtCv7C5S-7EgZGEDKNPSWmpK49IRr4zcAxQVfN6RFCoJvNX-mMbys0YKFE5qhv6Cg6h5_5uwbSmoqc/pub?gid=1201935171&single=true&output=csv";
const ownershipHistory =        "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtCv7C5S-7EgZGEDKNPSWmpK49IRr4zcAxQVfN6RFCoJvNX-mMbys0YKFE5qhv6Cg6h5_5uwbSmoqc/pub?gid=1319016067&single=true&output=csv";

class OwnersDataApi {
    get mintChannelVersion(){
        return this.metaData && this.metaData[0].MintChannelDetails;
    }
    get mintChannelDate(){
        return this.metaData && new Date(this.metaData[1].MintChannelDetails);
    }
    get scriptOwnerVersion(){
        return this.metaData && this.metaData[0].ScriptOwnershipCombined;
    }
    get scriptOwnerDate(){
        return this.metaData && new Date(this.metaData[1].ScriptOwnershipCombined);
    }
    async getMetaData() {
        this.metaData = await this.getLinkCSV(metaDataLink);
        this.metaData = csvJSON(this.metaData).result;
        console.log(`Meta data: ${JSON.stringify(this.metaData, null, 4)}`);
        AsyncStorage.setItem("metaData", JSON.stringify(this.metaData));
        return Promise.resolve(this.metaData);
    }

    async getObjectFromStorage(key){
        let data = await AsyncStorage.getItem(key);
        return Promise.resolve(data && JSON.parse(data));
    }
    async storageData() {
        try {
            console.log("storageData: calling get multi");
            this.syncMetaData = await this.getObjectFromStorage('metaData');
            this.syncScriptOwner = await AsyncStorage.getItem('scriptOwner');
            this.syncMintDetails = await AsyncStorage.getItem('mintDetails');
            console.log(`storageData: finish sync, syncMetaData: ${!!this.syncMetaData}, syncScriptOwner: ${!!this.syncScriptOwner}, syncMintDetails: ${!!this.syncMintDetails} `);
        } catch (e){
            console.log("storageData exception while reading items", e)
        }
        return Promise.resolve();
    }
    async syncIfNeeded() {
        console.log("syncIfNeeded: started");

        let dataToSync = [];
        console.log(`Checking Script Ownership oldVer: ${!this.syncMetaData || this.syncMetaData[0].ScriptOwnershipCombined}, newVer:${this.scriptOwnerVersion}`);
        if (!this.syncMetaData || this.syncMetaData[0].ScriptOwnershipCombined < this.scriptOwnerVersion){
            dataToSync.push(this.getScriptOwnersData.bind(this));
        } else {
            this.scriptOwner = csvJSON(this.syncScriptOwner, "scriptName");
        }
        console.log(`Checking Mint Channel oldVer: ${!this.syncMetaData || this.syncMetaData[0].MintChannelDetails}, newVer:${this.mintChannelVersion}`);
        if (!this.syncMetaData || this.syncMetaData[0].mintChannelDetails < this.mintChannelVersion){
            dataToSync.push(this.getMintDetails.bind(this));
        } else {
            this.mintDetails = csvJSON(this.syncMintDetails, "scriptName", "CHANNEL_TYPE_NAME");
        }
        if (dataToSync.length){
            return Promise.all([dataToSync[0](), dataToSync[1] && dataToSync[1]()]);
        }
    }
    async getScriptOwnersData(force) {
        if (force || !this.scriptOwner) {
            try {
                console.log("Getting ScriptOwnersData from web, there is no scriptOwner");
                let data  = await this.getLinkCSV(scriptOwnerLink, "scriptName");
                AsyncStorage.setItem("scriptOwner", data).then(()=>{
                    console.log("Done saving getScriptOwnersData from web");
                });
                this.scriptOwner = csvJSON(data, "scriptName");
            } catch(e){
                console.log("getMintDetails error: ", e);
            }
        }
        return Promise.resolve(this.scriptOwner);
        // return this.scriptOwner;
        // return this.getLinkCSV(scriptOwnerLink, "scriptName");
    }
    async getMintDetails(force) {
        if (force || !this.mintDetails) {
            try {
                console.log("Getting mintDetails from web, there is no scriptOwner");
                let data = await this.getLinkCSV(mintLink, "scriptName");
                AsyncStorage.setItem("mintDetails", data).then(()=>{
                    console.log("Done saving mintDetails from web");
                });
                this.mintDetails = csvJSON(data, "scriptName", "CHANNEL_TYPE_NAME");
            } catch(e){
                console.log("getMintDetails error: ", e);
            }
        }
        return Promise.resolve(this.mintDetails);
        // return this.mintDetails;
        // return this.getLinkCSV(mintLink, "scriptName");
    }

    async getLinkCSV(link) {
        return new Promise((resolve, reject) => {
            try {
                // let csvData = require("../../resources/ScriptOwnershipCombined.json");

                let req = new Request(link, {
                    method: "GET"
                });
                fetch(req)
                    .then(async resp => {
                        if (resp.ok) {
                            let contentType = resp.headers.get("content-type");
                            if (contentType.includes("text/csv")) {
                                let respText = await resp.text();
                                return resolve(respText);
                                // return resolve(respJson);
                            }
                        } else {
                            const respText = JSON.stringify(resp);
                            return reject({
                                status: resp.status,
                                statusText: `failed sending request: ${respText}`
                            });
                        }
                    });
            } catch (e){
                resolve(`Error while parsing the Scripts Owners File, error: ${e}`);
            }
        });
    }

    async getFullData(){
        return Promise.all([this.getScriptOwnersData(), this.getMintDetails()]);
    }

    async getOwnershipHistory(){
        let csv = await this.getLinkCSV(ownershipHistory);

        let lines = csv.split("\r\n");

        let result = [];
        let resultByKey = {};
        try {
            lines.forEach(data=>{
                let rowData = data.split(",");
                let obj = {
                    scriptName: rowData[0],
                    history: []
                };
                if (rowData.length > 1){
                    rowData.forEach((history, index)=>{
                        if (index > 0){
                            let historyData = history.split("-");
                            obj.history.push({
                                date: historyData[0]*1,
                                owner: historyData[1]
                            });
                        }
                    });
                }
                result.push(obj);
            });
            return result;
        } catch(e){
            console.log("Get Ownership History error", e);
        }
    }
}


let ownersDataApi = new OwnersDataApi();
export { ownersDataApi };

function csvJSON(csv, key, secondaryKey){
    let lines = csv.split("\r\n");

    let result = [];
    let resultByKey = {};
    try {

        console.log(`-------------------- lines: ${lines.length}, key: ${key}`);
        let headers = lines[ 0 ].split(",");
        for (let i = 1; i < lines.length; i++) {
            let obj = {};
            let currentline = lines[ i ].split(",");

            for (let j = 0; j < headers.length; j++) {
                obj[ headers[ j ] ] = currentline[ j ];
            }
            if (key) {
                if (obj[key]) {
                    if ( resultByKey[ obj[ key ] ] ) {
                        resultByKey[ obj[ key ] ].push(obj);
                    } else {
                        resultByKey[ obj[ key ] ] = [ obj ];
                    }
                } else if (secondaryKey){
                    if ( resultByKey[ obj[ secondaryKey ] ] ) {
                        resultByKey[ obj[ secondaryKey ] ].push(obj);
                    } else {
                        resultByKey[ obj[ secondaryKey ] ] = [ obj ];
                    }
                }
            }
            result.push(obj);
        }
    } catch (e) {
        console.log("exception in csvJSOn ", e);
    }

    //return result; //JavaScript object
    return { result, resultByKey }; //JSON
}