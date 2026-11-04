import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createAnswerService} from '../server/answer-service.mjs';
import {loadPassages, schemes} from '../server/corpus.mjs';
import {supportedRecords} from '../server/verified-facts.mjs';
import {schemeQuestions} from '../server/scheme-comparison.mjs';
import {filterCurrentCatalog} from '../client/static-engine.mjs';

export function makeDemoCatalog({now = new Date()} = {}) {
  const date = now instanceof Date ? now : new Date(now);
  if (!Number.isFinite(date.getTime())) throw new TypeError('A valid export date is required.');
  const passages = loadPassages(date);
  const evidence = new Map(passages.map(passage => [passage.id, passage]));
  const manifest = JSON.parse(readFileSync(new URL('../corpus/manifest.json', import.meta.url), 'utf8'));
  const sources = new Map(manifest.sources.map(source => [source.id, source]));
  const citation = source => {
    const passage = source.evidence_id ? evidence.get(source.evidence_id) : source;
    if (!passage) throw new Error('Export cannot find approved citation evidence.');
    const document = sources.get(passage.document_id);
    if (!document || document.status !== 'approved') throw new Error('Export cannot publish unapproved evidence.');
    return {evidence_id:passage.id, document_id:passage.document_id, title:passage.title,
      authority:passage.authority, url:passage.url, locator:passage.locator, verified_at:passage.verified_at,
      snapshot_sha256:passage.snapshot_sha256, valid_until:document.valid_until ?? null};
  };
  const records = supportedRecords(passages).map(record => ({id:record.id, evidence_id:record.evidence_id,
    scheme_id:record.scheme_id, topics:record.topics, en:record.en, hi:record.hi,
    passage_sha256:record.passage_sha256, source:citation(evidence.get(record.evidence_id))}));
  const service = createAnswerService({passages});
  const questionnaires = [];
  for (const [schemeId, questions] of Object.entries(schemeQuestions)) {
    const probe = (profile, language) => service.recommend({profile:{scheme_id:schemeId, ...profile}, language});
    const unknown = Object.fromEntries(['en','hi'].map(language => [language, probe({}, language)]));
    if (!unknown.en.results?.length || !unknown.hi.results?.length) continue;
    const generatedQuestions = questions.map(question => {
      const results = [false,true].map(value => ({value, en:probe({[question.key]:value}, 'en'), hi:probe({[question.key]:value}, 'hi')}));
      const failures = results.filter(result => result.en.results?.[0]?.status === 'not_matched');
      if (failures.length !== 1 || failures[0].hi.results?.[0]?.status !== 'not_matched') throw new Error('Static export needs one independent boolean failure per field: '+question.key);
      const failure = failures[0];
      if (failure.en.results[0].reasons.length !== 1 || failure.hi.results[0].reasons.length !== 1) throw new Error('Static export cannot merge compound rule predicates.');
      return {...question, fail_when:failure.value, failure_reason:{en:failure.en.results[0].reasons[0], hi:failure.hi.results[0].reasons[0]}};
    });
    const passing = Object.fromEntries(generatedQuestions.map(question => [question.key, !question.fail_when]));
    const matched = Object.fromEntries(['en','hi'].map(language => [language, probe(passing, language)]));
    if (['en','hi'].some(language => matched[language].results?.[0]?.status !== 'potential_match')) throw new Error('Static export could not derive a passing selected-condition profile.');
    questionnaires.push({scheme_id:schemeId, name:schemes[schemeId].name, questions:generatedQuestions,
      citations:unknown.en.results[0].citations.map(citation),
      match_reason:{en:matched.en.results[0].reasons[0], hi:matched.hi.results[0].reasons[0]},
      missing_reason:{en:unknown.en.results[0].reasons[0], hi:unknown.hi.results[0].reasons[0]},
      coverage_note:{en:matched.en.coverage_note, hi:matched.hi.coverage_note},
      ...(matched.en.results[0].scope_note ? {scope_note:{en:matched.en.results[0].scope_note, hi:matched.hi.results[0].scope_note}} : {})});
  }
  const catalog = {schema_version:1, generated_at:date.toISOString(), refresh_after_ms:60000,
    source_commit:'fe0d6f381e99b11bf494f2d470fff53527087810', mode:'static_reviewed_snapshot', whatsapp_url:null,
    schemes:Object.entries(schemes).map(([id, scheme]) => ({id, name:scheme.name})), records, questionnaires};
  const filtered = filterCurrentCatalog(catalog, date);
  if (filtered.records.length !== records.length || filtered.questionnaires.length !== questionnaires.length) throw new Error('Static export failed citation, expiry, or schema validation.');
  return catalog;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const catalog = makeDemoCatalog();
  const publicDirectory = new URL('../public/', import.meta.url);
  mkdirSync(publicDirectory, {recursive:true});
  writeFileSync(new URL('demo.json', publicDirectory), JSON.stringify(catalog, null, 2)+'\n');
  console.log(`Exported ${catalog.records.length} reviewed facts and ${catalog.questionnaires.length} questionnaires for the static demo.`);
}
