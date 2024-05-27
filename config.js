module.exports = {
  table: "zuth_users",
  token_expireIn: 15 * 60, // 15 Minutes
  columns: ["username", "name", "email", "mobile"],
  sendVerification: (identifier, code) => {
    console.log(identifier, code);
  },
};
