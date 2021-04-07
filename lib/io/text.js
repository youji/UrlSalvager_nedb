const fs = require("fs").promises;
const PageData = require("../dao/pageData.js");
const TimeId = require("../tool/timeId.js");

exports.formatExportData = async function formatExportData(data) {
  let rtnStr = "";
  const itemKeyArr = Object.keys(new PageData().info);
  // ヘッダ
  rtnStr += "url" + "\t";
  itemKeyArr.forEach((key) => {
    rtnStr += key + "\t";
  });
  rtnStr += "\n";

  // 実データ
  data.forEach((v, k) => {
    rtnStr += k + "\t";
    itemKeyArr.forEach((itemkey) => {
      rtnStr += v[itemkey] + "\t";
    });
    rtnStr += "\n";
  });
  return new Promise(function (resolve) {
    resolve(rtnStr);
  });
};
exports.textExport = async function textExport(data) {
  let filename = "./result/" + TimeId.getTimeId() + "/result.txt";
  try {
    await fs.writeFile(filename, data);
  } catch (err) {
    console.log(err.toString());
  }
  return new Promise(function (resolve) {
    resolve(filename);
  });
};

exports.exportHtmlData = async function exportHtmlData(data, path) {
  try {
    await fs.writeFile(path, data);
  } catch (err) {
    console.log(err.toString());
  }
  return new Promise(function (resolve) {
    resolve(path);
  });
};
