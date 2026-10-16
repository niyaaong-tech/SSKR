'use strict';
const clone = v => v == null ? v : structuredClone(v);
// Request-scoped working copy. Only a service-role CAS transaction persists it.
class WorkflowRepository {
  constructor(state, event, account, history = []) {
    this.snapshot = { ...clone(state || {}), event: clone(event), priceTiers: clone(event.priceTiers || []), account: clone(account), mockUserId: account?.id, logs: [], paymentAttempts: clone(state?.paymentAttempts || []) };
    this.history = history;
  }
  getCurrentEvent() { return clone(this.snapshot.event); }
  getEvents() { return [this.getCurrentEvent()]; }
  getPriceTiers() { return clone(this.snapshot.priceTiers); }
  savePriceTier(value) { this.snapshot.priceTiers = this.snapshot.priceTiers.map(p => p.id === value.id ? clone(value) : p); }
  getUserContext() { return { mockUserId: this.snapshot.mockUserId, account: clone(this.snapshot.account) }; }
  saveEvent(value) { this.snapshot.event = clone(value); }
  getApplication() { return clone(this.snapshot.application); }
  saveApplication(value) { this.snapshot.application = clone(value); }
  getCheckoutHold() { return clone(this.snapshot.checkoutHold); }
  saveCheckoutHold(value) { this.snapshot.checkoutHold = clone(value); }
  getPaymentAttempts() { return clone(this.snapshot.paymentAttempts); }
  savePaymentAttempt(value) { const i = this.snapshot.paymentAttempts.findIndex(p => p.id === value.id); if (i < 0) this.snapshot.paymentAttempts.push(clone(value)); else this.snapshot.paymentAttempts[i] = clone(value); }
  getParticipation() { return clone(this.snapshot.participation); }
  saveParticipation(value) { this.snapshot.participation = clone(value); }
  getParticipationHistory() { return clone(this.history); }
  appendLog(value) { this.snapshot.logs.push(clone(value)); }
  exportSnapshot() { return clone(this.snapshot); }
  document() { return Object.fromEntries(['application','checkoutHold','paymentAttempts','participation','run','memorial','refund','media'].map(k => [k,clone(this.snapshot[k] ?? (['paymentAttempts','media'].includes(k)?[]:null))])); }
}
module.exports = { WorkflowRepository };
