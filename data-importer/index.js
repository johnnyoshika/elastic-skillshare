const movieImporter = require('./movieImporter');
const apacheLogImporter = require('./apacheLogImporter');

movieImporter(() => {
  apacheLogImporter();
});
