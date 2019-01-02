'use strict';

const assert = require('assert');
const request = require('supertest');
const mm = require('egg-mock');
const utility = require('utility');
const path = require('path');
const fs = require('fs');

describe('test/mysql.test.js', () => {
  let app;
  const uid = utility.randomString();

  before(() => {
    app = mm.app({
      baseDir: 'apps/mysqlapp',
    });
    return app.ready();
  });

  beforeEach(function* () {
    // init test datas
    try {
      yield app.mysql.query(`insert into npm_auth set user_id = 'egg-${uid}-1', password = '1'`);
      yield app.mysql.query(`insert into npm_auth set user_id = 'egg-${uid}-2', password = '2'`);
      yield app.mysql.query(`insert into npm_auth set user_id = 'egg-${uid}-3', password = '3'`);
      yield app.mysql.queryOne(`select * from npm_auth where user_id = 'egg-${uid}-3'`);
    } catch (err) {
      console.log('init test datas error: %s', err);
    }
  });

  afterEach(function* () {
    // 清空测试数据
    yield app.mysql.query(`delete from npm_auth where user_id like 'egg-${uid}%'`);
  });

  after(done => {
    app.mysql.end(err => {
      app.close();
      done(err);
    });
  });

  afterEach(mm.restore);

  it('should query mysql user table success', () => {
    return request(app.callback())
      .get('/')
      .expect(200);
  });

  it('should query limit 2', function* () {
    const users = yield app.mysql.query('select * from npm_auth order by id desc limit 2');
    assert(users.length === 2);

    const rows = yield app.mysql.select('npm_auth', {
      orders: [[ 'id', 'desc' ]],
      limit: 2,
    });
    assert(rows.length === 2);
    assert.deepEqual(rows[0], users[0]);
    assert.deepEqual(rows[1], users[1]);
  });

  it('should update successfully', function* () {
    const user = yield app.mysql.queryOne('select * from npm_auth order by id desc limit 10');
    const result = yield app.mysql.update('npm_auth', { id: user.id, user_id: `79744-${uid}-update` });
    assert(result.affectedRows === 1);
  });

  it('should delete successfully', function* () {
    const user = yield app.mysql.queryOne('select * from npm_auth order by id desc limit 10');
    const result = yield app.mysql.delete('npm_auth', { id: user.id });
    assert(result.affectedRows === 1);
  });

  it('should query one success', function* () {
    const user = yield app.mysql.queryOne('select * from npm_auth order by id desc limit 10');
    assert(user);
    assert(typeof user.user_id === 'string' && user.user_id);

    const row = yield app.mysql.get('npm_auth', { user_id: user.user_id });
    assert(row.id === user.id);
  });

  it('should query one desc is NULL success', function* () {
    const user = yield app.mysql.queryOne('select * from npm_auth where `desc` is NULL');
    assert(user);
    assert(typeof user.user_id === 'string' && user.user_id);

    const row = yield app.mysql.get('npm_auth', { desc: null });
    assert(row.id === user.id);
  });

  it('should query one not exists return null', function* () {
    let user = yield app.mysql.queryOne('select * from npm_auth where id = -1');
    assert(!user);

    user = yield app.mysql.get('npm_auth', { id: -1 });
    assert(!user);
  });

  it('should escape value', () => {
    const val = app.mysql.escape('\'"?><=!@#');
    assert(val === '\'\\\'\\"?><=!@#\'');
  });

  it('should agent error when password wrong on multi clients', done => {
    const app = mm.app({
      baseDir: 'apps/mysqlapp-multi-client-wrong',
    });
    app.ready(err => {
      assert(err.message.includes('ER_ACCESS_DENIED_ERROR'));
      done();
    });
  });

  it('should queryOne work on transaction', function* () {
    const result = yield app.mysql.beginTransactionScope(function* (conn) {
      const row = yield conn.queryOne('select * from npm_auth order by id desc limit 10');
      return { row };
    }, {});
    assert(result.row);
    assert(result.row.user_id && typeof result.row.user_id === 'string');
    assert(result.row.password === '3');
  });

  describe('config.mysql.agent = true', () => {
    let app;
    before(() => {
      app = mm.cluster({
        baseDir: 'apps/mysqlapp',
        plugin: 'mysql',
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
        plugin: 'mysql',
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
        plugin: 'mysql',
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
      return request(app.callback())
        .get('/')
        .expect(200);
    });
  });

  describe('createInstance', () => {
    let app;
    before(() => {
      app = mm.cluster({
        baseDir: 'apps/mysqlapp-dynamic',
        plugin: 'mysql',
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
      return request(app.callback())
        .get('/')
        .expect(200);
    });
  });
});
