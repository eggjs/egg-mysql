import { expectType } from "tsd";
import { Application } from "egg";
import ".";

const app = new Application();

// Select Result
expectType<EggMySQLSelectResult>([
  {
    id: 1,
    name: "L",
  },
  {
    id: 2,
    name: "N",
  },
]);

// Insert Result
expectType<EggMySQLInsertResult>({
  affectedRows: 1,
  fieldCount: 2,
  insertId: 0,
  serverStatus: 2,
  warningCount: 4,
  message: "",
  protocol41: true,
  changedRows: 0,
});

// Update Result
expectType<EggMySQLUpdateResult>({
  affectedRows: 1,
  fieldCount: 2,
  insertId: 0,
  serverStatus: 2,
  warningCount: 4,
  message: "",
  protocol41: true,
  changedRows: 0,
});

// Get Result
expectType<EggMySQLGetResult>({
  id: 1,
  name: "L",
});

// To test get a row
expectType<Promise<object>>(
  app.mysql.get("table", {
    id: 1,
    age: "18",
  })
);

// To test query
expectType<
  Promise<EggMySQLSelectResult | EggMySQLUpdateResult | EggMySQLInsertResult>
>(app.mysql.query("update posts set hits = (hits + ?) where id = ?", [1, 123]));

// To test select
expectType<Promise<EggMySQLSelectResult>>(
  app.mysql.select("table", {
    where: {
      id: 1,
      age: "18",
    },
    limit: 10,
    orders: [["id", "asc"]],
  })
);

// To test insert
expectType<Promise<EggMySQLInsertResult>>(
  app.mysql.insert("table", {
    id: 1,
    age: "18",
    name: "Sakura",
  })
);

// To test update
expectType<Promise<EggMySQLUpdateResult>>(
  app.mysql.update(
    "table",
    {
      age: "19",
    },
    {
      where: {
        id: 1,
        age: "18",
      },
      limit: 10,
      orders: [["id", "asc"]],
    }
  )
);

// To test create
expectType<Promise<EggMySQLInsertResult>>(
  app.mysql.create("table", {
    age: "19",
  })
);

// To test delete
expectType<Promise<EggMySQLUpdateResult>>(
  app.mysql.delete("table", {
    id: 1,
  })
);

// To test literal.
expectType<string>(app.mysql.literals.now);

// To test customized literal.
expectType<{}>(new app.mysql.literals.Literal(`CONCAT("1", "2"`));
