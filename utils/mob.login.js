import { checkmodel } from "./checker.js";
import { dbClient } from "./common.database.js";
import { add_verification_token, signCookie } from "./common.login.js";
import { config } from "./common.js";
import { mobLoginModel } from "./model.login.js";

export async function mobSignup(data) {
  if (!checkmodel(config.user_model, data)) return 400;
  let keys = Object.keys(config.user_model);
  let { rows } = await dbClient.execute(
    `INSERT INTO zuth_users (${keys.join(",")}) VALUES (${keys
      .map((e, i) => `$${i + 1}`)
      .join(",")}) RETURNING id`,
    keys.map((e) => data[e])
  );

  return rows[0];
}

export async function mobLogin(data) {
  if (!checkmodel(mobLoginModel, data)) return 400;
  if (!data.code) {
    let { rows } = await dbClient.execute(
      `SELECT id FROM zuth_users WHERE mobile = $1 LIMIT 1`,
      [data.mobile]
    );
    if (rows.length > 0) {
      let code = new Array(6)
        .fill(0)
        .map((e) => Math.abs(Math.floor(Math.random() * 9)))
        .join("");
      add_verification_token(code, rows[0].id);
      config.sendVerification(data.mobile, code);
      return 200;
    } else return 404;
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
    return signCookie(rows[0].id);

  return 404;
}
