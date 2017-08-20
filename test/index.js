import test from 'ava';
import Ajv from 'ajv';
import {getAllFiles} from '../lib/files';

const schema = {
  type: 'object',
  required: ['title', 'description', 'tags'],
  additionalProperties: false,
  properties: {
    title: {
      type: 'string'
    },
    description: {
      oneOf: [
        {type: 'string'},
        {
          type: 'array',
          items: {
            type: 'object',
            required: ['title', 'content'],
            additionalProperties: false,
            properties: {
              title: {
                type: 'string'
              },
              content: {
                type: 'string'
              }
            }
          }
        }
      ]
    },
    tags: {
      type: 'array',
      items: {
        type: 'string'
      }
    }
  }
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
