// Comprueba que las versiones escritas a mano en varios archivos digan lo mismo. Si una
// herramienta se actualiza en un solo lugar, la imagen de Docker o el CI dejan de coincidir con
// lo que corre en local. Uso: pnpm check:versions
import { readFileSync } from "node:fs";

const CHECKS = [
  {
    name: "Playwright",
    sources: [
      ["pnpm-workspace.yaml", /"@playwright\/test":\s*([\d.]+)/],
      ["Dockerfile", /playwright:v([\d.]+)-/],
      [".circleci/config.yml", /playwright:v([\d.]+)-/],
    ],
  },
  {
    name: "pnpm",
    sources: [
      ["package.json", /"packageManager":\s*"pnpm@([\d.]+)"/],
      ["Dockerfile", /pnpm@([\d.]+)/],
    ],
  },
  {
    name: "Node (versión mayor)",
    sources: [
      [".nvmrc", /^v?(\d+)/],
      ["package.json", /"node":\s*">=(\d+)"/],
      [".circleci/config.yml", /cimg\/node:(\d+)\./],
    ],
  },
];

let failed = false;

for (const { name, sources } of CHECKS) {
  const found = sources.map(([file, pattern]) => [file, read(file, pattern)]);
  const versions = new Set(found.map(([, version]) => version));
  const detail = found.map(([file, version]) => `${file}: ${version ?? "no encontrada"}`);

  if (versions.size === 1 && !versions.has(undefined)) {
    console.log(`OK    ${name} ${[...versions][0]}`);
  } else {
    failed = true;
    console.error(`MAL   ${name} no coincide:\n        ${detail.join("\n        ")}`);
  }
}

if (failed) {
  console.error(
    "\nIguala las versiones en todos los archivos y vuelve a correr pnpm check:versions.",
  );
  process.exit(1);
}

function read(file, pattern) {
  return readFileSync(file, "utf8").match(pattern)?.[1];
}
