import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from './index.js';
import {createAnswerService} from './answer-service.mjs';
import {loadPassages} from './corpus.mjs';
import {restartUrl} from './whatsapp-restart.mjs';

const passages=loadPassages(new Date('2026-11-03T12:00:00Z'));
async function serve(options,run){
  const server=createApp({whatsappNumber:'',...options}).listen(0,'127.0.0.1');
  await new Promise(resolve=>server.once('listening',resolve));
  try {await run(`http://127.0.0.1:${server.address().port}`);} finally {await new Promise(resolve=>server.close(resolve));}
}

test('owner configuration controls both catalogue navigation and restart destination',async()=>{
  const number='12025550123';
  await serve({whatsappNumber:number,getPassages:()=>passages},async root=>{
    const catalog=await (await fetch(root+'/api/catalog')).json();
    assert.equal(catalog.whatsapp_url,'/start-whatsapp');
    const response=await fetch(root+catalog.whatsapp_url,{redirect:'manual'});
    assert.equal(response.status,302);assert.equal(response.headers.get('location'),restartUrl(number));
  });
  for(const number of ['', 'not-a-number', '+12025550123']){
    await serve({whatsappNumber:number,getPassages:()=>passages},async root=>{
      assert.equal((await (await fetch(root+'/api/catalog')).json()).whatsapp_url,null);
      assert.equal((await fetch(root+'/start-whatsapp',{redirect:'manual'})).status,503);
    });
  }
});

test('browser questions are offered only while their supporting rule evidence passes',async()=>{
  let available=passages;
  await serve({getPassages:()=>available},async root=>{
    const first=await (await fetch(root+'/api/catalog')).json();
    assert.equal(first.questionnaires.length,6);
    for(const questionnaire of first.questionnaires){
      assert.ok(questionnaire.questions.length>0);
      assert.equal(new Set(questionnaire.questions.map(q=>q.key)).size,questionnaire.questions.length);
      assert.ok(questionnaire.questions.every(q=>q.en && q.hi));
    }
    available=passages.filter(p=>p.id!=='pmkisan-guidelines:3');
    const changed=await (await fetch(root+'/api/catalog')).json();
    assert.ok(!changed.questionnaires.some(q=>q.scheme_id==='pm-kisan'));
    assert.ok(changed.questionnaires.some(q=>q.scheme_id==='pmuy'));
  });
});

test('real HTTP browser journey supports missing answers, corrections, Hindi and a model outage',async()=>{
  const answers=createAnswerService({passages,model:async()=>{throw Error('offline');}});
  await serve({answers,getPassages:()=>passages},async root=>{
    async function post(route,body){
      const response=await fetch(root+'/api/'+route,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      assert.equal(response.status,200);return response.json();
    }
    const profile={scheme_id:'pm-kisan',owns_cultivable_land:true,income_tax_payer_last_year:false,practising_registered_professional:false};
    const partial=await post('recommend',{profile,language:'en'});
    assert.equal(partial.results[0].status,'needs_information');assert.deepEqual(partial.results[0].missing_fields,['other_official_exclusion']);
    const complete=await post('recommend',{profile:{...profile,other_official_exclusion:false},language:'hi'});
    assert.equal(complete.results[0].status,'potential_match');assert.equal(complete.results[0].official_decision,false);
    assert.ok(complete.results[0].citations.length>0);assert.match(complete.coverage_note,/[\u0900-\u097f]/u);
    const corrected=await post('recommend',{profile:{...profile,owns_cultivable_land:false,other_official_exclusion:false},language:'en'});
    assert.equal(corrected.results[0].status,'not_matched');
    const answer=await post('chat',{question:'What is the PM-KISAN benefit?',language:'en'});
    assert.equal(answer.mode,'extractive');assert.equal(answer.status,'answered');assert.ok(answer.citations.length>0);assert.match(answer.answer_text,/per year/u);
    const unknown=await post('chat',{question:'What is the Moon Farmer Lottery Scheme benefit?',language:'en'});
    assert.notEqual(unknown.status,'answered');assert.deepEqual(unknown.citations,[]);
    const unsupported=await post('chat',{question:'Can I apply for PMUY without a PAN card?',language:'en'});
    assert.equal(unsupported.status,'insufficient_evidence');
  });
});

test('a missing corpus is not ready even though the model is optional',async()=>{
  await serve({getPassages:()=>[],fetchImpl:async()=>{throw Error('offline');}},async root=>{
    const response=await fetch(root+'/api/ready');assert.equal(response.status,503);
    const data=await response.json();assert.equal(data.ok,false);assert.equal(data.extractive_fallback,false);
  });
});
