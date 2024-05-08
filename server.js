import { createServer } from "http";
import express from "express";
import cookieParser from "cookie-parser";
import { PORT } from "./utils/common.js";
import bodyParser from "body-parser";

const app = express();
let httpServer = createServer(app);

app.use(cookieParser());
app.use(bodyParser.json());

app.get("/", (req, res) => res.send("testing"));
app.post("/login", (req, res) => {});

httpServer.listen(PORT, () => {
  console.log(`listening on http://localhost:${PORT}`);
});
