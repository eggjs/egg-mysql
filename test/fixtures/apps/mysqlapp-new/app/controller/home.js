'use strict';

module.exports = function* () {
  const users = yield this.service.user.list(this);

  this.body = {
    status: 'success',
    users: users,
  };
};
