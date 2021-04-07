const puppeteer = require("puppeteer");
const surveyPage = require("./lib/surveyPage");
const yamlIo = require("./lib/io/yaml");
const xlsxIo = require("./lib/io/xlsx");
const conf = yamlIo.load("conf.yaml");

// puppeteer
let browser = null;

//
let notYetUrls = new Set(conf.startUrl);
let processingUrls = new Set();
let doneData = new Map();

main();

async function main() {
  console.time("salvage time");

  browser = await puppeteer.launch(conf.browser);
  //
  while (notYetUrls.size > 0) {
    let targetUrl = getNotYetUrl1(notYetUrls);

    notYetUrls.delete(targetUrl);
    processingUrls.add(targetUrl);
    let pageData = await surveyPage.survey(browser, targetUrl);
    notYetUrls = mergeUrlList(notYetUrls, pageData.hrefs);
    processingUrls.delete(targetUrl);

    doneData.set(targetUrl, pageData.info);
    console.log(notYetUrls.size + " left");
  }
  await closeBrowser();
  await exportXlsxResult();

  console.timeEnd("salvage time");
}
async function closeBrowser() {
  await browser.close();
  console.log("-----CRAWL END-----");
  return new Promise(function (resolve) {
    resolve();
  });
}
async function exportXlsxResult() {
  const formattedData = await xlsxIo.formatExportData(doneData);
  const filename = await xlsxIo.xlsxExport(formattedData);
  console.log("-----RESULT EXPORTED (" + filename + ")-----");
  return new Promise(function (resolve) {
    resolve();
  });
}
function getNotYetUrl1(set) {
  for (var value of set) return value;
}
function mergeUrlList(baseSet, addSet) {
  let set = baseSet;
  for (var url of addSet) {
    try {
      const domain = new URL(url).hostname;
      if (conf.allowDomain.indexOf(domain) !== -1 && !doneData.has(url)) {
        set.add(url);
      }
    } catch (e) {
      console.log("ERROR:" + url);
    }
  }
  return set;
}
