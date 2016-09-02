'use strict';

const mysql = require('./lib/mysql');

module.exports = app => {
  if (app.config.mysql.app) mysql(app);
};
