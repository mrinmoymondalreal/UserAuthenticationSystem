import { fileURLToPath } from "url";
import path from "path";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PORT = process.env.AUTH_ZUTH_PORT || 3000;
export const config = (await import("../zuth.config.js")).default;

export function handleRoute(cb, fallback) {
  return async (req, res, next) => {
    try {
      timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(408).send(`${req.method} ${req.originalUrl} Timed Out`);
          req.socket.end();
          res.json = () => {};
          res.send = () => {};
          res.sendStatus = () => {};
        }
      }, config.requestTimeout);
      await cb(req, res, next);
    } catch (err) {
      if (fallback) res.rediret(fallback);
      else if (
        req.get("content-type") == "application/json" ||
        req.get("accept").indexOf("application/json")
      )
        res.status(500).send("ERR_INTERNAL_SERVER");
      else res.status(500).send("ERR_INTERNAL_SERVER");
    }
  };
}
