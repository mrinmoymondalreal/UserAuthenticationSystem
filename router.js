const express = require("express");
const app = express.Router();
const mobLogin = require("./recipies/mob.js");
const magicLogin = require("./recipies/magic.js");
const { config } = require("./common.js");
const { passwordLogin } = require("./recipies/password.js");

app.post("/login", async (req, res) => {
  try {
    let resp,
      data = req.body;
    switch (data.type) {
      case "mobile":
        if (config.recipies.includes("mobile")) resp = await mobLogin(data);
        break;
      case "magic":
        if (config.recipies.includes("magic")) resp = await magicLogin(data);
        break;
      case "password":
        if (config.recipies.includes("password"))
          resp = await passwordLogin(data);
      default:
        break;
    }

    if (resp.status == 200 && data.code) {
      res.setHeader("set-cookie", [
        `usraccess=${resp.data[1]}; Path=/; HttpOnly; Secure;`,
        `refaccess=${resp.data[0]}; Path=/; HttpOnly; Secure;`,
      ]);
    }

    res.status(resp.status || 400);
    res.end();
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get("/magiclogin", async (req, res) => {
  let queries = req.query;
  let resp = await magicLogin({ code: queries.code, email: "demo@demo.demo" });
  if (resp.status == 200) {
    res.setHeader("set-cookie", [
      `usraccess=${resp.data[1]}; Path=/; HttpOnly; Secure;`,
      `refaccess=${resp.data[0]}; Path=/; HttpOnly; Secure;`,
    ]);
    res.status(200);
    return res.redirect(queries.redirectTo);
  }
  res.status(resp.status);
  res.end();
});

app.post("/signup", async (req, res) => {
  try {
    let resp,
      data = req.body;
    if (config.recipies.includes("password")) resp = await passwordLogin(data);
    res.status(resp.status || 400);
    res.end();
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

module.exports = app;
