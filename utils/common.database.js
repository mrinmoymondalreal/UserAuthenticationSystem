import { config } from "./common.js";
import pg from "pg";

let { Pool } = pg;

function DatabaseClient(config) {
  this.pool = new Pool(config);
  return this;
}

DatabaseClient.prototype.execute = function (...query) {
  return this.pool.query(...query);
};

DatabaseClient.prototype.getClient = async function () {
  return await this.pool.connect();
};

export let dbClient = new DatabaseClient({
  connectionString: config.database_url,
});
