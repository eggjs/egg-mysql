'use strict';

const rds = require('ali-rds');

let count = 0;

module.exports = app => {
  app.addSingleton('mysql', createOneClient);
};

function createOneClient(config, app) {
  app.coreLogger.info('[egg-mysql] connecting %s@%s:%s/%s',
    config.user, config.host, config.port, config.database);
  const client = rds(config);

  app.beforeStart(async () => {
    const rows = await client.query('select now() as currentTime;');
    const index = count++;
    app.coreLogger.info(`[egg-mysql] instance[${index}] status OK, rds currentTime: ${rows[0].currentTime}`);
  });
  return client;
}
