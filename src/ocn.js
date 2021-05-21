const fetch = require('node-fetch');
const parser = require("xml2json");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const pLimit = require('p-limit');

// Limit number of concurrent calls
const limit = pLimit(80);

const xmlPromises = [];

const records = []
const tracker = {};

const csvWriter = createCsvWriter({
    path: "./out/ocn.csv",
    header: [
        { id: "code", title: "code" },
        { id: "name", title: "name" }
    ]
});

const getData = async (exch) => {
    return new Promise((resolve, reject) => {
        fetch(`https://localcallingguide.com/xmllocalexch.php?exch=${exch}`)
            .then(resp => resp.text())
            .then(data => {
                let promise;
                
                // Catch faulty XML
                try {
                    promise = resolve(JSON.parse(parser.toJson(data)).root || {});
                } catch (e) {
                    console.log(`No data at exch: ${exch}`);
                    promise = resolve({});
                }
                return promise;
            })
            .catch(() => {
                console.log(`No data at exch: ${exch}`);
                return resolve({});
            });
    });
}

// Populate array with pending promises
for (let i = 0; i < 100000; i++) {
    let spl = i.toString().split('');
    let diff = 5 - spl.length;
    if (diff) {
        for (let j = 0; j < diff; j++) {
            spl.unshift('0');
        }
    }
    spl.push('0');
    let exch = spl.join('');

    xmlPromises.push(limit(() => getData(exch)));
}

const validate = (input) => {
    if (!input || typeof(input) == "object") return -1;
    else return input;
}

Promise.all(xmlPromises).then((data) => {
    for (let i = 0; i < data.length; i++) {
        if (data[i]['lca-data'] && data[i]['lca-data'].prefix) {
            data[i] = data[i]['lca-data'].prefix;
            if (!Array.isArray(data[i])) 
                data[i] = [data[i]];
            
            for (let j = 0; j < data[i].length; j++) {
    
                if (!tracker[`${data[i][j].ocn}${data[i][j]['company-name']}`]) {
                    records.push({
                        code: data[i][j].ocn,
                        name: data[i][j]['company-name']
                    });
                    tracker[`${data[i][j].ocn}${data[i][j]['company-name']}`] = 1;
                }
            }
        }
    }

    csvWriter.writeRecords(records).then(() => console.log("ocn done"));
});