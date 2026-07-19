/**
 * Static regression guard for internal build identifiers leaking into rendered copy.
 * Internal API paths, source comments and technical keys remain valid; this guard
 * inspects user-facing JSX text and common copy-bearing props/objects only.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const roots = ["src/components", "src/app"];
const files = [];
function walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (path.endsWith(".tsx")) files.push(path);
  }
}
roots.forEach(walk);

const internalCode = /(?:\bIdea\s+\d+(?:\.\d+)?\b|\bPart\s+[A-Z]+(?:\.\d+)?\b|\b[A-Z]{1,3}\.\d+\b)/;
const internalLanguage = /\bNEYO Ops\b|Feature Switched OFF in|Pending Ops Vetting/;
const copyLine = /(?:>[^<{]*|(?:label|title|description|placeholder|message|help|detail|status)\s*[:=]|toast\s*\()/;
const failures = [];

for (const file of files) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, index) => {
    line = line.replace(/\/\/.*$/, "");
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) return;
    if (copyLine.test(line) && (internalCode.test(line) || internalLanguage.test(line))) {
      failures.push(`${file}:${index + 1}: ${trimmed}`);
    }
  });
}

if (failures.length) {
  console.error("Internal build language found in user-facing UI copy:\n" + failures.join("\n"));
  process.exit(1);
}
console.log(`UI copy leak check passed (${files.length} TSX files checked).`);
