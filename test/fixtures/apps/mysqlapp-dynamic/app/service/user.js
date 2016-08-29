'use strict';

exports.list = function* (ctx) {
  return yield ctx.app.mysql1.query('select * from npm_auth');
};
