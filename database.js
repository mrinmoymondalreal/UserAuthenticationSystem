import pg from "pg";
import { config } from "./utils/common.js";
import { checkmodel } from "./utils/checker.js";
import { user_model } from "./utils/user.js";
let { Pool } = pg;

function DatabaseClient(config) {
  this.pool = new Pool(config);
  return this;
}

DatabaseClient.prototype.execute = function (...query) {
  return this.pool.query(...query);
};

DatabaseClient.prototype.getClient = async function () {
  return await this.pool.connect();
};

let dbClient = new DatabaseClient({
  connectionString: "postgres://postgres:mrinmoymondal@localhost:5432/zuthauth",
});

function singup(data) {
  let method = config.method;
  switch (data.type) {
    case "mobile":
      if ((method = "mobile")) return;
      return mobSignup(data);
    case "email":
      if (method == "email") return;
      break;
    case "magiclink":
      if (method == "magiclink") return;
      break;
  }
}

async function mobSignup(data) {
  if (!checkmodel(user_model, data)) return false;
  let keys = Object.keys(user_model);
  let { rows } = await dbClient.execute(
    `INSERT INTO zuth_users (${keys.join(",")}) VALUES (${keys
      .map((e, i) => `$${i + 1}`)
      .join(",")}) RETURNING id, mobile`,
    keys.map((e) => data[e])
  );

  let code = new Array(6)
    .fill(0)
    .map((e) => Math.abs(Math.floor(Math.random(9))))
    .join("");
  add_verification_token(code, rows.id);
  config.sendverification["mobile"](mobile, code);

  return rows[0];
}

async function add_verification_token(code, identifier) {
  return (
    await dbClient.execute(
      `INSERT INTO tokens (token, identifier) VALUES ($1, $2) RETURNING id`,
      [code, identifier]
    )
  ).rows[0].id;
}

mobSignup({
  email: "mrinmoymondal@gmail.com",
  username: "mrinmoymondal",
  mobile: "7428247500",
  name: "mrinmoymondal",
}).then(console.log);
