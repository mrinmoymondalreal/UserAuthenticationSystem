module.exports = {
  table: "users", // name of the table in which the data should be stored
  token_expireIn: 15, // 15 Seconds
  recipies: ["magic", "mobile", "password"], // what recipies should be supported
  checkList: {
    username: /^(?!_)(?!.*__)[A-Za-z0-9_]{3,16}(?<!_)$/,
    name: /^[A-Za-z][A-Za-z '-]{0,48}[A-Za-z]$/,
  }, // names of the other columns other than the required recipies field with their regEx
  sendVerification: (identifier, code, type) => {
    console.log(identifier, code, type);
  }, // method to send the module
};
