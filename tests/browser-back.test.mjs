import assert from 'node:assert/strict';
import {installGameHistory} from '../app/use-browser-back.ts';

const marker='handoverNavigation';
const view=(screen,extra={})=>({screen,line:'현재 대사',prologue:0,preview:null,contact:null,restartPrompt:false,raffleInvitation:false,review:false,...extra});

// Traverse asynchronously, as browsers do. Reject pushes from popstate: Chromium
// marks those entries skippable even though a plain History API mock accepts them.
function fakeBrowser(initialState={}){
 const entries=[{url:'https://example.test/',state:{outside:true}},{url:'https://game.test/',state:structuredClone(initialState)}];
 let index=1,inPop=false,pushes=0,afterPop=()=>{};
 const listeners=new Set(),pending=[];
 const history={
  get state(){return entries[index].state;},get length(){return entries.length;},
  replaceState(state){entries[index]={...entries[index],state:structuredClone(state)};},
  pushState(state){assert.equal(inPop,false,'never push from popstate (Chromium skips these entries)');entries.splice(index+1);entries.push({url:entries[index].url,state:structuredClone(state)});index++;pushes++;},
  go(delta){pending.push(delta);},back(){pending.push(-1);},forward(){pending.push(1);}
 };
 const host={history,addEventListener:(type,fn)=>{assert.equal(type,'popstate');listeners.add(fn);},removeEventListener:(type,fn)=>{assert.equal(type,'popstate');listeners.delete(fn);}};
 return {host,entries,get index(){return index;},get pushes(){return pushes;},get listenerCount(){return listeners.size;},setAfterPop(fn){afterPop=fn;},flush(){
  let turns=0;
  while(pending.length){
   assert.ok(++turns<30,'navigation must not loop');
   const delta=pending.shift(),target=index+delta;
   if(!delta||target<0||target>=entries.length)continue;
   index=target;inPop=true;
   try{for(const fn of [...listeners])fn({state:history.state});}finally{inPop=false;}
   afterPop();
  }
 },back(){history.back();this.flush();},forward(){history.forward();this.flush();}};
}
function game(browser=fakeBrowser(),initial=view('intro'),initialEpoch='run:explore'){
 let current=initial,epoch=initialEpoch,busy=false,needsCommit=false;
 const restored=[];
 const controller=installGameHistory(browser.host,current,epoch,next=>{current=next;restored.push(next);needsCommit=true;},()=>busy);
 browser.setAfterPop(()=>{if(needsCommit){needsCommit=false;controller.sync(current,epoch);}});
 return {browser,controller,restored,get current(){return current;},setBusy(value){busy=value;},navigate(next,nextEpoch=epoch){current=next;epoch=nextEpoch;controller.sync(current,epoch);browser.flush();},dispose(){controller.dispose();}};
}

{
 const router={__NA:true,__vinext_scrollY:210,tree:['',{}],custom:{keep:'unchanged'}};
 const app=game(fakeBrowser(router));
 for(const screen of ['desktop','folders','fire-folder','draft'])app.navigate(view(screen));
 assert.equal(app.browser.host.history.length,6);
 const pushes=app.browser.pushes;
 for(const expected of ['fire-folder','folders','desktop','intro']){app.browser.back();assert.equal(app.current.screen,expected);}
 assert.equal(app.browser.index,1);assert.equal(app.browser.pushes,pushes);
 app.browser.forward();assert.equal(app.current.screen,'desktop');
 app.browser.forward();assert.equal(app.current.screen,'folders');
 assert.equal(app.browser.pushes,pushes,'Back and Forward only consume existing entries');
 for(const entry of app.browser.entries.slice(1)){for(const [key,value] of Object.entries(router))assert.deepEqual(entry.state[key],value);}
 app.navigate(view('intro'));assert.equal(app.browser.index,1);
 app.browser.back();assert.equal(app.browser.index,0,'one Back from title leaves the Site');
 app.dispose();assert.equal(app.browser.listenerCount,0);
 console.log('PASS finite Back/Forward, router metadata, and manual title exit');
}

