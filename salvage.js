const fs = require("fs").promises;
const puppeteer = require("puppeteer");
const surveyPage = require("./lib/surveyPage");
const yamlIo = require("./lib/io/yaml");
const jsonIo = require("./lib/io/json");
const conf = yamlIo.load("conf.yaml");
const nedb = require('nedb');

const pageDataDir = "./result/" + conf.id + "/pageData/";

let db = {};
db.UrlList = new nedb({ filename: 'result/'+conf.id+'/db', autoload: true });
db.UrlList.ensureIndex({
    fieldName: 'url',
    unique: true
})

init();
main();

async function init() {
    (async () => {
        await fs.mkdir(pageDataDir, { recursive: true });
    })();

    if (await countNotYetUrl() > 0) {
        console.log('前回処理実行時のデータが存在します。途中から開始します。')
    } else {
        conf.startUrl.forEach(url => {
            db.UrlList.insert({
                url: url,
                status: 'notyet'
            }, function (err) {
                // console.log(err)
            })
        });
    }
}
async function main() {
    console.time("salvage time");

    browser = await puppeteer.launch(conf.browser);
    //
    let kanryo = await countDoneUrl();
    let nokori = await countNotYetUrl();
    while (nokori > 0) {
        let target = await getNotYetUrl1()
        let targetId = target._id;
        let targetUrl = target.url;

        let pageData = await surveyPage.survey(browser, targetUrl,targetId);

        pageData.hrefs.forEach(url => {
            // console.log(url)
            if (isAllowDomain(url)) {
                let insertUrl = url;
                if(conf.hashDelete){
                    insertUrl = conf.hashDelete? insertUrl.replace(/#.*$/,"") : insertUrl;
                }
                db.UrlList.insert({
                    url: insertUrl,
                    status: 'notyet'
                }, function (err) {
                    // console.log('skip:' + insertUrl)
                })
            }
        })

        jsonIo.write(pageDataDir + target._id + '.json', pageData)
        await updateDone(targetUrl)

        console.log('[残り:' + nokori + ']', '[完了:' + (++kanryo) + ']', '('+targetUrl+' のチェックが終わったところ)')

        nokori = await countNotYetUrl()
    }
    await closeBrowser();
    // await exportXlsxResult();

    console.timeEnd("salvage time");
}
function isAllowDomain(url) {
    let rtn = false;
    const domain = new URL(url).hostname;
    if (conf.allowDomain.indexOf(domain) !== -1) {
        rtn = true;
    }
    return rtn;
}
async function countNotYetUrl() {
    let rtn = await new Promise((resolve, reject) => {
        db.UrlList.count({ status: 'notyet' }, (err, count) => {
            if (err) {
                reject(err);
            } else {
                resolve(count);
            }
        });
    });
    return rtn;
}
async function countDoneUrl() {
    let rtn = await new Promise((resolve, reject) => {
        db.UrlList.count({ status: 'done' }, (err, count) => {
            if (err) {
                reject(err);
            } else {
                resolve(count);
            }
        });
    });
    return rtn;
}
async function getNotYetUrl1() {
    let rtn = await new Promise((resolve, reject) => {
        db.UrlList.findOne({ status: 'notyet' }, (err, doc) => {
            if (err) {
                reject(err);
            } else {
                resolve(doc);
            }
        });
    });
    return rtn;
}
async function updateDone(url) {
    let rtn = await new Promise((resolve, reject) => {
        db.UrlList.update({
            url: url
        }, {
            $set: {
                status: 'done'
            }
        }, (err, numOfDocs) => {
            if (err) {
                reject(err);
            } else {
                resolve(numOfDocs);
            }
        });
    });
    return rtn;
}
async function closeBrowser() {
    await browser.close();
    console.log("-----CRAWL END-----");
    return new Promise(function (resolve) {
        resolve();
    });
}