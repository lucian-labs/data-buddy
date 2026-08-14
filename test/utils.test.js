const test = require("node:test");
const assert = require("node:assert/strict");

const { uuidGen } = require("../lib/utils");

const V4 =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test("uuidGen emits a well-formed v4 uuid", () => {
  for (let i = 0; i < 500; i++) {
    const id = uuidGen();
    assert.match(id, V4, `malformed id: ${id}`);
  }
});

test("uuidGen ids are distinct", () => {
  const seen = new Set();
  for (let i = 0; i < 1000; i++) seen.add(uuidGen());
  assert.equal(seen.size, 1000);
});
