import TYPE from './monster-type.json'
import parser from './parser'
import random from './random'

export default class Monster {
  constructor (type = TYPE.monster) {
    this.type = type;
    this.name = '';
    this.info = '';
    this.key = '';
    this.health = 0;
    this.initiative = 0;
    this.dex = 0;
    this.xp = 0;
  }
  setData (data, softReset = false) {
    if (!data.name || !data.hasOwnProperty('description')) throw new Error('Invalid monster data');

    this.name = data.name;
    this.info = data.description;
    if (data.hasOwnProperty('dex')) {
      let dex = parseInt(data.dex);
      if (!isNaN(dex)) this.dex = dex;
    }
    if (data.hasOwnProperty('xp')) {
      let xp = parseInt(data.xp);
      if (!isNaN(xp)) this.xp = xp;
    }
    if (!softReset && data.hasOwnProperty('hit')) this.getHealth(data.hit);
  }
  getHealth (hitDice) {
    let diceParams;
    try {
      diceParams = parser.parse(hitDice);
    } catch (e) {
      console.error(e);
      this.health = 0;
      return;
    }

    random.get(diceParams.die, diceParams.n)
      .then(data => {
        this.health = data.reduce((prev, cur) => prev + cur) + diceParams.modifier;
      })
      .catch(e => { console.error(e); });
  }
}
