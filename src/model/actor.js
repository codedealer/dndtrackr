import TYPES from './ACTOR_TYPES';
import COLORS from './COLORS';
import dataFactory from '../utils/actorDataFactory';
import settingsFactory from '../utils/actorSettingsFactory';

class Actor {
  constructor (uid, type = TYPES.monster, settings = false) {
    this.uid = uid;
    this.type = type;
    this.name = '';
    this.key = '';
    this.initiative = 0;
    this.data = dataFactory();
    this.settings = settings || settingsFactory();
    this.status = [];
    this.color = Object.assign({}, COLORS[0]);
    this.notes = '';
  }
}

export default Actor;