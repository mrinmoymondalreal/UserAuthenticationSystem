const dbClient = require("../database/index.js");
const { add_verification_token, signCookie } = require("./common.js");
const { check, config, randomIntInRange } = require("../common.js");
const { mob } = require("../database/model.js");

async function mobSignup(data) {
  if (!check(mob, data)) return { status: 400 };
  let otherColumns = config.columns.filter((e) => e != "mobile");
  let { rows } = await dbClient.execute(
    `INSERT INTO ${config.table}(${otherColumns.join(
      ","
    )},mobile) VALUES (${otherColumns
      .map((e, i) => `''`)
      .join(",")},$1) RETURNING id`,
    [data.mobile]
  );
  return rows[0].id;
}

async function mobLogin(data) {
  if (!check(mob, data)) return { status: 400 };
  if (!data.code) {
    let { rows } = await dbClient.execute(
      `SELECT id FROM ${config.table} WHERE mobile = $1 LIMIT 1`,
      [data.mobile]
    );
    if (rows.length == 0) rows = [{ id: await mobSignup(data) }];
    let code = randomIntInRange(100000, 999999);
    add_verification_token(code, rows[0].id);
    config.sendVerification(data.mobile, code, "mobileVerification");
    return { status: 200 };
  }

  let { rows } = await dbClient.execute(
    `SELECT zuth_users.id, tokens.identifier, tokens.expiration_time
    FROM zuth_users
    JOIN tokens ON tokens.identifier = zuth_users.id
    WHERE zuth_users.mobile = $1 AND tokens.token = $2
    LIMIT 1`,
    [data.mobile, data.code]
  );

  if (
    rows.length > 0 &&
    new Date(rows[0].expiration_time).getTime() - new Date().getTime() > 0
  )
    return { status: 200, data: await signCookie(rows[0].id) };

  return { status: 404 };
}

module.exports = mobLogin;
