const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'web/about/index.html'),'utf8');
const js=fs.readFileSync(path.join(root,'web/about/app.js'),'utf8');
const css=fs.readFileSync(path.join(root,'web/about/styles.css'),'utf8');
test('About keeps eight reachable chapters with unique headings and existing image assets',()=>{
 const ids=[...html.matchAll(/<section[^>]+id="(chapter-\d+)"[^>]+aria-labelledby="([^"]+)"/g)];assert.equal(ids.length,8);assert.equal(new Set(ids.map(x=>x[1])).size,8);
 for(const [,id,title] of ids){assert.ok(html.includes('href="#'+id+'"'));assert.ok(html.includes('id="'+title+'"'));}
 for(const [,url] of html.matchAll(/<img[^>]+src="([^"]+)"/g)){if(url.startsWith('https:'))continue;const file=path.join(root,url.startsWith('/about/')?'web'+url:url);assert.ok(fs.existsSync(file),file);assert.ok(fs.statSync(file).size<500000,url);}
});
test('Experience links lead directly to working service routes and use actual page previews',()=>{
 const entries=[...html.matchAll(/<a class="experience-link" href="([^"]+)">([\s\S]*?)<\/a>/g)];assert.equal(entries.length,4);
 assert.deepEqual(entries.map(x=>x[1]),['/participate/','/app/spots/jikjisa','/app/spots','/app/memorials/memorial-sskr-2026-may-001']);
 for(const [,url,body] of entries){assert.match(body,/preview-[a-z]+\.webp/);assert.doesNotMatch(url,/scenario=|javascript:/);}
});
test('Motion enhances native scrolling without hiding content from keyboard or reduced-motion readers',()=>{
 assert.doesNotThrow(()=>new vm.Script(js));assert.match(js,/prefers-reduced-motion/);assert.match(js,/aria-current/);assert.match(js,/aria-pressed/);assert.doesNotMatch(js,/addEventListener\(['"](?:wheel|touchmove)['"]|\.inert\s*=/);assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);assert.match(css,/\.skip-link:focus-visible/);
});
