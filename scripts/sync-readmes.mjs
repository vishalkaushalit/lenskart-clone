import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const root = fileURLToPath(new URL('../', import.meta.url));
const staged = process.argv.includes('--staged');
const write = process.argv.includes('--write');
const check = process.argv.includes('--check');
if (write === check) throw new Error('Choose --write or --check.');
const begin = '<!-- AUTO-GENERATED:START -->';
const end = '<!-- AUTO-GENERATED:END -->';
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
function read(path) {
  return staged ? git(['show', `:${path}`]) : readFileSync(resolve(root, path), 'utf8');
}
function files(directory) {
  return readdirSync(resolve(root, directory), { withFileTypes: true }).flatMap(entry => {
    const path = `${directory}/${entry.name}`;
    return entry.isDirectory() ? files(path) : [path];
  });
}
const paths = staged ? git(['ls-files', '--cached', '-z']).split('\0').filter(Boolean) : ['backend', 'frontend', 'web-panel'].flatMap(app => [
  `${app}/package.json`, ...files(`${app}/src`), ...(app === 'backend' ? files(`${app}/scripts`) : []),
]);
const sources = paths.filter(path => /^(backend|frontend|web-panel)\/(src|scripts)\/.*\.(?:jsx?|css)$/.test(path)).sort();
const unique = values => [...new Set(values)].sort();
const cell = value => String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
function table(headings, rows) {
  return `| ${headings.join(' | ')} |\n| ${headings.map(() => '---').join(' | ')} |\n${rows.map(row => `| ${row.map(cell).join(' | ')} |`).join('\n')}\n`;
}
const state = new Map(sources.map(path => [path, read(path)]));
function generated(app) {
  const entries = [...state].filter(([path]) => path.startsWith(`${app}/`));
  const pkg = JSON.parse(read(`${app}/package.json`));
  const digest = createHash('sha256').update(JSON.stringify([pkg, entries])).digest('hex');
  const env = unique(entries.flatMap(([, source]) => [...source.matchAll(/(?:process\.env|import\.meta\.env)\.([A-Z][A-Z0-9_]*)/g)].map(match => match[1])));
  let text = `## Generated code reference\n\nMaintained by \`npm run docs:sync\` from the repository root. Edit explanations above this section; generated content is replaced automatically. Source fingerprint: \`${digest}\`.\n\n### Actual npm commands\n\n`;
  text += table(['Script', 'Command'], Object.entries(pkg.scripts || {}).map(([key, value]) => [key, `\`${value}\``]));
  text += `\n### Environment keys used in source\n\n${env.map(key => `\`${key}\``).join(', ') || 'None'}. Values are never read from .env files.\n`;
  text += '\n### Source inventory and exported symbols\n\n';
  text += table(['File', 'Exports'], entries.map(([path, source]) => [
    `[${path.slice(app.length + 1)}](${path.slice(app.length + 1)})`,
    unique([...source.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let)\s+(\w+)/g)].map(match => match[1])).join(', ') || (/export\s+default/.test(source) ? 'default export' : 'Internal module / styles'),
  ]));
  text += '\n### Route declarations\n\nPaths below are local declarations; consult the API/page guide above for mounted prefixes and permissions.\n\n';
  const routes = entries.flatMap(([path, source]) => [
    ...[...source.matchAll(/\b(\w+)\.(get|post|patch|put|delete|use)\(\s*['"]([^'"]+)['"]/g)].map(match => [path.slice(app.length + 1), `${match[1]}.${match[2]}`, `\`${match[3]}\``]),
    ...[...source.matchAll(/<Route\s+path=['"]([^'"]+)['"]/g)].map(match => [path.slice(app.length + 1), 'React Route', `\`${match[1]}\``]),
  ]);
  text += routes.length ? table(['Source', 'Declaration', 'Path'], routes) : 'No route declarations in this application.\n';
  if (app === 'backend') {
    text += '\n### Exact model definitions\n\nThese source excerpts keep every schema field, default, validator, index, and model hook visible as code changes. Field purposes are explained in the database dictionary above.\n';
    for (const [path, source] of entries.filter(([path]) => path.includes('/models/') && !path.endsWith('.test.js'))) text += `\n#### ${path.split('/').at(-1)}\n\n\`\`\`js\n// Generated directly from ${path}; edit the source model, not this excerpt.\n${source.trim()}\n\`\`\`\n`;
  }
  return text.trim();
}
const blocks = new Map(['backend', 'frontend', 'web-panel'].map(app => [`${app}/README.md`, generated(app)]));
blocks.set('README.md', `## Generated application summary\n\n${table(['Application', 'Source files', 'Guide'], ['backend', 'frontend', 'web-panel'].map(app => [app, sources.filter(path => path.startsWith(`${app}/`)).length, `[README](${app}/README.md)`]))}\nUpdate references with \`npm run docs:sync\`; verify with \`npm run docs:check\`. Run \`npm run docs:hooks\` once per clone to enable commit-time synchronization. Review written field explanations whenever behavior changes.`);
let stale = false;
for (const [path, body] of blocks) {
  let original;
  try { original = write ? readFileSync(resolve(root, path), 'utf8') : read(path); }
  catch {
    if (check && staged) { stale = true; console.error(`README must be staged: ${path}`); continue; }
    throw new Error(`Missing README: ${path}`);
  }
  const start = original.indexOf(begin);
  const finish = original.indexOf(end);
  if ((start === -1) !== (finish === -1) || (start !== -1 && finish < start)) throw new Error(`Invalid generated markers in ${path}`);
  const block = `${begin}\n${body.trim()}\n${end}`;
  const next = start === -1 ? `${original.trimEnd()}\n\n${block}\n` : `${original.slice(0, start)}${block}${original.slice(finish + end.length)}`;
  if (next !== original) {
    stale = true;
    if (write) { writeFileSync(resolve(root, path), next); console.log(`Updated ${path}`); }
    else console.error(`Outdated README: ${path}`);
  }
}
if (check && stale) process.exitCode = 1;
else console.log(write ? 'README synchronization complete.' : 'README references match the source.');
