import axios from 'axios';
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
  get({ commit, state }, { die, n }) {
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
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      if (this.queue.pending(die)) {
        await this.queue.waitFor(die);
        let data = await this.get({ commit, state }, { die, n });
        resolve(data);
        return;
      }

      const packet = getPacket(n, 1, die);

      let response;
      try {
        const request = axios.post(this.url, JSON.stringify(packet), {
          headers: { 'Content-Type': 'application/json' }
        });
        this.queue.push(packet, request);

        response = await request;
      } catch (e) {
        this.queue.fail(packet);
        return reject('Request to remote api server failed');
      }

      if (response.data.error) {
        this.queue.fail(packet);
        return reject(response.data.error);
      }

      if (!response.data.result || !response.data.result.random.data.length) {
        this.queue.fail(packet);
        return reject('Invalid data');
      }

      commit('POPULATE_CACHE', {
        die,
        results: response.data.result.random.data
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
