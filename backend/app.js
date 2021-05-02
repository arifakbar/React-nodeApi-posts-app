const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");

const feedRouter = require("./routes/feed");
const authRouter = require("./routes/auth");

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, file.fieldname + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg"
  ) {
    return cb(null, true);
  } else {
    return cb(null, false);
  }
};

app.use(bodyParser.json());

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(feedRouter);
app.use("/auth", authRouter);

app.use((error, req, res, next) => {
  console.log("error : " + error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  console.log(data);
  res.status(status).json({ message: message });
});

mongoose
  .connect(
    "mongodb+srv://username:password@udemy-cluster.qubpg.mongodb.net/db-name?retryWrites=true&w=majority"
  )
  .then((result) => {
    const server = app.listen(8080);
    const io = require("./socket").init(server);
    io.on("connection", (socket) => {
      console.log("Client connected");
    });
  })
  .catch((err) => console.log(err));
