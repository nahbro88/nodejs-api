require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcrypt");
const app = express();
const User = require("./db.js");
const mongoose = require("mongoose");

const posts = [
  {
    name: "Goddam",
    id: "gothsm",
  },
  {
    hectic: "Byle",
    id: "lile",
  },
];

mongoose.connect("mongodb://localhost:27017/NodeApi").then(() => {
  app.listen(process.env.PORT);
});

app.use(express.json());
app.use(
  cors({
    origin: "*",
    methods: "GET, PUT, POST, DELETE, UPDATE",
  })
);

async function authenticate(req, res, next) {
  const token = req.body.token
  try {
  const verify = jwt.verify(token, process.env.ACCESS_KEY_SECRET)
  if (verify) {
      next()
  } else {
      res.json({ error: "Unauthenticated" })
  } } catch(e) {
    res.json({ error: "Unauthenticated" })
  }
}
app.post("/posts", authenticate, (req, res) => {
  res.json(posts).status(200);
});

app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  if (email.length == 0)
    return res.json({ error: "Enter your email" }).status(401);
  if (password.length == 0)
    return res.json({ error: "Enter your password" }).status(401);
  const credentials = {
    email,
    password: "",
  };

  bcrypt.genSalt(parseInt(process.env.ROUNDS)).then((salt) => {
    bcrypt.hash(password, salt).then((pass) => {
      credentials.password = pass;

      const user = new User(credentials);
      const token = user.authorize();
      res.json({ token }).status(200);
      user.save();
    });
  });
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const userExists = await User.findOne({ email });
  if (userExists) {
    const passwordValid = await bcrypt.compare(password, userExists.password);
    if (passwordValid) {
      const token = jwt.sign(
        { _id: userExists._id },
        process.env.ACCESS_KEY_SECRET
      );
      res.json({ success: true, token }).status(200);
    } else {
      res.json({ error: "Password is invalid" }).status(401);
    }
  } else {
    res.json({ error: "user does not exist" }).status(401);
  }
});
