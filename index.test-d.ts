import { expectType } from "tsd";
import { Application } from "egg";
import ".";

const app = new Application();

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
