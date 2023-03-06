exports.list = async ctx => {
  return await ctx.app.mysql1.query('select * from npm_auth');
};
