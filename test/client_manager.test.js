'use strict';

/**
 * Module dependencies.
 */

const pedding = require('pedding');
const request = require('supertest');
const mm = require('egg-mock');

describe('test/multiclient.test.js', () => {
  describe('old config', () => {
    let app;
    before(done => {
      app = mm.app({
        baseDir: 'apps/mysqlapp-multi-client',
        plugin: 'mysql',
      });
      app.ready(done);
    });

    it('should multi client work', done => {
      request(app.callback())
      .get('/')
      .expect({
        hasRows: true,
      })
      .expect(200, done);
    });

    it('should close all mysql client work', done => {
      done = pedding(Object.keys(app.config.mysql.clients).length, done);
      for (const key in app.config.mysql.clients) {
        app.mysqls.end(key, done);
      }
      app.mysqls.end({ host: 'not exists host' });
      app.mysqls.end('db1');
    });
  });

  describe('new config', () => {
    let app;
    before(done => {
      app = mm.app({
        baseDir: 'apps/mysqlapp-multi-client-new',
        plugin: 'mysql',
      });
      app.ready(done);
    });

    it('should multi client work', done => {
      request(app.callback())
      .get('/')
      .expect({
        hasRows: true,
      })
      .expect(200, done);
    });

    it('should close all mysql client work', done => {
      done = pedding(Object.keys(app.config.mysql.clients).length, done);
      for (const key in app.config.mysql.clients) {
        app.mysqls.end(key, done);
      }
      app.mysqls.end({ host: 'not exists host' });
      app.mysqls.end('db1');
    });
  });
});
