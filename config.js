module.exports = {
  table: "zuth_users",
  token_expireIn: 15 * 60, // 15 Minutes
  columns: ["username", "name", "email", "mobile"],
  sendVerification: (identifier, code, type) => {
    console.log(identifier, code);
  },
};
