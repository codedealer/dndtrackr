let template = {
  die: 0,
  n: 0,
  modifier: 0,
  advantage: false,
  disadvantage: false
}

class DiceParams {
  constructor () {
    this.dice = {};
    this.parsedStr = [];
    this.advantage = false;
    this.disadvantage = false
  }
  represent (diceRoll) {
    return Object.assign([], this.parsedStr, diceRoll).join(' ');
  }
  eval (diceRoll) {
    // eslint-disable-next-line no-eval
    return eval(this.represent(diceRoll));
  }
}

export default {
  parse (str, forceArray = false) {
    // sanitize
    str = str.replace(/\s/g, '');

    if (!forceArray) return this.parseHealth(str);

    let diceParams = new DiceParams();

    if (str.endsWith('a')) {
      str = str.substr(0, str.length - 1);
      diceParams.advantage = true;
      if (!str.length) str = '1d20';
    } else if (str.endsWith('d')) {
      str = str.substr(0, str.length - 1);
      diceParams.disadvantage = true;
      if (!str.length) str = '1d20';
    }

    //shortcuts
    if (/^\d{1,3}$/.test(str)) str = '1d' + str;
    if (/^[+-]\d+$/.test(str)) str = '1d20' + str;

    // validate and get dice
    diceParams.parsedStr = str.split(/\b/);
    diceParams.parsedStr.forEach((item, i) => {
      // eslint-disable-next-line no-useless-escape
      if (/^[+\-*\/]$/.test(item)) return;
      if (/^\d+$/.test(item)) return;

      let dieMatch = /^(\d{1,2})?d(\d{1,3})$/.exec(item);

      if (dieMatch === null) throw new Error('parer validation error');

      diceParams.dice[i] = {
        die: parseInt(dieMatch[2]),
        n: (dieMatch[1] ? parseInt(dieMatch[1]) : 1)
      }
    });

    return diceParams;
  },
  parseHealth (str) {
    let dieRegex = /(\d+)d(\d+)(([+-])(\d+))?/

    let result = dieRegex.exec(str);
    if (result === null) throw new Error(`Parse error for ${str}`);

    let obj = Object.assign({}, template);
    let n = parseInt(result[1], 10);
    obj.n = n > 0 ? n : 1;

    let die = parseInt(result[2], 10);
    obj.die = die > 1 ? die : 2;

    if (result[3] !== undefined) {
      let modifier;

      if (result[4] === '-') {
        modifier = parseInt(`-${result[5]}`, 10);
      } else {
        modifier = parseInt(result[5], 10);
      }

      obj.modifier = modifier;
    }

    return obj;
  }
}
