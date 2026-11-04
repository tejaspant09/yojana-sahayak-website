// The public demo evaluates a reviewed build snapshot locally. It never contacts
// a model, saves a profile, or creates an answer outside the exported fact set.
const schemeIds = new Set(['pm-kisan', 'pm-kmy', 'pmuy', 'pm-sym', 'pm-vishwakarma', 'nmmss']);
const topics = new Set(['benefit', 'overview', 'conditions', 'documents', 'application', 'ekyc', 'deadline', 'trades']);
const aliases = [
  ['pm-kmy', /\bpm[\s-]?kmy\b|kisan\s+maan.?dhan|किसान मानधन/iu],
  ['pm-kisan', /pm[\s-]?kisan|पीएम[\s-]?किसान|प्रधानमंत्री किसान/iu],
  ['nmmss', /\bnmmss?\b|national means.{0,12}merit|नेशनल मीन्स/iu],
  ['pmuy', /\bpmuy\b|ujjwala|उज्ज्वला/iu],
  ['pm-vishwakarma', /pm[\s-]?vishwakarma|विश्वकर्मा/iu],
  ['pm-sym', /pm[\s-]?sym|shram yogi|श्रम योगी/iu],
];
const copy = {
  en: {
    noEvidence:'I could not verify an answer from the available reviewed sources. Please specify the scheme and question.',
    choose:'Please name a covered scheme: PM-KISAN, PM-KMY, PMUY, PM-SYM, PM Vishwakarma, or NMMSS.',
    conflict:'The scheme named in your question differs from the selected scheme. Choose the intended scheme and ask again.',
    invalid:'Use Hindi or English and a question of 1–1000 characters.',
  },
  hi: {
    noEvidence:'उपलब्ध जाँचे गए स्रोतों से इस सवाल का उत्तर सत्यापित नहीं कर सका। कृपया योजना और सवाल स्पष्ट करें।',
    choose:'कृपया योजना का नाम बताएँ: PM-KISAN, PM-KMY, PMUY, PM-SYM, PM Vishwakarma या NMMSS।',
    conflict:'सवाल में दी गई योजना चुनी हुई योजना से अलग है। सही योजना चुनकर फिर सवाल पूछें।',
    invalid:'हिंदी या अंग्रेज़ी में 1–1000 अक्षरों का सवाल लिखें।',
  },
};

const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 8000;
function calendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(value+'T00:00:00Z');
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0,10) === value;
}
function dayInIndia(asOf) {
  const date = asOf instanceof Date ? asOf : new Date(asOf);
  if (!Number.isFinite(date.getTime())) throw new TypeError('A valid date is required.');
  return new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Kolkata', year:'numeric', month:'2-digit', day:'2-digit'}).format(date);
}
function currentCitation(source, day) {
  if (!object(source) || !text(source.title) || !text(source.locator) || !text(source.evidence_id)
    || !text(source.document_id) || !/^[a-f0-9]{64}$/.test(source.snapshot_sha256 || '')) return false;
  try {
    const url = new URL(source.url);
    if (url.protocol !== 'https:' || url.username || url.password
      || !/(?:^|\.)(?:gov|nic)\.in$/i.test(url.hostname)) return false;
  } catch { return false; }
  return source.valid_until === null || (calendarDate(source.valid_until) && source.valid_until >= day);
}
function validQuestionnaire(item, day) {
  return object(item) && schemeIds.has(item.scheme_id) && text(item.name)
    && Array.isArray(item.citations) && item.citations.length > 0 && item.citations.every(source => currentCitation(source, day))
    && Array.isArray(item.questions) && item.questions.length > 0 && item.questions.length <= 12
    && new Set(item.questions.map(question => question?.key)).size === item.questions.length
    && item.questions.every(question => object(question) && /^[a-z][a-z0-9_]{0,79}$/.test(question.key)
      && text(question.en) && text(question.hi) && typeof question.fail_when === 'boolean'
      && text(question.failure_reason?.en) && text(question.failure_reason?.hi))
    && ['match_reason', 'missing_reason', 'coverage_note'].every(key => text(item[key]?.en) && text(item[key]?.hi));
}

