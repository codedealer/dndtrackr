const state = () => ({
  _monsterIndex: [],
  _userMonsterIndex: [],
  _spellIndex: [],
  _userSpellIndex: [],
  _userFeatIndex: [],
});

const getters = {
  monsterIndex (state, getters, rootState) {
    if (rootState.user.state) {
      return [...state._monsterIndex, ...state._userMonsterIndex];
    }
    return state._monsterIndex;
  },
  spellIndex (state, getters, rootState) {
    if (rootState.user.state) {
      return [...state._spellIndex, ...state._userSpellIndex];
    }
    return state._spellIndex;
  },
  featIndex (state, getters, rootState) {
    return state._userFeatIndex;
  },
}

function fixProperty (property) {
  return property.startsWith('_') ? property : `_${property}`;
}

function setUserArray (state, payload) {
  let property, array;
  if (!Array.isArray(payload)) {
    if (typeof payload === 'object' && payload.property && Array.isArray(payload.value)) {
      // got the universal index object
      ({ property, value: array } = payload);
      property = fixProperty(property);
    } else {
      console.error('Trying to set user monster index with invalid array');
      throw new Error('Trying to set user monster index with invalid array');
      return;
    }
  } else {
    // assume the default is monsterIndex
    property = '_userMonsterIndex';
    array = payload;
  }

  if (!{}.hasOwnProperty.call(state, property)) {
    throw new Error(`Setting ${property} to data which is not permitted`);
  }

  state[property] = array;
}

function pushUserArray (state, el, property = '_userMonsterIndex') {
  if (!{}.hasOwnProperty.call(state, property)) {
    throw new Error(`Setting ${property} to data which is not permitted`);
  }

  state[property].push(el);
}

function updateUserArray (state, el, property = '_userMonsterIndex') {
  if (!{}.hasOwnProperty.call(state, property)) {
    throw new Error(`Setting ${property} to data which is not permitted`);
  }

  const i = state[property].findIndex(m => m.key === el.key);
  if (i < 0) throw new Error('Trying to update non-existing user index');

  state[property].splice(i, 1, el);
}

function removeUserArray (state, el, property = '_userMonsterIndex') {
  if (!{}.hasOwnProperty.call(state, property)) {
    throw new Error(`Setting ${property} to data which is not permitted`);
  }

  const i = state[property].findIndex(m => m.key === el.key);
  if (i < 0) return;

  state[property].splice(i, 1);
}

const mutations = {
  SET_MONSTER_INDEX (state, payload) {
    if (!Array.isArray(payload)) {
      console.error('Trying to set monster index with invalid array');
      return;
    }
    state._monsterIndex = payload;
  },
  SET_SPELL_INDEX (state, payload) {
    if (!Array.isArray(payload)) {
      console.error('Trying to set user spell index with invalid array');
      return;
    }
    state._spellIndex = payload;
  },
  SET_USER_INDEX (state, payload) {
    setUserArray(state, payload);
  },
  PUSH_USER_INDEX (state, el) {
    if (el.property && el.value) {
      pushUserArray(state, el.value, fixProperty(el.property));
    } else {
      pushUserArray(state, el);
    }
  },
  UPDATE_USER_INDEX (state, el) {
    if (el.property && el.value) {
      updateUserArray(state, el.value, fixProperty(el.property));
    } else {
      updateUserArray(state, el);
    }
  },
  REMOVE_USER_INDEX (state, el) {
    if (el.property && el.value) {
      removeUserArray(state, el.value, fixProperty(el.property));
    } else {
      removeUserArray(state, el);
    }
  },
  SET_USER_SPELL_INDEX (state, payload) {
    setUserArray (state, { property: '_userSpellIndex', value: payload });
  },
  PUSH_USER_SPELL_INDEX (state, el) {
    pushUserArray(state, el, '_userSpellIndex');
  },
  UPDATE_USER_SPELL_INDEX (state, el) {
    updateUserArray(state, el, '_userSpellIndex');
  },
  REMOVE_USER_SPELL_INDEX (state, el) {
    removeUserArray(state, el, '_userSpellIndex');
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
}