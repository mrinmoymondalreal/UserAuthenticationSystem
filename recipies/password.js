const { configDotenv } = require("dotenv");
configDotenv();

const dbClient = require("../database/index.js");
const { signCookie } = require("./common.js");
const { password } = require("../database/model.js");
const bcrypt = require("bcrypt");
const { config, check } = require("../common.js");

async function passwordSignup(data) {
  if (!check(password, data)) return { status: 400 };

  if (
    (
      await dbClient.execute(
        `SELECT id FROM ${config.table} WHERE email = $1`,
        [data.email]
      )
    ).rows.length > 0
  )
    return { status: 409 };

  Object.assign(data, {
    password: await bcrypt.hash(data.password, 10),
  });

  let otherColumns = config.columns.filter(
    (e) => !["email", "password"].includes(e)
  );
  let { rows } = await dbClient.execute(
    `INSERT INTO ${config.table}(${otherColumns.join(
      ","
    )},email,password) VALUES (${otherColumns
      .map(() => `''`)
      .join(",")}, $1, $2) RETURNING id`,
    [data.email, data.password]
  );

  return { status: 200, data: rows[0] };
}

async function passwordLogin(data) {
  if (!check(password, data)) return { status: 400 };

  let { rows } = await dbClient.execute(
    `SELECT id, password
    FROM ${config.table}
    WHERE email = $1
    LIMIT 1`,
    [data.email]
  );

  if (
    rows.length > 0 &&
    (await bcrypt.compare(data.password, rows[0].password))
  )
    return { status: 200, data: await signCookie(rows[0].id) };

  return { status: 404 };
}

module.exports = {
  passwordLogin,
  passwordSignup,
};
