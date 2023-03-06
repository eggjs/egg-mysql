module.exports = async ctx => {
  const users = await ctx.service.user.list(ctx);

  ctx.body = {
    status: 'success',
    users: users,
  };
};
