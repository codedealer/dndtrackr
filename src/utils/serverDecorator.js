import converter from './crConverter';

const skillIndex = {
  acrobatics: 'Acrobatics',
  handling: 'Animal Handling',
  ['animal handling']: 'Animal Handling',
  arcana: 'Arcana',
  athletics: 'Athletics',
  deception: 'Deception',
  history: 'History',
  insight: 'Insight',
  intimidation: 'Intimidation',
  intimidate: 'Intimidation',
  investigation: 'Investigation',
  medicine: 'Medicine',
  nature: 'Nature',
  perception: 'Perception',
  performance: 'Performance',
  persuasion: 'Persuasion',
  religion: 'Religion',
  ['sleight of hand']: 'Sleight of Hand',
  hand: 'Sleight of Hand',
  stealth: 'Stealth',
  survival: 'Survival',
}

const attributeIndex = {
  strength: true,
  dexterity: true,
  constitution: true,
  intelligence: true,
  wisdom: true,
  charisma: true,
}

const saveIndex = {
  strength_save: true,
  dexterity_save: true,
  constitution_save: true,
  intelligence_save: true,
  wisdom_save: true,
  charisma_save: true,
}

const parsableIndex = {
  actions: true,
  special_abilities: true,
  actions: true,
  reactions: true,
  spells: true,
  legendary_actions: true,
}

export default {
  prepare (data) {
    const result = {
      attributes: {},
      saves: {},
      skills: {},
    };

    for (const prop in data) {
      if (skillIndex[prop]) {
        result.skills[skillIndex[prop]] = data[prop];
      } else if (attributeIndex[prop]) {
        let attr = parseInt(data[prop]);
        if (!isNaN(attr)) {
          result.attributes[prop] = attr;
        }
      } else if (saveIndex[prop]) {
        let save = parseInt(data[prop]);
        if (!isNaN(save)) {
          result.saves[prop] = save;
        }
      } else if (parsableIndex[prop]) {
        let p = false;
        try {
          p = JSON.parse(data[prop]);
        } catch (e) {
          console.error(`Error while parsing ${prop} in monster data`);
        }

        if (p) {
          result[prop] = p;
        }
      } else if (prop === 'challenge_rating') {
        result[prop] = data[prop];
        result['xp'] = converter.crToXp(data[prop]);
      } else {
        result[prop] = data[prop];
      }
    }

    return result;
  },
  getActorIndex (actor, uid, key) {
    return {
      name: actor.name,
      type: actor.data.type,
      subtype: actor.data.subtype,
      challenge_rating: actor.data.challenge_rating,
      tag: uid,
      actor_tags: actor.tags.slice(),
      actor_type: actor.type,
      key,
    }
  },
  getSpellIndex: (spell, uid, key) => ({
    concentration: spell.data.concentration,
    dnd_class: spell.data.dnd_class.slice(),
    key,
    level: spell.data.level_int,
    name: spell.data.name,
    ritual: spell.data.ritual,
    school: spell.data.school,
    tag: uid,
  }),
  getActorPayload (actor, k) {
    const { uid, key, ...result } = actor;
    result.key = k;

    return result;
  },
  getSpellPayload (spell, k) {
    const { key, ...result } = spell;
    result.key = k;

    return result;
  }
}