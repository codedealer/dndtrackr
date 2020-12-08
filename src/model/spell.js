import dataFactory from '../utils/spellDataFactory';

function settings () {
  return { dirty: false }
}

class Spell {
  constructor () {
    this.key = '';
    this.settings = settings();
    this.tag = '';
    this.data = dataFactory();
  }
}

export default Spell;