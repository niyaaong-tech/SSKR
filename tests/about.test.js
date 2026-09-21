const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'web/about/index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'web/about/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web/about/styles.css'),'utf8');
test('About keeps eight scenes and all requested background and inset assets',()=>{
  const ids=[...html.matchAll(/<section[^>]+id="(chapter-\d+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,8);assert.equal(new Set(ids).size,8);
  const images=[...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(images.length,15);
  for(const url of images){assert.ok(fs.existsSync(path.join(root,'web'+url)),url);}
  for(const name of ['SSKR_info02.webp','SSKR_info11.webp','sskr_sp1.webp','sskr_sp2.webp','sskr_sp3.webp','sskr_memorial.webp','SSKR_info12.webp','SSKR_info13.webp','SSKR_info14.webp','sskr_web1.webp'])assert.ok(images.includes('/about/assets/'+name),name);
  assert.doesNotMatch(html,/class="eyebrow"|신청 방법 알아보기|신청 후에는 매니저에서 준비 상태를 확인하세요/);
  assert.doesNotMatch(html,/<img[^>]+src="[^"]+\.png"|class="reading-controls"/);
  assert.equal((html.match(/data-preview="[123]"/g)||[]).length,3);
});
test('About preserves preparation, noncompetitive principle, benefits and memorial story',()=>{
  for(const text of ['출발지','주유','휴식','주최 측이 지정한 경로는 없습니다','순위를 매기지 않으므로','메모리얼'])assert.ok(html.includes(text),text);
  assert.equal((html.match(/<blockquote /g)||[]).length,9);
  assert.equal((html.match(/<ul class="feature-summary">/g)||[]).length,4);
  for(const url of ['/','/explore/','/participate/','/app/spots','/app/memorials'])assert.ok(html.includes('href="'+url+'"'));
});
test('Motion script parses, keeps native scroll and provides reading/accessibility fallbacks',()=>{
  assert.doesNotThrow(()=>new vm.Script(js));
  for(const text of ['prefers-reduced-motion','visibilitychange','aria-hidden','scene.inert','requestAnimationFrame'])assert.ok(js.includes(text),text);
  assert.doesNotMatch(js,/addEventListener\(['"](?:wheel|touchmove)['"]/);
  assert.ok(css.includes('html:not(.is-cinematic)'));
  assert.ok(css.includes('height:auto;aspect-ratio:1.6'));
});
