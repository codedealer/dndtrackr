const queue = {
  q: [],
  push(packet) {
    if (this.has(packet.id))
      throw new Error(`trying to push the request ${packet.id} twice`);

    const request = {
      id: packet.id,
      max: packet.params.max,
      pending: true,
      resolver: false,
      promise: false,
    }

    request.promise = new Promise((resolve, reject) => { request.resolver = resolve });

    this.q.push(request);
  },
  has(id) {
    return this.q.some(req => req.id === id);
  },
  ok(packet) {
    let req = this.q.find(r => r.id === packet.id);

    if (!req) {
      this.q.push({
        id: packet.id,
        max: packet.params.max,
        pending: false
      });

      return;
    }

    req.resolver();
    req.pending = false;
  },
  fail(packet) {
    this.ok(packet);
  },
  pending(max) {
    return this.q.some(req => req.pending && req.max === max);
  },
  waitFor(max) {
    return this.q.find(req => req.pending && req.max === max).promise;
  }
};

export default queue;
