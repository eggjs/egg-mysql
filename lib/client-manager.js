'use strict';

const co = require('co');
const rds = require('ali-rds');
const assert = require('assert');

class ClientManager {
  constructor(app) {
    this.app = app;
    this.clients = new Map();
  }

  get(clientId) {
    return this.clients.get(clientId);
  }

  set(clientId, client) {
    this.clients.set(clientId, client);
  }

  create(config, callback) {
    const app = this.app;
    app.coreLogger.info('[rds-client-manager] connecting %s@%s:%s/%s',
      config.user, config.host, config.port, config.database);
    assert(config.host && config.port && config.user && config.database,
      `[rds-client-manager] 'host: ${config.host}', 'port: ${config.port}', 'user: ${config.user}', 'database: ${config.database}' are required on config`);

    const client = rds(config);
    client._superQuery = client.query;
    client.query = function* () {
      // agent 没有 instrument
      if (!app.instrument) {
        return yield this._superQuery.apply(this, arguments);
      }

      const sql = this.format.apply(this, arguments);
      const ins = app.instrument('rds', sql);
      const result = yield this._superQuery.apply(this, arguments);
      ins.end();
      return result;
    };

    const clientId = this.getClientId(config);
    this.set(clientId, client);

    co(function* () {
      const rows = yield client.query('select now() as currentTime;');
      if (rows.length) {
        return rows[0].currentTime;
      }
    }).then(currentTime => {
      app.coreLogger.info(`[rds-client-manager] ${clientId} status OK, rds currentTime: ${currentTime}`);
      callback();
    }).catch(err => {
      app.coreLogger.error(err);
      callback(err);
    });

    return client;
  }

  /**
   * 根据 config 删除对应的 rds client
   * @param {Object|String} config - rds 配置或者是 clientId
   * @param {Function} [callback] - end 回调方法
   * @return {undefined}
   */
  end(config, callback) {
    callback = callback || function() {};
    const clientId = typeof config === 'string' ? config : this.getClientId(config);
    const client = this.get(clientId);
    if (!client) {
      return callback();
    }
    this.clients.delete(clientId);
    client.end(callback);
  }

  getClientId(config) {
    return config.clientId || `${config.host}#${config.port}#${config.database}#${config.user}`;
  }
}

module.exports = ClientManager;
