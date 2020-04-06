const fs = require('fs');
const Alpine = require('alpine');
const alpine = new Alpine();
const moment = require('moment');
const bulk = require('./bulk');

const apacheLogImporter = async function () {
  fs.readFile('../apache-logs-data/access_log', async (err, data) => {
    if (err) throw err;
    const lines = data
      .toString()
      .split('\n')
      .filter(l => l.trim() !== '');
    await bulk({
      index: 'apache_logs',
      mappings: {
        properties: {
          time: { type: 'date' },
        },
      },
      dataset: lines.map(line => {
        const log = alpine.parseLine(line);
        return {
          ...log,
          time: moment(log.time, 'DD/MMM/YYYY:HH:mm:ss Z').format(),
        };
      }),
    });
  });
};

module.exports = apacheLogImporter;
