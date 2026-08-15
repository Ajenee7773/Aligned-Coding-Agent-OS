const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");

const root = path.resolve(__dirname, "..");
const planning = path.join(root, "harness", "rooms", "planning");

test("long-horizon protocol preserves identity and advances only audited state", () => {
  const foundation = fs.readFileSync(path.join(root, "harness", "FOUNDATION.md"), "utf8");
  const protocol = fs.readFileSync(path.join(planning, "LONG-HORIZON.md"), "utf8");
  assert.match(foundation, /resident intelligence remains the manager/i);
  assert.match(foundation, /Advance persistent task state only from\s+evidence/i);
  assert.match(protocol, /clears transient working clutter, not identity/i);
  assert.match(protocol, /manager advances `STATE\.md` only when the audit verdict is `pass`/i);
  assert.match(protocol, /operator's right to reject, redirect, cancel, or revise/i);
});

test("long-horizon templates are machine-readable and evidence-based", () => {
  const contract = JSON.parse(fs.readFileSync(path.join(planning, "CONTRACT.template.json"), "utf8"));
  const audit = JSON.parse(fs.readFileSync(path.join(planning, "AUDIT.template.json"), "utf8"));
  assert.equal(contract.schema, "aligned-long-horizon-contract/v1");
  assert.equal(contract.acceptance[0].evidence_type, "test_pass");
  assert.equal(audit.schema, "aligned-long-horizon-audit/v1");
  assert.equal(audit.read_only, true);
  assert.equal(audit.verdict, "pending");
});
