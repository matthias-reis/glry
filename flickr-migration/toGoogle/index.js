const { couchRefined, couchSetNamespace } = require('../lib');
const { googleCreateAlbum, googleAddToAlbum } = require('../lib');
const { logger } = require('just-task');
const { bold, green, red, yellow } = require('chalk');
const { splitEvery } = require('ramda');

const wait = t => new Promise(resolve => setTimeout(resolve, t));

module.exports = async name => {
  couchSetNamespace(name);

  const list = await couchRefined().list();
  const albums = list.rows.map(album => ({
    albumName: `${album.doc.name} (Flickr)`,
    chunks: splitEvery(
      30,
      album.doc.assignedPhotos.map(photo => photo.doc.googleId)
    ),
  }));

  for (let { albumName, chunks } of albums) {
    logger.info(
      `${yellow('===')} processing album ${green(albumName)} with ${bold(
        chunks.length
      )} requests.`
    );

    const album = await googleCreateAlbum(albumName);

    await wait(200);
    for (let chunk of chunks) {
      await googleAddToAlbum(album.id, chunk);
      await wait(200);
    }
    await wait(200);
  }
};
