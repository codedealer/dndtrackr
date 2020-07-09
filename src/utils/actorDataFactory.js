const dataFactory = () => {
  return {
    size: '',
    type: '',
    subtype: '',
    hit_points: 0,
    hit_dice: '',
    alignment: '',
    armor_class: 0,
    armor_desc: '',
    speed: '',
    attributes: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
    },
    saves: {},
    skills: {},
    damage_vulnerabilities: '',
    damage_resistances: '',
    damage_immunities: '',
    condition_immunities: '',
    senses: '',
    languages: '',
    challenge_rating: '',
    special_abilities: [],
    actions: [],
    reactions: [],
    spells: [],
    legendary_desc: '',
    legendary_actions: [],
  }
}

export default dataFactory;