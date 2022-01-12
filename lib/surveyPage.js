require('date-utils');
const fs = require("fs").promises;
const puppeteer = require("puppeteer");
const path = require("path");
const PageData = require("./dao/pageData.js");
const getPageDataEval = require("./getPageDataEval.js");
const yaml = require("./io/yaml.js");
const textIo = require("./io/text.js");
const conf = yaml.load("conf.yaml");
const TimeId = require("./tool/timeId.js");
const sleep = require("./tool/sleep");

const htmlDir = "./result/" + conf.id + "/htmlData/";
(async () => {
  if (conf.saveHtml) await fs.mkdir(htmlDir, { recursive: true });
})();

exports.survey = async function survey(browser, targetUrl,targetId) {
  let pageData = new PageData();
  try {
    if (isLoadBlockUrl(targetUrl)) {
      // console.log("skip:" + targetUrl);
      pageData.info.status = "skip";
      pageData.info.url = targetUrl;
      pageData.info.checkDate = new Date().toFormat("YYYY/MM/DD HH24:MI:SS");
      pageData.info.id = targetId;
    } else {
      // console.log("open:" + targetUrl);
      let page = await browser.newPage();
      page = await settingBasicAuthenticate(page);
      page = await initLoadBlockFile(page);
      if (typeof conf.emulateDevice !== "undefined") {
        await page.emulate(puppeteer.devices[conf.emulateDevice]);
      }
      let res = await page.goto(targetUrl, {
        waitUntil: "networkidle0",
        timeout: conf.timeout,
      });
      await sleep(conf.loadWait)
      if (conf.saveHtml) {
        await textIo.exportHtmlData(
          await res.text(),
          htmlDir + targetId + ".txt"
        );
      }
      pageData = await getPageDataEval.get(page);
      pageData.info.url = targetUrl;
      pageData.info.status = (typeof res._status === 'undefined')? '':res._status;
      pageData.info.contentType = (typeof res.headers()['content-type'] === 'undefined')? '':res.headers()['content-type'];
      pageData.info.lastModified = (typeof res.headers()['last-modified'] === 'undefined')? '':new Date(res.headers()['last-modified']).toFormat("YYYY/MM/DD HH24:MI:SS");
      pageData.info.checkDate = new Date().toFormat("YYYY/MM/DD HH24:MI:SS");
      pageData.info.id = targetId;
      await page.close();
      await sleep(conf.interval)
    }
  } catch (e) {
    console.log(e.name);
    pageData = new PageData();
    pageData.info.status = e.name;
  }

  return new Promise(function (resolve) {
    resolve(pageData);
  });
};
function isLoadBlockUrl(targetUrl) {
  let blockFlag = false;
  const url = new URL(targetUrl);
  let ext = path.extname(url.pathname).replace(".", "");

  conf.loadBlockFileExtention.some((blockExt) => {
    if (ext == blockExt || ext.toUpperCase() == blockExt) {
      blockFlag = true;
      return true; //break
    }
  });
  return blockFlag;
}
async function initLoadBlockFile(page) {
  await page.setRequestInterception(true);
  page.on("request", (interceptedRequest) => {
    let loadFlag = true;
    conf.loadBlockFileExtention.some((ext) => {
      if (interceptedRequest.url().endsWith(ext) || interceptedRequest.url().endsWith(ext.toUpperCase())) {
        loadFlag = false;
        return true; //break
      }
    });
    if (loadFlag) interceptedRequest.continue();
    else interceptedRequest.abort();
  });
  return new Promise(function (resolve) {
    resolve(page);
  });
}

async function settingBasicAuthenticate(page) {
  if (
    conf.hasOwnProperty("basicAuthentication") &&
    conf.basicAuthentication.hasOwnProperty("username") &&
    conf.basicAuthentication.hasOwnProperty("password")
  ) {
    await page.authenticate(conf.basicAuthentication);
  }
  return new Promise(function (resolve) {
    resolve(page);
  });
}

function escapeToFileName(url) {
  return url.replace(/(\\|\/|:|\*|\?|"|<|>|\||\.)/g, "_");
}
