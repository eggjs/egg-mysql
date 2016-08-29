'use strict';

const ClientManager = require('./client-manager');

module.exports = function(app) {
  // 兼容老的配置
  const mysqlConfig = app.config.mysql;
  app.config.mysql = compact(mysqlConfig);

  if (app.config.mysql !== mysqlConfig) {
    app.deprecate('[egg-mysql] 配置格式已修改，请尽快查阅 egg-mysql 文档并更新到新版配置格式');
  }
  // 创建 mysql
  const clientManager = new ClientManager(app);
  let count = 0;
  app.addSingleton('mysql', (config, app) => {
    const done = app.readyCallback(`createMysql-${count++}`);
    return clientManager.create(config, done);
  });

  // 兼容老的写法
  if (mysqlConfig.clients) {
    // 增加 end 方法
    app.mysql.end = function(config, callback) {
      callback = callback || function() {};
      const clientId = typeof config === 'string' ? config : getClientId(config);
      const client = app.mysql.get(clientId);
      if (!client) {
        return callback();
      }
      app.mysql.clients.delete(clientId);
      client.end(callback);
    };
    app.mysqls = app.mysql;
  }
};

/**
 * 兼容老的配置写法
 * @param  {Object} originalConfig 原始配置
 * @return {Object}                新版配置
 */
function compact(originalConfig) {
  const config = {
    app: originalConfig.app,
    agent: originalConfig.agent,
  };

  if (Array.isArray(originalConfig.clients)) {
    config.clients = {};
    for (const client of originalConfig.clients) {
      config.clients[getClientId(client)] = client;
    }
    // config.default = originalConfig.default; // 原来配置多实例不支持 default
    return config;
  }

  if (originalConfig.host) {
    config.client = originalConfig;
    config.default = originalConfig.default; // 原来配置单实例有默认值
    delete config.client.default;
    delete config.client.agent;
    delete config.client.app;
    return config;
  }

  return originalConfig;
}

/**
 * 获取 clientId
 * @param  {Object} config 配置对象
 * @return {String}        配置 id
 */
function getClientId(config) {
  return config.clientId || `${config.host}#${config.port}#${config.database}#${config.user}`;
}
