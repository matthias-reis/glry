const { Storage } = require('@google-cloud/storage');
const glob = require('glob');
const { resolve, basename } = require('path');
const { log, err } = require('./log');

const BUCKET = 'cardamonchai-galleries';

module.exports = async (folder, glryName) => {
  const files = glob.sync(`${folder}/*.*`);

  const storage = new Storage();
  const promises = files.map(async file => {
    const destination = `${glryName}/${basename(file)}`;

    const result = await storage.bucket(BUCKET).upload(file, {
      gzip: true,
      public: true,
      destination,
      metadata: {
        cacheControl: 'public, max-age=31536000',
      },
    });
    log(`${destination} uploaded`);
  });
  return Promise.all(promises);
};
