'use strict';

exports.rds = {
  host: 'your-rds-address.mysql.rds.aliyuncs.com',
  port: 3306,
  user: 'your-username',
  password: 'your-password',
  database: 'your-database-name',

  // optional params
  // The charset for the connection.
  // This is called "collation" in the SQL-level of MySQL (like utf8_general_ci).
  // If a SQL-level charset is specified (like utf8mb4)
  // then the default collation for that charset is used. (Default: 'UTF8_GENERAL_CI')
  // charset: 'utf8_general_ci',
  //
  // The maximum number of connections to create at once. (Default: 10)
  // connectionLimit: 10,
  //
  // The maximum number of connection requests the pool will queue
  // before returning an error from getConnection.
  // If set to 0, there is no limit to the number of queued connection requests. (Default: 0)
  // queueLimit: 0,
};
