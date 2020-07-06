import Actor from '../../model/actor';
import ACTOR_TYPES from '../../model/ACTOR_TYPES';
import COLORS from '../../model/COLORS';

const state = () => ({
  uid: 0,
  selected: false,
  actors: [],
});

const mutations = {
  ADD_ACTOR (state) {
    state.actors.push(new Actor(state.uid++));
    state.selected = state.uid - 1;
  },
  SELECT_ACTOR (state, uid) {
    state.selected = uid;
  },
  SET_ACTOR_INITIATIVE (state, { index, value }) {
    value = value < 0 ? 0 : value;
    if (value !== '' && typeof value === 'string') {
      value = '';
    }

    state.actors[index].initiative = value;
  },
  CHANGE_ACTOR_TYPE (state, index) {
    state.actors[index].type = (state.actors[index].type + 1) % 2;
  },
  CHANGE_ACTOR_COLOR (state, { actorIndex, colorIndex }) {
    state.actors[actorIndex].color = COLORS[colorIndex];
  },
  SET_ACTOR_NAME (state, { index, value }) {
    state.actors[index].name = value;
  },
  SET_ACTOR_KEY (state, { index, value }) {
    if (!value) value = '';
    state.actors[index].key = value;
  },
  REMOVE_ACTOR (state, index) {
    if (state.selected === state.actors[index].uid) {
      state.selected = false;
    }
    state.actors.splice(index, 1);
  },
  UPDATE_SETTINGS (state, { index, ...settings }) {
    Object.assign(state.actors[index].settings, settings);
  },
  UPDATE_DATA (state, { index, ...data }) {
    Object.assign(state.actors[index].data, data);
  },
  ADD_STATUS (state, { index, status }) {
    state.actors[index].status.push(status);
  },
  EDIT_STATUS (state, { actorIndex, statusIndex, status }) {
    state.actors[actorIndex].status.splice(statusIndex, 1, status);
  },
  DELETE_STATUS (state, { actorIndex, statusIndex }) {
    state.actors[actorIndex].status.splice(statusIndex, 1);
  }
}

export default {
  namespaced: true,
  state,
  mutations,
}