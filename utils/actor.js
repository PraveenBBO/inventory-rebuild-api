const { User } = require('@models');
const { requestContext } = require('./requestContext.js');

// simple in-memory TTL cache (no extra deps)
const nameCache = new Map(); // key: userId, value: { name, exp }

function now() { return Date.now(); }
function getCachedName(id) {
    const v = nameCache.get(id);
    if (!v || v.exp < now()) { nameCache.delete(id); return null; }
    return v.name;
}
function setCachedName(id, name, ttlMs = 5 * 60 * 1000) { // 5 min
    nameCache.set(id, { name, exp: now() + ttlMs });
}

function getActor() {
    return requestContext.getStore()?.user || null;
}

async function ensureActor() {
    const store = requestContext.getStore();
    if (!store) return null;

    if (store.user?.name && store.user.name.trim()) return store.user;

    // avoid repeated lookups in the same request
    if (store.__actorResolved) return store.user;
    store.__actorResolved = true;

    const id = store.user?.id;
    if (!id) return store.user;

    // try cache
    const cached = getCachedName(id);
    if (cached) {
        store.user.name = cached;
        return store.user;
    }

    const row = await User.findByPk(id, { attributes: ["name", "email"], raw: true });
    const resolved = row?.name || (store.user.email ? store.user.email.split("@")[0] : null) || null;
    if (resolved) {
        store.user.name = resolved;
        setCachedName(id, resolved);
    }
    return store.user;
}

module.exports = { getActor, ensureActor };