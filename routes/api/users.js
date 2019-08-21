const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

//@route    POST api/users
//@desc     Register User
//@access   public
router.post(
  "/",
  [
    check("name", "Name is required.")
      .not()
      .isEmpty(),
    check("email", "Please Include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } //save in postman as Registered USER

    //Destructure req.boy
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });
      //See if the Users exists else send back an error
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }
      //Get Users gravatar
      const gravatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm" //the default ff is error
      });
      user = new User({
        name,
        email,
        avatar,
        password
      });

      //Encrypt the password with bcrypt
      const salt = await bcrypt.getSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();

      //return jwt(JSON web token)
      //PAYLOAD THE DATA YOU WANT TO SEND within the token
      const payload = {
        user: {
          id: user.id
        }
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 36000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      //End
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
