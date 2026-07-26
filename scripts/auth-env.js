const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const resonantHome =
  process.env.ALIGNED_CODING_AGENT_HOME ||
  process.env.ALIGNED_AGENT_HOME ||
  process.env.RESONANT_HOME ||
  path.join(os.homedir(), ".aligned-coding-agent-os");
const authPath = process.env.RESONANT_AUTH_FILE || path.join(resonantHome, "agent", "auth.json");
const credentialsPath =
  process.env.ALIGNED_CREDENTIALS_FILE ||
  path.join(resonantHome, "secrets", "credentials.json");

function envVarForProvider(name) {
  const normalized = String(name || "").toLowerCase();
  const map = {
    anthropic: "ANTHROPIC_API_KEY",
    openai: "OPENAI_API_KEY",
    google: "GEMINI_API_KEY",
    gemini: "GEMINI_API_KEY",
    openrouter: "OPENROUTER_API_KEY",
    groq: "GROQ_API_KEY",
    xai: "XAI_API_KEY",
    mistral: "MISTRAL_API_KEY",
  };
  return map[normalized] || `${normalized.toUpperCase().replace(/[^A-Z0-9]/g, "_")}_API_KEY`;
}

try {
  const auth = JSON.parse(fs.readFileSync(authPath, "utf8"));
  const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
  const apiKey = String(credentials.provider_api_key || "").trim();
  if (!apiKey) process.exit(0);
  const envVar = auth.envVar || envVarForProvider(auth.provider);
  if (!envVar) process.exit(0);
  process.stdout.write(`${envVar}=${apiKey}`);
} catch {
  process.exit(0);
}
