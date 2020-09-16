#!/usr/bin/env node

require = require('esm')(module);

global.approot = require('path').resolve(__dirname, '..');

require('../main').init(process.argv);