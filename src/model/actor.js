import TYPES from './ACTOR_TYPES';
import COLORS from './COLORS';

class Actor {
  constructor (uid, type = TYPES.monster, data = { hit_points: 0 }, settings = {
 showHitPointWidget: true }) {
    this.uid = uid;
    this.type = type;
    this.name = '';
    this.key = '';
    this.initiative = 0;
    this.data = data;
    this.settings = settings;
    this.status = [];
    this.color = COLORS[0];
    this.notes = '';
  }
}

export default Actor;