const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),{spawnSync}=require('node:child_process');
const evidence=require('../browser/ui-evidence.cjs'),runner=require('../../tools/ui-qa.cjs');
test('UI QA TAP parser rejects empty matches, file stubs, and skipped-only output',()=>{
 for(const text of ['', 'TAP version 13\nok 1 - tests/browser/map.test.js\n# pass 1\n','ok 1 - UI geometry: mobile controls # SKIP disabled\nok 2 - UI geometry: desktop # TODO later\n'])assert.equal(evidence.parseTap(text).executedTests,0);
 const parsed=evidence.parseTap('# Subtest: UI geometry: marker centers\nok 1 - UI geometry: marker centers\nnot ok 2 - UI geometry: native input\nok 3 - UI geometry: optional # SKIP\n');assert.equal(parsed.executedTests,2);assert.equal(parsed.passedTests,1);assert.equal(parsed.failedTests,1);assert.equal(parsed.skippedTests,1);assert.deepEqual(parsed.selectedTests,['UI geometry: marker centers','UI geometry: native input','UI geometry: optional']);
});
test('UI QA CLI validates engine, source checkout, viewports and unique options before launching',()=>{
 assert.deepEqual(runner.options(['--engine=webkit','--viewports=390x844']),{engine:'webkit',viewports:'390x844'});assert.throws(()=>runner.options(['--engine=webkit','--engine=chromium']),/Duplicate/);assert.throws(()=>runner.options(['--viewports']),/Unknown/);for(const value of ['390x844,390x844','100x100','390x844,'])assert.throws(()=>runner.viewports(value),/Invalid/);
 for(const args of [['geometry','--engine=firefox'],['geometry','--source='+os.tmpdir()],['geometry','--viewports=390x844'],['check','--pattern=UI geometry','--viewports=390x844'],['before','--pattern=ignored'],['geometry','--input=ignored.json']]){const result=spawnSync(process.execPath,[path.join(evidence.root,'tools/ui-qa.cjs'),...args],{encoding:'utf8',windowsHide:true});assert.equal(result.status,1);assert.match(result.stderr,/Engine must|own checkout|only supported by before\/after|not supported by/);}
});
test('UI QA output cannot resolve through a junction into the source repository',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sskr-ui-qa-path-'));try{assert.throws(()=>evidence.output(path.join(evidence.root,'qa-output')),/outside/);const link=path.join(temp,'source-link');fs.symlinkSync(evidence.root,link,process.platform==='win32'?'junction':'dir');assert.throws(()=>evidence.output(path.join(link,'qa-output')),/outside/);const otherRepo=path.join(temp,'other-checkout');fs.mkdirSync(otherRepo);fs.writeFileSync(path.join(otherRepo,'.git'),'gitdir: elsewhere');assert.throws(()=>evidence.output(path.join(otherRepo,'qa-output')),/outside/);assert.equal(evidence.output(path.join(temp,'allowed')),fs.realpathSync(path.join(temp,'allowed')));}finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('UI QA review cannot substitute screenshots or geometry for visual, copy or user approval',()=>{
 const data={phases:{}};assert.throws(()=>runner.validateReview(data),/Complete|related/);for(const phase of ['before','after'])data.phases[phase]={requestedViewports:'390x844',captures:[{}],capture:{status:'passed'},functionalLayout:{status:'passed'},geometry:{status:'passed'}};assert.doesNotThrow(()=>runner.validateReview(data));data.phases.after.geometry.status='pending';assert.throws(()=>runner.validateReview(data),/Complete|related/);
});

test('UI QA preserves a failing before baseline and still requires passing after geometry',()=>{
 const capture={status:'passed',executedTests:1},failedGeometry={status:'failed'},passedGeometry={status:'passed'};
 const before={requestedViewports:'390x844',engine:'chromium',captures:[{}],capture,geometry:failedGeometry,functionalLayout:runner.phaseOutcome(failedGeometry,capture)};
 assert.equal(before.functionalLayout.status,'failed');assert.equal(before.functionalLayout.captureStatus,'passed');assert.equal(runner.capturesComplete(before),true);
 const data={phases:{before}};assert.doesNotThrow(()=>runner.validateAfter(data,'390x844','chromium'));assert.throws(()=>runner.validateAfter(data,'360x780','chromium'),/same viewport/);assert.throws(()=>runner.validateAfter(data,'390x844','webkit'),/same viewport/);
 data.phases.after={...before,geometry:passedGeometry,functionalLayout:runner.phaseOutcome(passedGeometry,capture)};assert.doesNotThrow(()=>runner.validateReview(data));
 data.phases.after.geometry=failedGeometry;data.phases.after.functionalLayout=runner.phaseOutcome(failedGeometry,capture);assert.equal(data.phases.after.functionalLayout.status,'failed');assert.throws(()=>runner.validateReview(data),/passing after|related/);
});
test('UI QA cannot hide an unrelated failed check with a later pass',()=>{
 const data={phases:{},relatedChecks:[{engine:'chromium',command:'check A',status:'failed'},{engine:'chromium',command:'check B',status:'passed'}]};assert.equal(evidence.functionalStatus(data),'failed');assert.throws(()=>runner.validateReview(data),/related checks/);
 data.relatedChecks.push({engine:'chromium',command:'check A',status:'passed'});assert.equal(evidence.functionalStatus(data),'passed');
 data.phases.before={functionalLayout:{status:'failed'}};assert.equal(evidence.functionalStatus(data),'failed');data.phases.after={functionalLayout:{status:'passed'}};assert.equal(evidence.functionalStatus(data),'passed');
 data.phases.after.functionalLayout.status='failed';assert.equal(evidence.functionalStatus(data),'failed');
});