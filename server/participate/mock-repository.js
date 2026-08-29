const { ParticipateRepository } = require("./repositories");

const clone = (value) => value == null ? value : JSON.parse(JSON.stringify(value));

class MockParticipateRepository extends ParticipateRepository {
  constructor(snapshot) {
    super();
    this.snapshot = clone(snapshot);
    this.snapshot.paymentAttempts ||= [];
    this.snapshot.logs ||= [];
  }

  setAccount(account) { this.snapshot.account = clone(account); }
  getCurrentEvent() { return clone(this.snapshot.event); }
  getEvents() { return clone(this.snapshot.events || [this.snapshot.event]); }
  saveEvent(event) { this.snapshot.event = clone(event); return this.getCurrentEvent(); }
  getPriceTiers() { return clone(this.snapshot.priceTiers || []); }
  getUserContext() { return clone({ mockUserId: this.snapshot.mockUserId, account: this.snapshot.account }); }
  getApplication() { return clone(this.snapshot.application); }
  saveApplication(application) { this.snapshot.application = clone(application); return this.getApplication(); }
  getCheckoutHold() { return clone(this.snapshot.checkoutHold); }
  saveCheckoutHold(hold) { this.snapshot.checkoutHold = clone(hold); return this.getCheckoutHold(); }
  getPaymentAttempts() { return clone(this.snapshot.paymentAttempts); }
  savePaymentAttempt(attempt) {
    const index = this.snapshot.paymentAttempts.findIndex((item) => item.id === attempt.id);
    if (index >= 0) this.snapshot.paymentAttempts[index] = clone(attempt);
    else this.snapshot.paymentAttempts.push(clone(attempt));
    return clone(attempt);
  }
  getParticipation() { return clone(this.snapshot.participation); }
  saveParticipation(participation) { this.snapshot.participation = clone(participation); return this.getParticipation(); }
  appendLog(entry) {
    this.snapshot.logs.push({ ...clone(entry), at: entry.at || new Date().toISOString() });
    this.snapshot.logs = this.snapshot.logs.slice(-80);
  }
  exportSnapshot() { return clone(this.snapshot); }
}

module.exports = { MockParticipateRepository, clone };
