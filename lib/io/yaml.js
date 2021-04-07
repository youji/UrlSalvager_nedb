const fs = require("fs");
const yaml = require("js-yaml");
exports.load = function loadYaml(filename) {
  const doc = yaml.load(fs.readFileSync(filename, "utf8"));
  return doc;
};
