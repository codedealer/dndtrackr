import diceRoller from '../../utils/diceRoller';
import cache from '../../random/cache';
import history from '../../history';
import config from '../../config';
import DiceResult from '../../parser/diceResult';
import DiceParams from '../../parser/diceParams';

const state = () => {
  if (!config.randomApiKey || !config.randomApiUrl) {
    throw new Error('No api credentials for random.org. Check config folder.');
  }

  return {
    input: '',
    result: new DiceResult(new DiceParams()),
    cache,
    history,
    local: false
  };
};

const getters = {
  input: state => state.input,
  resultEmpty: state => state.result.empty,
  diceParams: state => state.result.diceParams,
  rolls: state => state.result.rolls.filter(roll => !!Object.keys(roll).length),
  inputRepresentation: state => state.result.representInput(),
  inputRestoration: state => state.result.representInput(true),
  rollRepresentation: state => roll => {
    return state.result.diceParams.parsedStr.map((str, i) => {
      if ({}.hasOwnProperty.call(roll, i)) {
        return { str: roll[i].join(' + '), isDie: true };
      } else {
        return { str, isDie: false };
      }
    });
  },
  rollTotal: state => roll => {
    try {
      return state.result.eval(roll);
    } catch (e) {
      return 'syntax error';
    }
  },
  resultTotal: (state, getters) => {
    if (state.result.empty) return 0;

    let rollTotal1 = getters['rollTotal'](state.result.rolls[0]);
    if (!state.result.diceParams.isModifiedRoll()) {
      return rollTotal1;
    }

    let rollTotal2 = getters['rollTotal'](state.result.rolls[1]);
    if (state.result.diceParams.advantage) {
      return Math.max(rollTotal1, rollTotal2);
    }

    return Math.min(rollTotal1, rollTotal2);
  },
  nat: (state, getters) => {
    const keys = Object.keys(state.result.diceParams.dice);
    let output = '';
    // show badge only for throws of 1 d20
    if (keys.length !== 1) return output;
    if (
      state.result.diceParams.dice[keys[0]].die !== 20 ||
      state.result.diceParams.dice[keys[0]].n !== 1
    )
      return output;

    if (state.result.diceParams.isModifiedRoll()) {
      output = state.result.diceParams.advantage ? 'adv' : 'd/adv';
    }
    // check winning roll for naturals
    let winningRoll;
    if (
      getters['resultTotal'] === getters['rollTotal'](state.result.rolls[0])
    ) {
      winningRoll = state.result.rolls[0][keys[0]][0];
    } else {
      winningRoll = state.result.rolls[1][keys[0]][0];
    }

    if (winningRoll === 20 || winningRoll === 1) {
      return `nat ${winningRoll}`;
    }

    return output;
  }
};

const mutations = {
  SET_TEXT(state, payload) {
    state.input = payload;
  },
  POPULATE_CACHE(state, { die, results }) {
    state.cache.update(die, results);
  },
  RETRIEVE_CACHE(state, { die, n }) {
    state.cache.remove(die, n);
  },
  SET_RESULT(state, diceResult) {
    if (!(diceResult instanceof DiceResult)) {
      throw new Error(
        'Submitted dice result is not an instance of class DiceResult'
      );
    }

    state.result = diceResult;
  },
  PUSH_HISTORY(state) {
    state.history.push(state.result);
  },
  PREV_HISTORY(state) {
    state.history.prev();
  },
  NEXT_HISTORY(state) {
    state.history.next();
  }
};

const actions = {
  async roll({ commit, state }, diceParams) {
    const result = await diceRoller.getRollsResult(state, commit, diceParams);

    commit('SET_RESULT', result);
    commit('PUSH_HISTORY');
    commit('SET_TEXT', '');
  },
  async rollHitDice({ state, commit }, { diceParams, index }) {
    const result = await diceRoller.getRollsResult(state, commit, diceParams);

    const total = result.eval(result.rolls[0]);
    commit('encounter/UPDATE_DATA', { index, hit_points: total }, { root: true });
  },
  prevRoll({ state, getters, commit }) {
    commit('PREV_HISTORY');
    const result = state.history.current;
    if (result === false) return;

    commit('SET_RESULT', result);
    commit('SET_TEXT', getters['inputRestoration']);
  },
  nextRoll({ state, getters, commit }) {
    commit('NEXT_HISTORY');
    const result = state.history.current;
    if (result === false) {
      commit('SET_TEXT', '');
      commit('SET_RESULT', new DiceResult(new DiceParams()));

      return;
    }

    commit('SET_RESULT', result);
    commit('SET_TEXT', getters['inputRestoration']);
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};
