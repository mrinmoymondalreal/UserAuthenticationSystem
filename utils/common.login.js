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
    `SELECT ${config.coloumn_in_jwt.join(",")} FROM zuth_users WHERE id = $1`,
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

export async function verifyUser(data) {
  if (data.type == "mobile") {
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
      return 200;
  }

  if (data.type == "email") {
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
      return 200;
  }

  return 404;
}
