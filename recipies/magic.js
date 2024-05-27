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

async function magicLogin(data) {
  if (!check(magic, data)) return { status: 400 };
  if (!data.code) {
    let { rows } = await dbClient.execute(
      `SELECT id FROM ${config.table} WHERE email = $1 LIMIT 1`,
      [data.email]
    );
    if (rows.length == 0) rows = [{ id: await magicSignup(data) }];
    let code = randomIntInRange(100000, 999999);
    add_verification_token(code, rows[0].id);
    config.sendVerification(data.email, code);
    return { status: 200 };
  }

  let { rows } = await dbClient.execute(
    `SELECT zuth_users.id, tokens.identifier, tokens.expiration_time 
    FROM zuth_users
    JOIN tokens ON tokens.identifier = zuth_users.id
    WHERE zuth_users.email = $1 AND tokens.token = $2 
    LIMIT 1`,
    [data.email, data.code]
  );

  if (
    rows.length > 0 &&
    new Date(rows[0].expiration_time).getTime() - new Date().getTime() > 0
  )
    return { status: 200, data: await signCookie(rows[0].id) };

  return { status: 404 };
}

magicLogin({ email: "mrinmoymondal09@gmail.com", code: "245210" }).then(
  console.log
);
