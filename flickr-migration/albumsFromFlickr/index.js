const { couchFl, couchSetNamespace } = require('../lib');
const { logger } = require('just-task');
const { bold } = require('chalk');

module.exports = name => {
  couchSetNamespace(name);
  // read correct file
  let flickrFiles = require(`./${name}`);
  if (flickrFiles.photos) {
    flickrFiles = flickrFiles.photos;
  }
  flickrFiles = Object.values(flickrFiles);
  const flickrAlbums = flickrFiles.reduce((file, albums) => {
    return albums;
  }, {});
  logger.info(`assessing ${bold(flickrFiles.length)} flickr files`);
};