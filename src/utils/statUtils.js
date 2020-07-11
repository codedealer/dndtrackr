export default {
  getModifier: (stat) => {
    stat = parseInt(stat);
    if (isNaN(stat)) return 0;

    return Math.floor((stat - 10) / 2);
  },
}