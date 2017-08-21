import test from 'ava';
import Ajv from 'ajv';
import {getAllFiles} from '../lib/files';
import tags from '../lib/tags';

const schema = {
  type: 'object',
  required: ['title', 'participants', 'description', 'tags'],
  additionalProperties: false,
  properties: {
    title: {
      type: 'string'
    },
    participants: {
      type: 'array',
      items: [
        {type: 'number'},
        {oneOf: [{type: 'number'}, {"enum": ["+"]}]}
      ],
      additionalItems: false
    },
    description: {
      oneOf: [
        {type: 'string'},
        {
          type: 'array',
          minItems: 1,
          uniqueItems: true,
          items: {
            type: 'object',
            required: ['title', 'content'],
            additionalProperties: false,
            properties: {
              title: {
                type: 'string'
              },
              content: {
                oneOf: [
                  {type: 'string'},
                  {
                    type: 'array',
                    minItems: 2,
                    items: {type: 'string'}
                  }
                ]
              }
            }
          }
        }
      ]
    },
    tags: {
      type: 'array',
      items: {
        type: 'string',
        enum: Object.keys(tags)
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

test('All tags should have a description', t => {
  const nbTags = Object.keys(tags).length;
  t.plan((nbTags * 2)+ 1);
  t.not(nbTags, 0);
  Object.entries(tags).forEach(([key, value]) => {
    t.is(typeof value, 'string', `Tag ${key}'s value is not a string.`);
    t.not(value.trim(), '', `Tag ${key}'s value may not be empty.`);
  });
});
