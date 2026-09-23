(function (root) {
  'use strict';
  const KEY = 'bullcamp_academy_v1';
  const fresh = () => ({ version: 1, lessons: {}, last: null, created: new Date().toISOString() });
  const record = () => ({ step: 0, answers: {}, params: {}, runs: [], evidence: [], notes: {}, reflection: false, complete: false });
  function get(state, id) { return state.lessons[id] || (state.lessons[id] = record()); }
  function answer(r, key, chosen, q) {
    const prev = r.answers[key];
    const correct = chosen === q.answer;
    r.answers[key] = { chosen, correct, firstCorrect: prev ? prev.firstCorrect : correct, attempts: (prev?.attempts || 0) + 1 };
    return correct;
  }
  function skills(r) {
    return { understand: [0, 1].every(i => r.answers['transfer' + i]?.correct), operate: !!r.labDone && !!r.answers.lab?.correct, agent: !!r.answers.agent?.correct && !!r.notes.prompt?.trim() };
  }
  function eligible(r) { return Object.values(skills(r)).every(Boolean) && r.reflection && ['evidence', 'limit', 'next'].every(k => r.notes[k]?.trim()); }
  function complete(r) { if (!eligible(r)) return false; r.complete = true; r.completedAt = new Date().toISOString(); return true; }
  function arithmetic(text, vars) {
    if (text.length > 500) throw new Error('表达式太长。');
    const tokens = text.match(/[A-Za-z_][A-Za-z_0-9]*|(?:\d+(?:\.\d*)?|\.\d+)|[()+*/-]|\S/g) || [];
    let pos = 0;
    function atom() {
      const token = tokens[pos++];
      if (token === '-') return -atom();
      if (token === '+') return atom();
      if (token === '(') { const v = expression(); if (tokens[pos++] !== ')') throw new Error('括号不匹配。'); return v; }
      if (/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(token || '')) return Number(token);
      if (Object.hasOwn(vars, token)) return vars[token];
      throw new Error('只支持 cash、qty、price、fee_rate、数字与四则运算。');
    }
    function term() { let v = atom(); while (['*', '/'].includes(tokens[pos])) { const op = tokens[pos++], x = atom(); v = op === '*' ? v * x : v / x; } return v; }
    function expression() { let v = term(); while (['+', '-'].includes(tokens[pos])) { const op = tokens[pos++], x = term(); v = op === '+' ? v + x : v - x; } return v; }
    const value = expression();
    if (pos !== tokens.length || !Number.isFinite(value)) throw new Error('表达式未完成，或结果不是有限数字。');
    return value;
  }
  function checkCode(buy, sell) {
    const cases = [{ cash: 1000, qty: 2, price: 100, fee_rate: 0.01 }, { cash: 500, qty: 3, price: 40, fee_rate: 0 }, { cash: 800, qty: 0, price: 60, fee_rate: 0.02 }, { cash: 2000, qty: 5, price: 73, fee_rate: 0.015 }];
    return cases.flatMap((v, i) => ['buy', 'sell'].map(side => {
      const expected = v.cash + (side === 'buy' ? -1 : 1) * v.qty * v.price - v.qty * v.price * v.fee_rate;
      try { const actual = arithmetic(side === 'buy' ? buy : sell, v); return { label: `情境 ${i + 1} · ${side === 'buy' ? '买入' : '卖出'}`, vars: v, expected, actual, pass: Math.abs(actual - expected) < 1e-8 }; }
      catch (e) { return { label: `情境 ${i + 1} · ${side}`, vars: v, expected, error: e.message, pass: false }; }
    }));
  }
  function checkConfig(text) {
    let c; try { c = JSON.parse(text); } catch (_) { return ['JSON 无法解析，请检查逗号、引号与括号。']; }
    if (!c || typeof c !== 'object' || Array.isArray(c)) return ['计划必须是一个 JSON 对象。'];
    const errors = [];
    if (!Number.isFinite(c.max_position_pct) || c.max_position_pct <= 0 || c.max_position_pct > 0.2) errors.push('max_position_pct 必须大于 0 且不超过 0.20。');
    if (c.allow_borrowing !== false) errors.push('allow_borrowing 必须设为 false。');
    if (!['monthly', 'quarterly'].includes(c.rebalance)) errors.push('本角色只接受 monthly（月度）或 quarterly（季度）再平衡。');
    if (!c.weights || typeof c.weights !== 'object' || Array.isArray(c.weights) || !Object.keys(c.weights).length) errors.push('weights 需要至少一个持仓。');
    else {
      let sum = 0;
      for (const [symbol, weight] of Object.entries(c.weights)) {
        if (!Number.isFinite(weight) || weight < 0 || weight > c.max_position_pct) errors.push(`${symbol} 的权重须非负，且不超过单股上限。`);
        sum += weight;
      }
      if (!Number.isFinite(sum) || sum > 1 + 1e-10) errors.push('持仓权重合计不得超过 1，余下为现金。');
    }
    return errors;
  }
  function importState(text, lessons) {
    if (text.length > 3000000) throw new Error('存档大于 3 MB，无法导入。');
    const input = JSON.parse(text);
    if (input.version !== 1 || !input.lessons || typeof input.lessons !== 'object') throw new Error('这不是当前版本的探索营存档。');
    const out = fresh();
    for (const l of lessons) {
      const src = input.lessons[l.id]; if (!src || typeof src !== 'object') continue;
      const r = record();
      r.step = Number.isInteger(src.step) ? Math.max(0, Math.min(4, src.step)) : 0;
      for (const k of ['prediction','prompt','evidence','limit','next','buy','sell','config']) if (typeof src.notes?.[k] === 'string') r.notes[k] = src.notes[k].slice(0, 10000);
      r.evidence = Array.isArray(src.evidence) ? src.evidence.filter(i => Number.isInteger(i) && i >= 0 && i < l.facts.length) : [];
      if (src.params && typeof src.params === 'object') for (const [k, v] of Object.entries(src.params)) if (/^[a-zA-Z]+$/.test(k) && (typeof v === 'number' && Number.isFinite(v) || typeof v === 'string' && v.length < 50)) r.params[k] = v;
      r.runs = Array.isArray(src.runs) ? src.runs.slice(-8).filter(x => typeof x === 'string').map(x => x.slice(0, 3000)) : [];
      r.labDone = src.labDone === true;
      if (src.holdout && typeof src.holdout === 'object' && src.holdout.params && typeof src.holdout.params === 'object') {
        const p = src.holdout.params;
        if (['hold','trend'].includes(p.rule) && Number.isInteger(p.lookback) && p.lookback >= 2 && p.lookback <= 8 && Number.isFinite(p.weight) && p.weight >= 0 && p.weight <= 100 && Number.isFinite(p.cost) && p.cost >= 0 && p.cost <= 10) r.holdout = { params:{rule:p.rule,lookback:p.lookback,weight:p.weight,cost:p.cost}, date:String(src.holdout.date || '').slice(0,50) };
      }
      r.reflection = src.reflection === true;
      const questions = { lab: l.lab.check, agent: l.agent.check, transfer0: l.transfer[0], transfer1: l.transfer[1] };
      for (const [k, q] of Object.entries(questions)) {
        const a = src.answers?.[k];
        if (a && Number.isInteger(a.chosen) && a.chosen >= 0 && a.chosen < q.options.length) r.answers[k] = { chosen: a.chosen, correct: a.chosen === q.answer, firstCorrect: a.firstCorrect === true && Number.isFinite(a.attempts) && a.attempts >= 1, attempts: Math.max(1, Math.min(999, Number(a.attempts) || 1)) };
      }
      if (src.complete && eligible(r)) { r.complete = true; r.completedAt = typeof src.completedAt === 'string' ? src.completedAt.slice(0, 50) : ''; }
      out.lessons[l.id] = r;
    }
    out.last = lessons.some(l => l.id === input.last) ? input.last : null;
    return out;
  }
  const api = { KEY, fresh, record, get, answer, skills, eligible, complete, arithmetic, checkCode, checkConfig, importState };
  root.BullLearning = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
