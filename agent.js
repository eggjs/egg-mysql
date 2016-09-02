'use strict';

const mysql = require('./lib/mysql');

module.exports = agent => {
  if (agent.config.mysql.agent) mysql(agent);
};
