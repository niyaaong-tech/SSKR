const test = require('node:test');
const assert = require('node:assert/strict');
const { handleParticipateRequest: request } = require('../../server/participate/request-handler');
const account = { linked: true, provider: 'kakao' };
const act = (state, action, rest = {}) => request('application', { snapshot: state.mockSnapshot, account, action, ...rest });

test('back navigation preserves data, survives refresh and advances one step at a time', async () => {
 let state = await request('context', { scenario: 'b-step4', account });
 const original = structuredClone(state.application);
 for (const n of [4, 3, 2]) {
  state = await act(state, 'PREVIOUS_STEP', { fromStep: `STEP_${n}` });
  assert.equal(state.ok, true);
  assert.equal(state.surface.step, `STEP_${n-1}`);
  assert.deepEqual(state.application.participant, original.participant);
  assert.deepEqual(state.application.agreements, original.agreements);
  assert.equal(state.application.priceTierId, original.priceTierId);
  state = await request('context', { snapshot: state.mockSnapshot, account });
  assert.equal(state.surface.step, `STEP_${n-1}`);
 }
 state = await act(state, 'SAVE_ACKNOWLEDGEMENT', { acknowledgement: { acknowledged: true } });
 assert.equal(state.surface.step, 'STEP_2');
 state = await act(state, 'SAVE_AGREEMENTS', { agreements: Object.fromEntries(original.agreements.map(a => [a.code, a.accepted])) });
 assert.equal(state.surface.step, 'STEP_3');
 state = await act(state, 'SAVE_PARTICIPANT_INFO', { participant: { ...original.participant, priceTierId: original.priceTierId, bike: original.bike } });
 assert.equal(state.surface.step, 'STEP_4');
});

test('stale back requests cannot skip a step and invalid saved information still takes priority', async () => {
 let state = await request('context', { scenario: 'b-step4', account });
 state = await act(state, 'PREVIOUS_STEP', { fromStep: 'STEP_4' });
 const stale = await act(state, 'PREVIOUS_STEP', { fromStep: 'STEP_4' });
 assert.equal(stale.ok, false);
 assert.equal(stale.context.surface.step, 'STEP_3');
 state.mockSnapshot.application.acknowledgements = [];
 state = await request('context', { snapshot: state.mockSnapshot, account });
 assert.equal(state.surface.step, 'STEP_1');
});

test('deferred payment remains unpaid and resumes payment; missing consent reopens consent', async () => {
 let state = await request('context', { scenario: 'b-step4', account });
 state = await act(state, 'DEFER_PAYMENT');
 assert.equal(state.ok, true);
 assert.equal(state.surface.variant, 'PAYMENT_DEFERRED');
 assert.equal(state.participation, null);
 assert.equal(state.payment.state, 'NOT_STARTED');
 const deferred = structuredClone(state);
 state = await act(state, 'RESUME_PAYMENT');
 assert.equal(state.surface.step, 'STEP_4');
 deferred.mockSnapshot.application.agreements = [];
 state = await act(deferred, 'RESUME_PAYMENT');
 assert.equal(state.surface.step, 'STEP_2');
});

test('unpaid checkout hold is released on back; cancel allows a fresh application', async () => {
 let state = await request('checkout', { scenario: 'b-step4', account, action: 'PREPARE' });
 state = await act(state, 'PREVIOUS_STEP', { fromStep: 'STEP_4' });
 assert.equal(state.checkoutHold.state, 'RELEASED');
 for (const n of [3, 2]) state = await act(state, 'PREVIOUS_STEP', { fromStep: `STEP_${n}` });
 state = await act(state, 'CANCEL');
 assert.equal(state.surface.mode, 'MODE_A');
 assert.equal(state.application, null);
 state = await act(state, 'START');
 assert.equal(state.surface.step, 'STEP_1');
 assert.equal(state.application.priceTierId, null);
});

test('pending, processing, successful and completed payments cannot be rewound or deferred', async () => {
 for (const scenario of ['b-processing', 'b-finalizing', 'c-confirmed-spots']) {
  const state = await request('context', { scenario, account });
  const variants = [state];
  if (scenario === 'b-processing') {
   const pending = structuredClone(state);
   pending.mockSnapshot.paymentAttempts.at(-1).state = 'PENDING';
   variants.push(pending);
  }
  for (const initial of variants) for (const action of ['PREVIOUS_STEP', 'CANCEL', 'DEFER_PAYMENT', 'RESUME_PAYMENT', 'EDIT_PARTICIPANT_INFO']) {
   const result = await act(initial, action, { fromStep: 'STEP_4' });
   assert.equal(result.ok, false, `${scenario} ${action}`);
   assert.deepEqual(result.mockSnapshot.checkoutHold, initial.mockSnapshot.checkoutHold);
   assert.deepEqual(result.mockSnapshot.paymentAttempts, initial.mockSnapshot.paymentAttempts);
   assert.deepEqual(result.mockSnapshot.participation, initial.mockSnapshot.participation);
  }
 }
});
