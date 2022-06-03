'use strict';

module.exports = async (ctx) => {
  const dataArr = await ctx.service.user.list(ctx);

  ctx.body = {
    hasRows: dataArr[0].length > 0 && dataArr[1].length > 0 && dataArr[2].length > 0,
  };
};
