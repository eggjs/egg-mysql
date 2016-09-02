'use strict';

module.exports = {
  write: true,
  prefix: '^',
   test: [
     'test',
     'benchmark',
   ],
  devdep: [
    'egg-bin',
    'autod',
    'eslint',
    'eslint-config-egg',
    'supertest',
    'should',
  ],
  exclude: [
    './test/fixtures',
  ],
}
