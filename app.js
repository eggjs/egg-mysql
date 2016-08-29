'use strict';

const rds = require('./lib/rds');

module.exports = app => {
  if (app.config.mysql.app) rds(app);
};
