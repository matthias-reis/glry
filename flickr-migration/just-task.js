const { task, option, logger, argv } = require('just-task');
const { green } = require('chalk');
const fromGoogle = require('./fromGoogle');
const refineGoogle = require('./refineGoogle');
const refineFlickr = require('./refineFlickr');
const combine = require('./combine');
const toGoogle = require('./toGoogle');
const toMarkdown = require('./toMarkdown');

option('name', { default: 'anne' });

task('from-google', async () => {
  logger.info(`${green(argv().name)}: reading data from google ...`);
  await fromGoogle(argv().name);
});

task('refine-google', async () => {
  logger.info(`${green(argv().name)}: refine google data ...`);
  await refineGoogle(argv().name);
});

task('refine-flickr', async () => {
  logger.info(`${green(argv().name)}: refine flickr data ...`);
  await refineFlickr(argv().name);
});

task('combine', async () => {
  logger.info(
    `${green(argv().name)}: bringing flickr and google data together ...`
  );
  await combine(argv().name);
});

task('to-google', async () => {
  logger.info(`${green(argv().name)}: creating new albums on google ...`);
  await toGoogle(argv().name);
});

task('to-markdown', async () => {
  logger.info(
    `${green(argv().name)}: creating a markdown file with all links ...`
  );
  await toMarkdown(argv().name);
});
