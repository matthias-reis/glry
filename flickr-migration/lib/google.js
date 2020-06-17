const { google } = require('googleapis');
const { logger } = require('just-task');
const { bold, red } = require('chalk');

const express = require('express');
const opn = require('opn');
const fetch = require('node-fetch');

const { couchMeta } = require('./couch');

const { client_id, client_secret } = require('./oauth').installed;

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  `http://localhost:3000/return`
);

const scopes = ['https://www.googleapis.com/auth/photoslibrary'];

const accessToken = '';

const getRefreshToken = async () => {
  const doc = await couchMeta().get('refreshToken');
  return doc ? doc.refreshToken : null;
};

const doAuthRequest = async (url, options = {}, accessToken) => {
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`,
  };
  const response = await fetch(url, options);
  const data = await response.json();
  return data;
};

const authenticate = () =>
  new Promise((resolve, reject) => {
    const app = express();

    app.get('/return', async (req, res) => {
      res.set('Content-Type', 'text/html');
      res.end('<script>window.close();</script>');

      const code = req.query.code;
      logger.info(`oauth code retrieved. <${code}>`);

      const { tokens } = await oauth2Client.getToken(code);
      logger.info(`refresh token retrieved. ${bold(tokens.refresh_token)}>`);

      // save refreshToken
      couchMeta().set('refreshToken', {
        refreshToken: tokens.refresh_token,
      });
      resolve(tokens.access_token);
    });

    app.listen(3000, function() {
      logger.info('Waiting for authentication');
    });

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });

    opn(url);
  });

const doRequest = async (url, options) => {
  let res = {};
  if (accessToken) {
    // access token available, do the request immediately
    res = await doAuthRequest(url, options, accessToken);
  } else {
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      // refresh token available, refreah access token then request
      const { tokens } = await oauth2Client.refreshToken(refreshToken);
      res = await doAuthRequest(url, options, tokens.access_token);
    } else {
      // nothing available, login, then request
      const accessToken = await authenticate();
      res = await doAuthRequest(url, options, accessToken);
    }
  }

  return res;
};

const googleRetrieve = async nextPageToken =>
  doRequest(
    `https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=100${
      nextPageToken ? '&pageToken=' + nextPageToken : ''
    }`
  );

const googleCreateAlbum = async title => {
  const body = JSON.stringify({ album: { title } });
  return doRequest(`https://photoslibrary.googleapis.com/v1/albums`, {
    method: 'POST',
    body,
  });
};

const googleAddToAlbum = async (albumId, mediaItemIds) => {
  const body = JSON.stringify({ mediaItemIds });
  const res = await doRequest(
    `https://photoslibrary.googleapis.com/v1/albums/${albumId}:batchAddMediaItems`,
    {
      method: 'POST',
      body,
    }
  );
  if (res.error) {
    logger.error(`Error adding to album: ${red(res.error.message)}`);
  }
};

module.exports = { googleRetrieve, googleCreateAlbum, googleAddToAlbum };