{
 const app=game();for(const screen of ['desktop','registry','result'])app.navigate(view(screen));
 const pushes=app.browser.pushes;
 app.navigate(view('registry',{line:'검색어와 결과는 별도 상태에 유지됨'}));
 assert.equal(app.browser.index,3);assert.equal(app.browser.pushes,pushes,'in-game list button consumes its prior entry');
 app.browser.back();assert.equal(app.current.screen,'desktop','Back after list must not reopen the document');
 app.navigate(view('folders'));assert.equal(app.browser.entries.at(-1).state[marker].view.screen,'folders');
 app.browser.forward();assert.equal(app.current.screen,'folders','new navigation truncates the old forward branch');
 app.dispose();console.log('PASS in-game parent matching and new branches');
}

{
 const cases=[['draft',['fire-folder','folders','desktop','intro']],['result',['registry','desktop','intro']],['fire-plan',['safety-folder','folders','desktop','intro']],['route',['drawing-sub','drawing-folder','folders','desktop','intro']]];
 for(const [screen,parents] of cases){const app=game();app.navigate(view(screen));for(const parent of parents){app.browser.back();assert.equal(app.current.screen,parent,screen);}app.dispose();}
 const app=game();const preview={name:'검토파일.hwp',from:'safety-folder'};
 app.navigate(view('file-preview',{preview}));assert.deepEqual(app.current.preview,preview);
 app.browser.back();assert.equal(app.current.screen,'safety-folder');
 app.browser.forward();assert.deepEqual(app.current.preview,preview,'file view keeps its own document identity');
 app.dispose();console.log('PASS resumed documents seed finite parent paths');
}

{
 const app=game();app.navigate(view('prologue',{prologue:2}));
 for(const step of [1,0]){app.browser.back();assert.equal(app.current.screen,'prologue');assert.equal(app.current.prologue,step);}
 app.browser.back();assert.equal(app.current.screen,'intro');app.dispose();
 const modal=game();modal.navigate(view('result',{contact:'msg'}));
 modal.browser.back();assert.equal(modal.current.screen,'result');assert.equal(modal.current.contact,null);
 modal.browser.back();assert.equal(modal.current.screen,'registry');
 modal.browser.forward();modal.browser.forward();assert.equal(modal.current.contact,'msg');
 modal.dispose();console.log('PASS prologue scenes and resumed overlay first dismissal');
}

{
 const browser=fakeBrowser({router:'retained'});let app=game(browser);app.dispose();app=game(browser);
 assert.equal(browser.listenerCount,1);assert.equal(browser.host.history.length,2,'StrictMode does not add entries');
 app.navigate(view('result'));app.dispose();
 // Reload starts on the title while browser history retains older game entries.
 app=game(browser,view('intro'),'reload:explore');
 browser.back();assert.equal(browser.index,0,'reload title skips obsolete entries and exits');app.dispose();
 const resumeBrowser=fakeBrowser();let before=game(resumeBrowser);before.navigate(view('draft'));before.dispose();
 const resumed=game(resumeBrowser,view('intro'),'reload:explore');resumed.navigate(view('draft'),'new-run:explore');
 for(const screen of ['fire-folder','folders','desktop','intro']){resumeBrowser.back();assert.equal(resumed.current.screen,screen);}
 resumeBrowser.back();assert.equal(resumeBrowser.index,0,'resumed title does not strand old page history');resumed.dispose();
 console.log('PASS StrictMode, reload title exit, and resumed-run boundaries');
}

{
 const app=game();for(const screen of ['desktop','registry','report'])app.navigate(view(screen));
 app.navigate(view('boss'),'run:report');const count=app.browser.host.history.length;
 for(const screen of ['boss-reply','boss','boss-reply'])app.navigate(view(screen),'run:report');
 assert.equal(app.browser.host.history.length,count,'questions replace one authoritative report checkpoint');
 app.browser.back();assert.equal(app.current.screen,'intro','Back does not unlock old exploration or old answers');
 assert.equal(app.browser.index,1);app.dispose();
 const finished=game();finished.navigate(view('boss-reply'),'run:report');finished.navigate(view('score'),'run:complete');
 finished.browser.back();assert.equal(finished.current.screen,'intro');finished.dispose();
 console.log('PASS report phase boundary and authoritative completion checkpoint');
}

{
 const app=game();app.navigate(view('desktop'));app.navigate(view('result'));const index=app.browser.index,pushes=app.browser.pushes;
 app.setBusy(true);app.browser.back();assert.equal(app.browser.index,index);assert.equal(app.current.screen,'result');assert.equal(app.browser.pushes,pushes);
 app.setBusy(false);app.browser.back();assert.equal(app.current.screen,'desktop');
 app.dispose();console.log('PASS pending request traversal is restored without extra history');
}
