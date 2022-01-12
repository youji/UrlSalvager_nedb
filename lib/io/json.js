const fs = require("fs");
exports.load = function loadJson(filename) {
};
exports.write = function writeJson(filename,data) {
  fs.writeFile(filename, JSON.stringify(data, null, '    '),function(e){
    if(e) console.log(e)
  });
  return;
};
