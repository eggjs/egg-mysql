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
  ],
  exclude: [
    './test/fixtures',
  ],
}
