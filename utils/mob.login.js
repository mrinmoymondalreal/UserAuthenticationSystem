import { user_model } from "./user.js";
import { checkmodel } from "./checker.js";
import { dbClient } from "./common.database.js";
import {
  add_verification_token,
  signCookie,
  verifytoken,
} from "./common.login.js";
import { config } from "./common.js";
import { mobLoginModel } from "./model.login.js";

export async function mobSignup(data) {
  if (!checkmodel(user_model, data)) return false;
  let keys = Object.keys(user_model);
  let { rows } = await dbClient.execute(
    `INSERT INTO zuth_users (${keys.join(",")}) VALUES (${keys
      .map((e, i) => `$${i + 1}`)
      .join(",")}) RETURNING id, mobile`,
    keys.map((e) => data[e])
  );

  return rows[0];
}

export async function mobLogin(data) {
  if (!checkmodel(mobLoginModel, data)) return;
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
      return true;
    } else return;
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

  return;
}

// verifytoken(
//   "d2fbdd78-db08-4fbc-aaa8-53b364e40d59",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjAxOGY0YTIzLTJhNTItNTViOS0zOTNhLTA4MGE0ZTdkZTc4OCIsInVzZXJuYW1lIjoibXJpbm1veW1vbmRhbCIsImVtYWlsIjoibXJpbm1veW1vbmRhbEBnbWFpbC5jb20iLCJtb2JpbGUiOiI3NDI4MjQ3NTAwIiwibmFtZSI6Im1yaW5tb3ltb25kYWwiLCJjcmVhdGVkX2F0IjoiMjAyNC0wNS0wNVQxOTowMjo0OS42NzVaIiwibW9kaWZpZWRfYXQiOm51bGwsImlhdCI6MTcxNTEwMDkxMiwiZXhwIjoxNzE1MTAxMDEyfQ.lMKZ6qJg8gAaQM5WM58oiVbbG2w7XhdtKtNPilUgkbE"
// ).then(console.log);

// mobLogin({ mobile: "7428247500", code: "426422" }).then(console.log);
