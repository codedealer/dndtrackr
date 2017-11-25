let template = {
  die: 0,
  n: 0,
  modifier: 0
}

export default {
  parse (str, forceArray = false) {
    let obj;

    // shorthand
    if (/^\d+$/.test(str)) {
      obj = Object.assign({}, template);
      obj.n = 1;
      obj.die = parseInt(str, 10);
      return forceArray ? [obj] : obj;
    }

    let dieRegex = /((\d+)?\s?\()?(\d+)d(\d+)(\s?([+-])\s?(\d+))?/

    let result = dieRegex.exec(str);
    if (result === null) throw new Error(`Parse error for ${str}`);

    let resultArray = [];
    let i = result[2] === undefined ? 1 : parseInt(result[2], 10);
    if (i < 1 || !forceArray) i = 1;

    while (i--) {
      obj = Object.assign({}, template);
      let n = parseInt(result[3], 10);
      obj.n = n > 0 ? n : 1;

      let die = parseInt(result[4], 10);
      obj.die = die > 1 ? die : 2;

      if (result[5] !== undefined) {
        let modifier;

        if (result[6] === '-') {
          let s = result[7].split('');
          s.unshift('-');
          modifier = parseInt(s.join(''), 10);
        } else {
          modifier = parseInt(result[7], 10);
        }

        obj.modifier = modifier;
      }
      resultArray.push(obj);
    }

    if (forceArray) return resultArray;
    return resultArray.length > 2 ? resultArray : resultArray[0];
  }
}
