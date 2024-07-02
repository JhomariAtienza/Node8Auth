const express = require("express");
const bodyParser = require("body-parser");
const adminRouter = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const path = require("path");
const errorController = require("./controllers/error");
const { body } = require('express-validator');
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const User = require("./models/user");
const MONGODB_URI =
  "mongodb+srv://jhomari180:bravotangowhisky@cluster0.b93ppg2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: "sessions",
});
// const mongoConnect = require("./util/database").mongoConnect;
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then(user => {
      if (!user) {
        return next();
      }
      req.user = user;
      next();
    })
    .catch((err) => console.log(err));
});
app.use("/admin", adminRouter);
app.use(shopRoutes);
app.use(authRoutes);

app.get('/500', errorController.get500);

app.use(errorController.get404);

// const user = new User("roger", "roger@test.com", { items: [] });
// user.save();
app.use((error, req, res, next) => {
  // res.status(error.httpStatusCode).render(...);
  // res.redirect('/500');
  res.status(500).render('500', {
    pageTitle: 'Error!',
    path: '/500',
    isAuthenticated: req.session.isLoggedIn
  });
});
mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
