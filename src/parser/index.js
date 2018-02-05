let template = {
  die: 0,
  n: 0,
  modifier: 0,
  advantage: false,
  disadvantage: false
}

export default {
  parse (str, forceArray = false) {
    let obj;

    //sanitize
    str = str.replace(/\s/g, '');

    // shorthand
    if (/^\d+$/.test(str)) {
      obj = Object.assign({}, template);
      obj.n = 1;
      obj.die = parseInt(str, 10);
      return forceArray ? [obj] : obj;
    }

    let dieRegex = /^((\d+)?\()?((\d+)d)?(\d+)?(([+-])(\d+))?\)?([adAD])?$/

    let result = dieRegex.exec(str);
    if (result === null) throw new Error(`Parse error for ${str}`);

    let resultArray = [];
    let i = result[2] === undefined ? 1 : parseInt(result[2], 10);
    if (i < 1 || !forceArray) i = 1;
    if (result[9]) i = 2;

    while (i--) {
      obj = Object.assign({}, template);
      let n = result[4] ? parseInt(result[4], 10) : 1;
      if (result[9]) n = 1;
      obj.n = n > 0 ? n : 1;

      let die = result[5] ? parseInt(result[5], 10) : 20;
      obj.die = die > 1 ? die : 2;

      if (result[6] !== undefined) {
        let modifier;

        if (result[7] === '-') {
          modifier = parseInt(`-${result[8]}`, 10);
        } else {
          modifier = parseInt(result[8], 10);
        }

        obj.modifier = modifier;
      }

      if (result[9] !== undefined) {
        if (result[9].toLowerCase() === 'a') {
          obj.advantage = true;
        } else {
          obj.disadvantage = true;
        }
      }
      resultArray.push(obj);
    }

    if (forceArray) return resultArray;
    return resultArray.length > 2 ? resultArray : resultArray[0];
  }
}
