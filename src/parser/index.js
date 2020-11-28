import DP from './diceParams';

export default {
  test(str) {
    if (!str) return true;
    // sanitize
    str = str.replace(/\s/g, '').toLowerCase();

    // determine roll modifer
    if (str.endsWith('a')) {
      str = str.substr(0, str.length - 1);
      // assume default d20
      if (!str.length) str = '1d20';
    } else if (str.endsWith('d')) {
      str = str.substr(0, str.length - 1);
      // assume default d20
      if (!str.length) str = '1d20';
    }

    //shortcuts
    if (/^\d{1,3}$/.test(str)) str = '1d' + str;
    if (/^[+-]\d+$/.test(str)) str = '1d20' + str;

    // validate and get dice
    let parsedStr = str.split(/\b/);
    for (let i = parsedStr.length - 1; i >= 0; i--) {
      // eslint-disable-next-line no-useless-escape
      if (/^[+\-*\/]$/.test(parsedStr[i])) {
        if (i == parsedStr.length - 1) return 'String ends with a sign';
        continue;
      }
      if (/^\d+$/.test(parsedStr[i])) continue;

      if (/^(\d{1,2})?d(\d{1,3})$/.test(parsedStr[i]) === false) {
        return 'Invalid dice syntax';
      }
    }

    return true;
  },
  parse(str) {
    // sanitize
    str = str.replace(/\s/g, '').toLowerCase();

    const DiceParams = new DP();

    // determine roll modifer
    if (str.endsWith('a')) {
      str = str.substr(0, str.length - 1);
      DiceParams.advantage = true;
      // assume default d20
      if (!str.length) str = '1d20';
    } else if (str.endsWith('d')) {
      str = str.substr(0, str.length - 1);
      DiceParams.disadvantage = true;
      // assume default d20
      if (!str.length) str = '1d20';
    }

    //shortcuts
    if (/^\d{1,3}$/.test(str)) str = '1d' + str;
    if (/^[+-]\d+$/.test(str)) str = '1d20' + str;

    // validate and get dice
    DiceParams.parsedStr = str.split(/\b/);
    DiceParams.parsedStr.forEach((item, i) => {
      // eslint-disable-next-line no-useless-escape
      if (/^[+\-*\/]$/.test(item)) return;
      if (/^\d+$/.test(item)) return;

      let dieMatch = /^(\d{1,2})?d(\d{1,3})$/.exec(item);

      if (dieMatch === null) throw new Error('Invalid dice syntax');

      DiceParams.dice[i] = {
        die: parseInt(dieMatch[2]),
        n: dieMatch[1] ? parseInt(dieMatch[1]) : 1
      };
    });

    return DiceParams;
  }
};
