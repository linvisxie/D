// phonemize 1.1.0 emits its dictionary as over 100,000 JS bindings. Metro's
// Babel pass runs out of heap traversing them. Keep the same dictionary as
// one JSON string, retaining the upstream lookup and pronunciation logic.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

const entry = require.resolve('phonemize/en-g2p');
const dictionary = new (require(entry).G2PModel)().dictionary;
const literal = JSON.stringify(JSON.stringify(dictionary));
const replacement = 'var dictionary$1={default:JSON.parse(' + literal + ')};';
for (const filename of ['en-g2p.cjs', 'en-g2p.mjs']) {
  const file = path.join(path.dirname(entry), filename);
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes(replacement)) continue;
  const start = source.indexOf('const a$1=');
  const end = source.indexOf('const absent=', start);
  assert(start >= 0 && end > start, 'Check the updated phonemize dictionary layout');
  const temporary = file + '.tmp';
  fs.writeFileSync(temporary, source.slice(0, start) + replacement + source.slice(end));
  fs.renameSync(temporary, file);
}
delete require.cache[entry];
assert.deepEqual(new (require(entry).G2PModel)().dictionary, dictionary);
