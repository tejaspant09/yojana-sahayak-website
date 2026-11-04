import React, {useEffect, useRef, useState} from 'react';

const text = {
  en: {
    title:'Take the next step.', intro:'Check selected conditions or ask a question using reviewed official evidence.',
    check:'Check conditions', ask:'Ask a question', scheme:'Choose a scheme', empty:'No reviewed questionnaire is available right now.',
    yes:'Yes', no:'No', skip:'Unsure / skip', back:'Back', review:'Review your answers', edit:'Change',
    evaluate:'See my preliminary result', loading:'Checking reviewed sources…', restart:'Start a new check',
    question:'Your question', placeholder:'For example: What is the PM-KISAN benefit?', send:'Ask',
    notice:'Use fictional details for this demo. Your browser answers stay in this tab and are not saved as a profile.',
    preliminary:'This checks selected conditions only. The issuing authority decides eligibility.',
    missing:'Answers still needed', sources:'Supporting sources', none:'There is not enough reviewed evidence for this request.',
    error:'The service could not complete this request. Please try again.', retry:'Try again',
    limited:'Too many requests. Please wait a minute and try again.', busy:'The assistant is busy. Try again shortly.',
    offline:'Answered from reviewed records. The local model is unavailable.',
    access:'This server requires an access token supplied by its operator.', token:'Access token', unlock:'Use token for this tab',
    statuses:{potential_match:'Possible match on selected conditions', needs_information:'More information needed', not_matched:'Selected conditions not met'},
  },
  hi: {
    title:'अपना अगला कदम जानें।', intro:'जाँचे गए सरकारी स्रोतों से शुरुआती शर्तें जाँचें या सवाल पूछें।',
    check:'शर्तें जाँचें', ask:'सवाल पूछें', scheme:'योजना चुनें', empty:'अभी जाँची गई प्रश्नावली उपलब्ध नहीं है।',
    yes:'हाँ', no:'नहीं', skip:'पता नहीं / छोड़ें', back:'वापस', review:'अपने जवाब देखें', edit:'बदलें',
    evaluate:'शुरुआती परिणाम देखें', loading:'जाँचे गए स्रोत देख रहे हैं…', restart:'नई जाँच शुरू करें',
    question:'आपका सवाल', placeholder:'जैसे: पीएम-किसान में कितनी राशि मिलती है?', send:'पूछें',
    notice:'डेमो में काल्पनिक जानकारी दें। ब्राउज़र के जवाब इसी टैब में रहते हैं और प्रोफ़ाइल के रूप में सहेजे नहीं जाते।',
    preliminary:'यह केवल कुछ शुरुआती शर्तों की जाँच है। अंतिम पात्रता संबंधित सरकारी विभाग तय करता है।',
    missing:'इन सवालों के जवाब बाकी हैं', sources:'समर्थन करने वाले स्रोत', none:'इस सवाल के लिए पर्याप्त जाँचा हुआ प्रमाण उपलब्ध नहीं है।',
    error:'अभी जवाब नहीं मिल सका। कृपया फिर कोशिश करें।', retry:'फिर कोशिश करें',
    limited:'बहुत अधिक अनुरोध हैं। एक मिनट बाद फिर कोशिश करें।', busy:'सहायक अभी व्यस्त है। थोड़ी देर बाद कोशिश करें।',
    offline:'जाँचे गए रिकॉर्ड से उत्तर दिया गया है। स्थानीय मॉडल अभी उपलब्ध नहीं है।',
    access:'इस सर्वर के संचालक से मिला एक्सेस टोकन आवश्यक है।', token:'एक्सेस टोकन', unlock:'इस टैब में टोकन इस्तेमाल करें',
    statuses:{potential_match:'चुनी हुई शर्तों में संभावित मेल', needs_information:'और जानकारी चाहिए', not_matched:'चुनी हुई शर्तें पूरी नहीं हुईं'},
  },
};

function safeUrl(value) {
  try {const url=new URL(value); return url.protocol==='https:' ? url.href : null;} catch {return null;}
}
function Sources({items=[],lang}) {
  const unique=[...new Map(items.map(item=>[item.evidence_id || item.url,item])).values()];
  return <ul className="assistant-sources">{unique.map((source,index)=>{
    const url=safeUrl(source.url);
    return <li key={source.evidence_id || index}>{url
      ? <a href={url} target="_blank" rel="noreferrer">{source.title}</a>
      : <span>{source.title}</span>}
      <small>{source.locator}{source.verified_at ? ` (${lang==='hi'?'स्रोत की जाँच':'Source checked'}: ${source.verified_at})` : ''}</small>
    </li>;
  })}</ul>;
}

