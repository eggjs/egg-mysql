'use strict';

exports.list = async (ctx) => {
  return await ctx.app.mysql.query('select * from npm_auth');
};
