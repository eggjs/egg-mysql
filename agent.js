'use strict';

const rds = require('./lib/rds');

module.exports = agent => {
  rds(agent);
};
