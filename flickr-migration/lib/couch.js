const nano = require('nano')('http://localhost:5984');
const { logger } = require('just-task');
const { bold } = require('chalk');

const db = dbName => {
  let db;
  const getDb = async () => {
    if (!db) {
      db = await nano.db.use(dbName);
    }
    return db;
  };
  const get = async id => {
    let doc = null;
    try {
      const localDb = await getDb();
      doc = await localDb.get(id);
    } catch (e) {}
    return doc;
  };
  const find = async str => {
    const localDb = await getDb();
    const data = await localDb.find({
      selector: {
        _id: {
          $regex: str,
        },
      },
    });
    return data;
  };
  const set = async (id, doc) => {
    try {
      const localDb = await getDb();
      const existingDoc = await get(id);
      await localDb.insert({ ...existingDoc, ...doc }, id);
    } catch (e) {
      logger.error(`Error saving ${bold(id)} in db ${bold(dbName)}`, e);
    }
  };
  const bulkSet = async docs => {
    try {
      const localDb = await getDb();
      await localDb.bulk({ docs });
    } catch (e) {
      logger.error(
        `Error bulk saving ${docs.length} docs in db ${bold(dbName)}`,
        e
      );
    }
  };
  const list = async () => {
    const localDb = await getDb();
    const data = await localDb.list({ include_docs: true });
    return data;
  };
  return { get, set, bulkSet, list, find };
};

let namespace = '';
module.exports.couchSetNamespace = name => {
  namespace = `gp-${name}`;
  logger.info(`setting namespace to ${bold(namespace)}`);
};

module.exports.couchMeta = () => db(`${namespace}-meta`);
module.exports.couchGoRaw = () => db(`${namespace}-go-raw`);
module.exports.couchGo = () => db(`${namespace}-go`);
module.exports.couchFlRaw = () => db(`${namespace}-fl-raw`);
module.exports.couchFl = () => db(`${namespace}-fl`);
module.exports.couchRefined = () => db(namespace);
