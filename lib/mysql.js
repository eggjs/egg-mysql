const RDSClient = require('ali-rds');

let count = 0;

module.exports = app => {
  app.addSingleton('mysql', createOneClient);
};

function createOneClient(config, app) {
  app.coreLogger.info('[egg-mysql] connecting %s@%s:%s/%s',
    config.user, config.host, config.port, config.database);
  const client = new RDSClient(config);

  app.beforeStart(async () => {
    const rows = await client.query('select now() as currentTime;');
    const index = count++;
    app.coreLogger.info('[egg-mysql] instance[%s] status OK, rds currentTime: %s',
      index, rows[0].currentTime);
  });
  return client;
}
