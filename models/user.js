const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const schema = mongoose.Schema({
  email: {
    type: String,
    trim: true,
    // must be unique
    unique: 1,
  },
  name: {
    type: String,
    maxlength: 20,
  },
  password: {
    type: String,
    minlength: 6,
  },
  // 0: default role
  role: {
    type: Number,
    default: 0,
  },
  // avatar image url
  avatar: String,
  token: String,
  tokenValidity: Number,
});

// encrypt password before saving
schema.pre("save", function (proceed) {
  var user = this;
  // only encrypt when password changes
  if (user.isModified("password")) {
    // encrypt password
    bcrypt.genSalt(saltRounds, function (err, salt) {
      if (err) return proceed(err);

      bcrypt.hash(user.password, salt, function (err, hash) {
        if (err) return proceed(err);
        user.password = hash;
        proceed();
      });
    });
    // if not, just proceed
  } else {
    proceed();
  }
});

schema.methods.validatePassword = function (data, callback) {
  // compare existing data with encrypted input
  bcrypt.compare(data, this.password, function (err, isValid) {
    if (err) return callback(err);
    callback(null, isValid);
  });
};

schema.methods.generateToken = function (callback) {
  var user = this;
  var token = jwt.sign(user._id.toHexString(), "kittens");
  user.token = token;
  user.save(function (err, user) {
    if (err) return callback(err);
    callback(null, user);
  });
};

schema.statics.findByToken = function (token, callback) {
  var user = this;
  jwt.verify(token, "kittens", function (err, decoded) {
    user.findOne({ _id: decoded, token: token }, function (err, user) {
      if (err) return callback(err);
      callback(null, user);
    });
  });
};

const User = mongoose.model("user", schema);

module.exports = { User };
