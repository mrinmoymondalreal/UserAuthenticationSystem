function len(d) {
  return typeof d == "number" ? d : d.toString().length;
}

export function checkmodel(model, data) {
  for (let key of Object.keys(model)) {
    if (model[key].isRequired && !data[key]) return false;
    if (model[key].len) {
      let d = len(data[key]);
      if (model[key].len.max < d || model[key].len.min > d) return false;
    }
    if (model[key].type != typeof data[key]) return false;
    if (model[key].regExp && !model[key].regExp.test(data[key])) return false;
  }
  return true;
}
