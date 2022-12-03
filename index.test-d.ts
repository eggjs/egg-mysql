import { expectType } from 'tsd';
import { Application } from 'egg';
import '.';

const app = new Application();

expectType<Promise<object>>(app.mysql.get('table', {}));
