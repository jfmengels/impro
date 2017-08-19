const fs = require('fs');
const path = require('path');
const util = require('util');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

const filesPath = path.resolve(__dirname, '../jeux');

const getAllFiles = async () => {
  const files = await readdir(filesPath);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  return Promise.all(
    jsonFiles.map(async file => {
      const content = await readFile(filesPath + '/' + file, 'utf8');
      return {file, content: JSON.parse(content)};
    })
  );
};

module.exports = {
  getAllFiles
};
