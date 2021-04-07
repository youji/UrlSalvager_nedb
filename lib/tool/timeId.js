const ct = require("./currentTime.js");
class TimeId {
  constructor() {
    this.timeId = ct.get();
  }
  getTimeId() {
    return this.timeId;
  }
}
module.exports = new TimeId();
