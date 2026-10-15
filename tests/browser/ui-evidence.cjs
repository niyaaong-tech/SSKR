// Evidence storage only. Browser execution stays in the existing map/route suites.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const root=fs.realpathSync(path.resolve(__dirname,'../..'));
const hash=value=>crypto.createHash('sha256').update(value).digest('hex');
function canonical(target){
 let current=path.resolve(target),suffix=[];
 while(!fs.existsSync(current)){const parent=path.dirname(current);if(parent===current)throw Error('Cannot resolve QA output path');suffix.unshift(path.basename(current));current=parent;}
 return path.join(fs.realpathSync(current),...suffix);
}
function isInside(parent,child){const relative=path.relative(parent,child);return relative===''||(!relative.startsWith('..'+path.sep)&&relative!=='..'&&!path.isAbsolute(relative));}
function repositoryAncestor(target){for(let current=target;;current=path.dirname(current)){if(fs.existsSync(path.join(current,'.git')))return current;if(path.dirname(current)===current)return null;}}
function output(directory=process.env.SSKR_QA_OUTPUT){
 if(!directory)throw Error('Set SSKR_QA_OUTPUT to a task directory outside the repository');
 const resolved=canonical(directory);if(isInside(root,resolved)||repositoryAncestor(resolved))throw Error('QA output must be outside the repository, including junction targets');
 fs.mkdirSync(resolved,{recursive:true});const real=fs.realpathSync(resolved);if(isInside(root,real)||repositoryAncestor(real))throw Error('QA output resolves inside a repository');return real;
}
function git(args,raw=false){const result=spawnSync('git',args,{cwd:root,encoding:'utf8',windowsHide:true});if(result.status!==0)throw Error('Cannot identify source checkout: '+(result.stderr||result.error?.message||args.join(' ')));return raw?result.stdout:result.stdout.trim();}
function source(){
 const entries=git(['status','--porcelain=v1','--untracked-files=all','-z'],true).split('\0').filter(Boolean),dirtyFiles=[];
 for(let i=0;i<entries.length;i++){const entry=entries[i],status=entry.slice(0,2),name=entry.slice(3);if(/[RC]/.test(status))i++;const file=path.join(root,name);dirtyFiles.push({status,path:name,sha256:fs.existsSync(file)&&fs.statSync(file).isFile()?hash(fs.readFileSync(file)):null});}
 return {sourceRoot:root,branch:git(['branch','--show-current']),head:git(['rev-parse','HEAD']),dirtyFiles};
}
function parseTap(stdout){
 const tests=[...stdout.matchAll(/^(not ok|ok)\s+\d+\s+-\s+(.+)$/gm)].map(([,result,text])=>{const [name,...directives]=text.split(/\s+#\s+/);return {name:name.trim(),passed:result==='ok',skipped:directives.some(d=>/^(SKIP|TODO)\b/i.test(d)),fileStub:/\.test\.[cm]?js$/.test(name.trim())};}).filter(t=>!t.fileStub);
 const actual=tests.filter(t=>!t.skipped);return {selectedTests:tests.map(t=>t.name),executedTests:actual.length,passedTests:actual.filter(t=>t.passed).length,failedTests:actual.filter(t=>!t.passed).length,skippedTests:tests.filter(t=>t.skipped).length};
}
function report(dir=output()){
 const file=path.join(dir,'report.json');return fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{schemaVersion:2,scenario:'waypoint-rows',phases:{},relatedChecks:[],functionalLayout:{status:'pending'},visualReview:{status:'pending',observations:[]},copyReview:{status:'pending',observations:[]},userApproval:{status:'pending'}};
}
function metrics(dir=output()){
 const found=[];function visit(folder){for(const entry of fs.readdirSync(folder,{withFileTypes:true})){const file=path.join(folder,entry.name);if(entry.isDirectory())visit(file);else if(entry.name.endsWith('.metrics.json'))found.push(path.relative(dir,file).split(path.sep).join('/'));}}visit(dir);return found.sort();
}
function functionalStatus(data){
 const latest=new Map();for(const entry of data.relatedChecks||[])latest.set(entry.engine+'\0'+entry.command,entry.status);
 const phase=data.phases?.after||data.phases?.before,statuses=[...latest.values()];if(phase)statuses.push(phase.functionalLayout?.status||'pending');
 return statuses.includes('failed')?'failed':statuses.length&&statuses.every(status=>status==='passed')?'passed':'pending';
}function write(data,dir=output()){
 data.functionalLayout={status:functionalStatus(data)};
 data.metricFiles=metrics(dir);fs.writeFileSync(path.join(dir,'report.json'),JSON.stringify(data,null,2)+'\n');
 const lines=['# SSKR UI evidence','',`Scenario: ${data.scenario}`,`Functional/layout: ${data.functionalLayout?.status||'pending'}; visual: ${data.visualReview.status}; copy: ${data.copyReview.status}; user approval: ${data.userApproval.status}`,'','## Source','',`Root: ${data.source?.sourceRoot||root}`,`Branch: ${data.source?.branch||'pending'}`,`HEAD: ${data.source?.head||'pending'}`,`Dirty files: ${JSON.stringify(data.source?.dirtyFiles||[])}`,'','## Functional/layout evidence',''];
 function check(entry){lines.push(`- ${entry.status||'pending'}; engine ${entry.engine||'pending'}; executed ${entry.executedTests??0}; passed ${entry.passedTests??0}; skipped ${entry.skippedTests??0}`,`- Command: ${entry.command||'pending'}`,`- Tests: ${(entry.selectedTests||[]).join('; ')||'none'}`,`- Log: ${entry.log||'none'}`,`- Process: wrapper ${entry.wrapperPid||'unknown'}, child ${entry.pid||'unknown'}; ${entry.startedAt||'unknown'} → ${entry.finishedAt||'unknown'}`);}
 for(const [phase,entry] of Object.entries(data.phases)){lines.push(`### ${phase}`,'');if(entry.geometry){lines.push('Geometry gate:');check(entry.geometry);}check(entry.functionalLayout||{});for(const c of entry.captures||[])lines.push(`- [${c.name}](${c.file}) · [${c.panelCaptureKind==='full-page'?'full page':'panel'}](${c.panelFile}) · [text](${c.textFile}): ${c.conditions.viewport.width}×${c.conditions.viewport.height}; context ${JSON.stringify(c.conditions.context)}; scroll ${JSON.stringify(c.conditions.scroll)}; fixture ${c.conditions.fixtureHash}`);lines.push('');}
 lines.push('## Related checks','');for(const entry of data.relatedChecks)check(entry);
 lines.push('','## Geometry metrics','');for(const file of data.metricFiles)lines.push(`- [${file}](${file})`);
 lines.push('','## Review observations','');for(const key of ['visualReview','copyReview'])for(const item of data[key].observations)lines.push(`- ${key}: ${item}`);
 lines.push('','Generated captures and passing tests do not establish visual, copy, or user approval. Compare the PNGs and text snapshots and record concrete observations.');fs.writeFileSync(path.join(dir,'report.md'),lines.join('\n')+'\n');
}
async function capture(p,name,providerFixture,fixture){
 const phase=process.env.SSKR_QA_PHASE;if(!['before','after'].includes(phase))throw Error('SSKR_QA_PHASE must be before or after');if(!/^[a-zA-Z0-9_-]+$/.test(name))throw Error('Evidence name must be a simple filename');
 const dir=output(),data=report(dir),phaseDir=path.join(dir,phase);fs.mkdirSync(phaseDir,{recursive:true});
 const context=await p.evaluate(()=>({locale:navigator.language,userAgent:navigator.userAgent,timezone:Intl.DateTimeFormat().resolvedOptions().timeZone,deviceScaleFactor:devicePixelRatio,touch:navigator.maxTouchPoints>0,pointer:matchMedia('(pointer: coarse)').matches?'coarse':'fine',hover:matchMedia('(hover: hover)').matches,reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches,colorScheme:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light',screen:{width:screen.width,height:screen.height}}));
 const scroll=await p.evaluate(()=>({window:[scrollX,scrollY],panels:Object.fromEntries(['.rp-route-pane .rp-scroll','.rp-route-selected','.rp-discovery-pane .rp-scroll'].map(selector=>{const e=document.querySelector(selector);return [selector,e?[e.scrollLeft,e.scrollTop]:null];}))}));
 const panelCaptureKind=await p.locator('.spot-planning-area.is-mobile-editor').count()?'full-page':'planning-area';
 const conditions={sourceRoot:root,panelCaptureKind,viewport:p.viewportSize(),context,tab:await p.locator('[role=tab][aria-selected=true]').evaluateAll(tabs=>tabs.map(tab=>({id:tab.id,category:tab.dataset.category||null}))),path:new URL(p.url()).pathname+new URL(p.url()).search,providerHash:hash(providerFixture),fixture,fixtureHash:hash(JSON.stringify(fixture)),scroll,browser:p.context().browser().version(),engine:process.env.BROWSER_ENGINE||'chromium',channel:process.env.BROWSER_ENGINE==='webkit'?'webkit':process.env.BROWSER_CHANNEL||(process.platform==='win32'?'msedge':'chromium')};
 conditions.mapView=await p.evaluate(()=>window.__map?{center:[__map.getCenter().lat,__map.getCenter().lng].map(n=>Number(n.toFixed(6))),zoom:__map.getZoom()}:null);
 const baseline=data.phases.before?.captures?.find(c=>c.name===name);if(phase==='after'&&(!baseline||JSON.stringify(baseline.conditions)!==JSON.stringify(conditions)))throw Error('Before/after conditions differ or baseline missing: '+name);
 const file=path.join(phaseDir,name+'.png'),panelFile=path.join(phaseDir,name+'-panel.png'),textFile=path.join(phaseDir,name+'.text.json');if([file,panelFile,textFile].some(f=>fs.existsSync(f)))throw Error('Evidence already exists; use a fresh SSKR_QA_OUTPUT directory');
 try{
  await p.screenshot({path:file,animations:'disabled',fullPage:false});
  if(panelCaptureKind==='full-page')await p.screenshot({path:panelFile,animations:'disabled',fullPage:true});
  else{const panel=p.locator('.spot-planning-area');if(!await panel.count())throw Error('Current planning panel is missing');await panel.screenshot({path:panelFile,animations:'disabled'});}
  const snapshot=await p.locator('.rp-waypoint').evaluateAll(rows=>rows.map(row=>({id:row.dataset.waypoint,text:row.innerText,labels:[...row.querySelectorAll('button')].map(b=>b.getAttribute('aria-label'))})));fs.writeFileSync(textFile,JSON.stringify(snapshot,null,2)+'\n');
 }finally{
  const restored=await p.evaluate(async saved=>{
   for(const [selector,position] of Object.entries(saved.panels)){const element=document.querySelector(selector);if(element&&position){element.scrollLeft=position[0];element.scrollTop=position[1];}}
   scrollTo(saved.window[0],saved.window[1]);await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
   return {window:[scrollX,scrollY],panels:Object.fromEntries(Object.keys(saved.panels).map(selector=>{const element=document.querySelector(selector);return [selector,element?[element.scrollLeft,element.scrollTop]:null];}))};
  },scroll);
  if(JSON.stringify(restored)!==JSON.stringify(scroll)||JSON.stringify(p.viewportSize())!==JSON.stringify(conditions.viewport))throw Error('Evidence capture changed scroll or viewport conditions');
 }
 data.phases[phase]??={captures:[]};data.phases[phase].captures.push({name,panelCaptureKind,file:path.relative(dir,file).split(path.sep).join('/'),panelFile:path.relative(dir,panelFile).split(path.sep).join('/'),textFile:path.relative(dir,textFile).split(path.sep).join('/'),conditions,source:source(),sha256:hash(fs.readFileSync(file))});write(data,dir);
}
module.exports={root,canonical,isInside,output,source,parseTap,report,functionalStatus,write,capture};
