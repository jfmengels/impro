const fs = require('fs');
const path = require('path');
const util = require('util');
const mkdirp = util.promisify(require('mkdirp'));
const rimraf = util.promisify(require('rimraf'));
const {getAllFiles} = require('../lib/files');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const distPath = path.resolve(__dirname, '../dist');


function toMD(content) {
  const tags = content.tags.join(', ');
  return `# ${content.title}

Tags: ${tags}.

## Description

${content.description}
`;
}

getAllFiles().then(async files => {
  await rimraf(distPath);
  await mkdirp(distPath);
  return files.map(async ({file, content}) => {
    const md = toMD(content);
    await writeFile(path.resolve(distPath, file.replace('.json', '.md')), md);
  });
});
