const stats = new Map([
  ['charisma', 'CHA'],
  ['constitution', 'CON'],
  ['dexterity', 'DEX'],
  ['intelligence', 'INT'],
  ['strength', 'STR'],
  ['wisdom', 'WIS']
]);

export default {
  getModifier: (stat) => {
    stat = parseInt(stat);
    if (isNaN(stat)) return 0;

    return Math.floor((stat - 10) / 2);
  },
  shortAttribute: stat => {
    return stats.get(stat);
  },
  fixMod: mod => {
    if (!mod) return mod;
    let modFix = parseInt(mod);
    if (!isNaN(modFix) && modFix > 0) return `+${modFix}`;

    return mod;
  },
}