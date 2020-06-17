const { couchGo, couchGoRaw, couchSetNamespace } = require('../lib');
const { logger } = require('just-task');
const { bold } = require('chalk');

const getAllRequests = async () => {
  const res = await couchGoRaw().list();
  return res.rows;
};

const delay = t => new Promise(resolve => setTimeout(resolve, t));

module.exports = async name => {
  couchSetNamespace(name);

  let data = await getAllRequests();
  data = data.map(item => item.doc.mediaItems);
  data = [].concat(...data).map(({ filename, id, productUrl }) => ({
    _id: `f_${filename}`,
    filename,
    googleId: id,
    productUrl,
  }));

  logger.info(`retrieved photos: ${bold(data.length)}`);

  data = data.reduce((ret, next) => {
    ret[next._id] = next;
    return ret;
  }, {});

  logger.info(`distinct photo filenames: ${bold(Object.keys(data).length)}`);

  await couchGo().bulkSet(Object.values(data));

  const saved = await couchGo().list();
  logger.info(`saved photo filenames: ${bold(saved.rows.length)}`);
};
