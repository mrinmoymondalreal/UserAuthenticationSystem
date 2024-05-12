import { checkmodel } from "./checker.js";
import { dbClient } from "./common.database.js";
import bcrypt from "bcrypt";
import { signCookie } from "./common.login.js";
import { passwordLoginModel } from "./model.login.js";
import { config } from "./common.js";

export async function passwordSignup(data) {
  if (!checkmodel(config.user_model, data)) return 400;
  let keys = Object.keys(config.user_model);

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
  if (!checkmodel(passwordLoginModel, data)) return 400;

  let { rows } = await dbClient.execute(
    `SELECT zuth_users.id, zuth_users.password
    FROM zuth_users
    WHERE ${
      (config.method.includes("email/password") && "zuth_users.email = $1") ||
      ""
    } ${
      config.method.filter((e) => e.toLowerCase().indexOf("password") > -1)
        .length > 0
        ? "OR"
        : ""
    } ${
      (config.method.includes("username/password") &&
        "zuth_users.username = $1") ||
      ""
    }
    LIMIT 1`,
    [data.email]
  );

  if (
    rows.length > 0 &&
    (await bcrypt.compare(data.password, rows[0].password))
  )
    return signCookie(rows[0].id);

  return 404;
}
