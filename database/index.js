const { Pool } = require("pg");

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

module.exports = new DatabaseClient({
  connectionString: process.env.AUTH_DATABASE_URI,
});
