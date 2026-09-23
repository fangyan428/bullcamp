/* BullCamp academy: local-only learning engine, independent of classic progress. */
(function () {
  'use strict';
  const C = window.BullCourse, L = window.BullLearning, M = window.BullModels, F = window.BullControls, R = window.BullResources;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const external = (url, label, cls = '') => `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} ↗</a>`;
  let state = L.fresh(), storageOK = true, current = null, toastTimer, search = '', output = null, pendingImport = null, exportUrl = null;
  try { const raw = localStorage.getItem(L.KEY); if (raw) state = L.importState(raw, C.lessons); }
  catch (_) { storageOK = false; }
  function save() {
    try { localStorage.setItem(L.KEY, JSON.stringify(state)); storageOK = true; }
    catch (_) { storageOK = false; toast('无法写入浏览器存档，请到学习档案导出备份。'); }
  }
  function toast(message) { const el = $('#toast'); el.textContent = message; el.classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove('visible'), 4000); }
  const rFor = l => L.get(state, l.id);
  const done = () => C.lessons.filter(l => rFor(l).complete).length;
  const next = () => C.lessons.find(l => !rFor(l).complete) || C.lessons.at(-1);
  const bull = `<svg viewBox="0 0 80 80" fill="none" aria-hidden="true"><path d="M22 26C8 27 7 14 10 10c2 8 8 8 15 6M58 26c14 1 15-12 12-16-2 8-8 8-15 6" fill="#f7cd63" stroke="#16324a" stroke-width="3"/><path d="M19 26c0-15 42-15 42 0v21c0 22-42 22-42 0Z" fill="#fff" stroke="#16324a" stroke-width="3"/><path d="M27 20q13-16 26 0" fill="#166a9f"/><rect x="21" y="43" width="38" height="22" rx="11" fill="#c8e7df" stroke="#16324a" stroke-width="3"/><circle cx="29" cy="35" r="3" fill="#16324a"/><circle cx="51" cy="35" r="3" fill="#16324a"/><path d="M31 53v3m18-3v3" stroke="#16324a" stroke-width="3" stroke-linecap="round"/></svg>`;
  const heroArt = `<svg class="hero-art" viewBox="0 0 220 250" aria-hidden="true"><path d="M15 228H205M40 228v-40h35v40m15 0v-80h35v80m15 0V96h35v132" fill="#c7dde7" stroke="#9ebdce" stroke-width="2"/><path d="m30 165 43-45 35 13 55-67" fill="none" stroke="#138575" stroke-width="5" stroke-linecap="round"/><path d="m146 68 22-7-2 23" fill="none" stroke="#138575" stroke-width="5" stroke-linecap="round"/><g transform="translate(80 145) scale(.9)">${bull.replace(/<svg[^>]*>|<\/svg>/g,'')}</g></svg>`;
  function shell(view, body) {
    const nav = [['map','◈','学习旅程'],['manual','▤','方法手册'],['review','↺','复习角'],['practice','⌘','补充实践'],['archive','▦','学习档案']];
    $('#app').innerHTML = `<div class="shell"><aside class="sidebar"><a class="brand" href="#map" aria-label="BullCamp 首页">${bull}<span>BullCamp<small>投资探索营</small></span></a><nav class="nav" aria-label="主导航">${nav.map(([id,icon,title]) => `<a href="#${id}" class="${view === id ? 'active' : ''}" ${view === id ? 'aria-current="page"' : ''}><span class="nav-icon" aria-hidden="true">${icon}</span>${title}</a>`).join('')}</nav><div class="sidebar-bottom">从一个判断开始，<br>把方法留在自己手里。<a href="#manual">课程依据与适用范围</a></div></aside><main class="main" id="main" tabindex="-1"><div class="topline"><span>投资探索营 / ${view === 'lesson' ? '任务工作台' : nav.find(n => n[0] === view)?.[2] || '学习旅程'}</span><span class="local-indicator">本地学习 · ${done()} / 46</span></div>${!storageOK ? '<div class="storage-warning" role="alert">浏览器存档不可用或已有存档损坏。当前仍可学习，请导出备份；原版存档不受影响。</div>' : ''}${body}<footer class="footer">BullCamp 投资探索营 · 核心任务无需 API · 教学案例与行情均为原创模拟<br>基于 BullCamp（MIT）扩展；原版作者 wcy4213。学习进度保存在当前浏览器，可从档案导出。</footer></main></div>`;
  }
  function heading(title, text) { return `<header class="page-heading"><h1>${title}</h1><p>${text}</p></header>`; }
  function abilityCounts() { const c = { understand:0,operate:0,agent:0 }; C.lessons.forEach(l => { const s = L.skills(rFor(l)); for (const k in c) c[k] += +s[k]; }); return c; }
  function mapView() {
    const n = next(), count = done(), a = abilityCounts();
    const resume = C.lessons.find(l => l.id === state.last && !rFor(l).complete) || n;
    shell('map', `<div class="home-grid"><section><div class="journey-hero"><div class="copy"><div class="eyebrow">${count === 46 ? '主线已完成，研究继续' : '先做一个小决策，再学懂它'}</div><h1>投资这件事，<br>自己拿得住主意。</h1><p>读懂资料，亲手试一试，再审一遍 Agent 的判断。一步一步，建立自己的方法。</p><a class="btn" href="#lesson/${resume.id}">${count ? '继续学习' : '开始基础任务'} <span aria-hidden="true">→</span></a></div>${heroArt}</div><div class="section-head"><h2>你的学习路线</h2><span class="small muted">6 个基础任务 + 10 章</span></div>${C.chapters.map((c,i) => {
      const ls = C.lessons.filter(l => l.chapter === c.id), cd = ls.filter(l => rFor(l).complete).length;
      return `<details class="chapter" ${c.id === n.chapter || (count === 0 && i === 0) ? 'open' : ''}><summary><span class="chapter-num">${i === 0 ? c.icon : String(i).padStart(2,'0')}</span><div><h3>${c.title}</h3><p>${c.description}</p></div><span class="chapter-count">${cd}/${ls.length}</span></summary><ol class="lesson-list">${ls.map(l => { const r = rFor(l), cls = r.complete ? 'done' : l.id === n.id ? 'current' : ''; return `<li class="lesson-row ${cls}"><span class="lesson-dot">${r.complete ? '✓' : ''}</span><a class="lesson-link" href="#lesson/${l.id}"><div><span class="lesson-title">${l.title}</span><small>${l.minutes} 分钟左右 · ${l.lab.type === 'evidence' ? '资料判断' : l.lab.type === 'code' ? '代码实验' : l.lab.type === 'config' ? '配置实验' : '交互实验'} · Agent 审核</small></div><span class="status">${r.complete ? '已完成' : l.id === n.id ? '当前任务 →' : '可预习'}</span></a></li>`; }).join('')}</ol></details>`;
    }).join('')}<div class="intro-strip">建议沿路线前进，也可以自由预习。每关依次完成理解、操作、审核、迁移和复盘；补充真实运行不参与主线完成度。</div></section><aside class="home-aside"><section class="side-note"><h3>一路留下的能力</h3><div class="progress-big">${count}<small> / 46 个任务</small></div><div class="progress-track" role="progressbar" aria-label="任务完成进度" aria-valuenow="${count}" aria-valuemin="0" aria-valuemax="46"><span style="width:${count/46*100}%"></span></div><div class="ability"><span>理解与迁移</span><b>${a.understand}/46</b></div><div class="ability"><span>操作与核验</span><b>${a.operate}/46</b></div><div class="ability"><span>Agent 审核练习</span><b>${a.agent}/46</b></div><p>这是课程练习记录。独立判断还需要在新材料中不断检验。</p></section><section class="side-note"><h3>这一站带走什么</h3><p>${esc(n.goal)}</p><div class="stamp">${esc(n.takeaway)}</div></section><section class="side-note"><h3>一份能回看的研究笔记</h3><p>你的假设、实验与反证会留在档案里。换设备前，记得导出。</p><a href="#archive" class="small">查看学习档案</a></section></aside></div>`);
  }
  function question(q, key, r, enabled = true) {
    const a = r.answers[key];
    return `<section class="quiz" id="quiz-${key}" aria-labelledby="q-${key}"><h3 id="q-${key}">${esc(q.prompt)}</h3><div class="quiz-options">${q.options.map((o,i) => `<button class="option ${a?.chosen === i ? a.correct ? 'correct' : 'incorrect' : ''}" data-answer="${key}" data-choice="${i}" ${enabled ? '' : 'disabled'}><span class="option-key">${String.fromCharCode(65+i)}</span>${esc(o)}</button>`).join('')}</div>${!enabled ? '<p class="gate-note">完成上面的操作后再检查理解。</p>' : ''}${a ? `<div class="feedback ${a.correct ? '' : 'error'}" role="status"><b>${a.correct ? a.firstCorrect ? '首次检查通过。' : '订正通过。' : '这里还需要再想一步。'}</b> ${esc(q.explanation)}${!a.correct ? '<br>可以回看资料，再选择一次。' : ''}</div>` : ''}</section>`;
  }
  function noteField(key, label, r, placeholder, cls = '') { return `<label class="field">${label}<textarea class="${cls}" data-note="${key}" maxlength="10000" placeholder="${esc(placeholder || '')}">${esc(r.notes[key] || '')}</textarea></label>`; }
  function sourcePane(l) { return `<details class="source-pane" ${innerWidth > 900 ? 'open' : ''}><summary>随手查：本关资料</summary><p class="data-label">${l.dataLabel}</p>${l.facts.map(([label,text]) => `<div class="fact"><b>${esc(label)}</b>${esc(text)}</div>`).join('')}<h4>方法依据 · 联网延伸阅读</h4>${l.sources.map(id => external(C.sources[id][1], C.sources[id][0], 'source-link')).join('')}<p class="note">外部来源解释方法，案例数字由课程编写。无需打开外链即可完成本关。</p></details>`; }
  function controls(l, r) {
    const defs = F.controls[l.lab.type], values = { ...F.defaults(l.lab.type), ...l.lab.values, ...r.params };
    return `<form id="model-form"><div class="form-grid">${defs.map(c => `<label class="field">${c.label}${c.options ? `<select name="${c.key}" data-param="${c.key}">${Object.entries(c.options).map(([v,label]) => `<option value="${v}" ${values[c.key] === v ? 'selected' : ''}>${label}</option>`).join('')}</select>` : `<input name="${c.key}" data-param="${c.key}" type="number" value="${esc(values[c.key])}" min="${c.min}" max="${c.max}" step="${c.step}" required>`}</label>`).join('')}</div><button class="btn" type="submit">运行这组条件</button></form>`;
  }
  function table(headers, rows) { return `<div class="table-wrap"><table><thead><tr>${headers.map(h => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(row => `<tr>${row.map(v => `<td>${esc(v)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`; }
  function chart(series) {
    const all = series.flatMap(s => s.values), max = Math.max(...all), min = Math.min(0,...all), range = max-min || 1;
    const y = v => 160 - (v-min)/range*140;
    return `<div class="chart"><svg viewBox="0 0 500 195" role="img" aria-label="给定条件下的模拟资产路径，下方可展开数值"><text x="0" y="14" font-size="10" fill="#557084">${Math.round(max).toLocaleString()}</text><text x="0" y="166" font-size="10" fill="#557084">${Math.round(min)}</text>${[20,90,160].map(v => `<line x1="50" x2="487" y1="${v}" y2="${v}" stroke="#d5e2e9" stroke-dasharray="3 4"/>`).join('')}${series.map((s,i) => `<polyline points="${s.values.map((v,j) => `${50+j/(s.values.length-1)*435},${y(v)}`).join(' ')}" fill="none" stroke="${i ? '#138575' : '#166a9f'}" stroke-width="2.8" ${i ? 'stroke-dasharray="5 4"' : ''}/>`).join('')}<text x="50" y="186" font-size="10" fill="#557084">第 1 期</text><text x="448" y="186" font-size="10" fill="#557084">期末</text></svg><div class="chart-legend">${series.map(s => `<span>${esc(s.name)}</span>`).join('')}</div></div>`;
  }
  function renderOutput(o) {
    if (!o) return '';
    if (o.error) return `<div class="feedback error" role="alert">${esc(o.error)}</div>`;
    return `<section class="output" aria-label="实验结果"><div class="eyebrow">内置计算结果</div><div class="stats">${o.stats.map(s => `<div class="stat"><span>${esc(s.label)}</span><strong>${esc(s.value)}</strong></div>`).join('')}</div>${o.series ? chart(o.series) : ''}${o.rows?.length ? `<details class="table"><summary>展开计算明细</summary>${table(o.headers || [],o.rows)}</details>` : ''}<p class="note">${esc(o.note)}</p></section>`;
  }
  function labView(l,r) {
    let experiment = '';
    if (l.lab.type === 'evidence') {
      experiment = `<p class="note">点选你已核对的资料。至少核对一条，再判断它能支持什么。</p>${l.facts.map(([label,text],i) => `<button class="evidence-button ${r.evidence.includes(i) ? 'reviewed' : ''}" data-evidence="${i}" aria-pressed="${r.evidence.includes(i)}"><b>${r.evidence.includes(i) ? '✓ 已核对 · ' : ''}${esc(label)}</b>${esc(text)}</button>`).join('')}`;
    } else if (l.lab.type === 'code') {
      if (!r.notes.buy) r.notes.buy = 'cash - qty * price';
      if (!r.notes.sell) r.notes.sell = 'cash + qty * price';
      experiment = `<div class="example"><b>要修的行为</b>买入：原现金 − 成交额 − 费用。卖出：原现金 + 成交额 − 费用。费用 = qty × price × fee_rate。<br>输入 cash=1000、qty=2、price=100、fee_rate=0.01 时，应分别得到 798 和 1198。</div>${noteField('buy','buy_cash 的 return 表达式',r,'','code-input')}${noteField('sell','sell_cash 的 return 表达式',r,'','code-input')}<p class="note">变量：cash 原现金、qty 成交数量、price 成交价、fee_rate 单边费率（小数）。只在限定算术解析器内运行，不执行任意 Python。</p><button class="btn" data-action="code">运行 8 项核验</button><div id="special-output">${output?.code ? renderCode(output.code) : ''}</div>`;
    } else if (l.lab.type === 'config') {
      if (!r.notes.config) r.notes.config = JSON.stringify({ max_position_pct:0.35, weights:{ A:0.3, B:0.25 }, allow_borrowing:true, rebalance:'weekly' },null,2);
      experiment = `<div class="example"><b>角色约束</b>单股权重上限为 20%；不借款；月度或季度再平衡。weights 中的每项不得超过 max_position_pct，合计不超过 1，剩余作为现金。权重使用小数，例如 0.15 = 15%。<br>这是课程专用格式，真实上游配置需另行阅读。</div>${noteField('config','你的计划配置（JSON）',r,'','code-input config-input')}<button class="btn" data-action="config">验证配置约束</button><div id="special-output">${output?.config ? renderConfig(output.config) : ''}</div>`;
    } else experiment = controls(l,r) + `<div id="model-output">${renderOutput(output?.model)}</div>` + (['c8-4','c10-4'].includes(l.id) ? holdoutView(r) : '');
    return `<h2>亲手验证一次</h2><p>${esc(l.lab.instruction)}</p>${noteField('prediction','先写一个预期（可选，但建议）',r,'我改变……，预计……；因为……')}<hr>${experiment}${r.runs.length ? `<details><summary class="small muted">本关实验记录（最近 ${r.runs.length} 次）</summary><ol class="run-log">${r.runs.map(x => `<li>${esc(x)}</li>`).join('')}</ol></details>` : ''}${question(l.lab.check,'lab',r,!!r.labDone)}`;
  }
  function renderCode(results) { return `<div class="feedback ${results.every(x => x.pass) ? '' : 'error'}" role="status">${results.filter(x => x.pass).length} / 8 项通过。${results.every(x => x.pass) ? '费用方向、零费用与零成交均符合契约。' : '请比较实际值与期望值，修改表达式后再运行。'}</div>${table(['情境','输入 cash / qty / price / fee_rate','实际','期望'],results.map(x => [x.label,Object.values(x.vars).join(' / '),x.error || x.actual.toFixed(3),x.expected.toFixed(3)]))}`; }
  function holdoutView(r) {
    if (!r.holdout) return `<div class="example"><b>先锁定规则，再揭示另一段行情</b>上方路径可用于探索。选择规则、窗口、仓位和成本后，先运行一次，再锁定这些条件。另一段原创路径只在揭示时显示；结果不按盈亏评分。</div><button class="btn secondary" data-action="holdout" ${r.labDone ? '' : 'disabled'}>锁定当前条件并揭示样本</button>`;
    const prices = [100,108,113,109,103,98,101,93,90,94,96,91];
    const a = M.backtest(prices,r.holdout.params), b = M.backtest(prices,{...r.holdout.params,rule:'hold',weight:100});
    return `<div class="example"><b>已揭示的检验记录 · 固定条件</b>${esc(JSON.stringify(r.holdout.params))}<br>策略期末 ${M.money(a.value)}；同成本持有 ${M.money(b.value)}。<br>行情：${prices.join(' → ')}<br>这组条件的首次记录已保留。现在已经见过数据；继续修改属于探索，不能再把同一段称作独立检验。浏览器源码可查看，因此这只是教学过程，不是保密评测。</div>`;
  }
  function renderConfig(errors) { return `<div class="feedback ${errors.length ? 'error' : ''}" role="status">${errors.length ? errors.map(esc).join('<br>') : '给定配置约束全部通过。这只检查行为约束，不证明策略有效。'}</div>`; }
  function lessonView(l) {
    current = l; const r = rFor(l), titles = ['理解','操作','审核','迁移','复盘'];
    state.last = l.id; save();
    let body;
    if (r.step === 0) body = `<div class="eyebrow">任务 ${String(l.number).padStart(2,'0')} / 46</div><h2>从这个情境开始</h2><div class="scenario"><span class="label">你的任务</span>${esc(l.story)}</div><div class="teaching">${l.teach.map(p => `<p>${esc(p)}</p>`).join('')}</div><div class="example"><b>跟着算一遍</b>${esc(l.example)}</div><div class="stamp">本关要留下：${esc(l.takeaway)}</div><p class="note">遇到陌生词，可随时打开方法手册；回来时会保留当前位置。</p>`;
    if (r.step === 1) body = labView(l,r);
    if (r.step === 2) body = `<h2>你来审核 Agent</h2><p>先把结论与本关资料逐项对照，再给它一条能执行、能检查的后续任务。</p><div class="agent-report"><div class="agent-label">Agent 教学样本 · 人工编写，未调用模型</div><blockquote>${esc(l.agent.report)}</blockquote></div>${question(l.agent.check,'agent',r)}<hr>${noteField('prompt','写一条你会真正交给 Agent 的任务',r,'请基于【哪些资料与截止时间】，核对【什么问题】；输出【依据、计算、未知和反证】，不要超出【哪些约束】。')}<p class="note">这段文本保存为你的任务草稿，不会发送到外部服务。程序只检查是否填写；质量由你按范围、来源、约束和验收标准自查。</p>${l.practice ? `<a class="small" href="#practice/${l.practice}">查看对应的真实项目补充练习</a>` : ''}`;
    if (r.step === 3) body = `<h2>换一个情境，还能判断吗？</h2><p>用刚才的方法解决两个新问题。记录首次作答和后续订正，答错后可以回到例题重新检查。</p>${l.transfer.map((q,i) => question(q,'transfer'+i,r)).join('')}<p class="note">选择题验证有限范围的理解；最后还需要留下你自己的依据和边界。</p>`;
    if (r.step === 4) {
      const s = L.skills(r), all = Object.values(s).every(Boolean), idx = C.lessons.indexOf(l), upcoming = C.lessons[idx+1];
      body = `${r.complete ? `<div class="lesson-complete"><div class="eyebrow">已完成本关练习</div><h2>把方法留给下一次判断。</h2><p>${esc(l.takeaway)}</p><div class="actions">${upcoming ? `<a class="btn" href="#lesson/${upcoming.id}">下一任务：${esc(upcoming.title)}</a>` : '<a class="btn" href="#archive">查看毕业学习档案</a>'}<a class="btn secondary" href="#map">返回路线</a></div></div>` : '<h2>留下你的研究记录</h2><p>不按模拟盈利打分。用资料、操作和可推翻的判断，说明你学会了什么。</p>'}<div class="receipt"><div><span>自动核验 · 理解与迁移</span>${s.understand ? '✓ 两项新情境已通过' : '待完成：两项新情境'}</div><div><span>自动核验 · 操作</span>${s.operate ? '✓ 实操与操作检查已通过' : '待完成：运行/核对资料及操作检查'}</div><div><span>混合记录 · Agent 审核</span>${s.agent ? '✓ 审核题已通过，任务草稿已保存' : '待完成：审核题与任务草稿'}</div></div>${noteField('evidence','1. 我的结论，以及支持它的具体证据',r,'写一个数字、资料片段或实验差异，并说明它支持什么。')}${noteField('limit','2. 这个结论依赖什么，什么会推翻它？',r,'写出关键假设、适用范围或一个反例。')}${noteField('next','3. 下次我自己做什么，让 Agent 做什么？',r,'给出下一步动作与核验办法。')}<label class="checkbox"><input type="checkbox" data-reflection ${r.reflection ? 'checked' : ''}>我已检查：引用了具体证据，区分了假设，写明了限制与后续核验。这是自评，不是 AI 对开放答案的评分。</label><button class="btn" data-action="complete">${r.complete ? '保存更新后的复盘' : '完成任务并归档'}</button>${!all ? '<p class="gate-note">可以先写复盘，再回到上方步骤补全待完成项。</p>' : ''}`;
    }
    shell('lesson', `<header class="lesson-header"><a class="back" href="#map">← 返回学习路线</a><h1>${esc(l.title)}</h1><p>${esc(l.goal)}</p>${l.prerequisites.some(id => !rFor(C.lessons.find(x => x.id === id)).complete) ? '<p class="note">你正在提前预习；建议先完成前一任务，已有输入会保留。</p>' : ''}</header><div class="workspace"><section><nav class="steps" aria-label="任务步骤">${titles.map((t,i) => `<button class="step ${r.step === i ? 'active' : ''}" data-step="${i}" ${r.step === i ? 'aria-current="step"' : ''}><span class="step-index">${i+1}</span>${t}</button>`).join('')}</nav><div class="work-panel">${body}${r.step < 4 ? `<div class="step-actions"><button class="btn quiet" data-step="${Math.max(0,r.step-1)}" ${r.step === 0 ? 'disabled' : ''}>上一步</button><button class="btn" data-step="${r.step+1}">${['开始动手','去审核 Agent','检查新情境','写下复盘'][r.step]} →</button></div>` : ''}</div></section>${sourcePane(l)}</div>`);
  }
  function manualView() {
    const needle = search.trim().toLowerCase();
    const lessons = C.lessons.filter(l => [l.title,l.takeaway,...l.teach].join(' ').toLowerCase().includes(needle));
    const terms = R.glossary.filter(x => x.join(' ').toLowerCase().includes(needle));
    shell('manual', `${heading('随手翻的方法手册','先记住该怎样问、怎样查，再回到任务里亲手验证。这里也保留整个课程的依据与边界。')}<label class="field search">搜索概念或方法<input id="manual-search" type="search" placeholder="例如：定投、现金、回测、Agent" value="${esc(search)}"></label><details ${needle ? 'open' : ''}><summary>基础概念速查 · ${terms.length} 项</summary><dl class="glossary">${terms.map(([term,def]) => `<dt>${esc(term)}</dt><dd>${esc(def)}</dd>`).join('')}</dl></details><div class="manual-grid">${lessons.map(l => `<article class="manual-item"><h3>${esc(l.title)}</h3><p>${esc(l.takeaway)}</p><p class="muted">${esc(l.teach[0])}</p><a href="#lesson/${l.id}">回到任务 ${String(l.number).padStart(2,'0')} · 动手验证</a></article>`).join('')}</div>${!terms.length && !lessons.length ? '<p class="empty">没有找到这个词，可以换一个概念搜索。</p>' : ''}<hr><h2>内容依据与适用范围</h2><p>以 Aswath Damodaran《Investment Philosophies》第二版与公开课的方法谱系为骨架，结合 SEC、FINRA 的入门材料。覆盖被动投资、价值、成长、信息、技术规则、择时、套利、检验与理念匹配；这是一套入门课程，并非全书的逐章替代。</p><p>每个任务的公司、价格、概率、报表和 Agent 对话均为原创教学情境。涉及真实产品的条款、真实市场数据和运行成本，需要在补充实践中按当前来源核实。案例未模拟的税务、市场冲击等限制会在模型旁说明。</p>${Object.values(C.sources).map(([title,url]) => external(url,title,'source-link')).join('')}`);
  }
  function reviewView() {
    const rows = [];
    for (const l of C.lessons) { const r = rFor(l); for (const [key,a] of Object.entries(r.answers)) if (!a.firstCorrect || !a.correct) { const q = key === 'lab' ? l.lab.check : key === 'agent' ? l.agent.check : l.transfer[Number(key.slice(-1))]; rows.push({ l,key,a,q }); } }
    shell('review', `${heading('给错误留一个回来的地方','保留首次作答的痕迹。订正后再解释一次原因，别只记住选项的位置。')}${rows.length ? `<p class="small muted">${rows.length} 项需巩固 · ${rows.filter(x => x.a.correct).length} 项已订正</p>${rows.map(({l,key,a,q}) => `<article class="review-row"><span class="badge">${a.correct ? '已订正，仍可回看' : '待订正'}</span><h3>${esc(q.prompt)}</h3><p class="muted">${esc(l.title)} · ${key === 'agent' ? 'Agent 审核' : key === 'lab' ? '操作检查' : '新情境'}</p><details><summary class="small">回看解释</summary><p>${esc(q.explanation)}</p></details><button class="btn secondary small" data-review="${l.id}" data-review-step="${key === 'lab' ? 1 : key === 'agent' ? 2 : 3}">回到任务重新检查</button></article>`).join('')}` : '<div class="empty"><h2>还没有需要订正的题目</h2><p>开始学习后，首次答错的题目会自动留在这里。</p><a class="btn" href="#map">回到学习路线</a></div>'}`);
  }
  function practiceView(id) {
    const selected = R.projects.find(p => p.id === id), projects = selected ? [selected] : R.projects;
    shell('practice', `${heading('把学会的方法，带到真实工具里','补充实践不计入主线完成度。先用内置案例学会核查，再自主连接数据与模型。这里提供固定源码入口和可复现的离线练习。')}<div class="stamp">真实项目指引已核对源码，但未在本课程交付中调用付费 API 或实跑第三方 Agent。网页中的计算和教学对话不代表上游运行结果。</div><section class="plain-card" style="margin-top:24px"><h2>先跑一份完全离线的 Python 实验</h2><p>使用标准库、原创价格和本地配置。读取账本、改费用函数、比较参数，把输入与输出写入实验记录。</p><pre>python3 practice/lab.py --config practice/config.json --output experiment.json
python3 -m unittest discover -s practice -p 'test_*.py'</pre><div class="actions"><button class="btn secondary" data-action="download-practice">下载离线练习包</button></div><p class="note">网页目录版可直接读取 practice 文件夹；独立 HTML 使用下载按钮。下载 ZIP 后解压，即可得到 practice 文件夹，不连接网络。先读其中 README.md：lab.py 运行完整实验，exercise.py 是需要你修改的费用练习；test_exercise.py 初次有意出现失败。</p></section>${selected ? '<a href="#practice" class="small">← 查看全部实践方向</a>' : ''}${projects.map(p => `<section class="practice-project"><div class="eyebrow">${p.tag}</div><h3>${p.name}</h3><p class="small muted">固定版本：<code>${p.commit.slice(0,12)}</code> · 指引核查于 2026-09-23</p><ol>${p.steps.map(s => `<li>${esc(s)}</li>`).join('')}</ol><div class="example"><b>要能解释的工具边界</b>${esc(p.boundary)}</div><div class="actions">${external(`https://github.com/${p.repo}/blob/${p.commit}/${p.file}`,'打开固定版本源码','btn secondary')}${external(`https://github.com/${p.repo}/blob/${p.commit}/README.md`,'阅读对应 README','btn quiet')}</div></section>`).join('')}<hr><h2>实际运行后，留下什么</h2><p>在自己的实验目录保留：项目与提交、环境、数据来源和可得时间、模型、配置、预算与实际消耗、代码差异、完整输出、核验结果和失败原因。下载的练习包中附有运行记录模板。只有留有真实执行证据时，才在自己的记录中写“已运行”。</p><p class="note">RD-Agent 的自动因子与模型研究作为进一步延伸；需要更完整的数据、Linux/Docker 环境和实验管理，不作为入门主线。${external('https://github.com/microsoft/RD-Agent/tree/4834df2b6f3e417e5d0512dfe4fd24a8ac338b05','查看固定版本')}</p>`);
  }
  function markdown() {
    let text = `# BullCamp 投资探索营 · 我的学习档案\n\n导出日期：${new Date().toISOString()}\n\n已完成 ${done()}/46。教学案例与 Agent 样本均为原创模拟；开放记录为自评。\n`;
    C.lessons.forEach(l => { const r = rFor(l); if (!r.complete && !Object.keys(r.notes).length && !Object.keys(r.answers).length) return; text += `\n## ${l.number}. ${l.title}（${r.complete ? '完成' : '进行中'}）\n\n${l.takeaway}\n`; for (const [k,title] of [['prediction','操作前预期'],['prompt','给 Agent 的任务'],['evidence','结论与证据'],['limit','假设与反证'],['next','下一步']]) text += `\n### ${title}\n\n${r.notes[k] || '尚未记录'}\n`; text += '\n### 实验记录\n\n' + (r.runs.join('\n\n') || '无') + '\n\n### 练习检查\n\n' + Object.entries(r.answers).map(([k,a]) => `${k}：${a.firstCorrect ? '首次通过' : a.correct ? '订正通过' : '待订正'}；尝试 ${a.attempts} 次`).join('\n') + '\n'; });
    return text;
  }
  function archiveView() {
    const count = done(), notes = C.lessons.filter(l => rFor(l).complete || Object.values(rFor(l).notes).some(Boolean));
    shell('archive', `${heading('你的学习档案','保存自己做过的判断，也保存推翻它的理由。存档只留在当前浏览器；JSON 可以恢复进度，Markdown 便于阅读和整理。')}${count === 46 ? '<div class="lesson-complete"><div class="eyebrow">主线练习全部完成</div><h2>你已经走完 46 个任务。</h2><p>理解、操作、Agent 审核与复盘均已留下记录。接下来可以换一份资料独立研究，或选择补充真实实践。完成课程不是收益或专业资质证明。</p></div>' : ''}<div class="archive-grid"><section class="plain-card"><h2>备份与迁移</h2><p>已完成 <b>${count} / 46</b> 个任务，${notes.length} 份任务记录。</p><div class="actions"><button class="btn" data-action="export-json">导出进度 JSON</button><button class="btn secondary" data-action="export-md">导出研究笔记</button><label class="btn quiet file-button">导入存档<input id="import-file" type="file" accept=".json,application/json"></label></div><p class="note">导入会替换探索营进度；原版 BullCamp 存档不受影响。跨浏览器、换端口或离线文件之间迁移，请先导出。</p><details><summary class="small">也可以粘贴 JSON 导入</summary><label class="field">粘贴存档 JSON<textarea id="import-text" class="code-input" maxlength="3000000"></textarea></label><button class="btn secondary small" data-action="import-text">验证并导入文本</button></details></section><section class="plain-card"><h2>记录怎样理解</h2><p>自动核验：计算、代码、配置与结构化选择。<br>自评：任务草稿、证据质量、反证与行动计划。</p><p>首次答错的项目在复习角保留。修改已完成任务的输入或答案后，需重新核验并归档，记录才会再次计为完成。</p><button class="btn quiet small" data-action="reset">清空探索营存档</button></section></div>${notes.map(l => { const r = rFor(l); return `<details class="chapter"><summary><span class="chapter-num">${l.number}</span><div><h3>${esc(l.title)}</h3><p>${r.complete ? '已归档' : '进行中'}</p></div></summary><div class="receipt">${[['evidence','结论与证据'],['limit','假设与反证'],['next','下一步']].map(([k,t]) => `<div><span>${t}</span>${esc(r.notes[k] || '尚未记录')}</div>`).join('')}</div><a class="btn secondary small" href="#lesson/${l.id}">打开任务</a></details>`; }).join('')}`);
  }
  function download(name,text,type) {
    if (exportUrl) URL.revokeObjectURL(exportUrl);
    exportUrl = URL.createObjectURL(new Blob([text],{type}));
    let panel = $('#export-preview');
    if (!panel) { panel = document.createElement('section'); panel.id = 'export-preview'; panel.className = 'plain-card'; $('.page-heading').after(panel); }
    panel.innerHTML = `<h2>已生成 ${esc(name)}</h2><a class="btn" href="${exportUrl}" download="${esc(name)}">保存文件</a>${typeof text === 'string' ? '<p class="note">如果内置浏览器没有保存文件，可复制下面的完整文本；JSON 也可以粘贴导入。</p><label class="field">导出内容<textarea readonly id="export-text" class="code-input"></textarea></label>' : '<p class="note">解压后得到 practice 文件夹。内置浏览器未保存时，也可从项目 dist 文件夹取得 bullcamp-practice.zip。</p>'}`;
    if (typeof text === 'string') $('#export-text').value = text;
    panel.scrollIntoView({block:'start'});
  }
  function confirmInPage(action, message) {
    $('#confirmation')?.remove(); const panel = document.createElement('section'); panel.id='confirmation'; panel.className='plain-card'; panel.setAttribute('role','alertdialog'); panel.setAttribute('aria-labelledby','confirmation-title');
    panel.innerHTML=`<h2 id="confirmation-title">${esc(message)}</h2><p>只影响探索营进度与笔记，原版存档不变。建议先导出当前记录，再进行替换或清空。</p><div class="actions"><button class="btn secondary" data-action="cancel-confirm">取消</button><button class="btn" data-action="${action}">确认${action === 'confirm-reset' ? '清空' : '替换存档'}</button></div>`;
    $('.page-heading').after(panel); panel.scrollIntoView({block:'start'}); panel.querySelector('button').focus();
  }
  function navigate() {
    const [view,arg] = location.hash.slice(1).split('/'); current = null; output = null;
    if (view === 'lesson') { const l = C.lessons.find(x => x.id === arg); if (l) lessonView(l); else { mapView(); toast('未找到该任务，已返回学习路线。'); } }
    else if (view === 'manual') manualView(); else if (view === 'review') reviewView(); else if (view === 'archive') archiveView(); else if (view === 'practice') practiceView(arg); else mapView();
    window.scrollTo(0,0);
  }
  function refreshLesson() { const y = scrollY; lessonView(current); window.scrollTo(0,y); }
  function invalidate(r, lab = false) {
    const wasComplete = r.complete; r.complete = false;
    if (lab) { r.labDone = false; delete r.answers.lab; }
    if (wasComplete) {
      const indicator = $('.local-indicator'); if (indicator) indicator.textContent = `本地学习 · ${done()} / 46`;
      const banner = $('.lesson-complete .eyebrow'); if (banner) banner.textContent = '内容已修改，等待重新归档';
    }
  }
  function logRun(r,text) { r.runs.push(new Date().toLocaleString('zh-CN') + ' · ' + text); r.runs = r.runs.slice(-8); }
  document.addEventListener('click', e => {
    if (e.target.closest('.skip')) { e.preventDefault(); $('#main').focus(); $('#main').scrollIntoView({block:'start'}); return; }
    const el = e.target.closest('[data-step],[data-answer],[data-evidence],[data-action],[data-review]'); if (!el) return;
    if (el.dataset.review) { rFor(C.lessons.find(l => l.id === el.dataset.review)).step = Number(el.dataset.reviewStep); save(); location.hash = 'lesson/' + el.dataset.review; return; }
    const r = current && rFor(current);
    if (el.hasAttribute('data-step') && r) { r.step = Number(el.dataset.step); save(); lessonView(current); $('.steps').scrollIntoView({block:'start'}); return; }
    if (el.hasAttribute('data-answer') && r) {
      const key = el.dataset.answer, q = key === 'lab' ? current.lab.check : key === 'agent' ? current.agent.check : current.transfer[Number(key.slice(-1))];
      L.answer(r,key,Number(el.dataset.choice),q); invalidate(r); save(); refreshLesson(); $('#quiz-'+key)?.scrollIntoView({block:'nearest'}); return;
    }
    if (el.hasAttribute('data-evidence') && r) { const i = Number(el.dataset.evidence); r.evidence = r.evidence.includes(i) ? r.evidence.filter(x => x !== i) : [...r.evidence,i]; r.labDone = !!r.evidence.length; invalidate(r); save(); refreshLesson(); return; }
    switch (el.dataset.action) {
      case 'code': { const results = L.checkCode(r.notes.buy,r.notes.sell); output = {code:results}; r.labDone = results.every(x => x.pass); invalidate(r); logRun(r,`费用表达式核验：${results.filter(x=>x.pass).length}/8；buy=${r.notes.buy}；sell=${r.notes.sell}`); save(); refreshLesson(); break; }
      case 'config': { const errors = L.checkConfig(r.notes.config); output = {config:errors}; r.labDone = !errors.length; invalidate(r); logRun(r,`配置验证：${errors.length ? errors.join('；') : '通过'}；${r.notes.config}`); save(); refreshLesson(); break; }
      case 'holdout': if (r.labDone && !r.holdout) { r.holdout = { params:{...r.params},date:new Date().toISOString() }; logRun(r,'锁定条件后揭示教学检验路径：'+JSON.stringify(r.params)); save(); refreshLesson(); } break;
      case 'complete': {
        if (['c8-4','c10-4'].includes(current.id) && !r.holdout) { toast('请先在操作步骤锁定条件并揭示检验样本，留下实验记录。'); break; }
        if (!L.complete(r)) { toast('请补齐操作、审核、新情境与三项复盘，并勾选自查。'); break; }
        save(); lessonView(current); $('.work-panel').scrollIntoView({block:'start'}); toast('本关学习记录已归档。'); break;
      }
      case 'export-json': download('bullcamp-progress.json',JSON.stringify(state,null,2),'application/json'); break;
      case 'export-md': download('bullcamp-notes.md',markdown(),'text/markdown;charset=utf-8'); break;
      case 'import-text': {
        try { pendingImport = L.importState($('#import-text').value,C.lessons); confirmInPage('confirm-import','用粘贴的存档替换当前探索营进度？'); }
        catch (error) { toast('导入失败：'+error.message); } break;
      }
      case 'confirm-import': if (pendingImport) { state=pendingImport; pendingImport=null; save(); archiveView(); toast('存档已导入。'); } break;
      case 'cancel-confirm': pendingImport=null; $('#confirmation')?.remove(); break;
      case 'download-practice': if (window.BullPractice) { const bytes = Uint8Array.from(atob(window.BullPractice.zip),c=>c.charCodeAt(0)); download('bullcamp-practice.zip',bytes,'application/zip'); } else toast('练习包未载入，请从项目的 practice 文件夹读取。'); break;
      case 'reset': confirmInPage('confirm-reset','清空探索营进度与笔记？'); break;
      case 'confirm-reset': state=L.fresh(); save(); archiveView(); toast('探索营存档已清空。'); break;
    }
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'manual-search') { search = e.target.value; const pos = e.target.selectionStart; manualView(); const f = $('#manual-search'); f.focus(); if (pos !== null) f.setSelectionRange(pos,pos); return; }
    if (!current) return;
    const r = rFor(current), el = e.target;
    if (el.dataset.note) { r.notes[el.dataset.note] = el.value; const changedLab = ['buy','sell','config'].includes(el.dataset.note); invalidate(r,changedLab); if (changedLab) { output = null; const out = $('#special-output'); if (out) out.innerHTML = '<p class="note">内容已改变，请重新运行验证。</p>'; $('#quiz-lab')?.querySelectorAll('button').forEach(b=>b.disabled=true); } save(); }
    if (el.dataset.param) { r.params[el.dataset.param] = el.tagName === 'SELECT' ? el.value : el.value === '' ? null : Number(el.value); invalidate(r,true); output = null; save(); const out = $('#model-output'); if(out) out.innerHTML = '<p class="note">条件已改变，请重新运行。</p>'; $('#quiz-lab')?.querySelectorAll('button').forEach(b=>b.disabled=true); }
  });
  document.addEventListener('change', async e => {
    if (e.target.hasAttribute('data-reflection') && current) { const r = rFor(current); r.reflection = e.target.checked; invalidate(r); save(); }
    if (e.target.id === 'import-file') {
      const file = e.target.files[0]; if (!file) return;
      try { if (file.size > 3000000) throw new Error('存档超过 3 MB。'); pendingImport = L.importState(await file.text(),C.lessons); confirmInPage('confirm-import','用所选存档替换当前探索营进度？'); }
      catch (error) { toast('导入失败：' + error.message); }
    }
  });
  document.addEventListener('submit', e => {
    if (e.target.id !== 'model-form' || !current) return; e.preventDefault();
    const r = rFor(current), values = {};
    for (const c of F.controls[current.lab.type]) values[c.key] = c.options ? e.target.elements[c.key].value : Number(e.target.elements[c.key].value);
    const errors = F.validate(current.lab.type,values); const result = errors.length ? {error:errors.join(' ')} : M.run(current.lab.type,values);
    r.params = values; output = {model:result}; r.labDone = !result.error; invalidate(r);
    if (!result.error) logRun(r,JSON.stringify(values) + ' → ' + result.stats.map(s => s.label + ' ' + s.value).join('；'));
    save(); refreshLesson(); $('#model-output').scrollIntoView({block:'nearest'});
  });
  addEventListener('hashchange',navigate);
  navigate();
})();
