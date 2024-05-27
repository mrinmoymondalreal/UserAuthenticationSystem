const jwt = require("jsonwebtoken");
const dbClient = require("../database/index.js");
const { config } = require("../common.js");
const { v4: uuid } = require("uuid");

// done
async function verifytoken(elite, tkn) {
  let user, tmpTkn;
  try {
    user = jwt.verify(tkn, process.env.AUTH_JWT_TOKEN);
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
        tmpTkn = jwt.sign(user, process.env.AUTH_JWT_TOKEN, {
          expiresIn: config.token_expireIn,
        });
      }
    }
  } finally {
    return [user, tmpTkn];
  }
}

// done
async function add_verification_token(code, identifier) {
  return (
    await dbClient.execute(
      `INSERT INTO tokens (token, identifier) VALUES ($1, $2) RETURNING id`,
      [code, identifier]
    )
  ).rows[0].id;
}

// done
async function signCookie(id) {
  let { rows } = await dbClient.execute(
    `SELECT * FROM zuth_users WHERE id = $1`,
    [id]
  );
  let user = rows[0];
  Object.assign(user, { id });
  let tmpTkn = jwt.sign(user, process.env.AUTH_JWT_TOKEN, {
    expiresIn: config.token_expireIn,
  });
  let eliteTkn = uuid();
  await dbClient.execute(
    `INSERT INTO tokens(token, identifier, type) VALUES($1, $2, 'elite')`,
    [eliteTkn, id]
  );
  return [eliteTkn, tmpTkn];
}

// not done
// async function verifyUser(data) {
//   if (data.type == "mobile") {
//     let { rows } = await dbClient.execute(
//       `SELECT zuth_users.id, tokens.identifier, tokens.expiration_time
//       FROM zuth_users
//       JOIN tokens ON tokens.identifier = zuth_users.id
//       WHERE zuth_users.mobile = $1 AND tokens.token = $2
//       LIMIT 1`,
//       [data.mobile, data.code]
//     );

//     if (
//       rows.length > 0 &&
//       new Date(rows[0].expiration_time).getTime() - new Date().getTime() > 0
//     )
//       return 200;
//   }

//   if (data.type == "email") {
//     let { rows } = await dbClient.execute(
//       `SELECT zuth_users.id, tokens.identifier, tokens.expiration_time
//       FROM zuth_users
//       JOIN tokens ON tokens.identifier = zuth_users.id
//       WHERE zuth_users.email = $1 AND tokens.token = $2
//       LIMIT 1`,
//       [data.email, data.code]
//     );

//     if (
//       rows.length > 0 &&
//       new Date(rows[0].expiration_time).getTime() - new Date().getTime() > 0
//     )
//       return 200;
//   }

//   return 404;
// }

// not done
// async function checkConflict(data) {
//   let unique = [];

//   for (let key in config.user_model) {
//     config.user_model[key].isUnique && unique.push(key);
//   }

//   let u1 = unique.map((e, i) => `${e} = $${i + 1}`);

//   let sql = `SELECT ${unique.join(", ")} FROM zuth_users WHERE ${u1.join(
//     " OR "
//   )}`;

//   let d1 = await dbClient.execute(
//     sql,
//     unique.map((e) => data[e])
//   );

//   if (d1.rows.length > 0)
//     return d1.rows
//       .map((e) => Object.keys(e).map((o) => e[o] == data[o] && o))
//       .flat(2)
//       .filter((e) => e);

//   return false;
// }

module.exports = {
  signCookie,
  verifytoken,
  add_verification_token,
};
