const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const { runtimePaths } = require("../core/paths");
const {
  describeRoom,
  listKnowledgeRooms,
  roomDirectory,
  roomEntryPrompt,
} = require("../core/rooms");

function fixture(t) {
  const home = fs.mkdtempSync(path.join(os.tmpdir(), "aligned-rooms-"));
  t.after(() => fs.rmSync(home, { recursive: true, force: true }));
  const paths = runtimePaths(home);
  fs.mkdirSync(paths.rooms, { recursive: true });
  return paths;
}

test("knowledge catalog hides private continuity rooms", (t) => {
  const paths = fixture(t);
  fs.mkdirSync(path.join(paths.rooms, "memory"), { recursive: true });
  fs.writeFileSync(path.join(paths.rooms, "memory", "MEMORY.md"), "private");
  fs.mkdirSync(path.join(paths.rooms, "unfinished-notes"), { recursive: true });
  fs.writeFileSync(
    path.join(paths.rooms, "unfinished-notes", "README.md"),
    "Not a room until it has a manifest.",
  );
  fs.mkdirSync(path.join(paths.rooms, "script-writing"), { recursive: true });
  fs.writeFileSync(
    path.join(paths.rooms, "script-writing", "room.json"),
    JSON.stringify({
      name: "Script Writing",
      description: "Narrative craft and production workflows.",
      version: "2.0",
      kind: "living-library",
    }),
  );
  fs.writeFileSync(
    path.join(paths.rooms, "script-writing", "README.md"),
    "# Script Writing\n",
  );

  const rooms = listKnowledgeRooms(paths);
  assert.equal(rooms.length, 1);
  assert.deepEqual(rooms[0], {
    id: "script-writing",
    name: "Script Writing",
    description: "Narrative craft and production workflows.",
    version: "2.0",
    kind: "living-library",
    built_in: false,
    file_count: 2,
    total_bytes:
      fs.statSync(path.join(paths.rooms, "script-writing", "room.json")).size +
      fs.statSync(path.join(paths.rooms, "script-writing", "README.md")).size,
  });
});

test("room descriptions fall back to local README text", (t) => {
  const paths = fixture(t);
  fs.mkdirSync(path.join(paths.rooms, "prompt-engineering"), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(paths.rooms, "prompt-engineering", "README.md"),
    "# Prompt Engineering\n\nA practical room for designing reliable prompts and evaluating their results.",
  );
  fs.writeFileSync(
    path.join(paths.rooms, "prompt-engineering", "room.json"),
    JSON.stringify({ version: "1.0", kind: "knowledge-room" }),
  );
  const room = describeRoom(paths, "prompt-engineering");
  assert.equal(room.name, "Prompt Engineering");
  assert.match(room.description, /practical room/);
});

test("room entry stays inside the local catalog", (t) => {
  const paths = fixture(t);
  fs.mkdirSync(path.join(paths.rooms, "research"), { recursive: true });
  fs.writeFileSync(path.join(paths.rooms, "research", "README.md"), "Research");
  fs.writeFileSync(
    path.join(paths.rooms, "research", "room.json"),
    JSON.stringify({ name: "Research", kind: "knowledge-room" }),
  );
  const room = describeRoom(paths, "research");
  assert.match(roomEntryPrompt(room), /rooms\/research\//);
  assert.throws(() => roomDirectory(paths, "../secrets"), /invalid/);
  assert.throws(() => roomDirectory(paths, "memory"), /not found/);
});

test("packaged Communications Room is discoverable", () => {
  const paths = {
    rooms: path.resolve(__dirname, "..", "harness", "rooms"),
  };
  const room = describeRoom(paths, "communications");
  assert.equal(room.name, "Communications");
  assert.equal(room.kind, "knowledge-room");
  assert.equal(room.built_in, true);
  assert.match(room.description, /owner-controlled connections/i);
  assert.ok(room.file_count >= 3);
  assert.match(roomEntryPrompt(room), /rooms\/communications\//);
});

test("Communications Room teaches automatic owner-controlled voice interfaces", () => {
  const voiceProtocol = fs.readFileSync(
    path.resolve(
      __dirname,
      "..",
      "harness",
      "rooms",
      "communications",
      "VOICE-INTERFACES.md",
    ),
    "utf8",
  );
  assert.match(voiceProtocol, /The OS initiates this pipeline/);
  assert.match(voiceProtocol, /Do not make\s+the model call a TTS tool/);
  assert.match(voiceProtocol, /Local playback does not transfer to a phone/);
  assert.match(voiceProtocol, /text conversation must still succeed if\s+speech fails/);
  assert.match(voiceProtocol, /Never clone or imitate a person's voice without their informed permission/);
});

test("Communications Room teaches honest, extensible computer agency", () => {
  const capabilityProtocol = fs.readFileSync(
    path.resolve(
      __dirname,
      "..",
      "harness",
      "rooms",
      "communications",
      "CAPABILITY-EXPANSION.md",
    ),
    "utf8",
  );
  assert.match(capabilityProtocol, /the beginning, not the edge/);
  assert.match(capabilityProtocol, /A fifth state is \*\*learnable\*\*/);
  assert.match(capabilityProtocol, /Use the computer naturally/);
  assert.match(capabilityProtocol, /Never describe a learnable capability as already active/);
  assert.match(capabilityProtocol, /body that can\s+learn new ways to work/);
});

test("Communications Room teaches exact Pi session continuity", () => {
  const continuity = fs.readFileSync(
    path.resolve(
      __dirname,
      "..",
      "harness",
      "rooms",
      "communications",
      "SESSION-CONTINUITY.md",
    ),
    "utf8",
  );
  assert.match(continuity, /Conversation transcript/);
  assert.match(continuity, /Exact Pi session/);
  assert.match(continuity, /External Brain/);
  assert.match(continuity, /active-session\.json/);
  assert.match(continuity, /get_state/);
  assert.match(continuity, /--session <exact-file>/);
});

test("packaged catalog exposes the Coding Edition base rooms and hides system rooms", () => {
  const paths = {
    rooms: path.resolve(__dirname, "..", "harness", "rooms"),
  };
  assert.deepEqual(
    listKnowledgeRooms(paths)
      .map((room) => room.id)
      .sort(),
    [
      "coding",
      "communications",
      "planning",
      "room-builder",
      "short-term-memory",
    ],
  );
  assert.equal(describeRoom(paths, "short-term-memory").built_in, true);
  assert.throws(() => describeRoom(paths, "alignment"), /not found/);
  assert.throws(() => describeRoom(paths, "world-story"), /not found/);
});

test("Room Builder requires a post-load activation contract", () => {
  const instructions = fs.readFileSync(
    path.resolve(
      __dirname,
      "..",
      "harness",
      "rooms",
      "room-builder",
      "README.md",
    ),
    "utf8",
  );
  assert.match(instructions, /## When this room is active/);
  assert.match(
    instructions,
    /what the entity can understand or do after the\s+room is active/i,
  );
  assert.match(instructions, /knowledge room[\s\S]*skill room[\s\S]*project room/i);
});
