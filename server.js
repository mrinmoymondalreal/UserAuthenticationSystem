#!/usr/bin/env node

const { configDotenv } = require("dotenv");
configDotenv();

const express = require("express");
const app = express();
const router = require("./router.js");

const PORT = process.env.AUTH_PORT || 3131;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

app.get("/", (req, res) => res.send("test pass"));

app.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
