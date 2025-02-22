const jwt = require("jsonwebtoken");
const Secret_key = process.env.SECRET_KEY;

module.exports.createJwt = (payload) => {
  return jwt.sign(payload, Secret_key);
};

module.exports.verifyJwt = (token) => {
  try {
    const decoded = jwt.verify(token, Secret_key);
    return decoded;
  } catch (err) {
    return null;
  }
};
