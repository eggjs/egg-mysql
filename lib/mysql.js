'use strict';

const assert = require('assert');
const rds = require('ali-rds');

let count = 0;

module.exports = app => {
  app.addSingleton('mysql', createOneClient);
};

function createOneClient(config, app) {
  assert(config.host && config.port && config.user && config.database,
    `[egg-mysql] 'host: ${config.host}', 'port: ${config.port}', 'user: ${config.user}', 'database: ${config.database}' are required on config`);

  app.coreLogger.info('[egg-mysql] connecting %s@%s:%s/%s',
    config.user, config.host, config.port, config.database);
  const client = rds(config);

  app.beforeStart(function* () {
    const rows = yield client.query('select now() as currentTime;');
    const index = count++;
    app.coreLogger.info(`[egg-mysql] instance[${index}] status OK, rds currentTime: ${rows[0].currentTime}`);
  });
  return client;
}
