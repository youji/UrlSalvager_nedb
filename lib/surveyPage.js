const fs = require("fs").promises;
const puppeteer = require("puppeteer");
const path = require("path");
const PageData = require("./dao/pageData.js");
const getPageDataEval = require("./getPageDataEval.js");
const yaml = require("./io/yaml.js");
const textIo = require("./io/text.js");
const conf = yaml.load("conf.yaml");
const TimeId = require("./tool/timeId.js");

const htmlDir = "./result/" + TimeId.getTimeId() + "/htmlcode/";
(async () => {
  if (conf.saveHtml) await fs.mkdir(htmlDir, { recursive: true });
})();

exports.survey = async function survey(browser, targetUrl) {
  let pageData = {};
  try {
    if (isLoadBlockUrl(targetUrl)) {
      console.log("skip:" + targetUrl);
      pageData = new PageData();
      pageData.info.status = "skip";
    } else {
      console.log("open:" + targetUrl);
      let page = await browser.newPage();
      page = await settingBasicAuthenticate(page);
      page = await initLoadBlockFile(page);
      if (typeof conf.emulateDevice !== "undefined") {
        await page.emulate(puppeteer.devices[conf.emulateDevice]);
      }
      let res = await page.goto(targetUrl, {
        waitUntil: "networkidle0",
        timeout: 0,
      });
      await page.waitForTimeout(conf.interval);
      if (conf.saveHtml) {
        await textIo.exportHtmlData(
          await res.text(),
          htmlDir + getUniuePageId(targetUrl) + ".txt"
        );
      }
      pageData = await getPageDataEval.get(page);
      pageData.info.status = res._status;
      await page.close();
    }
  } catch (e) {
    console.log("error:" + targetUrl);
    console.log(e);
    pageData = new PageData();
    pageData.info.status = "error";
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
    if (ext == blockExt) {
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
      if (interceptedRequest.url().endsWith(ext)) {
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

function getUniuePageId(url) {
  return url.replace(/(\\|\/|:|\*|\?|"|<|>|\||\.)/g, "_");
}
