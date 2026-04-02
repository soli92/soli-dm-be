"use strict";

const fs = require("fs");
const path = require("path");

const packageRoot = path.resolve(__dirname, "..");
const serverJs = path.join(packageRoot, "dist", "server.js");

process.chdir(packageRoot);

if (!fs.existsSync(serverJs)) {
  console.error(
    "[soli-dm-be] File mancante: " +
      serverJs +
      "\n" +
      "Esegui prima la compilazione: npm run build\n" +
      "Su Render imposta Build Command: npm install && npm run build\n" +
      "e Root Directory sulla cartella che contiene package.json (root del repo), non la sola cartella src."
  );
  process.exit(1);
}

require(serverJs);
