const fs = require('fs');
const path = require('path');
const util = require('util');
const mkdirp = util.promisify(require('mkdirp'));
const rimraf = util.promisify(require('rimraf'));
const {getAllFiles} = require('../lib/files');
const tags = require('../lib/tags');

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const docsFolder = path.resolve(__dirname, '../docs');

function formatDescription(description) {
  if (typeof description === 'string') {
    return description;
  }
  return description
    .map(({title, content}) => {
      const formattedContent = (Array.isArray(content) ? content : [content]).join('\n\n');
      return `### ${title}\n\n${formattedContent}`;
    })
    .join('\n\n');
}

function formatParticipants(participants) {
  if (participants[1] === '+') {
    return `${participants[0]} ou plus`;
  }
  return participants.join(' à ');
}

function toMD(content) {
  const gameTags = content.tags.join(', ');
  return `# ${content.title}

Nombre de joueurs : ${formatParticipants(content.participants)}.
Tags : ${gameTags}.

## Description

${formatDescription(content.description)}
`;
}

function generateFiles(files) {
  return files.map(async ({file, content}) => {
    const md = toMD(content);
    await writeFile(path.resolve(docsFolder, 'jeux', file.replace('.json', '.md')), md);
  });
}

async function generateReadme(files) {
  // const allTags = files
  //   .map(({content}) => content.tags)
  //   .reduce((res, array) => res.concat(array), []);
  // const tags = [...new Set(allTags)].join(', ');
  const tagsTable = Object.entries(tags)
    .map(([tag, description]) => `- ${tag} : ${description}`)
    .join('\n');

  const games = files
    .map(({file, content}) => {
      const docFilePath = `./docs/jeux/${file.replace('.json', '.md')}`;
      return `- [${content.title}](${docFilePath}) (${content.tags.join(', ')})`;
    })
    .join('\n');
  const indexContent = `# Jeux d'improvisation

## Jeux

${games}

## Tags

${tagsTable}
`;
  await writeFile(path.resolve(__dirname, '../README.md'), indexContent);
}

getAllFiles()
  .then(async files => {
    await rimraf(docsFolder + '/jeux/*.md');
    await mkdirp(docsFolder + '/jeux');
    await generateReadme(files);
    await generateFiles(files);
  })
  .catch(err => {
    console.error(err);
  });
