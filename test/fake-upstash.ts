/**
 * A tiny in-memory stand-in for Upstash's REST pipeline endpoint, covering the
 * commands this app uses. Good enough for tests; not a Redis.
 */
import http from 'node:http';
import type { AddressInfo } from 'node:net';

type Value = string | string[] | Map<string, string>;

export async function startFakeUpstash(token = 'test-token') {
  const db = new Map<string, Value>();
  let down = false;
  let calls = 0;

  const run = (cmd: (string | number)[]): unknown => {
    const [name, key, ...args] = cmd.map(String);
    const hash = () => {
      let h = db.get(key);
      if (!(h instanceof Map)) db.set(key, (h = new Map()));
      return h;
    };
    const list = () => {
      let l = db.get(key);
      if (!Array.isArray(l)) db.set(key, (l = []));
      return l;
    };
    switch (name.toUpperCase()) {
      case 'GET': { const v = db.get(key); return typeof v === 'string' ? v : null; }
      case 'SET': {
        if (args.some(a => a.toUpperCase() === 'NX') && db.has(key)) return null;
        db.set(key, args[0]);
        return 'OK';
      }
      case 'INCR': { const n = Number(typeof db.get(key) === 'string' ? db.get(key) : 0) + 1; db.set(key, String(n)); return n; }
      case 'DEL': return db.delete(key) ? 1 : 0;
      case 'EXPIRE': return db.has(key) ? 1 : 0;
      case 'LPUSH': { const l = list(); l.unshift(...args.reverse()); return l.length; }
      case 'LTRIM': { const l = list(); db.set(key, l.slice(Number(args[0]), Number(args[1]) + 1)); return 'OK'; }
      case 'LRANGE': { const l = db.get(key); return Array.isArray(l) ? l.slice(Number(args[0]), Number(args[1]) + 1) : []; }
      case 'HINCRBY': { const h = hash(); const n = Number(h.get(args[0]) ?? 0) + Number(args[1]); h.set(args[0], String(n)); return n; }
      case 'HGET': { const h = db.get(key); return h instanceof Map ? (h.get(args[0]) ?? null) : null; }
      case 'HGETALL': { const h = db.get(key); return h instanceof Map ? [...h].flat() : []; }
      default: throw new Error(`fake upstash: unsupported ${name}`);
    }
  };

  const server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', c => (raw += c));
    req.on('end', () => {
      calls++;
      if (down) { res.writeHead(503); return res.end(); }
      if (req.headers.authorization !== `Bearer ${token}` || req.url !== '/pipeline') {
        res.writeHead(401, { 'content-type': 'application/json' });
        return res.end(JSON.stringify({ error: 'Unauthorized' }));
      }
      const out = (JSON.parse(raw) as (string | number)[][]).map(cmd => {
        try { return { result: run(cmd) }; } catch (e) { return { error: (e as Error).message }; }
      });
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(JSON.stringify(out));
    });
  });
  await new Promise<void>(r => server.listen(0, '127.0.0.1', r));

  return {
    url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`,
    token,
    db,
    get calls() { return calls; },
    setDown(v: boolean) { down = v; },
    reset() { db.clear(); down = false; calls = 0; },
    close: () => new Promise<void>(r => server.close(() => r())),
  };
}
