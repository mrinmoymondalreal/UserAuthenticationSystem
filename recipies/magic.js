const { magic } = require("../database/model.js");
const dbClient = require("../database/index.js");
const { add_verification_token, signCookie } = require("./common.js");
const { config, check, randomIntInRange } = require("../common.js");

async function magicSignup(data) {
  if (!check(magic, data)) return { status: 400 };
  let otherColumns = config.columns.filter((e) => e != "email");
  let { rows } = await dbClient.execute(
    `INSERT INTO ${config.table}(${otherColumns.join(
      ","
    )},email) VALUES (${otherColumns
      .map((e, i) => `''`)
      .join(",")},$1) RETURNING id`,
    [data.email]
  );

  return rows[0].id;
}

async function magicLogin(data, isforverify = false) {
  if (!check(magic, data)) return { status: 400 };
  if (!data.code) {
    let { rows } = await dbClient.execute(
      `SELECT id FROM ${config.table} WHERE email = $1 LIMIT 1`,
      [data.email]
    );
    console.log(rows.length);
    if (rows.length == 0 && !isforverify)
      rows = [{ id: await magicSignup(data) }];
    if (rows[0]) {
      let code = crypto.randomUUID();
      add_verification_token(code, rows[0].id);
      config.sendVerification(data.email, code, "emailMagicLink");
      return { status: 200 };
    }
  }

  let { rows } = await dbClient.execute(
    `SELECT ${config.table}.id, tokens.identifier, tokens.expiration_time 
    FROM ${config.table}
    JOIN tokens ON tokens.identifier = ${config.table}.id
    WHERE tokens.token = $1 
    LIMIT 1`,
    [data.code]
  );

  if (
    rows.length > 0 &&
    new Date(rows[0].expiration_time).getTime() - new Date().getTime() > 0
  ) {
    await dbClient.execute(
      `UPDATE ${config.table} SET is_email_verified = true WHERE id = $1`,
      [rows[0].id]
    );
    if (isforverify) return { status: 200 };
    return { status: 200, data: await signCookie(rows[0].id) };
  }

  return { status: 404 };
}

module.exports = magicLogin;
