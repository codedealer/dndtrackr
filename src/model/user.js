let user = {
  state: false,
  uid: false,
  displayName: '',
  photo: '',
  token: false,
  monsterIndex: [],
  spellIndex: [],
  featIndex: [],
  settings: {
    randomHitpoints: false,
    actorsOrderBy: 'name',
    actorsOrderAsc: true,
    spellsOrderBy: 'name',
    spellsOrderAsc: true,
    featsOrderBy: 'name',
    featsOrderAsc: true,
  },
}

export default user;