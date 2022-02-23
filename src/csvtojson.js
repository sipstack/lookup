const csv = require("csv-parser");
const fs = require("fs");


const result = [];

fs.createReadStream("src/csv/states.csv")
    .pipe(csv())
    .on("data", data => result.push(data))
    .on("end", () => {
        fs.writeFile("src/json/states.json", JSON.stringify(result), (err) => {
            if (err) throw err;
            console.log("csv to json complete");
        })
    });

