const fs = require("fs");
const path = require("path");

try {
  // The package exports rgPath pointing at its bundled binary
  const { rgPath } = require("@vscode/ripgrep/lib/index.js");
  const src = rgPath;
  const destDir = path.join(__dirname, "..", "bin");
  const dest = path.join(destDir, path.basename(src));

  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  fs.chmodSync(dest, 0o755);

  console.log("Copied ripgrep binary to", dest);
} catch (err) {
  console.error("Failed to copy ripgrep binary:", err);
  process.exitCode = 1;
}
