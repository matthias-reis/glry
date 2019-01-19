const glob = require('glob');
const { writeFileSync, readFileSync } = require('fs');
const { join } = require('path');
const chalk = require('chalk');

console.log('consolidating photo information');

console.time('glob');
const photoMetaFiles = glob.sync(
  '/Users/matthias.reis/Downloads/wetransfer-dfe026/photo_*.json'
);
console.timeEnd('glob');

console.time('load');

let photoMetaRaw;
let albums = [];
let blogContent = '';

try {
  photoMetaRaw = photoMetaFiles.map(file => require(file));
  albums = require('/Users/matthias.reis/Downloads/wetransfer-dfe026/albums.json')
    .albums;
  blogContent = readFileSync(
    '/Users/matthias.reis/Downloads/wetransfer-dfe026/blog.xml',
    { encoding: 'utf-8' }
  );
} catch (e) {
  console.error(e);
  process.exit(1);
}
console.timeEnd('load');

console.time('photos');
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
console.log(
  chalk`{green ${Object.keys(photoMeta.albums).length} albums}, {yellow ${
    Object.keys(photoMeta.tags).length
  } tags}, {bold ${Object.keys(photoMeta.photos).length} albums}`
);
console.timeEnd('photos');

console.time('albums');
albums.forEach(({ title, photos }) => {
  photos.forEach(id => {
    if (!photoMeta.photos[id]) {
      console.log(chalk`{green <photo ${id}>}: photo is not in list of photos`);
    } else if (photoMeta.photos[id].albums.indexOf(title) === -1) {
      if (photoMeta.albums[title]) {
        console.log(
          chalk`{green <photo ${id}>}: album {bold <${title}>} is not listed with photo`
        );
        photoMeta.albums[title].push(id);
        photoMeta.photos[id].albums.push(title);
      } else {
        console.log(
          chalk`{green <photo ${id}>}: album {bold <${title}>} is not listed in any photo yet. Creating it`
        );
        photoMeta.albums[title] = [];
        photoMeta.photos[id].albums.push(title);
      }
    }
  });
});
console.log(chalk`analyzed {green ${albums.length} albums}`);

console.log(
  chalk`{green ${Object.keys(photoMeta.albums).length} albums}, {yellow ${
    Object.keys(photoMeta.tags).length
  } tags}, {bold ${Object.keys(photoMeta.photos).length} photos}`
);
console.timeEnd('albums');

console.time('blog content');

photoMeta.upload = [];

while ((match = /\[myflickr tag="(.+)"\]/g.exec(blogContent))) {
  const tag = match[1];
  if (photoMeta.tags[tag]) {
    photoMeta.upload.push(tag);
    console.log(chalk`{green <${tag}>} found and added to uploads`);
  } else {
    console.log(chalk`{red <${tag}>} not found in photo tags`);
  }
}

console.timeEnd('blog content');

console.time('write');

writeFileSync(
  join(__dirname, 'anne.json'),
  JSON.stringify(photoMeta, null, 2),
  {
    encoding: 'utf-8',
  }
);
console.timeEnd('write');
