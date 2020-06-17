const { couchFl, couchGo, couchRefined, couchSetNamespace } = require('../lib');
const { logger } = require('just-task');
const { bold, green, red, yellow } = require('chalk');

const wait = t => new Promise(resolve => setTimeout(resolve, t));

module.exports = async name => {
  couchSetNamespace(name);
  const t0 = Date.now();
  const albums = await couchFl().list();
  const photosList = await couchGo().list();

  logger.info(
    `Fetched data for refining ${green(
      albums.rows.length
    )} albums in ${Date.now() - t0} ms`
  );
  const t1 = Date.now();

  const photos = photosList.rows.reduce((res, next) => {
    const tokens = next.doc._id.split('_');
    if (tokens[tokens.length - 1] === 'o.jpg') {
      res[tokens[tokens.length - 2]] = next;
    }
    return res;
  }, {});

  const resultSet = [];

  for (let currentAlbum of albums.rows) {
    const refinedAlbum = {
      _id: currentAlbum.doc.name,
      name: currentAlbum.doc.name,
      assignedPhotos: [],
      lostPhotos: [],
    };

    for (let photo of currentAlbum.doc.photos) {
      const googlePhoto = photos[photo.id];

      if (googlePhoto) {
        refinedAlbum.assignedPhotos.push({
          ...googlePhoto,
          flickrId: photo.id,
        });
      } else {
        refinedAlbum.lostPhotos.push(photo);
      }
    }

    logger.info(
      `${bold(refinedAlbum.name)}: analysed ${bold(
        currentAlbum.doc.photos.length
      )} photos - ${green(refinedAlbum.assignedPhotos.length)} found, ${red(
        refinedAlbum.lostPhotos.length
      )} lost,`
    );
    resultSet.push(refinedAlbum);
  }

  await couchRefined().bulkSet(resultSet);
};
