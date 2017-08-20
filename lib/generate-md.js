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

function formatDescription(description) {
  if (typeof description === 'string') {
    return description;
  }
  return description.map(({title, content}) => `### ${title}\n\n${content}`).join('\n\n');
}

function formatParticipants(participants) {
  if (participants[1] === '+') {
    return `${participants[0]} ou plus`;
  }
  return participants.join(' à ')
}

function toMD(content) {
  const tags = content.tags.join(', ');
  return `# ${content.title}

Nombre de joueurs : ${formatParticipants(content.participants)}.
Tags : ${tags}.

## Description

${formatDescription(content.description)}
`;
}

function generateFiles(files) {
  return files.map(async ({file, content}) => {
    const md = toMD(content);
    await writeFile(path.resolve(distPath, file.replace('.json', '.md')), md);
  });
}

async function generateIndex(files) {
  const allTags = files
    .map(({content}) => content.tags)
    .reduce((res, array) => res.concat(array), []);
  const tags = [...new Set(allTags)].join(', ');
  const games = files
    .map(({content}) => `- ${content.title} (${content.tags.join(', ')})`)
    .join('\n');
  const indexContent = `# Jeux d'improvisation

Tags: ${tags}.

## Jeux

${games}
`;
  await writeFile(path.resolve(distPath, 'index.md'), indexContent);
}

getAllFiles()
  .then(async files => {
    await rimraf(distPath);
    await mkdirp(distPath);
    await generateIndex(files);
    await generateFiles(files);
  })
  .catch(err => {
    console.error(err);
  });
