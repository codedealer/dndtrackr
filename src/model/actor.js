import TYPES from './ACTOR_TYPES';
import COLORS from './COLORS';
import dataFactory from '../utils/actorDataFactory';

class Actor {
  constructor (uid, type = TYPES.monster, settings = {
 showHitPointWidget: true }) {
    this.uid = uid;
    this.type = type;
    this.name = '';
    this.key = '';
    this.initiative = 0;
    this.data = Object.assign(dataFactory());
    this.settings = settings;
    this.status = [];
    this.color = COLORS[0];
    this.notes = '';
  }
}

export default Actor;