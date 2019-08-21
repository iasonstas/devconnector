const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const config = require("config");
const { check, validationResult } = require("express-validator");

//@route    GET api/auth
//@desc     Test route
//@access   public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (error) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
//To get response from postman
// Header key= x-auth-token     value = ctrl+paste token

//~~~~~~~~~~~~~TO LOGIN A USER.~~~~~~~~~~~~~~//

//@route    POST api/auth
//@desc     Authenticate - Login User
//@access   public
router.post(
  "/",
  [
    check("email", "Please Include a valid email").isEmail(),
    check("password", "Password is required").exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } //save in postman as Registered USER

    //Destructure req.boy
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email: email });
      //See if the Users exists else send back an error
      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }
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
