import fs from "fs";
import { modelMethodMaker } from "./method.maker.js";
import { createTable } from "./table.maker.js";

export function getConfig(model, method, database_url, token_secert) {
  let config = {};
  let user_model = modelMethodMaker(method, model);

  Object.assign(config, {
    user_model,
    method,
    database_url,
    token_secert,
  });

  fs.writeFile(
    "./config.zuth.js",
    "export default " + JSON.stringify(config, null, 2),
    (err) => (err ? console.log(err) : console.log("Done"))
  );

  console.log(JSON.stringify(config, null, 3));
  console.log(createTable(model));
}

getConfig(
  {},
  ["magiclink", "username/password", "mobile"],
  "hello",
  "tokenSecert"
);
