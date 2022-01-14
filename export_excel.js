const yamlIo = require("./lib/io/yaml");
const xlsxIo = require("./lib/io/xlsx");
const PageData = require("./lib/dao/pageData.js");
const conf = yamlIo.load("conf.yaml");
const nedb = require('nedb');


let db = {};
db.UrlList = new nedb({ filename: 'result/' + conf.id + '/db', autoload: true });
db.UrlList.ensureIndex({
    fieldName: 'url',
    unique: true
})
main();

async function main() {
    let rows = [];
    let headerRow = [];

    headerRow = Object.keys(new PageData().info)
    rows.push(headerRow);

    console.log('出力開始')
    let docs = await getDones();
    docs.forEach(doc => {
        let tmpRow = [];
        let pageDataFilePath = "./result/" + conf.id + "/pageData/" + doc['_id'] + '.json';
        // console.log(pageDataFilePath)
        try {
            let pageData = require(pageDataFilePath);
            let info = pageData.info;
            headerRow.forEach(item => {
                tmpRow.push(info[item])
            });
        } catch (e) {
            headerRow.forEach(item => {
                tmpRow.push("error")
            });
        }
        rows.push(tmpRow)
    });

    const filename = "./result/" + conf.id + "/" + conf.id + '.xlsx';
    await xlsxIo.xlsxExport(rows, filename);
    console.log("ファイル出力完了:" + filename);
}
async function getDones() {
    let rtn = await new Promise((resolve, reject) => {
        db.UrlList.find({ status: 'done' }).sort({ url: 1 }).exec((err, docs) => {
            if (err) {
                reject(err);
            } else {
                resolve(docs);
            }
        });
    });
    return rtn;
}