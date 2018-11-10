const { log, err } = require('./log');
const { getAlbums, getPhotosOfAlbum, filterBlacklist } = require('./flickr');
const blacklist = require('./blacklist');
const chalk = require('chalk');

const runner = async () => {
  log('starting processing');
  // request flickr for available albums
  const albums = await getAlbums();

  log(`Gefundene Collections <${albums.length}>`);
  // filter against album blacklist
  const filteredAlbums = filterBlacklist(albums);
  log(`Abgeglichen mit Blacklist <${filteredAlbums.length}>`);

  await albums.slice(0, 2).forEach(async a => {
    log(`Album: ${chalk.yellow(a.slug)}`);

    // request image metadata per album
    const photos = await getPhotosOfAlbum(a.id);
    console.log(photos);
  });
};

runner();

// download image

// select where to store image

// a) all images go to google

// b) if an imgage contains a certain tag it also goes to a local folder

// transform images in local folder to smaller and more efficient ones

// upload to scaleway
