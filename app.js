'use strict';

const rds = require('./lib/rds');

module.exports = app => {
  rds(app);
};
