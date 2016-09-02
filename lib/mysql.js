'use strict';

const assert = require('assert');
const rds = require('ali-rds');
const co = require('co');

let count = 0;

module.exports = function(app) {
  app.addSingleton('mysql', createMysql);
};

function createMysql(config, app) {
  const index = count++;
  const done = app.readyCallback(`createMysql-${index}`);
  app.coreLogger.info('[egg-mysql] connecting %s@%s:%s/%s',
    config.user, config.host, config.port, config.database);
  assert(config.host && config.port && config.user && config.database,
    `[egg-mysql] 'host: ${config.host}', 'port: ${config.port}', 'user: ${config.user}', 'database: ${config.database}' are required on config`);

  const client = rds(config);
  client._superQuery = client.query;
  client.query = function* () {
    const sql = this.format.apply(this, arguments);
    const ins = app.instrument('rds', sql);
    const result = yield this._superQuery.apply(this, arguments);
    ins.end();
    return result;
  };

  co(function* () {
    const rows = yield client.query('select now() as currentTime;');
    app.coreLogger.info(`[egg-mysql] instance[${index}] status OK, rds currentTime: ${rows[0].currentTime}`);
    done();
  }).catch(err => {
    app.coreLogger.error(err);
    done(err);
  });
  return client;
}
