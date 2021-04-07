module.exports = class PageData {
  constructor(name) {
    this.info = {
      status: "",
      title: "",
      description: "",
      keywords: "",
      canonical: "",
      viewport: "",
      charset: "",
    };
    this.hrefs = new Set();
  }
};
