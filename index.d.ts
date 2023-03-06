import type { RDSClient } from 'ali-rds';

type EggMySQL = RDSClient;

interface EggMySQLClientOption {
  /// host e.g. 'mysql.com'
  host: string;
  /// port e.g. '3306'
  port: string;
  /// username e.g. 'test_user'
  user: string;
  // password e.g. 'test_password'
  password: string;
  // database e.g. 'test'
  database: string;
}

interface EggMySQLClientsOption {
  [clientName: string]: EggMySQLClientOption;
}

interface EggMySqlConfig {
  default?: object;
  app?: boolean;
  agent?: boolean;
  client?: EggMySQLClientOption;
  clients?: EggMySQLClientsOption;
}

declare module 'egg' {
  interface Application {
    mysql: EggMySQL;
    mysqls: {
      get(clientId: string): EggMySQL;
    };
  }

  interface EggAppConfig {
    mysql: EggMySqlConfig;
  }
}
