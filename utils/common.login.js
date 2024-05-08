import { dbClient } from "./common.database.js";
import jwt from "jsonwebtoken";
import { config } from "./common.js";
import { v4 as uuid } from "uuid";

export async function verifytoken(elite, tkn) {
  let user, tmpTkn;
  try {
    user = jwt.verify(tkn, config.token_secert);
    let { exp, iat, ...rest } = user;
    user = rest;
  } catch (err) {
    if (err.name == "TokenExpiredError") {
      user = jwt.decode(tkn);
      let { exp, iat, ...rest } = user;
      user = rest;
      let { rows } = await dbClient.execute(
        `SELECT id as token 
      FROM tokens 
      WHERE tokens.token = $1 AND
      tokens.identifier = $2 AND
      tokens.type = 'elite'`,
        [elite, user.id]
      );

      if (rows.length > 0) {
        tmpTkn = jwt.sign(user, config.token_secert, {
          expiresIn: config.token_expireIn,
        });
      }
    }
  } finally {
    return [user, tmpTkn];
  }
}

export async function add_verification_token(code, identifier) {
  return (
    await dbClient.execute(
      `INSERT INTO tokens (token, identifier) VALUES ($1, $2) RETURNING id`,
      [code, identifier]
    )
  ).rows[0].id;
}

export async function signCookie(id) {
  let { rows } = await dbClient.execute(
    `SELECT * FROM zuth_users WHERE id = $1`,
    [id]
  );
  let user = rows[0];
  Object.assign(user, { id });
  let tmpTkn = jwt.sign(user, config.token_secert, {
    expiresIn: config.token_expireIn,
  });
  let eliteTkn = uuid();
  await dbClient.execute(
    `INSERT INTO tokens(token, identifier, type) VALUES($1, $2, 'elite')`,
    [eliteTkn, id]
  );
  return [eliteTkn, tmpTkn];
}
