import fs from 'fs';
import util from 'util';
import test from 'ava';
import Ajv from 'ajv';

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const path = __dirname + '/../jeux';

const schema = {
  type: 'object',
  required: ['title', 'description', 'tags'],
  additionalProperties: false,
  properties: {
    title: {
      type: 'string'
    },
    description: {
      type: 'string'
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
};

const getAllFiles = async () => {
  const files = await readdir(path);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  return Promise.all(
    jsonFiles.map(async file => {
      const content = await readFile(path + '/' + file, 'utf8');
      return {file, content: JSON.parse(content)};
    })
  );
};

const jsonFiles = getAllFiles();

test('All files should respect the schema', async t => {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);

  (await jsonFiles).map(({file, content}) => {
    const validation = validate(content);
    const errors = JSON.stringify(validate.errors, null, 2);
    t.true(validation, `In file ${file}: ${errors}`);
  });
});

test('All titles should be unique', async t => {
  const ajv = new Ajv();
  const validate = ajv.compile(schema);

  const titles = (await jsonFiles).map(({content}) => content.title);
  t.is(new Set(titles).size, titles.length, 'There are duplicate titles');
});
