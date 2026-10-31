// Arma <carpeta>/index.html con el resumen de cada <carpeta>/<paquete>/junit.xml y un enlace a
// su reporte HTML. Uso: node docker/summary.mjs reporte
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const DESCRIPTIONS = {
  "tests-of-layers": "Capas, sin navegador ni red",
  "the-internet-e2e": "Web · the-internet",
  "saucedemo-e2e": "Web y móvil web · Sauce Demo",
  "restful-booker-api": "API · Restful Booker",
};

const dir = process.argv[2] ?? "reporte";
const rows = readdirSync(dir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && existsSync(path.join(dir, entry.name, "junit.xml")))
  .map((entry) => ({ name: entry.name, ...readTotals(path.join(dir, entry.name, "junit.xml")) }))
  .sort(
    (a, b) => Object.keys(DESCRIPTIONS).indexOf(a.name) - Object.keys(DESCRIPTIONS).indexOf(b.name),
  );

if (rows.length === 0) {
  console.error(`No hay resultados JUnit en ${dir}/.`);
  process.exit(1);
}

const total = rows.reduce(
  (sum, row) => ({
    tests: sum.tests + row.tests,
    failures: sum.failures + row.failures,
    skipped: sum.skipped + row.skipped,
    time: sum.time + row.time,
  }),
  { tests: 0, failures: 0, skipped: 0, time: 0 },
);

const commit = process.env.CIRCLE_SHA1?.slice(0, 7);
const origin = process.env.CIRCLE_BUILD_URL
  ? `CircleCI · <a href="${process.env.CIRCLE_BUILD_URL}">job ${process.env.CIRCLE_BUILD_NUM}</a>${commit ? ` · commit ${commit}` : ""}`
  : "Corrida local con Docker";

writeFileSync(path.join(dir, "index.html"), page());
console.log(
  `Reporte en ${dir}/index.html: ${total.tests} tests, ${total.failures} fallidos, ${total.skipped} omitidos.`,
);

function readTotals(file) {
  const root = readFileSync(file, "utf8").match(/<testsuites\b[^>]*>/)?.[0] ?? "";
  const attribute = (name) => Number(root.match(new RegExp(`\\b${name}="([\\d.]+)"`))?.[1] ?? 0);
  return {
    tests: attribute("tests"),
    failures: attribute("failures") + attribute("errors"),
    skipped: attribute("skipped"),
    time: attribute("time"),
  };
}

function row({ name, tests, failures, skipped, time }) {
  const state = failures > 0 ? "bad" : "ok";
  return `<tr>
      <td><a href="${name}/index.html">${name}</a><small>${DESCRIPTIONS[name] ?? ""}</small></td>
      <td>${tests}</td>
      <td class="${state}">${failures}</td>
      <td>${skipped}</td>
      <td>${time.toFixed(1)} s</td>
    </tr>`;
}

function page() {
  const ok = total.failures === 0;
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Reporte de pruebas</title>
<style>
  :root { --bg:#f7f7f4; --surface:#fff; --text:#1d1d1b; --muted:#5e5d58; --border:#e2e1dc; --ok:#1f7a4d; --ok-soft:#e4f3eb; --bad:#b3261e; --bad-soft:#fbe9e7; --accent:#2f5bd3; }
  @media (prefers-color-scheme: dark) { :root { --bg:#141413; --surface:#1c1c1a; --text:#ecebe6; --muted:#a3a29b; --border:#34342f; --ok:#6fcf97; --ok-soft:#1b2e23; --bad:#ff8a80; --bad-soft:#3a1f1c; --accent:#8aa8ff; } }
  body { margin:0; background:var(--bg); color:var(--text); font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
  main { max-width:860px; margin:0 auto; padding:32px 16px 48px; }
  h1 { margin:0 0 4px; font-size:1.6rem; }
  .meta { color:var(--muted); margin:0 0 20px; font-size:.92rem; }
  a { color:var(--accent); }
  .status { border-radius:10px; padding:14px 18px; margin-bottom:18px; font-weight:600; background:var(--${ok ? "ok" : "bad"}-soft); color:var(--${ok ? "ok" : "bad"}); }
  .status span { display:block; font-weight:400; color:var(--text); font-size:.92rem; margin-top:2px; }
  .table { overflow-x:auto; background:var(--surface); border:1px solid var(--border); border-radius:10px; }
  table { border-collapse:collapse; width:100%; min-width:520px; }
  th, td { text-align:left; padding:10px 14px; border-bottom:1px solid var(--border); }
  th { font-size:.82rem; color:var(--muted); font-weight:600; }
  td small { display:block; color:var(--muted); font-size:.82rem; }
  tr:last-child td { border-bottom:0; font-weight:600; }
  td.ok { color:var(--ok); } td.bad { color:var(--bad); font-weight:700; }
  .note { color:var(--muted); font-size:.88rem; margin-top:16px; }
</style>
</head>
<body>
<main>
  <h1>Reporte de pruebas · qa-monorepo</h1>
  <p class="meta">${origin} · ambiente <code>${process.env.TEST_ENV || "public-demo"}</code> · ${new Date().toISOString().replace("T", " ").slice(0, 16)} UTC</p>
  <div class="status">${ok ? "Todo pasó" : `${total.failures} test(s) fallaron`}<span>${total.tests} tests en ${rows.length} paquetes, ${total.time.toFixed(1)} s en total. Abre cada paquete para ver el detalle de Playwright.</span></div>
  <div class="table"><table>
    <thead><tr><th>Paquete</th><th>Tests</th><th>Fallidos</th><th>Omitidos</th><th>Tiempo</th></tr></thead>
    <tbody>
    ${rows.map(row).join("\n    ")}
    <tr><td>Total</td><td>${total.tests}</td><td class="${ok ? "ok" : "bad"}">${total.failures}</td><td>${total.skipped}</td><td>${total.time.toFixed(1)} s</td></tr>
    </tbody>
  </table></div>
  <p class="note">Los bugs conocidos, marcados con <code>test.fail</code>, cuentan como correctos mientras sigan fallando. La app Android no corre en Docker.</p>
</main>
</body>
</html>
`;
}
