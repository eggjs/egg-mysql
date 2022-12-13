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
type EggContext = any;

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

type EggMySQLSelectResult = object[];
type EggMySQLGetResult = object;
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

type EggMySQLInsertResult = EggMySQLUpdateResult;

declare namespace EggMySQLLiterals {
  /**
   * NOW(): The database system time, you can obtain by app.mysql.literals.now.
   */
  const now: string;
  /**
   * Custom literal
   * @example
   * const Literal = app.mysql.literals.Literal;
   * await app.mysql.insert(table, {
   *   id: 123,
   *   fullname: new Literal(`CONCAT("${first}", "${last}"`),
   * });
   */
  class Literal {
    constructor(pattern: string);
  }
}

interface EggMySQL {
  literals: typeof EggMySQLLiterals;
  /**
   * returns mysql client instance.
   */
  get(dbName: string): EggMySQL;
  /**
   * get a single object from database table.
   * @param table tableName
   * @param where Condition
   * @example
   * const post = await app.mysql.get('posts', { id: 12 });
   */
  get(table: string, where?: object): Promise<EggMySQLGetResult>;
  /**
   * execute sql query
   * @example
   * query('update posts set hits = (hits + ?) where id = ?', [1, postId])
   */
  query: (
    sql: string,
    values?: any[]
  ) => Promise<
    EggMySQLSelectResult | EggMySQLUpdateResult | EggMySQLInsertResult
  >;
  /**
   * create object into table
   */
  create: (table: string, values: object) => Promise<EggMySQLUpdateResult>;
  /**
   * update object of table
   */
  update: (
    table: string,
    values: object,
    condition?: EggMySQLCondition
  ) => Promise<EggMySQLUpdateResult>;
  /**
   * delete objects from table
   */
  delete: (table: string, values: object) => Promise<EggMySQLUpdateResult>;
  /**
   * insert object into table
   */
  insert: (table: string, values: object) => Promise<EggMySQLInsertResult>;
  /**
   * select objects from table
   */
  select: (
    table: string,
    condition?: EggMySQLCondition
  ) => Promise<EggMySQLSelectResult>;
  /**
   * begin a transaction
   */
  beginTransaction: () => Promise<EggMySQLTransation>;
  /**
   * begin a scoped transaction
   */
  beginTransactionScope: (
    codeBlock: (conn: EggMySQLTransation) => Promise<object>,
    ctx: EggContext
  ) => Promise<EggMySQLTransation>;
}

interface EggMySQLTransation extends Omit<EggMySQL, "beginTransaction"> {
  /**
   * Commit this transaction.
   */
  commit: () => Promise<void>;
  /**
   * Rollback this transaction.
   */
  rollback: () => Promise<void>;
  /**
   * Whether this transaction has been commited.
   */
  readonly isCommit: boolean;
  /**
   * Whether this transaction has been rolled back.
   */
  readonly isRollback: boolean;
  /**
   * Get current mysql session's thread id.
   */
  readonly threadId: number;
  /**
   * Get current state.
   * @example
   * conn.state // e.g. "authenticated"
   */
  readonly state: string;
  /**
   * Get current config.
   */
  readonly config?: object;
}

declare module "egg" {
  interface Application {
    mysql: EggMySQL & Singleton<EggMySQL>;
  }

  interface EggAppConfig {
    mysql: EggMySqlConfig;
  }
}
