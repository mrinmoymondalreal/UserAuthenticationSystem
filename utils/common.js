import { fileURLToPath } from "url";
import path from "path";

export const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const PORT = process.env.AUTH_ZUTH_PORT || 3000;
export const config = (await import("../zuth.config.js")).default;
