#!/usr/bin/env node

const fs = require("fs"),
  path = require("path");
const { config } = require("./common");

let inquirer;

if (process.argv[2] == "getsql") {
  if (!(config.recipies instanceof Array)) {
    console.log("No Configuration Available!!");
    process.exit(0);
  }
  let sql = `CREATE TABLE ${config.table} (\n\tid SERIAL PRIMARY KEY`;
  if (config.recipies.includes("password"))
    sql += `,\n\temail VARCHAR(100) DEFAULT NULL,\n\tpassword TEXT DEFAULT NULL,\n\tis_email_verified BOOLEAN NOT NULL DEFAULT FALSE`;
  if (
    config.recipies.includes("magic") &&
    !config.recipies.includes("password")
  )
    sql += `,\n\temail VARCHAR(100) DEFAULT NULL,\n\tis_email_verified BOOLEAN NOT NULL DEFAULT FALSE`;
  if (config.recipies.includes("mobile"))
    sql += `,\n\tmobile VARCHAR(100) DEFAULT NULL,\n\tis_phone_verified BOOLEAN NOT NULL DEFAULT FALSE`;

  sql += `,\n\tis_account_done BOOLEAN NOT NULL DEFAULT FALSE\n}\n`;
  sql += `CREATE TABLE IF NOT EXISTS tokens
(
  id SERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  token TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'verification',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expiration_time timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP + INTERVAL '15 minutes'
);`;
  console.log(sql);
} else {
  getImports();
}

async function getImports() {
  inquirer = (await import("inquirer")).default;

  let config = {};
  const a1 = await inquirer.prompt({
    name: "table_name",
    type: "input",
    message: "Name of the Table: ",
    default() {
      return "users";
    },
  });

  const a2 = await inquirer.prompt({
    name: "token_expireIn",
    type: "number",
    message: "Token Expire Time (in seconds): ",
    default() {
      return 90;
    },
  });

  const a3 = await inquirer.prompt({
    name: "Recipies",
    type: "checkbox",
    message: "Choose the Authentication Recipies to use: ",
    choices: [
      { name: "Password and Email Based" },
      { name: "Magic Link" },
      { name: "Mobile/OTP Based" },
    ],
  });

  config = {
    table: a1.table_name,
    token_expireIn: a2.token_expireIn,
    recipies: a3.Recipies.map(function (item) {
      if (item === "Password and Email Based") {
        return "password";
      } else if (item === "Magic Link") {
        return "magic";
      } else if (item === "Mobile/OTP Based") {
        return "mobile";
      }
    }),
    checkList: {},
  };

  let code =
    require("./package.json").type == "module"
      ? "export default "
      : "module.exports = " +
        String(
          JSON.stringify(config, null, 2).slice(0, -2) +
            `,\n\t"sendVerification": (identifier, code, type) => {\n\t\tconsole.log(identifier, code, type);\n\t}\n }`
        );

  fs.writeFile(
    path.join(process.cwd(), require("./package.json").name + ".config.js"),
    code,
    (err) => {
      err && console.log(err);
    }
  );

  const a4 = await inquirer.prompt({
    name: "db",
    type: "input",
    message: "PostgreSQL URI: ",
  });

  const a5 = await inquirer.prompt({
    name: "jwts",
    type: "input",
    message: "JsonWebToken Sceret: ",
  });

  console.log(`\n
    add these variables to our env:
    AUTH_DATABASE_URI=${a4.db}
    AUTH_JWT_TOKEN=${a5.jwts}
  `);

  console.log("configuration completed!!!");
}
