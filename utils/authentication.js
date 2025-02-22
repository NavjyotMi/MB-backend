const bcrypt = require("bcrypt");

const saltRounds = 10;

async function hashedPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hashedPassword) {
  return await bcrypt.compare(password, hashedPassword);
}

module.exports = { hashedPassword, comparePassword };
