const csv = require('csvtojson');
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser

/**
* @param {string} filePath Recieves file path of CSV file to be converted to JSON
* @return {Promise{Object}} Returns promise that resolves to JSON Object upon completion of conversion
*/
const getCsv = (filePath) => {
  return new Promise((resolve, reject) => {
    csv()
    .fromFile(filePath)
    .then((jsonObj)=>{
      resolve(jsonObj);
    })
  })
}

/**
* @param {Object} jsonObject promise that resolves to JSON Object upon completion of conversion
* @param {string} name Recieves the desired name of the output file as a string.  This will then be followed by '-' and the date the file was created as YYYYMMDD.
* @param {string} dir Recieves the directory in which the file should be placed (E.g. './files/'). Defaults to root directory.
*/
const writeCsv = (jsonObject, name, dir = '') => {
  const date = new Date();
  const parser = new Json2csvParser();
  const csv = parser.parse(jsonObject);
  fs.writeFile(`${dir}${name}-${date.toISOString().slice(0,10).replace(/-/g,"")}.csv`, csv, (err) => {
    if (err) throw err;
  });
  return `${dir}${name}-${date.toISOString().slice(0,10).replace(/-/g,"")}.csv`;
}

const appendToFile = (csvFile, jsonObject, name) => {
  const parser = new Json2csvParser();
  const csvForFile = parser.parse(jsonObject);
  fs.appendFile(csvFile, `\n\n${name}\n${csvForFile}`, (err) => {
    if (err) throw err;
  });
};

module.exports.getCsv = getCsv;
module.exports.writeCsv = writeCsv;
module.exports.appendToFile = appendToFile;
