exports.get = function get() {
  var now = new Date();
  var res =
    "" +
    now.getFullYear() +
    zeroPadding(now.getMonth() + 1, 2) +
    zeroPadding(now.getDate(), 2) +
    zeroPadding(now.getHours(), 2) +
    zeroPadding(now.getMinutes(), 2) +
    zeroPadding(now.getSeconds(), 2) +
    zeroPadding(now.getMilliseconds(), 3);
  return res;
};
function zeroPadding(num, len) {
  return (Array(len).join("0") + num).slice(-len);
}
