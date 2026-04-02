"use strict";

const fs = require("fs");
const path = require("path");

/**
 * Risolve la root del pacchetto anche se Render usa Root Directory = `src`
 * (così __dirname può essere .../src/scripts e `tsc` ha scritto .../dist dalla vera root).
 */
function resolvePackageRoot(startDir) {
  let dir = path.resolve(startDir);
  const tried = [];
  const candidates = [];

  for (;;) {
    const serverJs = path.join(dir, "dist", "server.js");
    const pkgPath = path.join(dir, "package.json");
    tried.push(dir);

    if (fs.existsSync(serverJs) && fs.existsSync(pkgPath)) {
      try {
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
        if (pkg.name === "soli-dm-be") {
          return { root: dir, serverJs };
        }
      } catch {
        /* ignore */
      }
      candidates.push({ root: dir, serverJs });
    }

    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }

  if (candidates.length > 0) {
    return candidates[candidates.length - 1];
  }

  return { root: null, serverJs: null, tried };
}

const { root, serverJs, tried } = resolvePackageRoot(__dirname);

if (!root || !serverJs || !fs.existsSync(serverJs)) {
  console.error(
    "[soli-dm-be] Impossibile trovare dist/server.js risalendo da:\n  " +
      path.resolve(__dirname) +
      "\nPercorsi controllati:\n  " +
      (Array.isArray(tried) ? tried.join("\n  ") : "(nessuno)") +
      "\n\nEsegui prima: npm run build\n" +
      "Su Render: Build Command = npm install && npm run build\n" +
      "Root Directory = cartella con package.json (root repo), non solo src."
  );
  process.exit(1);
}

process.chdir(root);
require(serverJs);
