// Connects tools used to convert csv=>jason and json=>csv
const getCsv = require('./js/csvHandler.js').getCsv;
const writeCsv = require('./js/csvHandler.js').writeCsv;
const appendToFile = require('./js/csvHandler.js').appendToFile;
const fs = require('fs');

const cafesArray = require('./js/globalVariables.js').cafesArray; // Array of names [cafe1Name, cafe2Name, ...]
const cafeResults = require('./js/globalVariables.js').cafeResults; // 2d object {cafe1Name: {}, cafe2Name: {} ...}

const dateRange = {};

// Connects tools used to locate file locations and return them as strings
const findFile = require('./js/findFile.js').findFile;
const findFileArray = require('./js/findFile.js').findFileArray;

const getFiles = async () => {
  const namescsv = await findFile('staffList', 'csv_files');
  const data = await findFile('data', 'csv_files');
  return [namescsv, data];
}

const toDate = (dateString) => {
  if (dateString.includes('----')) return false;
  const thisTime = dateString.split(' ');
  const hrsAndMin = thisTime[1].split(':');
  const inst = new Date(thisTime[0]);
  inst.setHours(hrsAndMin[0]);
  inst.setMinutes(hrsAndMin[1]);
  return inst;
}

const incrementor = (objectToVerify, addOrEquals, tally) => {
   if (objectToVerify) {
     objectToVerify += addOrEquals;
     tally -= addOrEquals;
   } else {
     objectToVerify = addOrEquals;
     tally -= addOrEquals;
   }
}

const checkDate = (timeIn, timeOut) => {
  if (!dateRange.earliestDate || timeIn < dateRange.earliestDate) {
    dateRange.earliestDate = timeIn;
  }
  if (!dateRange.latestDate || timeOut > dateRange.latestDate) {
    dateRange.latestDate = timeOut;
  }
}

const format = (obj) => {
  const newArray = [['time', 'hours']];
  for (let line in obj) {
    newArray.push([line, obj[line]]);
  }
  return newArray;
}

const hourTrack = (line) => {
  let minutes = ((line['Time Out']-line['Time In'])/60000);
  if (!line['Time Out']) {
    line['Time Out'] = line['Time In'] + (Number(line['Hours'])*3600000)
  };
  if (minutes < line['Hours']) {line['Time Out'] = line['Time In'] + Number(line['Hours'])*3600000}
  minutes = Number(((line['Time Out']-line['Time In'])/60000).toFixed(2));
  const minInFirstHour = 60 - line['Time In'].getMinutes();
  if (!line.Cafe) return false;
  if (cafeResults[line.Cafe][line['Time In'].getHours()]) {
    cafeResults[line.Cafe][line['Time In'].getHours()] += minInFirstHour;
    minutes -= minInFirstHour;
  } else {
    cafeResults[line.Cafe][line['Time In'].getHours()] = minInFirstHour;
    minutes -= minInFirstHour;
  }
  for (let i = (line['Time In'].getHours()+1); minutes > 0; i++) {
    let toAdd = 0;
    if (minutes > 60) {
      toAdd = 60;
      minutes -= 60;
    } else {
      toAdd = minutes;
      minutes = 0;
    }
    if (cafeResults[line.Cafe][i]) {
      cafeResults[line.Cafe][i] += toAdd;
    } else {
      cafeResults[line.Cafe][i] = toAdd;
    }
  }
}

const main = async () => {
  const files = await getFiles();
  const names = await getCsv(files[0]);
  const data = await getCsv(files[1]);
  for (let line in data) {
    const timeIn = toDate(data[line]['Time In']);
    const timeOut = toDate(data[line]['Time Out']);
    data[line]['Time In'] = timeIn;
    data[line]['Time Out'] = timeOut;
    checkDate(timeIn, timeOut);
    for (let name in names) {
      if (data[line].Name.includes(names[name].First) && data[line].Name.includes(names[name].Last)) {
        data[line].Cafe = names[name].Location;
        data[line].Role = names[name].Title;
      }
    }
    if (!data[line].Cafe) console.log(`Missing Cafe for ${data[line].Name}`);
    hourTrack(data[line]);
  }
  dateRange.totalDays = Math.floor((dateRange.latestDate - dateRange.earliestDate)/86400000)
  for (let cafe in cafeResults) {
    for (let hour in cafeResults[cafe]) {
      cafeResults[cafe][hour] = (cafeResults[cafe][hour]/dateRange.totalDays)/60;
    }
  }
  for (let cafe in cafeResults) {
    let thisCafeArray = format(cafeResults[cafe]);
    writeCsv(thisCafeArray, `${cafe}`, './results/');
  }

  console.log(cafeResults);
}

main();
