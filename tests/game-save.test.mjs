import assert from 'node:assert/strict';
import {makeSavedRun,parseSavedRun,reconcileSavedRun} from '../app/game-save.ts';

const credential={id:'12345678-1234-1234-1234-123456789abc',token:'a'.repeat(64)};
const progress={screen:'boss-reply',line:'확인한 자료대로 보고한다.',found:['c1','c2'],answers:[1,2],qIndex:1,reportedAt:2,msgHints:1,callHints:0,prologue:2,search:'합동소방',searched:true,preview:null,chatHistory:[{id:1,question:'어디부터 보면 될까요?',reply:'결재문서를 확인하세요.'}],contact:null,phoneProgress:null};
const saved=makeSavedRun(credential,{...progress,form:{name:'저장하면 안 되는 정보',phone:'01012345678',consent:true}});
assert.ok(saved);assert.deepEqual(saved.progress,progress);
assert.equal(JSON.stringify(saved).includes('01012345678'),false);
assert.deepEqual(parseSavedRun(JSON.stringify(saved)),saved);
assert.equal(parseSavedRun('{broken'),null);
assert.equal(parseSavedRun(JSON.stringify({...saved,version:99})),null);
assert.equal(parseSavedRun(JSON.stringify({...saved,progress:{...progress,answers:[8]}})),null);
assert.equal(makeSavedRun(credential,{...progress,screen:'intro'}),null);
assert.equal(makeSavedRun(credential,{...progress,screen:'unknown'}),null);
assert.equal(makeSavedRun(credential,{...progress,screen:'file-preview',preview:null}).progress.screen,'folders');
assert.equal(makeSavedRun(credential,{...progress,qIndex:200}).progress.qIndex,1);
console.log('PASS checkpoint validation, answered-question recovery, malformed data, and private form exclusion');

const lastAnswer=makeSavedRun(credential,{...progress,answers:[1,2,1,2,1],qIndex:4});
const complete={id:credential.id,completed:true,score:4,grade:'A',entered:false};
assert.equal(reconcileSavedRun(lastAnswer,complete).screen,'score');
const ending=makeSavedRun(credential,{...lastAnswer.progress,screen:'ending',contact:'ending',phoneProgress:{kind:'ending',phase:'connected',step:1}});
assert.equal(reconcileSavedRun(ending,complete).phoneProgress.step,1);
assert.equal(reconcileSavedRun(ending,{...complete,entered:true}).screen,'raffle-done');
assert.equal(reconcileSavedRun(ending,{...complete,completed:false}).screen,'boss-reply');
assert.throws(()=>reconcileSavedRun(ending,{...complete,id:'someone-else'}));
console.log('PASS interrupted completion, resumed call, entry status, and session mismatch');
