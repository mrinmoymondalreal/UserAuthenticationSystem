const { verifyUser, checkAccountCompletionStatus } = require("./middleware");
const { addToDetails } = require("./recipies/addToDatabase");
const { verifytoken, logout } = require("./recipies/common");
const magicLogin = require("./recipies/magic");
const mobLogin = require("./recipies/mob");
const { passwordLogin, passwordSignup } = require("./recipies/password");
const router = require("./router");

module.exports = {
  router,
  verifyUser,
  mobLogin,
  magicLogin,
  passwordLogin,
  passwordSignup,
  verifytoken,
  logout,
  addToDetails,
  checkAccountCompletionStatus,
};
