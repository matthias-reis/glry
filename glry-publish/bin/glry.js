#!/usr/bin/env node
const run = require('../src');
const { resolve } = require('path');

const [, , glryName, folder] = process.argv;

run(glryName, resolve(process.cwd(), folder));
