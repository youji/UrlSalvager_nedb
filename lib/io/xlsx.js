const xlsx = require("xlsx");
const PageData = require("../dao/pageData.js");
const TimeId = require("../tool/timeId.js");

exports.xlsxExport = async function xlsxExport(data,filename) {
  try {
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.aoa_to_sheet(data);
    const ws_name = "urllist";

    xlsx.utils.book_append_sheet(wb, ws, ws_name);
    xlsx.writeFile(wb, filename);
  } catch (e) {
    console.log(e);
  }
  return new Promise(function (resolve) {
    resolve(filename);
  });
};