export default function Assistant({lang,questionnaires=[],schemeId,onSchemeChange,service,ready=true}) {
  const t=text[lang];
  const [mode,setMode]=useState('check'), [stage,setStage]=useState('questions'), [index,setIndex]=useState(0);
  const [profile,setProfile]=useState({}), [result,setResult]=useState(null), [question,setQuestion]=useState('');
  const [answer,setAnswer]=useState(null), [busy,setBusy]=useState(false), [error,setError]=useState('');
  const [needsAccess,setNeedsAccess]=useState(false), [accessToken,setAccessToken]=useState(''), [tokenDraft,setTokenDraft]=useState('');
  const pending=useRef(null), heading=useRef(null);
  const selected=questionnaires.find(item=>item.scheme_id===schemeId);
  const questions=selected?.questions || [];

  useEffect(()=>{
    pending.current?.abort(); pending.current=null; setBusy(false); setResult(null); setAnswer(null); setError('');
    setStage(previous=>previous==='results'?'review':previous);
    return ()=>{pending.current?.abort();pending.current=null;};
  },[lang,schemeId,mode]);
  useEffect(()=>{
    if(service){setAnswer(null);setResult(null);setStage(previous=>previous==='results'?'review':previous);}
  },[service]);
  useEffect(()=>{setProfile({});setIndex(0);setStage('questions');},[schemeId]);
  useEffect(()=>{if(index>0 || stage!=='questions')heading.current?.focus();},[index,stage]);

  function reply(value) {
    const next={...profile};
    if(value===null)delete next[questions[index].key]; else next[questions[index].key]=value;
    setProfile(next);setError('');
    if(index+1<questions.length)setIndex(index+1);else setStage('review');
  }
  async function request(kind) {
    if(!ready){setError(t.error);return;}
    pending.current?.abort();
    const controller=new AbortController();pending.current=controller;
    const timer=setTimeout(()=>controller.abort(),35000);
    setBusy(true);setError('');setAnswer(null);setResult(null);
    try {
      let data;
      if(service){data=await service[kind](kind==='chat'?{question:question.trim(),scheme_id:schemeId || undefined,language:lang}:{profile:{...profile,scheme_id:schemeId},language:lang});}
      else {
      const response=await fetch(`/api/${kind}`,{
        method:'POST',signal:controller.signal,
        headers:{'Content-Type':'application/json',...(accessToken?{Authorization:`Bearer ${accessToken}`}:{})},
        body:JSON.stringify(kind==='chat'?{question:question.trim(),scheme_id:schemeId || undefined,language:lang}:{profile:{...profile,scheme_id:schemeId},language:lang}),
      });
      if(response.status===401){setNeedsAccess(true);throw Error(t.access);}
      if(response.status===429)throw Error(t.limited);
      if(response.status===503)throw Error(t.busy);
      if(!response.ok)throw Error(t.error);
      data=await response.json();
      }
      if(controller!==pending.current)return;
      if(kind==='chat'){if(typeof data.answer_text!=='string')throw Error(t.error);setAnswer(data);}
      else {if(!Array.isArray(data.results))throw Error(t.error);setResult(data);setStage('results');}
    } catch(problem) {
      if(controller===pending.current)setError(problem.name==='AbortError'?t.error:problem.message || t.error);
    } finally {
      clearTimeout(timer);if(controller===pending.current){pending.current=null;setBusy(false);}
    }
  }
  function reset(){pending.current?.abort();pending.current=null;setBusy(false);setProfile({});setIndex(0);setStage('questions');setResult(null);setError('');}
  return <section id="assistant" className="assistant wrap" aria-labelledby="assistant-title">
    <div className="section-heading"><h2 id="assistant-title">{t.title}</h2><p>{t.intro}</p></div>
    <div className="assistant-layout">
      <aside className="assistant-sidebar">
        <div className="assistant-modes" role="group" aria-label={lang==='hi'?'मदद का प्रकार':'Type of help'}>
          <button type="button" aria-pressed={mode==='check'} onClick={()=>setMode('check')}>{t.check}</button>
          <button type="button" aria-pressed={mode==='ask'} onClick={()=>setMode('ask')}>{t.ask}</button>
        </div>
        <label htmlFor="assistant-scheme">{t.scheme}</label>
        <select id="assistant-scheme" value={schemeId} onChange={event=>onSchemeChange(event.target.value)}>
          <option value="">{t.scheme}</option>
          {questionnaires.map(item=><option key={item.scheme_id} value={item.scheme_id}>{item.name}</option>)}
        </select>
        <p className="assistant-note">{t.notice}</p>
      </aside>
      <div className="assistant-workspace" aria-busy={busy}>
        {mode==='check' && (!selected ? <p>{t.empty}</p> : <>
          {stage==='questions' && questions[index] && <>
            <p className="assistant-step">{index+1} / {questions.length} — {selected.name}</p>
            <h3 ref={heading} tabIndex="-1">{questions[index][lang]}</h3>
            <div className="assistant-actions">
              <button type="button" className="assistant-primary" onClick={()=>reply(true)}>{t.yes}</button>
              <button type="button" onClick={()=>reply(false)}>{t.no}</button>
              <button type="button" onClick={()=>reply(null)}>{t.skip}</button>
            </div>
            {index>0 && <button type="button" className="assistant-link" onClick={()=>setIndex(index-1)}>{t.back}</button>}
          </>}
          {stage==='review' && <>
            <h3 ref={heading} tabIndex="-1">{t.review}</h3>
            <ol className="assistant-review">{questions.map((item,i)=><li key={item.key}>
              <span>{item[lang]}<strong>{profile[item.key]===undefined?t.skip:profile[item.key]?t.yes:t.no}</strong></span>
              <button type="button" className="assistant-link" disabled={busy} onClick={()=>{setIndex(i);setStage('questions');}}>{t.edit}</button>
            </li>)}</ol>
            <button type="button" className="assistant-primary" disabled={busy || !ready} onClick={()=>request('recommend')}>{busy?t.loading:t.evaluate}</button>
          </>}
          {stage==='results' && result && <>
            <h3 ref={heading} tabIndex="-1">{result.results.length?t.statuses[result.results[0].status] || t.none:t.none}</h3>
            {result.results.map(item=><article key={item.scheme_id}>
              <p>{item.scheme_name}</p>
              <ul>{item.reasons.map(reason=><li key={reason}>{reason}</li>)}</ul>
              {item.missing_fields.length>0 && <><p>{t.missing}:</p><ul>{item.missing_fields.map(key=><li key={key}>{questions.find(item=>item.key===key)?.[lang] || key}</li>)}</ul></>}
              {item.scope_note && <p>{item.scope_note}</p>}
              <h4>{t.sources}</h4><Sources items={item.citations} lang={lang}/>
            </article>)}
            <p className="assistant-note">{result.coverage_note || t.preliminary}</p>
            <div className="assistant-actions"><button type="button" onClick={()=>setStage('review')}>{t.edit}</button><button type="button" onClick={reset}>{t.restart}</button></div>
          </>}
        </>)}
        {mode==='ask' && <>
          <form onSubmit={event=>{event.preventDefault();request('chat');}}>
            <label htmlFor="assistant-question">{t.question}</label>
            <textarea id="assistant-question" value={question} onChange={event=>setQuestion(event.target.value)} required maxLength={1000} placeholder={t.placeholder}/>
            <button className="assistant-primary" disabled={busy || !ready || !question.trim()}>{busy?t.loading:t.send}</button>
          </form>
          {answer && <article className="assistant-answer" aria-live="polite">
            <p>{answer.answer_text}</p>
            {answer.mode==='extractive' && <small>{t.offline}</small>}
            {answer.citations?.length>0 && <><h4>{t.sources}</h4><Sources items={answer.citations} lang={lang}/></>}
          </article>}
        </>}
        {busy && <p role="status">{t.loading}</p>}
        {error && <p className="assistant-error" role="alert">{error}</p>}
        {needsAccess && <form className="assistant-access" onSubmit={event=>{event.preventDefault();setAccessToken(tokenDraft.trim());setTokenDraft('');setNeedsAccess(false);setError('');}}>
          <label htmlFor="access-token">{t.token}</label><input id="access-token" type="password" value={tokenDraft} autoComplete="off" required onChange={event=>setTokenDraft(event.target.value)}/>
          <button>{t.unlock}</button>
        </form>}
      </div>
    </div>
  </section>;
}
