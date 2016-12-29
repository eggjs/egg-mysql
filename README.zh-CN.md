# egg-mysql

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-mysql.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-mysql
[travis-image]: https://img.shields.io/travis/eggjs/egg-mysql.svg?style=flat-square
[travis-url]: https://travis-ci.org/eggjs/egg-mysql
[codecov-image]: https://img.shields.io/codecov/c/github/eggjs/egg-mysql.svg?style=flat-square
[codecov-url]: https://codecov.io/github/eggjs/egg-mysql?branch=master
[david-image]: https://img.shields.io/david/eggjs/egg-mysql.svg?style=flat-square
[david-url]: https://david-dm.org/eggjs/egg-mysql
[snyk-image]: https://snyk.io/test/npm/egg-mysql/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-mysql
[download-image]: https://img.shields.io/npm/dm/egg-mysql.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-mysql

MySQL 插件是为 egg 提供 MySQL 数据库访问的功能

此插件基于 [ali-rds](https://github.com/ali-sdk/ali-rds) 实现一个简单的配置封装，具体使用方法你还需要阅读 [ali-rds] 的文档。

## 安装

```bash
$ npm i egg-mysql --save
```

## 配置

通过 `config/plugin.js` 配置启动 MySQL 插件:

```js
exports.mysql = {
  enable: true,
  package: 'egg-mysql',
};
```

在 `config/config.${env}.js` 配置各个环境的数据库连接信息：

### 单数据源

```js
exports.mysql = {
  // 单数据库信息配置
  client: {
    // host
    host: 'mysql.com',
    // 端口号
    port: '3306',
    // 用户名
    user: 'test_user',
    // 密码
    password: 'test_password',
    // 数据库名
    database: 'test',    
  },
  // 是否加载到 app 上，默认开启
  app: true,
  // 是否加载到 agent 上，默认关闭
  agent: false,
};
```

使用方式：

```js
app.mysql.query(sql, values); // 单实例可以直接通过 app.mysql 访问
```

### 多数据源

```js
exports.mysql = {
  clients: {
    // clientId, 获取client实例，需要通过 app.mysql.get('clientId') 获取
    db1: {
      // host
      host: 'mysql.com',
      // 端口号
      port: '3306',
      // 用户名
      user: 'test_user',
      // 密码
      password: 'test_password',
      // 数据库名
      database: 'test',
    },
    // ...
  },
  // 所有数据库配置的默认值
  default: {

  },

  // 是否加载到 app 上，默认开启
  app: true,
  // 是否加载到 agent 上，默认关闭
  agent: false,
};
```

使用方式：

```js
const client1 = app.mysql.get('db1');
client1.query(sql, values);

const client2 = app.mysql.get('db2');
client2.query(sql, values);
```

## 扩展

### app.js

#### app.mysql

如果开启了 `config.mysql.app = true`，则会在 app 上注入 [ali-rds] 客户端 的 [Singleton 单例](https://github.com/eggjs/egg/blob/master/lib/core/singleton.js)。

```js
app.mysql.query(sql);
app.mysql.get('db1').query(sql);
```

### agent.js

#### agent.mysql

如果开启了 `config.mysql.agent = true`，则会在 agent 上注入 [ali-rds] 客户端 的 [Singleton 单例](https://github.com/eggjs/egg/blob/master/lib/core/singleton.js)。

```js
agent.mysql.query(sql);
agent.mysql.get('db1').query(sql);
```

## CRUD 使用指南

### Create

```js
// 插入
const result = yield app.mysql.insert('posts', { title: 'Hello World' });
const insertSuccess = result.affectedRows === 1;
```

### Read

```js
// 获得一个
const post = yield app.mysql.get('posts', { id: 12 });
// 查询
const results = yield app.mysql.select('posts',{
  where: { status: 'draft' },
  orders: [['created_at','desc'], ['id','desc']],
  limit: 10,
  offset: 0
});
```

### Update

```js
// 修改数据，将会根据主键 ID 查找，并更新
const row = {
  id: 123,
  name: 'fengmk2',
  otherField: 'other field value',
  modifiedAt: app.mysql.literals.now, // `now()` on db server
};
const result = yield app.mysql.update('posts', row);
const updateSuccess = result.affectedRows === 1;
```

### Delete

```js
const result = yield app.mysql.delete('table-name', {
  name: 'fengmk2'
});
```

## 事务

### 手动控制

- 优点：beginTransaction, commit 或 rollback 都由开发者来完全控制，可以做到非常细粒度的控制。
- 缺点：手写代码比较多，不是每个人都能写好。忘记了捕获异常和 cleanup 都会导致严重 bug。

```js
const conn = yield app.mysql.beginTransaction();

try {
  yield conn.insert(table, row1);
  yield conn.update(table, row2);
  yield conn.commit();
} catch (err) {
  // error, rollback
  yield conn.rollback(); // rollback call won't throw err
  throw err;
}
```

### 自动控制：Transaction with scope

- API：`*beginTransactionScope(scope, ctx)`
  - `scope`: 一个 generatorFunction，在这个函数里面执行这次事务的所有 sql 语句。
  - `ctx`: 当前请求的上下文对象，传入 ctx 可以保证即便在出现事务嵌套的情况下，一次请求中同时只有一个激活状态的事务。
- 优点：使用简单，不容易犯错，就感觉事务不存在的样子。
- 缺点：整个事务要么成功，要么失败，无法做细粒度控制。

```js
const result = yield app.mysql.beginTransactionScope(function* (conn) {
  // don't commit or rollback by yourself
  yield conn.insert(table, row1);
  yield conn.update(table, row2);
  return { success: true };
}, ctx); // ctx 是当前请求的上下文，如果是在 service 文件中，可以从 `this.ctx` 获取到
// if error throw on scope, will auto rollback
```

## 进阶

### 自定义SQL拼接
```js
const results = yield app.mysql.query('update posts set hits = (hits + ?) where id = ?', [1, postId]);
```

### 表达式(Literal)
如果需要调用mysql内置的函数（或表达式），可以使用`Literal`。

#### 内置表达式
- NOW(): 数据库当前系统时间，通过`app.mysql.literals.now`获取。

```js
yield app.mysql.insert(table, {
  create_time: app.mysql.literals.now
});

// INSERT INTO `$table`(`create_time`) VALUES(NOW())
```

#### 自定义表达式
下例展示了如何调用mysql内置的`CONCAT(s1, ...sn)`函数，做字符串拼接。

```js
const Literal = app.mysql.literals.Literal;
const first = 'James';
const last = 'Bond';
yield app.mysql.insert(table, {
  id: 123,
  fullname: new Literal(`CONCAT("${first}", "${last}"`),
});

// INSERT INTO `$table`(`id`, `fullname`) VALUES(123, CONCAT("James", "Bond"))
```

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)


[ali-rds]: https://github.com/ali-sdk/ali-rds
