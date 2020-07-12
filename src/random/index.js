import queue from './queue';
import getPacket from './packet';
import config from '../config';

class Random {
  constructor() {
    if (!config.randomApiKey || !config.randomApiUrl) {
      throw new Error(
        'No api credentials for random.org. Check config folder.'
      );
    }
    this.queue = queue;

    this.sampleSize = config.randomSampleSize || 100;
    this.url = config.randomApiUrl;
  }
  async get({ commit, state }, { die, n }) {
    if (die === 0 || n === 0) return Promise.resolve([0]);
    if (parseInt(die, 10) <= 1 || isNaN(parseInt(die, 10))) die = 2;
    if (n > this.sampleSize) n = this.sampleSize;

    if (state.cache.has(die, n)) {
      let data = state.cache.get(die, n);
      commit('RETRIEVE_CACHE', { die, n });

      return Promise.resolve(data);
    } else if (state.local) {
      // fallback to local generator
      return Promise.resolve(this.local(die, n));
    }

    // check if there are already requests with that
    if (this.queue.pending(die)) {
      await this.queue.waitFor(die);
      return this.get({ commit, state }, { die, n });
    }

    // build request
    const packet = getPacket(n, 1, die);

    let response;
    try {
      const request = fetch(this.url, {
        method: 'POST',
        cache: 'no-cache',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(packet),
      });

      this.queue.push(packet);

      response = await request;
      if (response.status !== 200) {
        throw new Error(`Request to remote api server returned ${response.status}`);
      }
    } catch (e) {
      this.queue.fail(packet);
      throw new Error('Request to remote api server failed');
    }

    response = await response.json();

    if (response.error) {
      this.queue.fail(packet);
      throw new Error(response.error);
    }

    if (!response.result || !response.result.random.data.length) {
      this.queue.fail(packet);
      throw new Error('Invalid data');
    }

    return new Promise((resolve, reject) => {
      commit('POPULATE_CACHE', {
        die,
        results: response.result.random.data
      });

      this.queue.ok(packet);

      let data = state.cache.get(die, n);
      commit('RETRIEVE_CACHE', { die, n });

      resolve(data);
    });
  }
  local(die, n) {
    let results = [];
    for (let i = 0; i < n; i++) {
      results.push(Math.floor(Math.random() * die) + 1);
    }

    return results;
  }
}

export default new Random();
