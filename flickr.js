const fetch = require('node-fetch');
const { log, err } = require('./log');
const blacklist = require('./blacklist');
const { get, flattenDeep } = require('lodash');

const apiKey = '09cf08983f8f2c5e24f90d9fd616af24';
const userId = '99929697%40N07';

const request = async params => {
  const allParams = {
    ...params,
    api_key: apiKey,
    user_id: userId,
    format: 'json',
    nojsoncallback: 1,
  };
  const url =
    'https://api.flickr.com/services/rest/?' +
    Object.entries(allParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

  log(`FLICKR requesting url <${url}>`);
  const t0 = Date.now();
  const result = await fetch(url);
  log(`FLICKR request took <${Date.now() - t0} ms>`);
  const obj = await result.json();

  return obj;
};

const preFlatten = (collection, basePath = '') =>
  collection &&
  collection.map(({ title, id, set, collection }) => {
    const flatSet = preFlatten(set, `${title} > `) || [];
    const flatCollection = preFlatten(collection, `${title} > `) || [];
    return [
      { slug: `${basePath}${title}`, title, id },
      ...flatSet,
      ...flatCollection,
    ];
  });

const getAlbums = async () => {
  log('FLICKR: requesting albums');
  const result = await request({
    method: 'flickr.collections.getTree',
  });

  const collection = get(result, ['collections', 'collection']);
  const preFlattened = preFlatten(collection);
  const flattened = flattenDeep(preFlattened);

  return flattened;
};

const getPhotosOfAlbum = async collection_id => {
  const result = await request({
    method: 'flickr.collections.getInfo',
    collection_id,
  });

  return result;
};

const filterBlacklist = albums =>
  albums.filter(album => !blacklist.includes(album.title));

module.exports = { getAlbums, getPhotosOfAlbum, filterBlacklist };
