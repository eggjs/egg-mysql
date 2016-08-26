'use strict';

const assert = require('assert');
const RDS = require('ali-rds');

module.exports = app => {
  app.addSingoneTon('rds', (config, app) => {
    config = Object.assign({}, config);
    /* todo
    if (config.cluster) {
      return rds(config);
    }*/
    return RDS(config);
  });
};
