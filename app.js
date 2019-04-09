require("dotenv").config();

const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const favicon = require("serve-favicon");
const mongoose = require("mongoose");
const logger = require("morgan");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
require("./configs/passport");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
  })
  .then(x => {
    console.log(
      `Connected to Mongo! Database name: "${x.connections[0].name}"`,
    );
  })
  .catch(err => {
    console.error("Error connecting to mongo", err);
  });

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`,
);

const app = express();

// Middleware Setup

app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(
  require("node-sass-middleware")({
    src: path.join(__dirname, "public"),
    dest: path.join(__dirname, "public"),
    sourceMap: true,
  }),
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static(path.join(__dirname, "public")));
app.use(favicon(path.join(__dirname, "public", "images", "favicon.ico")));

app.use(
  session({
    secret: "asdasdasdasdasdasd",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60000 },
    store: new MongoStore({
      mongooseConnection: mongoose.connection,
      ttl: 24 * 60 * 60, // 1 day
    }),
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// default value for title local
app.locals.title = "Express - Generated with IronGenerator";

//Allow Cors hay que ver si metemos el middleware de la learning
const cors = require("cors");

app.use(
  cors({
    credentials: true,
    origin: ["https://tweetflick-front.herokuapp.com/signup"],
  }),
);

const index = require("./routes/index");
app.use("/", index);

//Api routes
const api = require("./routes/api");
app.use("/api", api);

//Auth routes
const auth = require("./routes/auth-routes");
app.use("/auth", auth);

//Profile routes
const profile = require("./routes/profile-routes");
app.use("/profile", profile);

module.exports = app;