// Preserve the UI's catalogue shape while withdrawing expired or malformed
// evidence on every refresh and every assessment, including a long-lived tab.
export function filterCurrentCatalog(catalog, now = new Date()) {
  const day = dayInIndia(now);
  if (!object(catalog) || catalog.schema_version !== 1) return {schemes:[], records:[], questionnaires:[], whatsapp_url:null};
  const records = (Array.isArray(catalog.records) ? catalog.records : []).filter(record => object(record)
    && schemeIds.has(record.scheme_id) && text(record.id) && text(record.en) && text(record.hi)
    && Array.isArray(record.topics) && record.topics.length > 0 && record.topics.every(topic => topics.has(topic))
    && currentCitation(record.source, day));
  const questionnaires = (Array.isArray(catalog.questionnaires) ? catalog.questionnaires : []).filter(item => validQuestionnaire(item, day));
  return {...catalog, records, questionnaires, whatsapp_url:null};
}

function topicFor(question) {
  if (/deadline|last date|open|closing|अंतिम|तारीख|कब तक/i.test(question)) return 'deadline';
  if (/document|proof|कागज|दस्तावेज/i.test(question)) return 'documents';
  if (/ekyc|e-kyc|केवाईसी/i.test(question)) return 'ekyc';
  if (/apply|application|enrol|register|आवेदन|पंजीकरण/i.test(question)) return 'application';
  if (/eligib|exclu|condition|qualif|who can|land|tax|age|income|पात्र|शर्त|अपवाद|जमीन|आयु|उम्र|आयकर/i.test(question)) return 'conditions';
  if (/benefit|amount|pay|pension|money|rupee|instal|kitn|paisa|लाभ|राशि|पैस|रुपय|पेंशन|किस्त/i.test(question)) return 'benefit';
  if (/trade|occupation|ट्रेड|व्यवसाय/i.test(question)) return 'trades';
  return null;
}
function insufficient(language, reason, schemeId = null) {
  return {status:'insufficient_evidence', language, scheme_id:schemeId, reason_code:reason, citations:[], answer_text:copy[language].noEvidence};
}

