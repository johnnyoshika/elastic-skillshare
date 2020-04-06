const csv = require('csv-parser');
const fs = require('fs');
const bulk = require('./bulk');

const movies = [];
const ratings = [];
const tags = [];

const movieImporter = function (onComplete) {
  fs.createReadStream('../movies-data/movies.csv')
    .pipe(csv())
    .on('data', data => movies.push(data))
    .on('end', () => {
      console.log(`${movies.length} movies parsed`);

      fs.createReadStream('../movies-data/ratings.csv')
        .pipe(csv())
        .on('data', data => ratings.push(data))
        .on('end', () => {
          console.log(`${ratings.length} ratings parsed`);

          fs.createReadStream('../movies-data/tags.csv')
            .pipe(csv())
            .on('data', data => tags.push(data))
            .on('end', async () => {
              console.log(`${tags.length} tags parsed`);

              await bulk({
                index: 'movies',
                mappings: {
                  properties: {
                    id: { type: 'integer' },
                    year: { type: 'date' },
                    genre: { type: 'keyword' },
                    title: {
                      type: 'text',
                      analyzer: 'english',
                      fields: {
                        raw: {
                          type: 'keyword',
                        },
                      },
                    },
                  },
                },
                dataset: movies.map(m => ({
                  id: m.movieId,
                  title: m.title,
                  genre: m.genres.split('|'),
                })),
                reset: true,
              });

              await bulk({
                index: 'ratings',
                mappings: {
                  properties: {
                    userId: { type: 'integer' },
                    movieId: { type: 'integer' },
                    rating: { type: 'double' },
                    title: {
                      type: 'text',
                      analyzer: 'english',
                      fields: {
                        raw: {
                          type: 'keyword',
                        },
                      },
                    },
                    timestamp: { type: 'integer' },
                  },
                },
                dataset: ratings.map(r => ({
                  ...r,
                  title: movies.find(m => m.movieId === r.movieId)
                    .title,
                })),
                reset: true,
              });

              await bulk({
                index: 'tags',
                mappings: {
                  properties: {
                    userId: { type: 'integer' },
                    movieId: { type: 'integer' },
                    tag: { type: 'keyword' },
                    title: {
                      type: 'text',
                      analyzer: 'english',
                      fields: {
                        raw: {
                          type: 'keyword',
                        },
                      },
                    },
                    timestamp: { type: 'integer' },
                  },
                },
                dataset: tags.map(t => ({
                  ...t,
                  title: movies.find(m => m.movieId === t.movieId)
                    .title,
                })),
                reset: true,
              });

              onComplete();
            });
        });
    });
};

module.exports = movieImporter;
