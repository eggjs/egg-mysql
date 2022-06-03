'use strict';

exports.list = async (ctx) => {
  return await Promise.all([
    ctx.app.mysqls.get('db1').query('select * from npm_auth'),
    ctx.app.mysqls.get('db2').query('select * from npm_auth'),
    ctx.app.mysqls.get('db3').query('select * from npm_auth'),
  ]);
};
