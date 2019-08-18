const fs = require('fs');

/**
* @param {string} pattern pattern of file to be matched by regex
* @param {string} year Recieves year of the file to be located
* @param {string} dir Recieves directory name to be searched for file
* @returns {string : null} Returns either the path of the requested file as a string, or if absent returns null
**/
const findFile = (pattern, dir) => {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(dir);
    const regexp = new RegExp(`^${pattern}.*`);
    if (files.some(file => file.match(regexp))) {
      resolve(`./${dir}/${files.find(file => file.match(regexp))}`);
    } else {
      resolve(null);
    }
  })
}

/**
* @param {string} pattern pattern of file to be matched by regex
* @param {string} dir Recieves directory name to be searched for file
* @returns {array} Returns the paths matching the pattern requested file as strings
**/
const findFileArray = (pattern, dir) => {
  return new Promise((resolve, reject) => {
    const files = fs.readdirSync(dir);
    const regexp = new RegExp(pattern);
    resolve(files.filter(file => file.match(regexp)).sort().map(file => (
      `./${dir}/${file}`)
    ));
  })
};

module.exports.findFile = findFile;
module.exports.findFileArray = findFileArray
