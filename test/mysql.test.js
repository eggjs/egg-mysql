'use strict';

/**
 * Module dependencies.
 */

const should = require('should');
const request = require('supertest');
const mm = require('egg-mock');
const utility = require('utility');
const path = require('path');
const fs = require('fs');

describe('test/mysql.test.js', () => {
  let app;
  const uid = utility.randomString();

  before(function* () {
    app = mm.app({
      baseDir: 'apps/mysqlapp',
      plugin: 'mysql',
    });
    yield app.ready();

    should.exist(app.mysql);
  });

  beforeEach(function* () {
    // 先初始化测试数据，避免为空
    try {
      yield app.mysql.query(`insert into npm_auth set user_id = 'egg-${uid}-1', password = '1'`);
      yield app.mysql.query(`insert into npm_auth set user_id = 'egg-${uid}-2', password = '2'`);
      yield app.mysql.query(`insert into npm_auth set user_id = 'egg-${uid}-3', password = '3'`);
      yield app.mysql.queryOne(`select * from npm_auth where user_id = 'egg-${uid}-3'`);
    } catch (err) {
      console.log(err);
    }
  });

  afterEach(function* () {
    // 清空测试数据
    yield app.mysql.query(`delete from npm_auth where user_id like 'egg-${uid}%'`);
  });

  after(done => {
    app.mysql.end(done);
  });

  afterEach(mm.restore);

  it('should query mysql user table success', done => {
    request(app.callback())
    .get('/')
    .expect(200, done);
  });

  it('should query limit 2', function* () {
    const users = yield app.mysql.query('select * from npm_auth order by id desc limit 2');
    users.should.be.an.Array;
    users.should.length(2);

    const rows = yield app.mysql.select('npm_auth', {
      orders: [[ 'id', 'desc' ]],
      limit: 2,
    });
    rows.should.length(2);
    rows[0].should.eql(users[0]);
    rows[1].should.eql(users[1]);
  });

  it('should update successfully', function* () {
    const user = yield app.mysql.queryOne('select * from npm_auth order by id desc limit 10');
    const result = yield app.mysql.update('npm_auth', { id: user.id, user_id: `79744-${uid}-update` });
    result.affectedRows.should.eql(1);
  });

  it('should delete successfully', function* () {
    const user = yield app.mysql.queryOne('select * from npm_auth order by id desc limit 10');
    const result = yield app.mysql.delete('npm_auth', { id: user.id });
    result.affectedRows.should.eql(1);
  });

  it('should query one success', function* () {
    const user = yield app.mysql.queryOne('select * from npm_auth order by id desc limit 10');
    should.exist(user);
    user.user_id.should.be.a.String;

    const row = yield app.mysql.get('npm_auth', { user_id: user.user_id });
    row.id.should.equal(user.id);
  });

  it('should query one not exists return null', function* () {
    let user = yield app.mysql.queryOne('select * from npm_auth where id = -1');
    should.not.exist(user);

    user = yield app.mysql.get('npm_auth', { id: -1 });
    should.not.exist(user);
  });

  it('should escape value', () => {
    const val = app.mysql.escape('\'"?><=!@#');
    val.should.equal('\'\\\'\\"?><=!@#\'');
  });

  it('should agent error when password wrong on multi clients', done => {
    mm(process.env, 'EGG_LOG', 'NONE');
    const app = mm.app({
      baseDir: 'apps/mysqlapp-multi-client-wrong',
      plugin: 'mysql',
    });
    app.ready(() => {
      throw new Error('should not run this');
    });
    app.agent.on('error', err => {
      if (err.message.indexOf('ER_ACCESS_DENIED_ERROR') !== -1) {
        done();
      }
    });
  });

  it('should agent.mysql work', done => {
    const app = mm.cluster({
      baseDir: 'apps/mysqlapp',
      plugin: 'mysql',
    });
    app.ready(() => {
      app.close();
      const result = fs.readFileSync(path.join(__dirname, './fixtures/apps/mysqlapp/run/agent_result.json'), 'utf8');
      result.should.match(/\[\{"currentTime":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"\}\]/);
      done();
    });
  });

  it('should disable app work', done => {
    const app = mm.app({
      baseDir: 'apps/mysqlapp-disable',
      plugin: 'mysql',
    });
    app.ready(() => {
      should.not.exist(app.mysql);
      done();
    });
  });

  it('should queryOne work on transaction', function* () {
    const result = yield app.mysql.beginTransactionScope(function* (conn) {
      const row = yield conn.queryOne('select * from npm_auth order by id desc limit 10');
      return { row };
    }, {});
    should.exist(result.row);
    result.row.user_id.should.be.a.String;
    result.row.password.should.equal('3');
  });

  describe('newConfig', () => {
    let app;
    before(done => {
      app = mm.cluster({
        baseDir: 'apps/mysqlapp-new',
        plugin: 'mysql',
      });
      app.ready(done);
    });

    after(() => {
      app.close();
    });

    it('should new config agent.mysql work', done => {
      app.ready(() => {
        const result = fs.readFileSync(path.join(__dirname, './fixtures/apps/mysqlapp-new/run/agent_result.json'), 'utf8');
        result.should.match(/\[\{"currentTime":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"\}\]/);
        done();
      });
    });

    it('should query mysql user table success', done => {
      request(app.callback())
      .get('/')
      .expect(200, done);
    });
  });

  describe('createInstance', () => {
    let app;
    before(done => {
      app = mm.cluster({
        baseDir: 'apps/mysqlapp-dynamic',
        plugin: 'mysql',
      });
      app.ready(done);
    });

    after(() => {
      app.close();
    });

    it('should new config agent.mysql work', done => {
      app.ready(() => {
        const result = fs.readFileSync(path.join(__dirname, './fixtures/apps/mysqlapp-dynamic/run/agent_result.json'), 'utf8');
        result.should.match(/\[\{"currentTime":"\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z"\}\]/);
        done();
      });
    });

    it('should query mysql user table success', done => {
      request(app.callback())
      .get('/')
      .expect(200, done);
    });
  });
});
