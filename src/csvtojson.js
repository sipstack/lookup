const csv = require("csv-parser");
const fs = require("fs");


const ocn1 = [];
const ocn2 = [];

let count = 0;

fs.createReadStream("./out/ocn.csv")
    .pipe(csv())
    .on("data", data => ocn1.push(data))
    .on("end", () => {
        fs.createReadStream("./out/ocn2.csv")
            .pipe(csv())
            .on("data", data => ocn2.push(data))
            .on("end", () => {
                
                for (let i = 0; i < ocn1.length; i++) {
                    for (let j = 0; j < ocn2.length; j++) {
                        if (`${ocn1[i].code}${ocn1[i].name}${ocn1[i].city_id}` == `${ocn2[j].code}${ocn2[j].name}${ocn2[j].city_id}`) count++;
                    }
                }

                console.log(count);
            });
    });

