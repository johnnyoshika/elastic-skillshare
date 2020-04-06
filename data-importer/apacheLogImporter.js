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
      // There's a bug here. The index resets sporadically and it seems to go on forever.
      // When the count gets to about 167,402 (which it never should b/c there are only 20K records, but it seems to max out at 167,402), stop the script.
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
