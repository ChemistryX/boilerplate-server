require("dotenv").config();
const express = require("express");
const app = express();
const port = 5000;
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { auth } = require("./middleware/auth");
const { User } = require("./models/user");
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("successfully connected to the database"))
  .catch((err) => console.log(err));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

app.get("/", (req, res) => res.json({ success: true }));

app.post("/api/users/register", (req, res) => {
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

app.post("/api/users/login", (req, res) => {
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

app.get("/api/users/auth", auth, (req, res) => {
  res
    .status(200)
    .json({ success: true, _id: req.user._id, email: req.user.email, name: req.user.name, role: req.user.role, avatar: req.user.avatar });
});

app.get("/api/users/logout", auth, (req, res) => {
  User.findOneAndUpdate(
    { _id: req.user._id },
    // reset existing token
    { token: "" },
    (err, user) => {
      if (err) return res.json({ success: false, message: err });
      return res.status(200).json({ success: true });
    }
  );
});

app.listen(port, () => console.log(`server listening on port ${port}`));
