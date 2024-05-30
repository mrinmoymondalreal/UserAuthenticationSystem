module.exports = {
  table: "users",
  token_expireIn: 15, // 15 Seconds
  recipies: ["magic", "mobile", "password"],
  checkList: {
    username: /^(?!_)(?!.*__)[A-Za-z0-9_]{3,16}(?<!_)$/,
    name: /^[A-Za-z][A-Za-z '-]{0,48}[A-Za-z]$/,
  },
  sendVerification: (identifier, code, type) => {
    console.log(identifier, code, type);
  },
};
