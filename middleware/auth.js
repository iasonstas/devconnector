const jwt = require("jsonwebtoken");
const config = require("config");

//Middleware is a function that has access to req res cycle(object) .
//Next is a callback that we have to run once we are done to move to the next piece of middleware

module.exports = function(req, res, next) {
  //Get token from header
  const token = req.header("x-auth-token");
  //Check if not token
  if (!token) {
    return res.status(401).json({ msg: "No token, authorization denied" });
  }

  //Verify token
  try {
    const decoded = jwt.verify(token, config.get("jwtSecret")); //decodes the token
    //take the req Object and assign a value to user
    req.user = decoded.user; //it has user in the payload
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token is not valid" });
  }
};
