const { google } = require('googleapis');
const fetch = require('node-fetch');
const { logger } = require('just-task');
const { bold } = require('chalk');

const {
  couchMeta,
  couchGoRaw,
  googleRetrieve,
  couchSetNamespace,
} = require('../lib');
let metaDbHandler;
let rawDbHandler;

const getNextItem = async () => {
  let nextPageToken = await metaDbHandler.get('nextPageToken');
  nextPageToken = nextPageToken ? nextPageToken.nextPageToken : null;

  let isDone = await metaDbHandler.get('retrievedAllPages');
  isDone = isDone ? isDone.retrievedAllPages : false;

  if (!isDone) {
    const res = await googleRetrieve(nextPageToken);

    if (res.error) {
      logger.error(res.error);
      process.exit(1);
    }
    logger.info(
      `Received response: ${bold(
        res.mediaItems ? res.mediaItems.length + ' items' : 'no items'
      )}.`
    );
    const newToken = res.nextPageToken;
    if (newToken) {
      await metaDbHandler.set('nextPageToken', { nextPageToken: newToken });
    } else {
      logger.info('this was the last page ... finished');

      await metaDbHandler.set('retrievedAllPages', { retrievedAllPages: true });
    }
    await rawDbHandler.set(
      `doc_${Date.now()}_${parseInt(Math.random() * 1000000).toString(16)}`,
      res
    );
    await getNextItem();
  }
};

module.exports = async name => {
  couchSetNamespace(name);

  metaDbHandler = couchMeta();
  rawDbHandler = couchGoRaw();

  await getNextItem();
  return;
};
