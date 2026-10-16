(function () {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const form = $('#event-form');
  const catalog = window.SSKR_SPOT_CATALOG || [];
  let fieldPlaces=[],starts=catalog.filter(p=>p.kind==='start'),finish=catalog.find(p=>p.id==='daecheon');
  const storageKey = 'sskr.event-admin.draft';
  const state = { events: [], current: null, record: null, dirty: false, busy: false, access: false, conflict: false };
  const input = name => form.elements.namedItem(name);
  function notice(message, error = false) {
    $('#admin-notice').textContent = message;
    $('#admin-notice').classList.toggle('is-error', error);
  }
  function element(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text;
    if (className) node.className = className;
    return node;
  }
  function localDateTime(value) {
    const date = new Date(value);
    if (!value || !Number.isFinite(date.getTime())) return { date: '', time: '' };
    const local = new Date(date.getTime() + 9 * 60 * 60 * 1000).toISOString();
    return { date: local.slice(0, 10), time: local.slice(11, 16) };
  }
  function formattedDate(value) {
    return localDateTime(value).date || '개최일 미정';
  }
  function selectedStarts() { return starts.filter(place => input('start-' + place.id).checked); }
  function partialSchedule() {
    const date = input('eventDate').value, start = input('startTime').value, end = input('endTime').value;
    return Boolean((date && !start && !end) || (!date && (start || end)));
  }
  function readyToPublish(record) {
    const data = record?.document;
    return Boolean(data?.publicTitle?.trim() && data.eventStartAt && data.eventEndAt && data.startLocationIds?.length && (data.isTest&&data.timeMode==='MANUAL'||data.sunlight?.verification === 'REVIEWED'));
  }
  function syncSunriseFields() {
    starts.forEach(place => { $('#sunrise-' + place.id).hidden = !input('start-' + place.id).checked; });
    $('#sunrise-empty').hidden = selectedStarts().length > 0;
  }
  function setBusy(value) {
    state.busy = value;
    form.querySelectorAll('fieldset').forEach(fieldset => { fieldset.disabled = value; });
    ['new-event', 'reload-events', 'retry-access'].forEach(id => { $('#' + id).disabled = value; });
    $('#event-list').querySelectorAll('button').forEach(button => { button.disabled = value; });
    updateState();
  }
  function updateState() {
    const record = state.record;
    $('#editor-title').textContent = record ? record.document.publicTitle || '이름 없는 행사' : '새 행사 초안';
    const active = record && state.current?.id === record.id;
    const published = Boolean(record?.publishedVersion);
    $('#event-badge').textContent = active ? '현재 공개 행사' : published ? '공개 이력 있음' : record ? '저장된 초안' : '새 초안';
    $('#event-status').textContent = state.dirty ? '저장하지 않은 변경사항이 있습니다.' : record ? '초안 버전 ' + record.revision + (published ? ' · 공개 버전 ' + record.publishedVersion : ' · 아직 공개하지 않았습니다.') : '아직 저장하지 않았습니다.';
    $('#save-event').disabled = state.busy || !state.access || state.conflict;
    $('#save-event').textContent = state.busy ? '처리 중…' : '초안 저장';
    const completeSchedule = input('eventDate').value && input('startTime').value && input('endTime').value && selectedStarts().length;
    input('reviewed').disabled = state.busy || !completeSchedule;
    $('#publish-event').disabled = state.busy || !state.access || !readyToPublish(record) || state.dirty || state.conflict;
    $('#publish-readiness').textContent = state.conflict ? '현재 입력은 보존했습니다. 목록에서 최신 초안을 다시 불러온 뒤 변경사항을 반영하세요.' : state.dirty ? '변경사항을 먼저 저장하면 공개할 수 있습니다.' : !readyToPublish(record) ? '공개 전에는 행사 제목·일정·출발지·도착지를 입력하고 시각 기준을 확인하세요.' : '공개하면 이 초안이 참가자에게 적용됩니다. 이후 편집한 내용은 다시 공개할 때 반영됩니다.';
  }
  function snapshot() {
    const values = {};
    Array.from(form.elements).forEach(control => { if (control.name) values[control.name] = control.type === 'checkbox' ? control.checked : control.value; });
    return { values, record: state.record, dirty: state.dirty, conflict: state.conflict, partialSchedule: partialSchedule() };
  }
  function rememberDraft() {
    try { sessionStorage.setItem(storageKey, JSON.stringify(snapshot())); } catch (_) { /* The form remains available if browser storage is full. */ }
  }
  function restoreDraft() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey));
      if (!saved || !saved.values || (!saved.dirty && !saved.partialSchedule)) return false;
      input('isTest').checked=saved.values.isTest===true;input('timeMode').value=saved.values.timeMode||'SOLAR';
      renderPlaces({startLocationIds:Object.entries(saved.values).filter(([key,value])=>key.startsWith('start-')&&value===true).map(([key])=>key.slice(6)),finishLocationId:saved.values.finishLocationId});
      for (const [name, value] of Object.entries(saved.values)) {
        const control = input(name);
        if (control && typeof value === (control.type === 'checkbox' ? 'boolean' : 'string')) control.type === 'checkbox' ? control.checked = value : control.value = value;
      }
      state.record = saved.record || null; state.dirty = true; state.conflict = Boolean(saved.conflict);
      syncSunriseFields(); updateState();
      notice('이전에 작성하던 초안을 복원했습니다. 저장 전 내용을 확인하세요.');
      return true;
    } catch (_) { return false; }
  }
  function renderList() {
    const list = $('#event-list'); list.replaceChildren();
    if (!state.events.length) list.append(element('p', '등록된 행사가 없습니다.', 'empty-list'));
    for (const record of state.events) {
      const button = element('button', undefined, 'event-row'); button.type = 'button';
      button.setAttribute('aria-current', String(record.id === state.record?.id));
      button.append(element('strong', record.document.publicTitle || '이름 없는 행사'), element('span', formattedDate(record.document.eventStartAt) + ' · ' + (record.id === state.current?.id ? '현재 공개' : record.publishedVersion ? '공개 이력' : '초안')));
      button.addEventListener('click', async () => {
        if (state.busy) return;
        if ((state.dirty || state.conflict) && !await confirmDialog('초안을 다시 불러올까요?', '저장하지 않은 입력은 사라집니다. 필요한 내용을 먼저 복사한 뒤 불러오세요.', '불러오기')) return;
        loadRecord(record); notice('저장된 초안을 불러왔습니다.');
      });
      list.append(button);
    }
  }
  function loadRecord(record) {
    form.reset(); state.record = record || null; state.dirty = false; state.conflict = false;
    const data=record?.document||{};
    input('isTest').checked=data.isTest===true;input('timeMode').value=data.timeMode||'SOLAR';renderPlaces(data);
    if (record) {
      ['publicTitle', 'editionLabel', 'description'].forEach(name => { input(name).value = data[name] || ''; });
      input('minimumSpotCheckins').value = String(data.minimumSpotCheckins ?? 10);
      const start = localDateTime(data.eventStartAt), end = localDateTime(data.eventEndAt);
      input('eventDate').value = start.date || end.date; input('startTime').value = start.time; input('endTime').value = end.time;
      ['applicationOpenAt','applicationCloseAt'].forEach(name=>{const v=localDateTime(data[name]);input(name).value=v.date&&v.time?v.date+'T'+v.time:'';});
      starts.forEach(place => { input('start-' + place.id).checked = (data.startLocationIds || []).includes(place.id); });
      const sunlight = data.sunlight;
      if (sunlight) {
        input('sourceUrl').value = sunlight.sourceUrl || ''; input('calculationVersion').value = sunlight.calculationVersion || '';
        input('sunsetTime').value = localDateTime(sunlight.finish?.sunsetAt).time;
        starts.forEach(place => { input('sunrise-' + place.id).value = localDateTime(sunlight.starts?.find(item => item.locationId === place.id)?.sunriseAt).time; });
        input('reviewed').checked = sunlight.verification === 'REVIEWED';
      }
    }
    syncSunriseFields(); renderList(); updateState(); rememberDraft();
  }
  async function request(method, suffix = '', body, revision) {
    if(body?.document){const {placeCatalog,catalogVersion,routingVersion,...editable}=body.document;body={...body,document:editable};}
    const headers = { 'X-SSKR-Request': '1' };
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (revision !== undefined) headers['If-Match'] = '"' + revision + '"';
    const response = await fetch('/api/backend?resource=events' + suffix, { method, headers, credentials: 'same-origin', cache: 'no-store', ...(body !== undefined ? { body: JSON.stringify(body) } : {}) });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) {
      const error = new Error(result.error?.userMessage || '서버에 연결하지 못했습니다. 입력한 내용은 유지됩니다.');
      error.status = response.status; throw error;
    }
    return result;
  }
  function showError(error) {
    let message = error.message || '서버에 연결하지 못했습니다. 입력한 내용은 유지됩니다.';
    $('#access-actions').hidden = true; $('#login-button').hidden = true;
    if (error.status === 401) {
      state.access = false; message = '운영 계정으로 로그인해 주세요. 작성 중인 내용은 유지됩니다.';
      $('#access-actions').hidden = false; $('#login-button').hidden = false;
    } else if (error.status === 403) {
      state.access = false; message = '행사 운영 권한이 있는 계정만 사용할 수 있습니다. 작성 중인 내용은 유지됩니다.';
      $('#access-actions').hidden = false;
    } else if (error.status === 412) {
      state.conflict = true; state.dirty = true;
      message = '다른 화면에서 초안이 변경되었습니다. 현재 입력은 보존했습니다. 목록 새로고침 후 최신 초안을 확인하세요.';
    } else if (!state.access) $('#access-actions').hidden = false;
    notice(message, true); rememberDraft(); updateState();
  }
  async function refreshEvents(initial = false) {
    if (state.busy) return;
    setBusy(true);
    try {
      const response = await request('GET');
      state.access = true;fieldPlaces=response.placeOptions||[]; state.events = response.events || []; state.current = response.current || null;
      $('#access-actions').hidden = true; $('#admin-workspace').hidden = false;
      renderList();
      if (initial && !restoreDraft()) loadRecord(state.events.find(record => record.id === state.current?.id) || state.events[0] || null);
      if (!initial) notice(state.conflict ? '목록을 갱신했습니다. 현재 입력은 그대로 유지됩니다. 행사 목록에서 최신 초안을 불러올 수 있습니다.' : '행사 목록을 갱신했습니다. 작성 중인 내용은 유지됩니다.');
      else if (!state.dirty) notice('초안 저장과 공개는 별도로 진행됩니다.');
    } catch (error) { showError(error); } finally { setBusy(false); }
  }
  function buildDocument() {
    if (!form.reportValidity()) return null;
    const selected = selectedStarts(), date = input('eventDate').value;
    if (date && input('startTime').value && input('endTime').value && input('endTime').value <= input('startTime').value) { notice('도착 마감 시각은 출발 가능 시각보다 늦어야 합니다.', true); input('endTime').focus(); return null; }
    const at = time => date && time ? date + 'T' + time + ':00+09:00' : null;
    let sunlight = null;
    if (input('timeMode').value==='SOLAR'&&input('reviewed').checked) {
      const missing = selected.find(place => !input('sunrise-' + place.id).value);
      if (missing || !input('sunsetTime').value || !input('sourceUrl').value.trim()) {
        notice('검토 완료로 저장하려면 선택한 출발지의 일출, 도착지의 일몰, 자료 주소를 모두 입력하세요.', true);
        input(missing ? 'sunrise-' + missing.id : !input('sunsetTime').value ? 'sunsetTime' : 'sourceUrl').focus(); return null;
      }
      let url;
      try { url = new URL(input('sourceUrl').value.trim()); } catch (_) { /* Shown below. */ }
      if (!url || url.protocol !== 'https:' || url.username || url.password) { notice('검토 자료 주소는 계정 정보가 없는 https 주소를 입력하세요.', true); input('sourceUrl').focus(); return null; }
      sunlight = { date, timezone: 'Asia/Seoul', verification: 'REVIEWED', sourceUrl: url.href, calculationVersion: input('calculationVersion').value.trim() || 'manual-review', starts: selected.map(place => ({ locationId: place.id, lat: place.lat, lng: place.lng, sunriseAt: at(input('sunrise-' + place.id).value) })), finish: { locationId: finish.id, lat: finish.lat, lng: finish.lng, sunsetAt: at(input('sunsetTime').value) } };
    }
    return { ...state.record?.document, publicTitle: input('publicTitle').value.trim(), editionLabel: input('editionLabel').value.trim(), description: input('description').value.trim(), timezone: 'Asia/Seoul', eventStartAt: at(input('startTime').value), eventEndAt: at(input('endTime').value), applicationOpenAt:input('applicationOpenAt').value?input('applicationOpenAt').value+':00+09:00':null,applicationCloseAt:input('applicationCloseAt').value?input('applicationCloseAt').value+':00+09:00':null,minimumSpotCheckins: Number(input('minimumSpotCheckins').value), startLocationIds: selected.map(place => place.id), finishLocationId: input('finishLocationId').value, sunlight,isTest:input('isTest').checked,timeMode:input('timeMode').value };
  }
  async function saveEvent(event) {
    event.preventDefault();
    if (state.busy || !state.access || state.conflict) return;
    const data = buildDocument(); if (!data) return;
    setBusy(true);
    try {
      const current = state.record;
      const response = await request(current ? 'PUT' : 'POST', current ? '&id=' + encodeURIComponent(current.id) : '', { document: data }, current?.revision);
      const saved = { ...current, ...response, document: response.document || data };
      state.events = [saved, ...state.events.filter(record => record.id !== saved.id)];
      state.record = saved; state.dirty = false; state.conflict = false;
      input('reviewed').checked = saved.document.sunlight?.verification === 'REVIEWED';
      ['applicationOpenAt','applicationCloseAt'].forEach(name=>{const value=localDateTime(saved.document[name]);input(name).value=value.date&&value.time?value.date+'T'+value.time:'';});
      renderList(); updateState(); rememberDraft();
      notice(partialSchedule() ? '초안을 저장했습니다. 날짜·시각을 모두 입력하지 않은 일정은 이 브라우저에만 보관했습니다.' : '초안을 저장했습니다. 공개 전까지 참가자 화면에는 반영되지 않습니다.');
    } catch (error) { showError(error); } finally { setBusy(false); }
  }
  function confirmDialog(title, description, action) {
    const dialog = $('#admin-dialog');
    $('#dialog-title').textContent = title; $('#dialog-description').textContent = description; $('#dialog-confirm').textContent = action;
    return new Promise(resolve => {
      let finished = false;
      const finishDialog = value => { if (finished) return; finished = true; dialog.close(); cleanup(); resolve(value); };
      const yes = () => finishDialog(true), no = () => finishDialog(false), cancel = event => { event.preventDefault(); no(); };
      function cleanup() { $('#dialog-confirm').removeEventListener('click', yes); $('#dialog-cancel').removeEventListener('click', no); dialog.removeEventListener('cancel', cancel); }
      $('#dialog-confirm').addEventListener('click', yes); $('#dialog-cancel').addEventListener('click', no); dialog.addEventListener('cancel', cancel);
      dialog.showModal(); $('#dialog-cancel').focus();
    });
  }
  async function publishEvent() {
    if (state.busy || !state.access || state.dirty || state.conflict || !readyToPublish(state.record)) return;
    const record = state.record;
    if (!await confirmDialog('이 행사를 공개할까요?', record.document.publicTitle + '\n행사 안내와 루트 일정에 이 설정이 적용됩니다. 현재 공개 중인 행사가 있다면 이 행사로 바뀝니다.', '공개하기')) return;
    setBusy(true);
    try {
      const response = await request('POST', '&id=' + encodeURIComponent(record.id) + '&action=publish', {}, record.revision);
      state.current = { id: record.id, configVersion: response.publishedVersion };
      const saved = { ...record, ...response };
      state.events = state.events.map(item => item.id === saved.id ? saved : item); loadRecord(saved);
      notice('행사를 공개했습니다. 공개 버전 ' + response.publishedVersion + ' 설정이 참가자 화면에 적용됩니다.');
    } catch (error) { showError(error); } finally { setBusy(false); }
  }
  async function login() {
    rememberDraft(); $('#login-button').disabled = true;
    try {
      const response = await fetch('/api/backend?resource=login', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-SSKR-Request': '1' }, credentials: 'same-origin', body: JSON.stringify({ returnTo: '/app/admin' }) });
      const result = await response.json();
      if (!response.ok || !result.url) throw new Error(result.error?.userMessage || '로그인을 시작하지 못했습니다. 잠시 후 다시 시도해 주세요.');
      const target = new URL(result.url, location.origin);
      if (target.protocol !== 'https:' && target.origin !== location.origin) throw new Error('로그인 주소를 확인하지 못했습니다.');
      location.assign(target.href);
    } catch (error) { notice(error.message, true); $('#login-button').disabled = false; }
  }
  function renderPlaces(data={}) {
    const testing=input('isTest').checked;
    input('timeMode').disabled=!testing;
    if(!testing){input('timeMode').value='SOLAR';}
    const group=testing;
    starts=[...catalog.filter(p=>p.kind==='start'),...(group?fieldPlaces.filter(p=>p.startEligible):[])];
    const finishes=[...catalog.filter(p=>p.kind==='finish'),...(group?fieldPlaces.filter(p=>p.kind==='spot'):[])];
    $('#start-locations').replaceChildren();$('#sunrise-fields').replaceChildren();
    for(const place of starts){
      const label=element('label',undefined,'start-option'),checkbox=element('input');checkbox.type='checkbox';checkbox.name='start-'+place.id;checkbox.checked=(data.startLocationIds||[]).includes(place.id);
      const name=element('span');name.append(element('strong',place.startName||place.name),element('small',place.region||''));label.append(checkbox,name);$('#start-locations').append(label);
      const sunriseLabel=element('label',place.name+' 일출','field');sunriseLabel.id='sunrise-'+place.id;const time=element('input');time.type='time';time.name='sunrise-'+place.id;time.step='60';sunriseLabel.append(time);$('#sunrise-fields').append(sunriseLabel);
    }
    input('finishLocationId').replaceChildren(...finishes.map(p=>{const o=element('option',p.name);o.value=p.id;return o;}));
    if(finishes.some(p=>p.id===data.finishLocationId))input('finishLocationId').value=data.finishLocationId;
    finish=finishes.find(p=>p.id===input('finishLocationId').value);
    $('#sunlight-section').hidden=input('timeMode').value==='MANUAL';syncSunriseFields();
  }
  renderPlaces();
  form.addEventListener('input', event => {
    if (state.busy) return;
    state.dirty = true;
    if(event.target.name==='isTest'){const before={startLocationIds:selectedStarts().map(p=>p.id),finishLocationId:input('finishLocationId').value};if(input('isTest').checked)input('timeMode').value='MANUAL';renderPlaces(before);}
    if(event.target.name==='timeMode')$('#sunlight-section').hidden=input('timeMode').value==='MANUAL';
    if(event.target.name==='finishLocationId')finish=[...fieldPlaces,...catalog].find(p=>p.id===input('finishLocationId').value);
    if (['eventDate', 'startTime', 'endTime', 'sourceUrl', 'calculationVersion', 'sunsetTime'].includes(event.target.name) || event.target.name.startsWith('start-') || event.target.name.startsWith('sunrise-')) input('reviewed').checked = false;
    syncSunriseFields(); updateState(); rememberDraft();
  });
  form.addEventListener('submit', saveEvent);
  $('#publish-event').addEventListener('click', publishEvent);
  $('#reload-events').addEventListener('click', () => refreshEvents());
  $('#retry-access').addEventListener('click', () => refreshEvents($('#admin-workspace').hidden));
  $('#login-button').addEventListener('click', login);
  $('#new-event').addEventListener('click', async () => {
    if (state.busy) return;
    if (state.dirty && !await confirmDialog('새 행사 초안을 만들까요?', '저장하지 않은 입력은 사라집니다. 필요한 내용을 먼저 저장해 주세요.', '새 초안 만들기')) return;
    loadRecord(null); notice('실제 행사 정보를 입력해 주세요. 공개할 때까지 초안으로 보관됩니다.'); input('publicTitle').focus();
  });
  const authError = new URL(location.href).searchParams.get('authError');
  if (authError) { const url = new URL(location.href); url.searchParams.delete('authError'); history.replaceState(null, '', url); }
  refreshEvents(true);
})();
