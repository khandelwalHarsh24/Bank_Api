const jwt = require("jsonwebtoken");
const jwt_secret=process.env.jwt_secret

module.exports = (req, res, next) => {
  const token = req.header("Authorization").replace("Bearer ", "");
  if (!token) return res.status(401).send({ message: "Access denied" });

  try {
    const decoded = jwt.verify(token, jwt_secret);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send({ message: "Invalid token" });
  }
};
