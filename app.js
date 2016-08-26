'use strict';

const rds = require('./lib/rds');

module.exports = app => {
    if (app.config.rds.app) rds(app);
};
