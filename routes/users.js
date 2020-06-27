const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const { auth } = require("../middleware/auth");

router.post("/register", (req, res) => {
  // retrieve data from client
  const user = new User(req.body);

  // store data to database
  user.save((err, doc) => {
    if (err) return res.json({ success: false, message: err });
    return res.status(200).json({
      success: true,
    });
  });
});

router.post("/login", (req, res) => {
  // check if requested email is present.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        success: false,
        message: "Invalid email address",
      });
    }

    user.validatePassword(req.body.password, (err, isValid) => {
      if (!isValid) return res.json({ success: false, message: "Incorrect password" });

      user.generateToken((err, user) => {
        if (err) return res.status(400).json({ success: false, message: err });
        res.cookie("token", user.token).status(200).json({ success: true, userId: user._id });
      });
    });
  });
});

router.get("/auth", auth, (req, res) => {
  res
    .status(200)
    .json({ success: true, _id: req.user._id, email: req.user.email, name: req.user.name, role: req.user.role, avatar: req.user.avatar });
});

router.get("/logout", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    // clear existing token
    { token: "" },
    (err, user) => {
      if (err) return res.json({ success: false, message: err });
      return res.status(200).json({ success: true });
    }
  );
});

module.exports = router;
