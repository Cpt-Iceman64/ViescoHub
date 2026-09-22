const assert = require('node:assert/strict');
require('../js/self-settings-sync.js');
const { start, valid } = globalThis.SelfSettingsSync;
const copy = x => JSON.parse(JSON.stringify(x));
const wait = () => new Promise(resolve => setImmediate(resolve));
const initial = { classes: [{ name: '4°1', lvl: '4' }], settings: {} };
assert.equal(valid({...initial,weekly:{start:'2026-09-28',end:'2026-10-02',weekType:'A',settings:{'4°1':{LUNDI:{fin:'12h00',reprise:'13h00'}}}}}),true);
assert.equal(valid({...initial,weekly:{start:'02/10/2026',end:'2026-09-28',weekType:'C',settings:{}}}),false);

function server() {
    let data = null, offline = false;
    const listeners = [];
    const snapshot = () => ({ exists: !!data, data: () => copy(data), metadata: {} });
    const ref = { onSnapshot(options, fn) { listeners.push(fn); fn(snapshot()); } };
    const db = {
        collection: () => ({ doc: () => ref }),
        async runTransaction(fn) {
            if (offline) throw new Error('Hors connexion');
            let next;
            await fn({ get: async () => snapshot(), set: (_, value) => { next = value; }, update: (_, value) => { next = value; } });
            if (next) { data = copy(next); listeners.forEach(fn => fn(snapshot())); }
        }
    };
    return { db, setOffline: value => { offline = value; }, read: () => copy(data) };
}
function client(server, config = initial) {
    let local = copy(config), editing = false;
    const cache = new Map();
    const messages = [];
    const api = start({ db: server.db,
        storage: { getItem: k => cache.get(k) || null, setItem: (k,v) => cache.set(k,v), removeItem: k => cache.delete(k) },
        getConfig: () => local, applyConfig: v => { local = v; },
        isEditing: () => editing, status: v => messages.push(v)
    });
    return { api, cache, messages, get: () => local, edit: v => { editing = v; }, change: name => { local.classes.push({ name, lvl: '4' }); api.publish(); } };
}
(async () => {
    const shared = server();
    const a = client(shared); await wait();
    assert.deepEqual(shared.read().config, initial);
    const b = client(shared, { ...initial, settings: { old: true } }); await wait();
    assert.deepEqual(b.get(), initial); // Un autre ordinateur ne réinitialise pas le document.
    a.change('4°1 CHAM'); await wait();
    assert.equal(b.get().classes.length, 2);
    assert.equal(a.cache.size, 0);
    b.edit(true);
    a.change('4°2'); await wait();
    b.change('4°3'); await wait();
    assert.ok(b.messages.at(-1).includes('Conflit'));
    assert.equal(shared.read().config.classes.some(c => c.name === '4°3'), false);
    assert.equal(b.cache.size, 1);
    b.edit(false); b.api.loadShared();
    assert.equal(b.cache.size, 0);
    shared.setOffline(true);
    b.change('Groupe test'); await wait();
    assert.equal(b.cache.size, 1);
    shared.setOffline(false); b.api.retry(); await wait();
    assert.equal(b.cache.size, 0);
    assert.equal(a.get().classes.some(c => c.name === 'Groupe test'), true);
    console.log('Self sync : initialisation, second PC, partage, conflit et reprise après coupure validés.');
})().catch(error => { console.error(error); process.exitCode = 1; });
