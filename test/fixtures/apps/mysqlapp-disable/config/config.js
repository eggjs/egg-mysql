'use strict';

exports.mysql = {
  host: '127.0.0.1',
  port: 3307,
  user: 'root',
  password: '',
  database: 'test',
  app:false
  // host: env.ALI_SDK_RDS_HOST || 'localhost',
  // port: env.ALI_SDK_RDS_PORT || 3306,
  // user: env.ALI_SDK_RDS_USER || 'root',
  // password: env.ALI_SDK_RDS_PASSWORD || '',
  // database: env.ALI_SDK_RDS_DATABASE || 'test',
};