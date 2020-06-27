require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cors_origin = ["http://localhost:3000"]; // dev environment
const app = express();
const port = 5000;
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log("successfully connected to the database"))
  .catch((err) => console.log(err));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: cors_origin,
    credentials: true,
  })
);

// register routes
app.use("/api/users", require("./routes/users"));
app.get("/", (req, res) => res.json({ success: true }));

app.listen(port, () => console.log(`server listening on port ${port}`));
