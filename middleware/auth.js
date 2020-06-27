const { User } = require("../models/user");

let auth = (req, res, proceed) => {
  let token = req.cookies.token;
  // find user by given token above and compare with existing one
  User.findByToken(token, (err, user) => {
    if (err) throw err;
    if (!user) return res.json({ success: false, message: "authentication failed" });
    req.token = token;
    req.user = user;
    proceed();
  });
};

module.exports = { auth };
