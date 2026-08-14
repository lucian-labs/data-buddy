// Tests run against the compiled lib/ — the artifact that actually ships —
// using node:test so the package keeps its zero-dependency install.
const test = require("node:test");
const assert = require("node:assert/strict");

const { DataBuddy } = require("../lib");

const seed = () => [
  { id: "a", n: 1 },
  { id: "b", n: 2 },
  { id: "c", n: 3 },
];

test("get returns every record", () => {
  const db = new DataBuddy(seed());
  assert.deepEqual(
    db.get().map((r) => r.id),
    ["a", "b", "c"]
  );
});

test("get hands back a copy, not the backing array", () => {
  const db = new DataBuddy(seed());
  const got = db.get();
  got.length = 0;
  assert.equal(db.get().length, 3);
});

test("the constructor copies the caller's array", () => {
  const mine = seed();
  const db = new DataBuddy(mine);
  db.create({ n: 4 });
  assert.equal(mine.length, 3);
});

test("getOne finds a record, or null", () => {
  const db = new DataBuddy(seed());
  assert.deepEqual(db.getOne("b"), { id: "b", n: 2 });
  assert.equal(db.getOne("zzz"), null);
});

test("create appends with a generated id", () => {
  const db = new DataBuddy(seed());
  const rec = db.create({ n: 4 });
  assert.equal(typeof rec.id, "string");
  assert.equal(db.get().length, 4);
  assert.deepEqual(db.getOne(rec.id), rec);
});

test("create uses a caller-supplied id generator", () => {
  let next = 10;
  const db = new DataBuddy([{ id: 1, n: 1 }], () => next++);
  const rec = db.create({ n: 2 });
  assert.equal(rec.id, 10);
  assert.deepEqual(db.getOne(10), rec);
});

test("update patches the FIRST record (index 0 is not a miss)", () => {
  const db = new DataBuddy(seed());
  assert.deepEqual(db.update("a", { n: 99 }), { id: "a", n: 99 });
  assert.deepEqual(db.getOne("a"), { id: "a", n: 99 });
});

test("update patches the last record", () => {
  const db = new DataBuddy(seed());
  assert.deepEqual(db.update("c", { n: 99 }), { id: "c", n: 99 });
});

test("update on an unknown id returns null and writes nothing", () => {
  const db = new DataBuddy(seed());
  assert.equal(db.update("zzz", { hacked: true }), null);
  assert.equal(db.get().length, 3);
  assert.equal(db.data[-1], undefined);
});

test("delete removes the FIRST record (index 0 is not a miss)", () => {
  const db = new DataBuddy(seed());
  assert.equal(db.delete("a"), true);
  assert.deepEqual(
    db.get().map((r) => r.id),
    ["b", "c"]
  );
});

test("delete removes the last record", () => {
  const db = new DataBuddy(seed());
  assert.equal(db.delete("c"), true);
  assert.deepEqual(
    db.get().map((r) => r.id),
    ["a", "b"]
  );
});

test("delete on an unknown id returns false and removes nothing", () => {
  const db = new DataBuddy(seed());
  assert.equal(db.delete("zzz"), false);
  assert.deepEqual(
    db.get().map((r) => r.id),
    ["a", "b", "c"]
  );
});

test("an empty store misses cleanly", () => {
  const db = new DataBuddy([]);
  assert.deepEqual(db.get(), []);
  assert.equal(db.getOne("a"), null);
  assert.equal(db.update("a", { n: 1 }), null);
  assert.equal(db.delete("a"), false);
});
