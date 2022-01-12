const fs = require("fs");
const yaml = require("js-yaml");
exports.load = function loadYaml(filename) {
  const doc = yaml.load(fs.readFileSync(filename, "utf8"));
  return doc;
};
exports.write = function writeYaml(filename,data) {
  fs.writeFile(filename, yaml.dump(data), 'utf8',function(e){
    if(e) console.log(e)
  });
  return;
};
