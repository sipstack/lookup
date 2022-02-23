const fetch = require('node-fetch');
const parser = require("xml2json");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const pLimit = require('p-limit');

// Limit number of concurrent calls
const limit = pLimit(100);

const cities = require('./json/cities.json');
const xmlPromises = [];

const records = []
const tracker = {};

const csvWriter = createCsvWriter({
    path: "./out/ocn.csv",
    header: [
        { id: "code", title: "code" },
        { id: "name", title: "name" },
        { id: "cityId", title: "city_id" }
    ]
});

const getData = async (url) => {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(resp => resp.text())
            .then(data => {
                let promise;
                
                // Catch faulty XML
                try {
                    promise = resolve(JSON.parse(parser.toJson(data)).root);
                } catch (e) {
                    promise = new Promise();
                }
                return promise;
            });
    });
}

// Populate array with pending promises
for (let i = 0; i < 20; i++) {
    let spl = i.toString().split('');
    let diff = 5 - spl.length;
    if (diff) {
        for (let j = 0; j < diff; j++) {
            spl.unshift('0');
        }
    }
    spl.push('0');
    let exch = spl.join('');

    xmlPromises.push(limit(() => getData(`https://localcallingguide.com/xmllocalexch.php?exch=${exch}`)));
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
                let cityId = cities[data[i][j].rc] ? cities[data[i][j].rc] : -1;
    
                if (!tracker[`${data[i][j].ocn}${data[i][j]['company-name']}${cityId}`]) {
                    records.push({
                        code: data[i][j].ocn,
                        name: data[i][j]['company-name'],
                        cityId
                    });
                    tracker[`${data[i][j].ocn}${data[i][j]['company-name']}${cityId}`] = 1;
                }
            }
        }
    }

    csvWriter.writeRecords(records).then(() => console.log("ocn done"));
});