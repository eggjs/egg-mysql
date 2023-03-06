import type { Application, IBoot } from 'egg';
import { initPlugin } from './lib/mysql';

export default class AppBootHook implements IBoot {
  private readonly app: Application;
  constructor(app: Application) {
    this.app = app;
  }

  configDidLoad() {
    if (this.app.config.mysql.app) {
      initPlugin(this.app);
    }
  }
}
