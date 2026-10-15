/** Optional QA dependency lives outside the theme. Run against npm start. */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const exec = promisify(execFile);
const cli = process.env.LIGHTHOUSE_BIN || '/tmp/atelier-qa-tools/node_modules/.bin/lighthouse';
await mkdir(new URL('./lighthouse/', import.meta.url), { recursive: true });
const results = [];
for (const [name, route] of [['home', '/'], ['collection', '/collections/all'], ['product', '/products/line-tote-bag']]) {
  const file = new URL(`./lighthouse/${name}.json`, import.meta.url).pathname;
  await exec(cli, [`http://127.0.0.1:3334${route}`, '--chrome-flags=--headless --no-sandbox --disable-gpu', '--only-categories=performance,accessibility', '--output=json', `--output-path=${file}`, '--quiet'], { timeout: 120000 });
  const report = JSON.parse(await readFile(file));
  const result = { page: name, scope: 'Local Liquid fixture server; not Shopify', performance: Math.round(report.categories.performance.score * 100), accessibility: Math.round(report.categories.accessibility.score * 100), lcp: report.audits['largest-contentful-paint'].displayValue, cls: report.audits['cumulative-layout-shift'].numericValue, failures: report.categories.accessibility.auditRefs.filter(ref => report.audits[ref.id].score === 0).map(ref => ref.id) };
  results.push(result);console.log(JSON.stringify(result));
}
await writeFile(new URL('./lighthouse/results.json', import.meta.url), JSON.stringify(results, null, 2) + '\n');
