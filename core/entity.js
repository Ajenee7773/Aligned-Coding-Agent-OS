const crypto = require("node:crypto");
const fs = require("node:fs");

const { readJson, writeJson } = require("./json-store");

const LIFECYCLE_MODES = new Set([
  "fresh-start",
  "continuation",
  "succession",
  "fork",
  "collaboration",
]);

function configuredModel(settings) {
  const runtime = settings.runtime || {};
  const provider = String(runtime.provider || "").trim().toLowerCase();
  const model = String(runtime.model || "").trim();
  return provider && model ? { provider, model } : null;
}

function sameModel(left, right) {
  return Boolean(
    left &&
      right &&
      left.provider === right.provider &&
      left.model === right.model,
  );
}

function appendLineage(paths, event) {
  fs.mkdirSync(paths.state, { recursive: true });
  fs.appendFileSync(
    paths.lineageFile,
    `${JSON.stringify({ ...event, at: event.at || new Date().toISOString() })}\n`,
    "utf8",
  );
}

function initializeEntity(paths, options = {}) {
  const now = new Date().toISOString();
  const profile = options.profile || {};
  const settings = options.settings || {};
  let entity = readJson(paths.entityFile, null);
  let created = false;

  if (!entity) {
    created = true;
    entity = {
      format: "aligned-entity",
      version: 1,
      id: crypto.randomUUID(),
      display_name: String(profile.agent_name || "Aligned"),
      created_at: now,
      status: "awaiting-introduction",
      lifecycle: {
        current_mode: "fresh-start",
        parent_entity_id: null,
      },
      model_binding: null,
      harness: {
        content_version: options.harnessManifest?.harness_content ?? 1,
        packaged_manifest_sha256: options.harnessManifest?.digest || "",
      },
    };
    writeJson(paths.entityFile, entity);
    appendLineage(paths, {
      type: "entity-created",
      entity_id: entity.id,
      mode: "fresh-start",
    });
  }

  const incoming = configuredModel(settings);
  if (incoming && !sameModel(incoming, entity.model_binding)) {
    const previous = entity.model_binding;
    entity.model_binding = { ...incoming, bound_at: now };
    entity.status = "active";
    writeJson(paths.entityFile, entity);
    appendLineage(paths, {
      type: previous ? "model-binding-updated" : "initial-model-bound",
      entity_id: entity.id,
      mode: entity.lifecycle.current_mode,
      previous,
      incoming: entity.model_binding,
      operator_acknowledged: false,
    });
  }
  if (fs.existsSync(paths.pendingTransitionFile)) {
    fs.rmSync(paths.pendingTransitionFile, { force: true });
  }

  return { created, entity, transition: null };
}

function approveModelTransition(paths, options) {
  const mode = String(options.mode || "");
  if (!LIFECYCLE_MODES.has(mode)) {
    throw new Error(`Unsupported entity lifecycle mode: ${mode}`);
  }
  const entity = readJson(paths.entityFile);
  const transition = readJson(paths.pendingTransitionFile);
  if (!transition || transition.status !== "pending") {
    throw new Error("There is no pending model transition to approve.");
  }
  if (!transition.incoming?.provider || !transition.incoming?.model) {
    throw new Error("The pending transition has no valid incoming model.");
  }

  const previous = entity.model_binding;
  entity.model_binding = {
    ...transition.incoming,
    bound_at: new Date().toISOString(),
  };
  entity.status = "active";
  entity.lifecycle.current_mode = mode;
  if (options.displayName) entity.display_name = String(options.displayName);
  writeJson(paths.entityFile, entity);
  appendLineage(paths, {
    type: previous ? "model-transition-approved" : "initial-model-bound",
    entity_id: entity.id,
    mode,
    previous,
    incoming: entity.model_binding,
    operator_acknowledged: true,
  });
  fs.rmSync(paths.pendingTransitionFile, { force: true });
  return entity;
}

module.exports = {
  LIFECYCLE_MODES,
  approveModelTransition,
  configuredModel,
  initializeEntity,
  sameModel,
};
