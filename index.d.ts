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

type Singleton<T> = {};

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

type EggMySQLInsertResult = object[];
type EggMySQLSelectResult = object[];
interface EggMySQLCondition {
  where?: object;
  orders?: [string, "desc" | "asc" | "DESC" | "ASC"][];
  limit?: number;
  offset?: number;
  [otherCondition: string]: any;
}
interface EggMySQLUpdateResult {
  affectedRows: number;
  fieldCount: number;
  insertId: number;
  serverStatus: number;
  warningCount: number;
  message: string;
  protocol41: boolean;
  changedRows: number;
}

interface EggMySQLLiterals {
  now: number;
  Literal: Function;
}

interface EggMySQL {
  literals: EggMySQLLiterals;
  /// Returns mysql client instance.
  get: (dbName: string) => EggMySQL;
  /// execute sql e.g.
  /// query('update posts set hits = (hits + ?) where id = ?', [1, postId])
  query: (
    sql: string,
    values?: any[]
  ) => Promise<
    EggMySQLSelectResult | EggMySQLUpdateResult | EggMySQLInsertResult
  >;
  /// create object into table
  create: (table: string, values: object) => Promise<EggMySQLUpdateResult>;
  /// update object of table
  update: (table: string, values: object, condition?: EggMySQLCondition) => Promise<EggMySQLUpdateResult>;
  /// delete objects from table
  delete: (table: string, values: object) => Promise<EggMySQLUpdateResult>;
  /// insert object into table
  insert: (table: string, values: object) => Promise<EggMySQLInsertResult>;
  /// select objects from table
  select: (
    table: string,
    condition?: EggMySQLCondition
  ) => Promise<EggMySQLSelectResult>;
  /// begin a transaction
  beginTransaction: () => Promise<EggMySQLTransation>;
  /// begin a scoped transaction
  beginTransactionScope: (
    codeBlock: (conn: EggMySQLTransation) => Promise<object>,
    ctx: object
  ) => Promise<EggMySQLTransation>;
}

interface EggMySQLTransation extends Omit<EggMySQL, "beginTransaction"> {
  commit: () => Promise<void>;
  rollback: () => Promise<void>;
}

declare module "egg" {
  interface Application {
    mysql: EggMySQL & Singleton<EggMySQL>;
  }

  interface EggAppConfig {
    mysql: EggMySqlConfig;
  }
}
