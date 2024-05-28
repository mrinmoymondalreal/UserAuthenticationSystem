const { verifytoken } = require("./recipies/common");

function verifyUser(req, res) {
  if (req.cookies && req.cookies.refaccess && req.cookies.usraccess)
    return res.next();
  req.user = verifytoken(req.cookies.refaccess, req.cookies.usraccess);
  res.next();
}

module.exports = {
  verifyUser,
};
