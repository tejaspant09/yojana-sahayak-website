import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { loadPassages, schemes } from '../server/corpus.mjs';
import { supportedRecords } from '../server/verified-facts.mjs';

const passages = loadPassages();
const byId = new Map(passages.map(passage => [passage.id, passage]));
const manifest = JSON.parse(readFileSync(new URL('../corpus/manifest.json', import.meta.url), 'utf8'));
const sources = new Map(manifest.sources.map(source => [source.id, source]));
const records = supportedRecords(passages).map(record => {
  const passage = byId.get(record.evidence_id);
  const source = sources.get(passage.document_id);
  return {
    scheme_id: record.scheme_id,
    topics: record.topics,
    en: record.en,
    hi: record.hi,
    source: {
      title: passage.title,
      locator: passage.locator,
      url: passage.url,
      valid_until: source.valid_until ?? null
    }
  };
});
const catalog = {
  generated_at: new Date().toISOString(),
  source_commit: 'fe351b32d1474de0da73fdde9b296a4d4248ac91',
  schemes: Object.entries(schemes).map(([id, scheme]) => ({ id, name: scheme.name })),
  records
};
const directory = new URL('../public/', import.meta.url);
mkdirSync(directory, { recursive: true });
writeFileSync(new URL('catalog.json', directory), JSON.stringify(catalog, null, 2));
writeFileSync(new URL('.nojekyll', directory), '');
console.log(`Exported ${records.length} reviewed records for ${catalog.schemes.length} schemes.`);
