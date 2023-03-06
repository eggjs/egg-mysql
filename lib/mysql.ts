import type { Application, Agent } from 'egg';
import { RDSClient } from 'ali-rds';

let count = 0;
function createOneClient(config: Record<string, any>, app: Application | Agent) {
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

export function initPlugin(app: Application | Agent) {
  app.addSingleton('mysql', createOneClient);
  // alias to app.mysqls
  // https://github.com/eggjs/egg/blob/9ad39f59991bd48633b8da4abe1da5eb79a1de62/lib/core/singleton.js#L38
  (app as any).mysqls = (app as any).mysql;
}
