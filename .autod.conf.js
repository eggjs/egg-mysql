'use strict';

module.exports = {
  write: true,
  prefix: '^',
  test: [
    'test',
    'benchmark',
  ],
  devdep: [
    'egg',
    'egg-bin',
    'egg-ci',
    'autod',
    'eslint',
    'eslint-config-egg',
    'supertest',
  ],
  exclude: [
    './test/fixtures',
  ],
}
