import test from 'node:test';
import assert from 'node:assert/strict';
import { restartUrl, withRestartLink } from './whatsapp-restart.mjs';
import { createWhatsAppConversation } from './whatsapp-flow.mjs';

const number='12025550123'; // Reserved fictional example; never an operator default.
test('restart destination requires an explicitly configured international number', () => {
  for(const input of ['', 'abc', '+12025550123', '001234567890', '123', '1'.repeat(16)]) assert.equal(restartUrl(input),null);
  const url = new URL(restartUrl(number));
  assert.equal(url.origin, 'https://wa.me');
  assert.equal(url.pathname, '/'+number);
  assert.equal(url.searchParams.get('text'), 'YOJANA START');
});

test('greeting and Hindi/English retry messages get one visible restart URL', async () => {
  const flow = createWhatsAppConversation({ answers: {}, naturalFlow: true });
  const original = await flow.handle('fictional-restart', 'START');
  assert.equal(withRestartLink(original,''), original);
  const greeting = withRestartLink(original,number);
  assert.ok(greeting.includes(restartUrl(number)));
  for (const language of ['1', '2']) {
    await flow.handle('fictional-restart', 'START');
    await flow.handle('fictional-restart', language);
    await flow.handle('fictional-restart', '1');
    const retry = withRestartLink(await flow.handle('fictional-restart', 'unclear'),number);
    assert.ok(retry.includes(restartUrl(number)));
    assert.ok(retry.includes('लिंक खोलें, फिर भेजें दबाएँ।'));
    assert.ok(retry.includes('Open the link, then tap Send.'));
    assert.equal(withRestartLink(retry,number), retry);
  }
});

test('ordinary questions and non-text results are unchanged', () => {
  for (const text of ['1 Yes\n2 No', 'Source: https://pmkisan.gov.in/', '', null, undefined]) {
    assert.equal(withRestartLink(text), text);
  }
});
