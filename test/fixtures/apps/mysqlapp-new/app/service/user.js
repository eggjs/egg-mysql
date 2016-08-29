'use strict';

exports.list = function* (ctx) {
  return yield ctx.app.mysql.query('select * from npm_auth');
};
