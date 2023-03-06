import { expectType } from 'tsd';
import { Application } from 'egg';
import { EggMySQL } from '.';

const app = new Application();

expectType<Promise<any>>(app.mysql.get('table', {}));
expectType<EggMySQL>(app.mysql);
expectType<EggMySQL>(app.mysqls.get('foo'));
