'use strict';

const rds = require('./lib/rds');

module.exports = agent => {
  if (agent.config.rds.agent) rds(agent);
};
