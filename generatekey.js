const crypto = require("crypto");
const randomHex = crypto.randomBytes(64).toString("hex");
console.log(randomHex);
