const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('../js/models.js');
const F = require('../js/controls.js');
const run = (type, p={}) => M.run(type,{...F.defaults(type),...p});
const near = (a,b) => assert.ok(Math.abs(a-b) < 1e-8, `${a} ≠ ${b}`);

test('external contributions and fees are not counted as profits',()=>{
  near(run('cash',{start:1000,deposit:200,ending:1260,fee:10}).raw.profit,50);
  near(run('cash',{start:1000,deposit:900,ending:1960,fee:10}).raw.profit,50);
});
test('cash-flow bridge adds back depreciation but subtracts receivable and capex',()=>{
  assert.deepEqual(run('cashflow').raw,{profit:60,operating:30,free:-10});
});
test('DCF constant cash has closed-form value, and rejects invalid perpetuity',()=>{
  near(run('dcf',{cash:10,growth:0,discount:10,terminal:0}).raw.value,100);
  assert.ok(run('dcf',{discount:2,terminal:2}).error);
  assert.ok(run('dcf',{discount:15}).raw.value < run('dcf',{discount:10}).raw.value);
});
test('DCA accounts for every cash contribution and fee',()=>{
  const a=run('dca',{fee:0,path:'falling'}).raw;
  near(a.total,1200); near(a.value, M.paths.falling.reduce((s,p)=>s+100/p,0)*50);
  assert.ok(a.profit<0);
  const b=run('dca',{fee:1}).raw; near(b.fees,12);
});
test('waiting money remains in account; future salaries cannot be invested early',()=>{
  const a=run('dca',{funding:'salary',plan:'wait',path:'rising'}).raw;
  near(a.value,1200); near(a.cash,1200); near(a.fees,0);
  const b=run('dca',{funding:'salary',plan:'all',fee:0}).raw;
  const c=run('dca',{funding:'salary',plan:'fixed',fee:0}).raw;
  near(b.value,c.value);
  const lump=run('dca',{funding:'lump',plan:'all',path:'rising',fee:0}).raw;
  near(lump.value,1920);
});
test('orders honor limit, depth, affordability and charge only upon execution',()=>{
  near(run('order',{kind:'limit',limit:100,ask:101}).raw.cost,0);
  assert.deepEqual(run('order',{kind:'market',cash:201,ask:100,fee:1,quantity:10,depth:5}).raw,{quantity:2,cost:201});
  near(run('order',{kind:'market',cash:0}).raw.quantity,0);
});
test('allocation rejects implicit borrowing and computes weighted scenario',()=>{
  assert.ok(run('allocation',{stock:70,bond:40}).error);
  near(run('allocation').raw.change,-.105);
});
test('rebalancing restores allocation and guards empty portfolio',()=>{
  near(run('rebalance').raw.trade,-100);
  assert.ok(run('rebalance',{stock:0,other:0}).error);
});
test('turnover cost units are percentage points',()=>{
  assert.deepEqual(run('cost',{turnover:600,cost:.5,gross:12,benchmark:10}).raw,{net:9,fees:3});
});
test('leverage magnifies loss and equity ratio can become negative',()=>{
  assert.deepEqual(run('leverage',{equity:100,loan:100,change:-20}).raw,{assets:160,equity:60,ratio:.375});
  assert.ok(run('leverage',{change:-60}).raw.equity<0);
});
test('dilution can offset total profit growth; merger failure changes expectation',()=>{
  near(run('dilution',{profit:100,shares:100,growth:20,issue:50}).raw.after,.8);
  near(run('arbitrage',{prob:80,offer:100,fail:60,cost:1}).raw.expected,91);
});
test('prefix results are invariant to unseen future observations',()=>{
  const p={rule:'trend',lookback:2,weight:80,cost:.5};
  const a=M.backtest([100,102,105,110,200],p),b=M.backtest([100,102,105,110,1],p);
  assert.deepEqual(a.values.slice(0,4),b.values.slice(0,4));
  assert.equal(a.values[1],10000); // insufficient prior observations
});
test('backtest costs respect cash, and fixed prices lose only charged fees',()=>{
  const x=M.backtest([100,100,100,100],{rule:'hold',lookback:2,weight:100,cost:1});
  near(x.value,10000-x.fees);
  near(x.value,10000/1.01);
  assert.ok(x.maxDrawdown>=0 && x.maxDrawdown<=1);
});
test('invalid UI parameters are rejected, including NaN and fractional share orders',()=>{
  for(const p of [{quantity:1.5},{ask:0},{cash:NaN}]) assert.ok(F.validate('order',{...F.defaults('order'),...p}).length);
  assert.ok(F.validate('strategy',{...F.defaults('strategy'),path:'missing'}).length);
});
