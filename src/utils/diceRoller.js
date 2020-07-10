import random from '../random';
import DiceResult from '../parser/diceResult';

export default {
  async getRollsResult (state, commit, diceParams) {
    let promises = [];
    const rolls = diceParams.isModifiedRoll() ? 2 : 1;

    for (let i = 0; i < rolls; i++) {
      let map = Object.values(diceParams.dice).map(dieObj => {
        return random.get({ commit, state }, dieObj);
      });
      promises = [...promises, ...map];
    }

    let results = await Promise.all(promises);

    const diceRolls = [{}, {}];
    for (let i = 0; i < rolls; i++) {
      Object.keys(diceParams.dice).forEach(key => {
        diceRolls[i][key] = results.shift();
      });
    }

    return new DiceResult(diceParams, diceRolls);
  }
}