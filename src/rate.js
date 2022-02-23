const fetch = require('node-fetch');
const parser = require("xml2json");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const pLimit = require('p-limit');

// Limit number of concurrent calls
const limit = pLimit(100);

const countries = require('./json/countries.json');
const states = require('./json/states.json');
const xmlPromises = [];

const recordsRegion = []
const recordsPrefix = []

const trackerRegion = {};
const trackerPrefix = {};

let countRegion = 0;
let countPrefix = 0;

const csvWriterRegion = createCsvWriter({
    path: "src/out/rate_region.csv",
    header: [
        { id: "regionNum", title: "regionnum" },
        { id: "regionName", title: "regionname" },
        { id: "exactMatch", title: "exact_match" },
    ]
});

const csvWriterPrefix = createCsvWriter({
    path: "src/out/rate_prefix.csv",
    header: [
        { id: "prefixNum", title: "prefixnum" },
        { id: "regionNum", title: "regionnum" },
        { id: "countryCode", title: "countrycode" },
        { id: "npa", title: "npa" },
        { id: "nxx", title: "nxx" },
        { id: "lata", title: "latanum" },
        { id: "state", title: "state" },
        { id: "ocn", title: "ocn" },
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
                let record = data[i][j];

                // Validate variable types
                let lata = validate(record.lata);
                let state = states.find(state => state.state_code == record.region);
                let countryId = state ? state.country_id : undefined;
                let country = countries.find(country => country.id === countryId);
                let countryCode = country ? country.iso3 : undefined;
                let regionName = `${record.rc}, ${record.region} (${countryCode})`;

                // Tracker object prevents duplicates
                let trackerKeyRegion = `${regionName}`;
                let trackerKeyPrefix = `${countryCode}${record.npa}${record.nxx}${lata}${record.region}${record.ocn}`;
                
                if (!trackerRegion[trackerKeyRegion]) {
                    recordsRegion.push({
                        regionNum: ++countRegion,
                        regionName
                    });
                    trackerRegion[trackerKeyRegion] = 1;
                }

                if (!trackerPrefix[trackerKeyPrefix]) {
                    recordsPrefix.push({
                        prefixNum: ++countPrefix,
                        regionNum: countRegion,
                        countryCode: countryCode,
                        npa: record.npa,
                        nxx: record.nxx,
                        lata,
                        state: record.region,
                        ocn: record.ocn
                    });
                    trackerPrefix[trackerKeyPrefix] = 1;
                }
            }
        }
    }

    csvWriterRegion.writeRecords(recordsRegion).then(() => console.log("region done"));
    csvWriterPrefix.writeRecords(recordsPrefix).then(() => console.log("prefix done"));
});