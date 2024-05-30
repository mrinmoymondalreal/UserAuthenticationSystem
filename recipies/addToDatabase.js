const { config, check } = require("../common");
const dbClient = require("../database/index.js");
const { signCookie } = require("./common.js");

async function addToDetails(data, id) {
  if (!config.checkList) return { status: 400 };

  let columnsArr = Object.keys(config.checkList);

  if (!check(config.checkList, data)) return { status: 400 };

  await dbClient.execute(
    `UPDATE ${config.table}
    SET
      ${columnsArr.map((_, i) => `${_} = $${i + 2}`).join(", ")},
      is_account_done = true
    WHERE id = $1`,
    [id, ...columnsArr.map((e) => data[e])]
  );

  return { status: 200, data: await signCookie(id, true) };
}

module.exports = {
  addToDetails,
};
