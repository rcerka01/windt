const path = require("path");
const fs = require("fs");
const solc = require("solc");

const windTpath = path.resolve(__dirname, "contracts", "WindT.sol");
const source = fs.readFileSync(windTpath, "utf8");

module.exports = solc.compile(source, 1).contracts[':WindT'];
