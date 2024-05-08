import { checkmodel } from "./checker.js";
import { magicLoginModel } from "./model.login.js";
import { user_model } from "./user.js";
import { dbClient } from "./common.database.js";
import { add_verification_token, signCookie } from "./common.login.js";
import { config } from "./common.js";

export async function magicSignup(data) {
  if (!checkmodel(user_model, data)) return;
  let keys = Object.keys(user_model);
  let { rows } = await dbClient.execute(
    `INSERT INTO zuth_users (${keys.join(",")}) VALUES (${keys
      .map((e, i) => `$${i + 1}`)
      .join(",")}) RETURNING id, mobile`,
    keys.map((e) => data[e])
  );

  return rows[0];
}

export async function magicLogin(data) {
  if (!checkmodel(magicLoginModel, data)) return;
  if (!data.code) {
    let { rows } = await dbClient.execute(
      `SELECT id FROM zuth_users WHERE email = $1 LIMIT 1`,
      [data.email]
    );
    if (rows.length > 0) {
      let code = new Array(6)
        .fill(0)
        .map((e) => Math.abs(Math.floor(Math.random() * 9)))
        .join("");
      add_verification_token(code, rows[0].id);
      config.sendVerification(data.email, code);
      return true;
    } else return;
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
    return signCookie(rows[0].id);

  return;
}
