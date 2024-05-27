module.exports = {
  table: "users",
  token_expireIn: 15 * 60, // 15 Minutes
  columns: ["username", "name", "email", "mobile", "password"],
  recipies: ["magic", "mobile", "password"],
  sendVerification: (identifier, code, type) => {
    console.log(identifier, code, type);
  },
};
