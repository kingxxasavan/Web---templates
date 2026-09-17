/**
 * An in-memory stand-in for the Realtime Database, faithful to the semantics
 * the backend actually relies on:
 *
 *   - a write of null removes the node, and empty parents disappear with it
 *   - update() applies several locations at once, keys may contain slashes
 *   - reads of a missing path return null, never undefined
 *
 * The RTDB emulator can't run in this environment, so this is what lets the
 * Realtime Database backend be exercised by the same behaviour tests as the
 * SQL one. It proves the backend's own logic — paths, key encoding, ordering,
 * atomic grouping — not the Firebase SDK's behaviour.
 */

const clone = (v) => (v === undefined ? null : structuredClone(v));
const parts = (path) => String(path).split("/").filter(Boolean);

function readAt(root, path) {
  let node = root;
  for (const key of parts(path)) {
    if (node == null || typeof node !== "object") return null;
    node = node[key];
  }
  return node === undefined ? null : node;
}

function writeAt(root, path, value) {
  const segs = parts(path);
  if (!segs.length) return;

  const leaf = segs.pop();
  const chain = [root];
  let node = root;

  for (const key of segs) {
    if (node[key] == null || typeof node[key] !== "object") node[key] = {};
    node = node[key];
    chain.push(node);
  }

  if (value === null || value === undefined) delete node[leaf];
  else node[leaf] = clone(value);

  // RTDB has no empty nodes: prune parents that just became childless.
  for (let i = chain.length - 1; i > 0; i--) {
    if (Object.keys(chain[i]).length === 0) delete chain[i - 1][segs[i - 1]];
    else break;
  }
}

class FakeRef {
  constructor(store, path = "") {
    this.store = store;
    this.path = path;
  }

  async get() {
    const value = readAt(this.store.data, this.path);
    return { val: () => clone(value), exists: () => value != null };
  }

  async set(value) {
    writeAt(this.store.data, this.path, value);
  }

  /** Multi-location write; every key is applied, and null removes. */
  async update(values) {
    for (const [key, value] of Object.entries(values)) {
      writeAt(this.store.data, this.path ? `${this.path}/${key}` : key, value);
    }
  }

  async remove() {
    writeAt(this.store.data, this.path, null);
  }

  async transaction(fn) {
    const next = fn(clone(readAt(this.store.data, this.path)));
    if (next !== undefined) writeAt(this.store.data, this.path, next);
    return { committed: next !== undefined };
  }
}

export function createFakeDatabase() {
  const store = { data: {} };
  return {
    ref: (path = "") => new FakeRef(store, path),
    _dump: () => clone(store.data),
    _reset: () => {
      store.data = {};
    },
  };
}
