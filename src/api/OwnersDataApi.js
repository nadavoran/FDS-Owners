const metaDataLink = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtCv7C5S-7EgZGEDKNPSWmpK49IRr4zcAxQVfN6RFCoJvNX-mMbys0YKFE5qhv6Cg6h5_5uwbSmoqc/pub?gid=1597171652&single=true&output=csv";
const scriptOwnerLink = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtCv7C5S-7EgZGEDKNPSWmpK49IRr4zcAxQVfN6RFCoJvNX-mMbys0YKFE5qhv6Cg6h5_5uwbSmoqc/pub?gid=1883684353&single=true&output=csv";
const mintLink = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtCv7C5S-7EgZGEDKNPSWmpK49IRr4zcAxQVfN6RFCoJvNX-mMbys0YKFE5qhv6Cg6h5_5uwbSmoqc/pub?gid=1201935171&single=true&output=csv";

class OwnersDataApi {
    // async getNamesData() {
    //     return Promise.resolve([
    //         {id: 0, name: "a"},
    //         {id: 1, name: "b"},
    //         {id: 2, name: "c"},
    //         {id: 3, name: "d"},
    //         {id: 4, name: "e"},
    //         {id: 5, name: "f"},
    //         {id: 6, name: "g"},
    //         {id: 7, name: "h"},
    //         {id: 8, name: "i"}
    //     ])
    // }
    async getScriptOwnersData() {
        return this.getLinkCSVinJSON(scriptOwnerLink, "scriptName");
    }
    async getMintDetails() {
        return this.getLinkCSVinJSON(mintLink, "scriptName");
    }

    async getLinkCSVinJSON(link, key) {
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
                                console.log("----------- Data, in");
                                return resolve(csvJSON(respText, key));
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
        // .then(function(values) {
        //     console.log("getFullData: ", values);

            // values[1].forEach(data => {
            //
            // });
            // values[1].forEach(data=>{
            //     if (tempFilteredData[data.fiScript + data.fiOwner] || tempFilteredData[data.fiScript + data.fiOwner] === 0){
            //         values[0][tempFilteredData[data.fiScript + data.fiOwner]].extraData.push({
            //             fiName: data.fiName,
            //             fiId: data.fiId
            //         })
            //     } else {
            //         tempFilteredData[ data.fiScript + data.fiOwner ] = index;
            //         values[0].push({
            //             fiScript: data.fiScript,
            //             fiOwner: data.fiOwner,
            //             extraData: [{
            //                 fiName: data.fiName,
            //                 fiId: data.fiId
            //             }]
            //         });
            //     }
            // });
        // });
    }
}


let ownersDataApi = new OwnersDataApi();
export { ownersDataApi };

function csvJSON(csv, key){

    let lines = csv.split("\n");

    let result = [];
    let resultByKey = {};
    try {

        console.log("-------------------- lines: ", lines.length);
        let headers = lines[ 0 ].split(",");

        for (let i = 1; i < lines.length; i++) {
            let obj = {};
            let currentline = lines[ i ].split(",");

            for (let j = 0; j < headers.length; j++) {
                obj[ headers[ j ] ] = currentline[ j ];
            }
            if ( resultByKey[ obj[ key ] ] ) {
                resultByKey[ obj[ key ] ].push(obj);
            } else {
                resultByKey[ obj[ key ] ] = [ obj ];
            }

            result.push(obj);
        }
    } catch (e) {
        console.log("exception in csvJSOn ", e);
    }

    //return result; //JavaScript object
    return { result, resultByKey }; //JSON
}