'use strict';

exports.mysql = {
  default: {
    database: null,
    connectionLimit: 5,
  },
  app: true,
  agent: false,

  // Single Database
  // client: {
  //   host: 'host',
  //   port: 'port',
  //   user: 'user',
  //   password: 'password',
  //   database: 'database',
  // },

  // Multi Databases
  // clients: {
  //   db1: {
  //     host: 'host',
  //     port: 'port',
  //     user: 'user',
  //     password: 'password',
  //     database: 'database',
  //   },
  //   db2: {
  //     host: 'host',
  //     port: 'port',
  //     user: 'user',
  //     password: 'password',
  //     database: 'database',
  //   },
  // },
};
