const express = require("express");
const app = express.Router();
const mobLogin = require("./recipies/mob.js");
const magicLogin = require("./recipies/magic.js");
const { config } = require("./common.js");
const { passwordLogin, passwordSignup } = require("./recipies/password.js");
const { logout } = require("./recipies/common.js");
const { addToDetails } = require("./recipies/addToDatabase.js");
const { verifyUser } = require("./middleware.js");

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

    if (resp.status == 200 && (data.code || data.type == "password")) {
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
    if (config.recipies.includes("password")) resp = await passwordSignup(data);
    res.status(resp.status || 400);
    res.end();
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.post("/verify_email", async (req, res) => {
  try {
    let queries = req.body;
    let resp = await magicLogin(queries, true);
    res.status(resp.status);
    res.end();
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.get("/logout", async (req, res) => {
  await logout(req.cookies.refaccess, req.cookies.usraccess);
  res.setHeader("set-cookie", [
    "usraccess=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;",
    "refaccess=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;",
  ]);
  res.status(200);
  res.end();
});

app.post("/verify_mobile", async (req, res) => {
  try {
    let queries = req.body;
    console.log(queries);
    let resp = await mobLogin(queries, true);
    res.status(resp.status);
    res.end();
  } catch (err) {
    res.status(500).send(err.toString());
  }
});

app.post("/add_details", verifyUser, async (req, res) => {
  let data = req.body;
  let resp = await addToDetails(data, req.user.id);
  if (resp.status == 200) {
    res.setHeader("set-cookie", ["usraccess=" + resp.data[1]]);
  }
  res.status(resp.status).end();
});

module.exports = app;
