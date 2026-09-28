const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
function load(file) {
  if (cache.has(file)) return cache.get(file);
  const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const mod = { exports: {} };
  const localRequire = (name) => {
    if (name.endsWith('.json')) return require(path.join(root, name.replace(/^@\//, '')));
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name + '.ts'));
    return require(name);
  };
  new Function('require', 'module', 'exports', output)(localRequire, mod, mod.exports);
  cache.set(file, mod.exports); return mod.exports;
}
const { catalogBooks, matchCatalogBook, searchCatalog } = load(path.join(root, 'lib/catalog.ts'));
const { makeBook, decodeLibrary } = load(path.join(root, 'lib/user-library.ts'));
assert.equal(catalogBooks.length, 16);
assert.equal(new Set(catalogBooks.map(b => b.id)).size, 16);
for (const b of catalogBooks) {
  assert(fs.statSync(path.join(root, 'public', b.artwork.path)).size > 1000);
  assert(b.summary && b.sources.length);
  for (const s of b.sources) assert(new URL(s.url).protocol === 'https:');
  for (const r of b.reviews) assert(b.sources.some(s => s.id === r.sourceId));
}
assert.equal(matchCatalogBook({ title: ' 총 균 쇠 ', author: '재레드 다이아몬드' }).id, 'guns-germs-steel');
assert.equal(matchCatalogBook({ title: 'Demian', author: 'Hermann Hesse' }).id, 'demian');
assert.equal(matchCatalogBook({ title: '데미안', author: '동명이 아닌 저자' }), undefined);
assert.equal(matchCatalogBook({ title: '데미안', author: '' }), undefined);
assert.equal(searchCatalog('칼 우주')[0].id, 'cosmos');
const input = { title: '데미안', author: '헤르만 헤세', genre: '소설', totalPages: 240, currentPage: 32, status: 'reading', note: '내 메모' };
const saved = makeBook(input);
assert.equal(saved.catalogId, 'demian');
const edited = makeBook({ ...input, note: '메모만 수정' }, saved);
assert.equal(edited.id, saved.id);
assert.equal(edited.currentPage, 32);
assert.equal(edited.lastReadAt, saved.lastReadAt);
assert.equal(edited.note, '메모만 수정');
assert.equal(decodeLibrary(JSON.stringify({ version: 1, books: [edited] }))[0].catalogId, 'demian');
const changed = makeBook({ ...input, title: '새 책' }, saved);
assert.equal(changed.catalogId, undefined);
assert.equal(changed.description, '');
assert.equal(makeBook({ ...input, currentPage: 0, status: 'want' }).lastReadAt, undefined);
console.log('PASS: 16 catalog assets/sources, exact work identity, safe unknown matches, progress and memo preservation, v1 storage compatibility');
