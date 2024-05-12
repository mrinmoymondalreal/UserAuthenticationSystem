import express from "express";
import { login, singup } from "./method.js";
import { handleRoute } from "./utils/common.js";

const app = express.Router();
app.post(
  "/login",
  handleRoute(async (req, res) => {
    let result = await login(req.body);
    if (result instanceof Array)
      res.setHeader("set-cookie", [
        `usraccess=${result[1]}; Path=/; HttpOnly; Secure;`,
        `refaccess=${result[0]}; Path=/; HttpOnly; Secure;`,
      ]);
    res.status(result.status).data(result.data || result.status);
  })
);

app.post(
  "/signup",
  handleRoute(async (req, res) => {
    let result = await singup(req.body);
    res.status(result.status).data(result.data || result.status);
  })
);

export default app;
