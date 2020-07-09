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
      } else {
        result[prop] = data[prop];
      }
    }

    return result;
  }
}