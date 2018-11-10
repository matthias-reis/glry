const chalk = require('chalk');

const t0 = Date.now();

const doLog = (str, isErr = false) =>
  console.log(
    chalk.grey(`[${((Date.now() - t0) / 1000).toFixed(3)} s] `),
    isErr ? chalk.red('[err] ') : chalk.green('[inf] '),
    str
  );

module.exports = {
  log: doLog,
  err: str => doLog(str, true),
};
