import test from 'node:test';
import assert from 'node:assert/strict';
import {createApp} from './index.js';
import {createAnswerService} from './answer-service.mjs';

test('a selected scheme cannot override a different scheme explicitly named in a question',async()=>{
  let calls=0;
  const result=await createAnswerService({model:async()=>{calls++;throw Error('should not run');}})
    .chat({scheme_id:'pm-kisan',question:'What are PMUY benefits?',language:'en'});
  assert.equal(result.status,'clarify');assert.equal(result.reason_code,'conflicting_scheme');
  assert.deepEqual(result.citations,[]);assert.equal(calls,0);
});

test('a client disconnect cannot free asynchronous work admission prematurely',async()=>{
  let finish,entered;
  const started=new Promise(resolve=>entered=resolve);
  const app=createApp({maximum:1,answers:{chat:async()=>{entered();await new Promise(resolve=>finish=resolve);return {status:'answered'};}}});
  const server=app.listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  const root=`http://127.0.0.1:${server.address().port}`;
  const options={method:'POST',headers:{'Content-Type':'application/json'},body:'{"question":"fictional"}'};
  const cancel=new AbortController();
  try{
    const first=fetch(root+'/api/chat',{...options,signal:cancel.signal}).catch(()=>null);
    await started;cancel.abort();await first;
    const second=await fetch(root+'/api/chat',options);assert.equal(second.status,503);
    finish();
  }finally{finish?.();await new Promise(resolve=>server.close(resolve));}
});

test('forwarded addresses do not evade default limits and responses carry browser protections',async()=>{
  const server=createApp({limit:1}).listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));
  const root=`http://127.0.0.1:${server.address().port}`;
  try{
    const first=await fetch(root+'/api/health',{headers:{'X-Forwarded-For':'198.51.100.1'}});
    assert.equal(first.status,200);assert.equal(first.headers.get('x-content-type-options'),'nosniff');
    assert.match(first.headers.get('content-security-policy'),/object-src 'none'/);
    const second=await fetch(root+'/api/health',{headers:{'X-Forwarded-For':'198.51.100.2'}});
    assert.equal(second.status,429);
  }finally{await new Promise(resolve=>server.close(resolve));}
});
