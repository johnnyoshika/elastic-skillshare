const elasticsearch = require('elasticsearch');
const axios = require('axios');

const host = 'localhost:9200';

const client = new elasticsearch.Client({
  host,
  log: 'trace',
  apiVersion: '7.6',
});

async function create({ index, mappings }) {
  await client.indices.create(
    {
      index: index,
      body: {
        mappings,
      },
    },
    { ignore: [400] },
  );
}

async function bulk({ index, mappings, dataset, reset }) {
  try {
    await axios.get(`http://${host}/${index}`);

    if (reset) {
      await client.indices.delete({
        index: index,
      });
      await create();
    }
  } catch (error) {
    await create({ index, mappings });
  }

  const body = dataset.flatMap(doc => [
    { create: { _index: index, _id: doc.id } },
    doc,
  ]);

  const { body: bulkResponse } = await client.bulk({
    refresh: true,
    body,
  });

  const { count } = await client.count({
    index: index,
  });

  console.log(`imported ${count}`);
}

module.exports = bulk;
