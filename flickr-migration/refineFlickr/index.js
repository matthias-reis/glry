const { couchFl, couchSetNamespace } = require('../lib');
const { logger } = require('just-task');
const glob = require('glob');
const { bold, green, yellow } = require('chalk');

module.exports = async name => {
  couchSetNamespace(name);

  logger.info('consolidating flickr photo metadata');
  let photoMetaRaw;
  let albums;
  const photoGlob = glob.sync(`${__dirname}/${name}/photo_*.json`);

  try {
    const t0 = Date.now();
    photoMetaRaw = photoGlob.map(file => require(file));
    albums = require(`./${name}/albums.json`).albums;
    logger.info(`assessing ${bold(photoGlob.length)} flickr photos`);
    logger.info(`assessing ${bold(albums.length)} flickr albums`);
    logger.info(`reading data finished after ${bold(Date.now() - t0)} ms`);
  } catch (e) {
    logger.error(e);
    process.exit(1);
  }

  const t1 = Date.now();

  const photoMeta = photoMetaRaw.reduce(
    (meta, data) => {
      try {
        const { id, name } = data;
        const photo = { id, name, albums: [], tags: [] };
        data.albums.forEach(({ title }) => {
          photo.albums.push(title);
          if (!meta.albums[title]) {
            meta.albums[title] = [];
          }
          meta.albums[title].push(id);
        });
        data.tags.forEach(({ tag }) => {
          photo.tags.push(tag);
          if (!meta.tags[tag]) {
            meta.tags[tag] = [];
          }
          meta.tags[tag].push(id);
        });
        meta.photos[id] = photo;
      } catch (e) {
        console.error(e);
      }
      return meta;
    },
    { albums: {}, tags: {}, photos: {} }
  );

  logger.info(
    `BEFORE album refinement: ${green(
      Object.keys(photoMeta.albums).length
    )} albums, ${yellow(Object.keys(photoMeta.tags).length)} tags, ${bold(
      Object.keys(photoMeta.photos).length
    )} photos`
  );

  albums.forEach(({ title, photos }) => {
    photos.forEach(id => {
      if (!photoMeta.photos[id]) {
        // logger.warn(`id ${green(id)}: photo is not in list of photos`);
      } else if (photoMeta.photos[id].albums.indexOf(title) === -1) {
        if (photoMeta.albums[title]) {
          // logger.warn(
          //   `id ${green(id)}: album ${bold(title)} is not listed with photo`
          // );
          photoMeta.albums[title].push(id);
          photoMeta.photos[id].albums.push(title);
        } else {
          // logger.warn(
          //   `id ${green(id)}: album ${bold(
          //     title
          //   )} is not listed in any photo yet. Creating it`
          // );
          photoMeta.albums[title] = [];
          photoMeta.photos[id].albums.push(title);
        }
      }
    });
  });

  logger.info(
    `AFTER album refinement: ${green(
      Object.keys(photoMeta.albums).length
    )} albums, ${yellow(Object.keys(photoMeta.tags).length)} tags, ${bold(
      Object.keys(photoMeta.photos).length
    )} photos`
  );

  logger.info(`refining data finished after ${bold(Date.now() - t1)} ms`);

  const t2 = Date.now();

  const refinedAlbums = Object.keys(photoMeta.albums).map(key => {
    const res = {
      _id: key,
      name: key,
      photos: [],
    };
    photoMeta.albums[key].forEach(photoId =>
      res.photos.push({ ...photoMeta.photos[photoId] })
    );
    return res;
  });

  logger.info(`rearrange of albums finished after ${bold(Date.now() - t2)} ms`);

  const t3 = Date.now();

  await couchFl().bulkSet(refinedAlbums);

  logger.info(`persistence finished after ${bold(Date.now() - t3)} ms`);
};
