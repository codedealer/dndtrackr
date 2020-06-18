import config from '../config';

class Packet {
  constructor(n, min, max, sampleSize, id, apiKey) {
    this.jsonrpc = '2.0';
    this.method = 'generateIntegers';
    this.id = id;
    this.params = {
      apiKey,
      n: sampleSize,
      min,
      max,
      replacement: true,
      base: 10
    };
  }
}

let id = 1;
function getPacket(n, min, max) {
  if (!config.randomApiKey) {
    throw new Error('No api credentials for random.org. Check config folder.');
  }

  let sampleSize = config.randomSampleSize || 100;
  return new Packet(n, min, max, sampleSize, id++, config.randomApiKey);
}

export default getPacket;
