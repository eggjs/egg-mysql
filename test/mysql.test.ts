import { strict as assert } from 'node:assert';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import mm, { MockApplication } from 'egg-mock';
// import types from index.d.ts
import type {} from '..';

describe('test/mysql.test.ts', () => {
  let app: MockApplication;
  const uid = randomUUID();

  before(() => {
    app = mm.app({
      baseDir: 'apps/mysqlapp',
    });
    return app.ready();
  });

  beforeEach(async () => {
    // init test datas
    try {
      await app.mysql.query(`insert into npm_auth set user_id = 'egg-${uid}-1', password = '1'`);
      await app.mysql.query(`insert into npm_auth set user_id = 'egg-${uid}-2', password = '2'`);
      await app.mysql.query(`insert into npm_auth set user_id = 'egg-${uid}-3', password = '3'`);
      await app.mysql.queryOne(`select * from npm_auth where user_id = 'egg-${uid}-3'`);
    } catch (err) {
      console.log('init test datas error: %s', err);
    }
  });

  afterEach(async () => {
    // 清空测试数据
    await app.mysql.query(`delete from npm_auth where user_id like 'egg-${uid}%'`);
  });

  after(async () => {
    await app.mysql.end();
    await app.close();
  });

  afterEach(mm.restore);

  it('should query mysql user table success', () => {
    return app.httpRequest()
      .get('/')
      .expect(200);
  });

  it('should query limit 2', async () => {
    const users = await app.mysql.query('select * from npm_auth order by id desc limit 2');
    assert(users.length === 2);

    const rows = await app.mysql.select('npm_auth', {
      orders: [[ 'id', 'desc' ]],
      limit: 2,
    });
    assert(rows.length === 2);
    assert.deepEqual(rows[0], users[0]);
    assert.deepEqual(rows[1], users[1]);
  });

  it('should update successfully', async () => {
    const user = await app.mysql.queryOne('select * from npm_auth order by id desc limit 10');
    const result = await app.mysql.update('npm_auth', { id: user.id, user_id: `79744-${uid}-update` });
    assert(result.affectedRows === 1);
  });

  it('should delete successfully', async () => {
    const user = await app.mysql.queryOne('select * from npm_auth order by id desc limit 10');
    const result = await app.mysql.delete('npm_auth', { id: user.id });
    assert(result.affectedRows === 1);
  });

  it('should query one success', async () => {
    const user = await app.mysql.queryOne('select * from npm_auth order by id desc limit 10');
    assert(user);
    assert(typeof user.user_id === 'string' && user.user_id);

    const row = await app.mysql.get('npm_auth', { user_id: user.user_id });
    assert(row.id === user.id);
  });

  it('should query one desc is NULL success', async () => {
    const user = await app.mysql.queryOne('select * from npm_auth where `desc` is NULL');
    assert(user);
    assert(typeof user.user_id === 'string' && user.user_id);

    const row = await app.mysql.get('npm_auth', { desc: null });
    assert(row.id === user.id);
  });

  it('should query with literal in where conditions', async () => {
    const user = await app.mysql.queryOne('select * from npm_auth where `password` is not NULL');
    assert(user);
    assert(typeof user.user_id === 'string' && user.user_id);

    const row = await app.mysql.get('npm_auth', { password: new app.mysql.literals.Literal('is not NULL') });
    assert(row.id === user.id);
  });

  it('should query one not exists return null', async () => {
    let user = await app.mysql.queryOne('select * from npm_auth where id = -1');
    assert(!user);

    user = await app.mysql.get('npm_auth', { id: -1 });
    assert(!user);
  });

  it('should escape value', () => {
    const val = app.mysql.escape('\'"?><=!@#');
    assert(val === '\'\\\'\\"?><=!@#\'');
  });

  it('should agent error when password wrong on multi clients', async () => {
    const app = mm.app({
      baseDir: 'apps/mysqlapp-multi-client-wrong',
    });
    await assert.rejects(async () => {
      await app.ready();
    }, (err: Error) => {
      assert.match(err.message, /ER_ACCESS_DENIED_ERROR/);
      return true;
    });
  });

  it('should queryOne work on transaction', async () => {
    const result = await app.mysql.beginTransactionScope(async conn => {
      const row = await conn.queryOne('select * from npm_auth order by id desc limit 10');
      return { row };
    });
    assert(result.row);
    assert(result.row.user_id && typeof result.row.user_id === 'string');
    assert(result.row.password === '3');
  });

  describe('config.mysql.agent = true', () => {
    let app;
    before(() => {
      app = mm.cluster({
        baseDir: 'apps/mysqlapp',
      });
      return app.ready();
    });
    after(() => app.close());

    it('should agent.mysql work', () => {
      const result = fs.readFileSync(path.join(__dirname,
        './fixtures/apps/mysqlapp/run/agent_result.json'), 'utf8');
      assert(/\[\{"currentTime":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"\}\]/.test(result));
    });
  });

  describe('config.mysql.app = false', () => {
    let app;
    before(() => {
      app = mm.app({
        baseDir: 'apps/mysqlapp-disable',
      });
      return app.ready();
    });
    after(() => app.close());

    it('should disable app work', () => {
      assert(!app.mysql);
    });
  });

  describe('newConfig', () => {
    let app;
    before(() => {
      app = mm.cluster({
        baseDir: 'apps/mysqlapp-new',
      });
      return app.ready();
    });

    after(() => app.close());

    it('should new config agent.mysql work', () => {
      const result = fs.readFileSync(path.join(__dirname,
        './fixtures/apps/mysqlapp-new/run/agent_result.json'), 'utf8');
      assert(/\[\{"currentTime":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"\}\]/.test(result));
    });

    it('should query mysql user table success', () => {
      return app.httpRequest()
        .get('/')
        .expect(200);
    });
  });

  describe('createInstance', () => {
    let app;
    before(() => {
      app = mm.cluster({
        baseDir: 'apps/mysqlapp-dynamic',
      });
      return app.ready();
    });

    after(() => app.close());

    it('should new config agent.mysql work', () => {
      const result = fs.readFileSync(path.join(__dirname,
        './fixtures/apps/mysqlapp-dynamic/run/agent_result.json'), 'utf8');
      assert(/\[\{"currentTime":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"\}\]/.test(result));
    });

    it('should query mysql user table success', () => {
      return app.httpRequest()
        .get('/')
        .expect(200);
    });
  });
});
