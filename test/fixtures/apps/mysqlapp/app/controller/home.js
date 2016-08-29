'use strict';

module.exports = function* () {
  console.log(9999);
  const users = yield this.service.user.list(this);

  this.body = {
    status: 'success',
    users: users,
  };
};
