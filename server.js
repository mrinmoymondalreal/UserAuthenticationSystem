import { createServer } from "http";
import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./utils/common.js";
import bodyParser from "body-parser";
import { login, singup } from "./method.js";

const app = express();
let httpServer = createServer(app);

app.use(cookieParser());
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("testing"));
app.post("/login", async (req, res) => {
  try {
    let data = req.body;
    let result = await login(data);
    if (result instanceof Array) {
      res.setHeader("set-cookie", [
        `a_token=${result[1]}; Path=/; HttpOnly; Secure;`,
        `r_token=${result[0]}; Path=/; HttpOnly; Secure;`,
      ]);
      res.sendStatus(200);
    } else {
      res.sendStatus(result);
    }
  } catch (err) {
    console.log(err.toString());
    res.sendStatus(500);
  }
});

app.post("/signup", async (req, res) => {
  let data = req.body;
  let result = await singup(data);
  if (typeof result == "object" && result.id) {
    res.sendStatus(200);
  } else {
    res.sendStatus(result);
  }
});

httpServer.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
