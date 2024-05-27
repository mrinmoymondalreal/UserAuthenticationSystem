const items = {
  config: require("./config.js"),
  isDef: (e) => !(e == undefined || e == null),
  check: (model, data) => {
    if (!(items.isDef(data) && data instanceof Object)) return false;
    for (let g in model) {
      if (!model[g].test(data[g])) return false;
    }
    return true;
  },
  randomIntInRange: function (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
  },
};

module.exports = items;
