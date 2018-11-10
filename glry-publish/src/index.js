const glob = require('glob');
const { resolve } = require('path');
const { mkdirSync } = require('fs');
const { tmpdir } = require('os');
const rimraf = require('rimraf');

const { log, err } = require('./log');

const transform = require('./transform');
const upload = require('./upload');

const tmpFolder = resolve(tmpdir(), './glry');

const run = async (glryName, folder) => {
  try {
    mkdirSync(tmpFolder);
    log(`[glry publish] running ...`);
    log(`temp folder <${tmpFolder}>`);

    const files = glob.sync(`${folder}/*.jpg`);
    log(`<${files.length}> files detected`);

    const transformInfo = await transform(files, tmpFolder, glryName);
    log('finished transforming data');

    const uploadInfo = await upload(tmpFolder, glryName);
    log('finished uploading data');
  } catch (e) {
    err(e);
  } finally {
    log('finally');
    rimraf.sync(tmpFolder);
  }
};

module.exports = run;
