"use strict";

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/** Directory con package.json "name": "soli-dm-be" (non richiede dist/). */
function findSoliDmPackageRoot(startDir) {
  let dir = path.resolve(startDir);
  for (;;) {
    const pkgPath = path.join(dir, "package.json");
    if (fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        if (pkg.name === "soli-dm-be") {
          return dir;
        }
      } catch {
        /* ignore */
      }
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

function distServerPath(root) {
  const p = path.join(root, "dist", "server.js");
  return fs.existsSync(p) ? p : null;
}

const root = findSoliDmPackageRoot(__dirname);

if (!root) {
  console.error(
    "[soli-dm-be] Nessun package.json con \"name\": \"soli-dm-be\" risalendo da:\n  " +
      path.resolve(__dirname)
  );
  process.exit(1);
}

let serverJs = distServerPath(root);

/** Su Render la build a volte non produce dist/ (Root Directory su src, build errata, ecc.). */
if (!serverJs && process.env.RENDER) {
  console.error(
    "[soli-dm-be] dist/server.js assente in " +
      root +
      " — eseguo npm run build (ambiente Render)…"
  );
  try {
    execSync("npm run build", {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
  } catch {
    process.exit(1);
  }
  serverJs = distServerPath(root);
}

if (!serverJs) {
  console.error(
    "[soli-dm-be] File mancante: " +
      path.join(root, "dist", "server.js") +
      "\n\n" +
      "In locale: npm run build\n\n" +
      "Su Render:\n" +
      "  • Build Command: npm install && npm run build\n" +
      "  • Root Directory: vuoto (root del repo, dove ci sono package.json + tsconfig.json)\n\n" +
      "Se Root Directory è obbligatoriamente `src`, imposta:\n" +
      "  • Build: cd .. && npm install && npm run build\n" +
      "  • Start: cd .. && npm start"
  );
  process.exit(1);
}

process.chdir(root);
require(serverJs);
