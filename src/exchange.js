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
    path: "./out/exchange.csv",
    header: [
        { id: "code", title: "code" },
        { id: "cityId", title: "city_id" },
        { id: "npa", title: "npa" },
        { id: "nxx", title: "nxx" },
        { id: "block", title: "block" },
        { id: "_switch", title: "switch" },
        { id: "switch_name", title: "switch_name" },
        { id: "switch_type", title: "switch_type" },
        { id: "lata", title: "lata" },
        { id: "lir", title: "lir" },
        { id: "ocn", title: "ocn" }
    ]
});

const getData = async (npa, nxx) => {
    return new Promise((resolve, reject) => {
        fetch(`https://localcallingguide.com/xmlprefix.php?npa=${npa}&nxx=${nxx}`)
            .then(resp => resp.text())
            .then(data => {
                let promise;
                
                // Catch faulty XML
                try {
                    promise = resolve(JSON.parse(parser.toJson(data)).root);
                } catch (e) {
                    console.log(`No data at npa/nxx: ${npa}/${nxx}`);
                    promise = resolve({});
                }
                return promise;
            })
            .catch(() => {
                console.log(`No data at npa/nxx: ${npa}/${nxx}`)
                return resolve({});
            });
    });
}

// Populate array with pending promises
for (let i = 201; i < 1000; i++) {
    for (let j = 200; j < 1000; j++) {
        xmlPromises.push(limit(() => getData(i, j)));
    }
}

const validate = (input) => {
    if (!input || typeof(input) == "object") return -1;
    else return input;
}

Promise.all(xmlPromises).then((data) => {
    for (let i = 0; i < data.length; i++) {
        if (data[i] && data[i].prefixdata) {
            data[i] = data[i].prefixdata;
            if (!Array.isArray(data[i])) 
                data[i] = [data[i]];
            
            for (let j = 0; j < data[i].length; j++) {
                // Validate variable types
                let cityId = validate(cities[data[i][j].rc]);
                let lata = validate(data[i][j].lata);
                let lir = validate(data[i][j].lir);
                let _switch = validate(data[i][j].switch);
                let switch_type = validate(data[i][j].switchtype);

                if (!tracker[`${data[i][j].exch}${cityId}${data[i][j].npa}${data[i][j].nxx}${data[i][j].x}${_switch}${data[i][j]['company-name']}${switch_type}${lata}${lir}${data[i][j].ocn}`]) {
                    records.push({
                        code: data[i][j].exch,
                        cityId,
                        npa: data[i][j].npa,
                        nxx: data[i][j].nxx,
                        block: data[i][j].x,
                        _switch,
                        name: data[i][j]['company-name'],
                        switch_type,
                        lata,
                        lir,
                        ocn: data[i][j].ocn
                    });
                    tracker[`${data[i][j].exch}${cityId}${data[i][j].npa}${data[i][j].nxx}${data[i][j].x}${_switch}${data[i][j]['company-name']}${switch_type}${lata}${lir}${data[i][j].ocn}`] = 1;
                }
            }
        }
    }

    csvWriter.writeRecords(records).then(() => console.log("exchange done"));
});