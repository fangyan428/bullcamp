const test=require('node:test');
const assert=require('node:assert/strict');
require('../js/curriculum.js');
const C=require('../js/curriculum-more.js');
const L=require('../js/learning.js');
const F=require('../js/controls.js');
const M=require('../js/models.js');

test('46 complete tasks have unique IDs, forward prerequisites, original cases and valid questions',()=>{
  assert.equal(C.lessons.length,46);assert.equal(new Set(C.lessons.map(l=>l.id)).size,46);
  assert.equal(C.chapters.length,11);
  for(const [i,l] of C.lessons.entries()){
    assert.equal(l.number,i+1); assert.equal(l.teach.length,2);assert.equal(l.transfer.length,2);
    assert.ok(l.goal && l.story && l.example && l.takeaway && l.facts.length>=2);
    assert.deepEqual(l.prerequisites,i?[C.lessons[i-1].id]:[]);
    for(const source of l.sources) assert.ok(C.sources[source]);
    for(const q of [l.lab.check,l.agent.check,...l.transfer]){
      assert.ok(q.prompt && q.explanation && q.options.length>=3);
      assert.ok(Number.isInteger(q.answer)&&q.answer>=0&&q.answer<q.options.length);
    }
    if(F.controls[l.lab.type]){
      const p={...F.defaults(l.lab.type),...l.lab.values};
      assert.deepEqual(F.validate(l.lab.type,p),[],l.id);const result=M.run(l.lab.type,p);assert.ok(!result.error,l.id);
      for(const control of F.controls[l.lab.type].filter(c=>!c.options)) {
        const steps=(p[control.key]-control.min)/control.step;
        assert.ok(Math.abs(steps-Math.round(steps))<1e-7,`${l.id}: default ${control.key} must satisfy browser step constraints`);
      }
      assert.ok(!JSON.stringify(result).includes('NaN'),l.id);
    }else assert.ok(['evidence','code','config'].includes(l.lab.type));
  }
});
test('grading cannot complete a lesson from answers alone; all 46 accept the complete core workflow',()=>{
  const state=L.fresh();
  for(const l of C.lessons){
    const r=L.get(state,l.id); assert.equal(L.complete(r),false);
    for(const [k,q] of Object.entries({lab:l.lab.check,agent:l.agent.check,transfer0:l.transfer[0],transfer1:l.transfer[1]})) L.answer(r,k,q.answer,q);
    assert.equal(L.complete(r),false);
    r.labDone=true;r.notes={prompt:'核对给定资料，输出来源与缺口',evidence:'具体证据',limit:'给定假设',next:'下一步检验'};
    assert.equal(L.complete(r),false);r.reflection=true;assert.equal(L.complete(r),true);
  }
  const imported=L.importState(JSON.stringify(state),C.lessons);
  assert.equal(Object.values(imported.lessons).filter(r=>r.complete).length,46);
  assert.notEqual(L.KEY,'bullcamp_state');
});
test('correction keeps first attempt evidence and import recalculates correctness',()=>{
  const l=C.lessons[0],r=L.record(),q=l.lab.check;
  L.answer(r,'lab',(q.answer+1)%q.options.length,q);L.answer(r,'lab',q.answer,q);
  assert.equal(r.answers.lab.firstCorrect,false);assert.equal(r.answers.lab.attempts,2);
  r.answers.lab.correct=false;
  const state=L.fresh();state.lessons[l.id]=r;
  const copy=L.importState(JSON.stringify(state),C.lessons);
  assert.equal(copy.lessons[l.id].answers.lab.correct,true);
  assert.equal(copy.lessons[l.id].complete,false);
  assert.throws(()=>L.importState('{"version":7}',C.lessons));
});
test('arithmetic parser accepts equivalent fee fixes and rejects executable syntax',()=>{
  assert.ok(L.checkCode('cash - qty * price * (1 + fee_rate)','cash + qty * price - qty * price * fee_rate').every(x=>x.pass));
  assert.ok(L.checkCode('cash-qty*price','cash+qty*price').some(x=>!x.pass));
  for(const s of ['fetch("url")','globalThis','cash;alert(1)','cash/0','(cash+2']) assert.throws(()=>L.arithmetic(s,{cash:10}));
  assert.equal(L.arithmetic('-(2+3)*4',{cash:10}),-20);
});
test('configuration requires valid budget, position sizes, no borrowing and cadence',()=>{
  const c={max_position_pct:.2,weights:{A:.2,B:.15},allow_borrowing:false,rebalance:'monthly'};
  assert.deepEqual(L.checkConfig(JSON.stringify(c)),[]);
  for(const bad of [{...c,weights:{A:.3}},{...c,allow_borrowing:true},{...c,rebalance:'daily'},{...c,weights:{A:.2,B:.2,C:.2,D:.2,E:.2,F:.2}},{...c,weights:{A:'0.1'}}]) assert.ok(L.checkConfig(JSON.stringify(bad)).length);
});
test('case inputs agree with the story ledger and worked examples',()=>{
  const result=id=>{const l=C.lessons.find(l=>l.id===id);return M.run(l.lab.type,{...F.defaults(l.lab.type),...l.lab.values});};
  assert.equal(result('f-1').raw.profit,90);
  assert.equal(result('f-2').raw.expected,5);
  assert.deepEqual(result('f-3').raw,{profit:30,operating:10,free:-5});
  assert.equal(result('c1-3').raw.quantity,5);
  assert.equal(result('c2-2').raw.cost,301);
  assert.equal(result('c2-3').raw.trade,-1000);
  assert.equal(result('c3-3').raw.after,.8);
  assert.equal(result('c4-4').raw.old,60);
  assert.equal(result('c8-1').raw.net,11.2);
  assert.equal(result('c9-3').raw.expected,102);
});
