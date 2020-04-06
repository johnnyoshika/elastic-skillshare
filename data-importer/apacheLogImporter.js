var fs = require('fs');
var Alpine = require('alpine');
var alpine = new Alpine();
const bulk = require('./bulk');

const apacheLogImporter = async function () {
  let logs = [];
  let firstImport = true;

  alpine.parseReadStream(
    fs.createReadStream('../apache-logs-data/access_log', {
      encoding: 'utf8',
    }),
    async data => {
      logs.push(data);
      if (logs.length > 1000) {
        await bulk({
          index: 'apache_logs',
          mappings: {},
          dataset: logs,
          reset: firstImport,
        });
        logs = [];
        firstImport = false;
      }
    },
  );
};

module.exports = apacheLogImporter;
