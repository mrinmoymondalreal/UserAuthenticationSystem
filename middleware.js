const { verifytoken } = require("./recipies/common");

async function verifyUser(req, res, next) {
  if (!(req.cookies && req.cookies.refaccess && req.cookies.usraccess))
    return next();
  console.log(req.cookies.refaccess, req.cookies.usraccess);
  req.user = await verifytoken(req.cookies.refaccess, req.cookies.usraccess);
  res.setHeader("set-cookie", [
    `usraccess=${req.user[1]}; Path=/; HttpOnly; Secure;`,
  ]);
  req.user = req.user[0];
  next();
}

async function checkAccountCompletionStatus(route) {
  return (req, res, next) => {
    if (!req.user) return next();
    if (req.user.is_account_done) return res.redirect(route);
    next();
  };
}

module.exports = {
  verifyUser,
  checkAccountCompletionStatus,
};
