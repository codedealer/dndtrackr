export default {
  q: [],
  push (packet, request) {
    if (this.has(packet.id)) throw new Error(`trying to push the request ${packet.id} twice`);

    this.q.push({
      id: packet.id,
      max: packet.params.max,
      pending: true,
      request
    });
  },
  has (id) {
    return this.q.some(req => req.id === id);
  },
  ok (packet) {
    let req = this.q.find(r => r.id === packet.id);

    if (!req) {
      this.q.push({
        id: packet.id,
        max: packet.params.max,
        pending: false
      });

      return;
    }

    req.pending = false;
  },
  fail (packet) {
    this.ok(packet);
  },
  pending (max) {
    return this.q.some(req => req.pending && req.max === max)
  },
  waitFor (max) {
    return this.q.find(req => req.pending && req.max === max).request;
  }
}
