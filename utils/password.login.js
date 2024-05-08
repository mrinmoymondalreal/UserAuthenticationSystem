import { user_model } from "./user.js";
import { checkmodel } from "./checker.js";
import { dbClient } from "./common.database.js";
import bcrypt from "bcrypt";
import { add_verification_token, signCookie } from "./common.login.js";
import { config } from "./common.js";
import { passwordLoginModel } from "./model.login.js";

export async function passwordSignup(data) {
  if (!checkmodel(user_model, data)) return false;
  let keys = Object.keys(user_model);

  Object.assign(data, {
    password: await bcrypt.hash(data.password, 10),
  });

  let { rows } = await dbClient.execute(
    `INSERT INTO zuth_users (${keys.join(",")}) VALUES (${keys
      .map((e, i) => `$${i + 1}`)
      .join(",")}) RETURNING id`,
    keys.map((e) => data[e])
  );

  return rows[0];
}

export async function passwordLogin(data) {
  if (!checkmodel(passwordLoginModel, data)) return;

  let { rows } = await dbClient.execute(
    `SELECT zuth_users.id, zuth_users.password
    FROM zuth_users
    WHERE zuth_users.email = $1 OR zuth_users.username = $1
    LIMIT 1`,
    [data.email]
  );

  if (
    rows.length > 0 &&
    (await bcrypt.compare(data.password, rows[0].password))
  )
    return signCookie(rows[0].id);

  return;
}

// passwordSignup({
//   email: "mrinmoymondalreal@gmail.com",
//   username: "mrinmoymondal1",
//   mobile: "7428247501",
//   password: "Mrinmoymondal@2004",
//   name: "Mrinmoy Mondal",
// }).then(console.log);

passwordLogin({
  // email: "mrinmoymondalreal@gmail.com",
  email: "mrinmoymondal1",
  password: "Mrinmoymondal@2004",
}).then(console.log);
