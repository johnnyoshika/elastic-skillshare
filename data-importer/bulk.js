const elasticsearch = require('elasticsearch');
const axios = require('axios');

const host = 'localhost:9200';

const client = new elasticsearch.Client({
  host,
  log: 'trace',
  apiVersion: '7.6',
});

async function bulk({ index, mappings, dataset }) {
  try {
    await axios.get(`http://${host}/${index}`);
    await client.indices.delete({
      index: index,
    });
  } catch (error) {}

  await client.indices.create(
    {
      index: index,
      body: {
        mappings,
      },
    },
    { ignore: [400] },
  );

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
