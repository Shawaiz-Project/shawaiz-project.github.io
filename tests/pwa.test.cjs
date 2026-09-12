// Run with Node 18+ from the repository root: node tests/pwa.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const origin = 'https://shawaiz-project.github.io';
const handlers = {};
const stores = new Map();
let online = true;
let skipped = false;
let claimed = false;
const counters = { fetches: 0 };
const key = value => new URL(typeof value === 'string' ? value : value.url, origin).pathname;
const caches = {
  async open(name) {
    if (!stores.has(name)) stores.set(name, new Map());
    const entries = stores.get(name);
    return {
      async addAll(requests) {
        const pending = requests.map(req => {
          const pathname = key(req);
          const file = path.join(root, pathname === '/' ? 'index.html' : pathname);
          assert(fs.existsSync(file), `Missing precache file: ${file}`);
          return [pathname, new Response(fs.readFileSync(file))];
        });
        pending.forEach(([url, response]) => entries.set(url, response));
      },
      async match(req) { return entries.get(key(req))?.clone(); }
    };
  },
  async keys() { return [...stores.keys()]; },
  async delete(name) { return stores.delete(name); }
};
const context = vm.createContext({
  self: {
    addEventListener: (name, fn) => { handlers[name] = fn; },
    location: { origin },
    clients: { claim: async () => { claimed = true; } },
    skipWaiting: () => { skipped = true; }
  },
  caches, URL, Response,
  Request: class extends Request { constructor(url, opts) { super(new URL(url, origin), opts); } },
  fetch: async () => { counters.fetches++; if (!online) throw new Error('Offline'); return new Response('network', { status: 404 }); }
});
vm.runInContext(fs.readFileSync(path.join(root, 'sw.js'), 'utf8'), context);
async function lifecycle(name) {
  let work;
  handlers[name]({ waitUntil: p => { work = p; } });
  await work;
}
async function request(url, mode = 'navigate', method = 'GET') {
  let response;
  handlers.fetch({ request: { url: new URL(url, origin).href, method, mode }, respondWith: p => { response = p; } });
  return response;
}
(async () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'site.webmanifest')));
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.start_url, '/');
  assert.equal(manifest.scope, '/');
  for (const icon of manifest.icons) {
    const data = fs.readFileSync(path.join(root, icon.src));
    assert.equal(data.subarray(1, 4).toString(), 'PNG');
    assert.equal(`${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`, icon.sizes);
  }
  await lifecycle('install');
  assert(stores.get('shawaiz-portfolio-v1').size >= 20);
  assert.equal(skipped, false, 'Do not activate an update without consent');
  stores.set('shawaiz-portfolio-old', new Map());
  stores.set('unrelated-project-cache', new Map());
  await lifecycle('activate');
  assert(claimed);
  assert(!stores.has('shawaiz-portfolio-old'));
  assert(stores.has('unrelated-project-cache'));
  online = false;
  for (const url of ['/', '/index.html', '/?source=app']) {
    const response = await request(url);
    assert((await response.text()).includes('<h1>Shawaiz Ali</h1>'));
  }
  assert.equal(counters.fetches, 0);
  assert((await (await request('/unknown')).text()).includes('You’re offline'));
  assert.equal((await request('/missing.png', 'cors')).type, 'error');
  assert.equal(await request('https://github.com/Shawaiz-Project'), undefined);
  assert.equal(await request('/submit', 'cors', 'POST'), undefined);
  online = true;
  assert.equal((await request('/unknown')).status, 404, 'Preserve online 404 responses');
  handlers.message({ data: { type: 'OTHER' } });
  assert.equal(skipped, false);
  handlers.message({ data: { type: 'SKIP_WAITING' } });
  assert.equal(skipped, true);
  console.log('PASS: manifest, PNG dimensions, all precache paths, offline pages/query URLs, fallback, external/POST bypass, 404 preservation, scoped cache cleanup, update consent');
})().catch(error => { console.error(error); process.exitCode = 1; });
