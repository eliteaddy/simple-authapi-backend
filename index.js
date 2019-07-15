const express = require("./node_modules/express");
const mongoose = require("./node_modules/mongoose");
const bodyParser = require("./node_modules/body-parser");
const bcrypt = require("./node_modules/bcryptjs");
const jwt = require("./node_modules/jsonwebtoken");
const auth = require("./config/auth");
const jwtSecret = require("./config/keys").jwtSecret;
const cors = require("./node_modules/cors");
const app = express();

const port = 80;

//MongoDB Options
const db = require("./config/keys").MongoURI;
const option = {
  useNewUrlParser: true,
};

//Connect to Database
mongoose
  .connect(db, option)
  .then(() => console.log("MongoDb Connected..."))
  .catch(err => console.log(err));

app.use(cors());
app.use(bodyParser.json());

// Body parser
// app.use(express.urlencoded({ extended: false }));

// Api Model
const Api = require("./model/Api");

// Home route
app.get("/", (req, res) => {
  Api.find({})
    .sort({ date: -1 })
    .then(item => res.json(item));
});

app.post("/", auth, (req, res) => {
  var { username, title, post, url, votes, category } = req.body;
  var newpost = new Api({
    username,
    title,
    post,
    url,
    votes,
    category,
  });

  newpost
    .save()
    .then(item => res.json(item))
    .catch(err => res.status(404).json({ msg: `Not post due to ${err}` }));
});

app.delete("/:id", auth, (req, res) => {
  // Api.findById(req.params.id)
  //     .then(item => item.remove().then(() => res.json({ "success": true })))
  //     .catch(() => res.status(404).json({ "success": false }))
  Api.findByIdAndDelete(req.params.id, (err, todo) => {
    if (err) return res.status(500).send({ success: false });
    return res.json({ success: true });
  });
});

app.patch("/:id", auth, (req, res) => {
  Api.findByIdAndUpdate(req.params.id, req.body, { new: true }, (err, todo) => {
    if (err) return res.status(500).send(err);
    return res.json(todo);
  });
});

// User Model
const User = require("./model/User");

// Home route
app.get("/admin", auth, (req, res) => {
  User.findById(req.user.id)
    .select("-password")
    .then(user => res.json(user));
});

// For Register
app.put("/admin", (req, res) => {
  var { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ msg: "Enter All Field" });
  }

  User.findOne({ username }).then(user => {
    if (user) {
      if (user.username == username) {
        return res.status(400).json({ mgs: "Username Already Exist!" });
      }
      return res.status(400);
    }

    var newUser = new User({
      username,
      password,
    });

    // Create Salt and Hash
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUser.password, salt, (err, hash) => {
        if (err) throw err;
        newUser.password = hash;
        newUser.save().then(user => {
          jwt.sign(
            { id: user.id },
            jwtSecret,
            { expiresIn: 3600000000 },
            (err, token) => {
              if (err) throw err;
              res.json({
                token,
                user: {
                  id: user.id,
                  username: user.username,
                  isGuest: false,
                },
              });
            }
          );
        });
      });
    });
  });
});

// For Login
app.post("/admin", (req, res) => {
  var { username, password } = req.body;
  var logger = username;
  if (!logger || !password) {
    return res.status(400).json({ msg: "Enter All Field" });
  }
  User.findOne({ username }).then(user => {
    if (!user) return res.status(400).json({ mgs: "User Doesn't Exist!" });
    bcrypt.compare(password, user.password).then(isMatch => {
      if (!isMatch) return res.status(400).json({ msg: "Invalid Credentials" });
      jwt.sign(
        { id: user.id },
        jwtSecret,
        { expiresIn: 3600 },
        (err, token) => {
          if (err) throw err;
          res.json({
            token,
            user: {
              id: user.id,
              username: user.username,
              isGuest: false,
            },
          });
        }
      );
    });
  });
});

app.delete("/admin/:id", auth, (req, res) => {
  User.findByIdAndDelete(req.params.id, (err, todo) => {
    if (err) return res.status(500).send({ success: false });
    return res.json({ success: true });
  });
});

app.patch("/admin/:id", auth, (req, res) => {
  User.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true },
    (err, todo) => {
      if (err) return res.status(500).send(err);
      return res.json(todo);
    }
  );
});

// Listen on port 5000
app.listen(port, () => {
  console.log(`Server is booming on port 5000
Visit http://localhost:5000`);
});
