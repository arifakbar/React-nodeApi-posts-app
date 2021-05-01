const express = require("express");
const { body } = require("express-validator/check");

const router = express.Router();

const User = require("../models/user");
const authController = require("../controllers/auth");
const isAuth = require("../middleware/auth");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email!")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((user) => {
          if (user) {
            return Promise.reject("Email address already in use");
          }
        });
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().not().isEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);

router.get("/status", isAuth, authController.getStatus);

router.patch("/status", isAuth, authController.updateStatus);

module.exports = router;
