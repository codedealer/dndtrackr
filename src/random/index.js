import axios from 'axios'
import api from './api-key.json'
import cache from './cache'

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
  get (max, n = 1) {
    if (parseInt(max, 10) <= 1) max = 2;
    if (n > sampleSize) n = sampleSize;

    if (cache.has(max, n)) return Promise.resolve(cache.get(max, n));

    return new Promise((resolve, reject) => {
      axios.post(url, JSON.stringify(compose(n, 1, max)))
        .then((response) => {
          if (response.data.error) return reject(response.data.error);

          if (response.data.result && response.data.result.random.data.length) {
            cache.update(max, response.data.result.random.data);
            resolve(cache.get(max, n));
          }
        })
        .catch((err) => { reject(err) });
    });
  }
}
