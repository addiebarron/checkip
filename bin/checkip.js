#!/usr/bin/env node

require = require('esm')(module);

const resolve = require('path').resolve;
global.approot = resolve(__dirname, '../');

require('../main').init(process.argv);