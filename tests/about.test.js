const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'web/about/index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'web/about/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web/about/styles.css'),'utf8');
test('About includes eight titled scenes and all ten supplied illustrations',()=>{
  const ids=[...html.matchAll(/<section[^>]+id="(chapter-\d+)"/g)].map(m=>m[1]);
  assert.equal(ids.length,8);assert.equal(new Set(ids).size,8);
  const images=[...html.matchAll(/<img[^>]+src="([^"]+)"/g)].map(m=>m[1]);
  assert.equal(images.length,10);assert.equal(new Set(images).size,10);
  for(let n=1;n<=10;n++){
    const name='SSKR_info'+String(n).padStart(2,'0');
    assert.ok(images.includes('/about/assets/'+name+'.webp'));
    assert.ok(fs.existsSync(path.join(root,'web/about/assets/'+name+'.png')));
    assert.ok(fs.statSync(path.join(root,'web/about/assets/'+name+'.webp')).size<500000);
  }
  assert.doesNotMatch(html,/\/shared\/assets\/editorial\//);
});
test('About preserves preparation, noncompetitive principle, benefits and memorial story',()=>{
  for(const text of ['출발지','주유','휴식','주최 측이 지정한 경로는 없습니다','순위를 매기지 않으므로','완주','메모리얼'])assert.ok(html.includes(text),text);
  for(const url of ['/','/explore/','/participate/','/app/memorials'])assert.ok(html.includes('href="'+url+'"'));
});
test('Motion script parses, keeps native scroll and provides reading/accessibility fallbacks',()=>{
  assert.doesNotThrow(()=>new vm.Script(js));
  for(const text of ['prefers-reduced-motion','userReading','visibilitychange','aria-hidden','scene.inert','requestAnimationFrame'])assert.ok(js.includes(text),text);
  assert.doesNotMatch(js,/addEventListener\(['"](?:wheel|touchmove)['"]/);
  assert.ok(css.includes('html:not(.is-cinematic)'));
  assert.ok(css.includes('height:auto;aspect-ratio:1.6'));
});