export function createStaticService(catalog, {now = () => new Date()} = {}) {
  // A caller cannot mutate the exported snapshot after service construction.
  const snapshot = structuredClone(catalog);
  const current = () => filterCurrentCatalog(snapshot, now());
  function recommend(input = {}) {
    if (!object(input)) return {status:'invalid_request', results:[], reason_code:'invalid_profile'};
    if (Object.hasOwn(input, 'profiles')) return compare(input);
    if (!object(input.profile)) return {status:'invalid_request', results:[], reason_code:'invalid_profile'};
    const {profile} = input;
    const language = ['en', 'hi'].includes(input.language) ? input.language : 'en';
    const schemeId = profile.scheme_id || 'pm-kisan';
    if (!schemeIds.has(schemeId)) return {status:'invalid_request', results:[], reason_code:'unsupported_scheme'};
    const rule = current().questionnaires.find(item => item.scheme_id === schemeId);
    if (!rule) return {status:'insufficient_evidence', language, results:[], reason_code:'rule_evidence_unavailable'};
    const missing = rule.questions.filter(question => typeof profile[question.key] !== 'boolean').map(question => question.key);
    const failures = rule.questions.filter(question => profile[question.key] === question.fail_when).map(question => question.failure_reason[language]);
    const status = failures.length ? 'not_matched' : missing.length ? 'needs_information' : 'potential_match';
    const item = {scheme_id:schemeId, scheme_name:rule.name, status,
      reasons:failures.length ? failures : [rule[missing.length ? 'missing_reason' : 'match_reason'][language]],
      missing_fields:missing, citations:structuredClone(rule.citations), official_decision:false,
      ...(rule.scope_note?.[language] ? {scope_note:rule.scope_note[language]} : {})};
    return {status:'ok', language, results:[item], coverage_note:rule.coverage_note[language]};
  }
  function compare(input) {
    const profiles = input.profiles;
    if (!Array.isArray(profiles) || !profiles.length || profiles.length > 10 || Object.hasOwn(input, 'profile')
      || (input.language !== undefined && !['en', 'hi'].includes(input.language))
      || profiles.some(profile => !object(profile) || !schemeIds.has(profile.scheme_id))
      || new Set(profiles.map(profile => profile.scheme_id)).size !== profiles.length) {
      return {status:'invalid_request', results:[], reason_code:'invalid_profiles'};
    }
    const records = current().questionnaires;
    const results = [], unavailable = [];
    for (const profile of profiles) {
      const item = recommend({profile, language:input.language}).results?.[0];
      if (!item) {unavailable.push(profile.scheme_id);continue;}
      const total = records.find(rule => rule.scheme_id === profile.scheme_id).questions.length;
      const unknown = item.missing_fields.length, failed = item.status === 'not_matched' ? item.reasons.length : 0;
      results.push({...item, condition_counts:{total, met:total - unknown - failed, failed, unknown}});
    }
    const order = {potential_match:0, needs_information:1, not_matched:2};
    results.sort((a,b) => order[a.status] - order[b.status]
      || b.condition_counts.met / b.condition_counts.total - a.condition_counts.met / a.condition_counts.total);
    return {status:results.length ? 'ok' : 'insufficient_evidence', results, unavailable_schemes:unavailable,
      ranking_basis:'reviewed_condition_coverage', official_decision:false};
  }
  function chat(input = {}) {
    if (!object(input)) return {status:'invalid_request', reason_code:'invalid_request', citations:[]};
    const {question, scheme_id:requested, language:provided} = input;
    const language = provided || (/[\u0900-\u097f]/u.test(typeof question === 'string' ? question : '') ? 'hi' : 'en');
    if (!['en','hi'].includes(language) || typeof question !== 'string' || !question.trim() || question.length > 1000) {
      return {status:'invalid_request', reason_code:'invalid_question_or_language', answer_text:copy.en.invalid, citations:[]};
    }
    if (requested && !schemeIds.has(requested)) return insufficient(language, 'unknown_scheme');
    const named = aliases.find(([,pattern]) => pattern.test(question))?.[0];
    if (requested && named && requested !== named) return {status:'clarify', language, scheme_id:requested,
      reason_code:'scheme_conflict', citations:[], answer_text:copy[language].conflict};
    const schemeId = requested || named;
    if (!schemeId) return {status:'clarify', language, scheme_id:null, reason_code:'choose_scheme', citations:[], answer_text:copy[language].choose};
    if (/\bpan(?:\s+card)?\b|permanent account number|पैन/u.test(question.toLocaleLowerCase())) return insufficient(language, 'no_evidence', schemeId);
    const topic = topicFor(question);
    const data = current();
    if (!topic) {
      const name = data.schemes?.find(scheme => scheme.id === schemeId)?.name || schemeId;
      return {status:'clarify', language, scheme_id:schemeId, reason_code:'missing_intent', citations:[],
        answer_text:language === 'hi' ? name+' के लाभ, शर्तें, दस्तावेज़ या आवेदन के बारे में क्या जानना चाहेंगे?'
          : 'What would you like to know about '+name+': benefits, conditions, documents, or application?'};
    }
    const record = data.records.find(record => record.scheme_id === schemeId && record.topics.includes(topic));
    if (!record) return insufficient(language, 'no_evidence', schemeId);
    return {status:'answered', language, scheme_id:schemeId, reason_code:'static_reviewed_record', mode:'static',
      answer_text:record[language], citations:[structuredClone(record.source)], fact_ids:[record.id]};
  }
  return {chat, recommend};
}
