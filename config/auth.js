const jwt = require("../node_modules/jsonwebtoken");
const jwtSecret = require("./keys").jwtSecret;

const auth = (req, res, next) => {
  const token = req.header("x-auth-token");

  // Check for token
  if (!token) res.status(401).json({ msg: "No token, authorization denied" });
  try {
    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    // Add user from payload
    req.user = decoded;
    next();
  } catch (e) {
    console.log(e);
    res.status(400).json({ msg: "Token Not Valid" });
  }
};

module.exports = auth;
