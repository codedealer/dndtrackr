import axios from 'axios'
import api from './api-key.json'
import cache from './cache'
import queue from './queue'

let id = 10;
const sampleSize = 100;
const url = 'https://api.random.org/json-rpc/1/invoke';

function compose (n, min, max) {
  return {
    jsonrpc: '2.0',
    method: 'generateIntegers',
    params: {
      apiKey: api.api,
      n: sampleSize,
      min: min,
      max: max,
      replacement: true,
      base: 10
    },
    id: id++
  }
}

export default {
  queue,
  get (max, n = 1) {
    if (max === 0 || n === 0) return Promise.resolve([0]);
    if (parseInt(max, 10) <= 1 || isNaN(parseInt(max, 10))) max = 2;
    if (n > sampleSize) n = sampleSize;

    if (cache.has(max, n)) return Promise.resolve(cache.get(max, n));

    return new Promise((resolve, reject) => {
      const packet = compose(n, 1, max);

      if (this.queue.pending(max)) {
        this.queue.waitFor(max).then(() => {
          this.get(max, n).then(data => {
            resolve(data);
          });
        });
        return;
      }

      const request = axios.post(url, JSON.stringify(packet));
      this.queue.push(packet, request);

      request.then((response) => {
        if (response.data.error) {
          this.queue.fail(packet);
          return reject(response.data.error);
        }

        if (response.data.result && response.data.result.random.data.length) {
          cache.update(max, response.data.result.random.data);
          this.queue.ok(packet);
          resolve(cache.get(max, n));
        }
      })
      .catch((err) => {
        this.queue.fail(packet);
        reject(err);
      });
    });
  }
}
