'use strict';

module.exports = function(app) {
  app.mysql1 = app.mysql.createInstance(app.config.mysql1);
};
