module.exports = class PageData {
  constructor(name) {
    this.info = {
      url:"",
      status: "",
      title: "",
      description: "",
      keywords: "",
      canonical: "",
      viewport: "",
      contentType:"",
      charset: "",
      lastModified:"",
      checkDate:"",
      id:"",
    };
    this.hrefs = [];
  }
};
