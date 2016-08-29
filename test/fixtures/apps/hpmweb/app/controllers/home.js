'use strict';

module.exports = function* () {
  const rows = yield this.app.mysql.query('show tables');
  this.body = {
    hasRows: rows.length > 0,
  };
};
