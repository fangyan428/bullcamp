/* ============ BullCamp 美股新手村 · 游戏引擎 ============ */
(function () {
  'use strict';

  var DATA = window.CURRICULUM || { units: [] };
  var $app = document.getElementById('app');
  var $nav = document.getElementById('nav');

  /* ---------- 数值配置 ---------- */
  var CFG = {
    xpFirst: 10, xpRetry: 5, xpLessonBonus: 20, xpBossBonus: 40, xpDaily: 10, xpReview: 5,
    hearts: 3, heartsBoss: 4,
    dailyCount: 5, reviewCount: 10,
    star3: 0.9, star2: 0.7
  };

  var TITLES = [
    { xp: 0, name: '韭菜幼苗', emoji: '🌱' },
    { xp: 100, name: '见习股民', emoji: '📈' },
    { xp: 300, name: '图表学徒', emoji: '📊' },
    { xp: 600, name: '财报侦探', emoji: '🔍' },
    { xp: 1000, name: '风控骑士', emoji: '🛡️' },
    { xp: 1600, name: '华尔街之狼预备役', emoji: '🐺' },
    { xp: 2500, name: '传奇操盘手', emoji: '👑' }
  ];

  var BADGES = [
    { id: 'first', emoji: '🎉', name: '新手上路', desc: '完成第一关' },
    { id: 'streak3', emoji: '🔥', name: '三日之约', desc: '连续学习 3 天' },
    { id: 'streak7', emoji: '☄️', name: '七日火焰', desc: '连续学习 7 天' },
    { id: 'u1', emoji: '🐣', name: '新手村毕业', desc: '通关单元 1' },
    { id: 'u2', emoji: '🗺️', name: '市场活地图', desc: '通关单元 2' },
    { id: 'u3', emoji: '🎯', name: '下单老司机', desc: '通关单元 3' },
    { id: 'u4', emoji: '📊', name: '行情阅读者', desc: '通关单元 4' },
    { id: 'u5', emoji: '⚡', name: '杠杆驯兽师', desc: '通关单元 5' },
    { id: 'u6', emoji: '🛡️', name: '防割毕业生', desc: '通关单元 6' },
    { id: 'u9', emoji: '💸', name: '金融明白人', desc: '通关金融基础课' },
    { id: 'u10', emoji: '⚖️', name: '持证估值师', desc: '通关估值课' },
    { id: 'u7', emoji: '🇭🇰', name: '港股通行者', desc: '通关港股入门' },
    { id: 'u8', emoji: '🎢', name: '3倍老司机', desc: '通关3倍ETF特训' },
    { id: 'boss100', emoji: '💯', name: '满分Boss', desc: 'Boss 战三星通关' },
    { id: 'cleaner', emoji: '🧹', name: '错题清道夫', desc: '清空一次错题本' },
    { id: 'daily5', emoji: '⚡', name: '挑战常客', desc: '完成 5 次每日挑战' },
    { id: 'xp1000', emoji: '💎', name: '千钻大佬', desc: '累计 1000 XP' }
  ];

  /* ---------- 存档 ---------- */
  var KEY = 'bullcamp_state';
  var state = load();
  function defaults() {
    return {
      xp: 0, streak: 0, lastActive: null, history: {},
      lessons: {}, wrong: [], cards: [],
      daily: { date: null, done: false, score: 0 }, dailyTotal: 0,
      badges: [], sound: true, everWrong: false,
      stats: { answered: 0, correct: 0 }
    };
  }
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      var s = JSON.parse(raw);
      var d = defaults();
      for (var k in d) if (!(k in s)) s[k] = d[k];
      /* 旧存档迁移：错题引用由 {u,l,q} 序号改为 {id,q}，与单元排序解耦 */
      if (s.wrong && s.wrong.length && s.wrong[0].id === undefined) {
        s.wrong = s.wrong.map(function (w) {
          return { id: 'u' + (w.u + 1) + 'l' + (w.l + 1), q: w.q, n: w.n || 1 };
        });
      }
      return s;
    } catch (e) { return defaults(); }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  /* ---------- 日期 & 连胜 ---------- */
  function todayStr(offset) {
    var d = new Date();
    if (offset) d.setDate(d.getDate() + offset);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function refreshStreak() {
    if (state.lastActive && state.lastActive !== todayStr() && state.lastActive !== todayStr(-1)) {
      state.streak = 0; save();
    }
  }
  function markActiveToday() {
    var t = todayStr();
    if (state.lastActive === t) return;
    state.history[t] = true;
    state.streak = (state.lastActive === todayStr(-1)) ? state.streak + 1 : 1;
    state.lastActive = t;
    save();
  }
  function streakLitToday() { return state.lastActive === todayStr(); }

  /* ---------- 美东时间市场状态 ---------- */
  function marketStatus() {
    try {
      var fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour12: false, weekday: 'short', hour: '2-digit', minute: '2-digit' });
      var parts = {};
      fmt.formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
      var wd = parts.weekday, mins = (parseInt(parts.hour, 10) % 24) * 60 + parseInt(parts.minute, 10);
      var hm = parts.hour + ':' + parts.minute;
      if (wd === 'Sat' || wd === 'Sun') return { key: 'closed', label: '休市', tip: '周末休市，正好来学两关', time: hm };
      if (mins >= 240 && mins < 570) return { key: 'pre', label: '盘前交易中', tip: '流动性低、点差大，就是第2单元讲的那样', time: hm };
      if (mins >= 570 && mins < 960) return { key: 'open', label: '盘中交易', tip: '常规时段 9:30-16:00 ET', time: hm };
      if (mins >= 960 && mins < 1200) return { key: 'post', label: '盘后交易中', tip: '财报大多这个时候发布', time: hm };
      return { key: 'closed', label: '休市', tip: '美股睡了，你学一关再睡', time: hm };
    } catch (e) { return { key: 'closed', label: '—', tip: '', time: '' }; }
  }

  /* ---------- 音效 ---------- */
  var audioCtx = null;
  function beep(freqs, dur, type) {
    if (!state.sound) return;
    try {
      audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
      freqs.forEach(function (f, i) {
        var o = audioCtx.createOscillator(), g = audioCtx.createGain();
        o.type = type || 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0.001, audioCtx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.12, audioCtx.currentTime + 0.02 + i * dur);
        g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + (i + 1) * dur + 0.05);
        o.connect(g); g.connect(audioCtx.destination);
        o.start(audioCtx.currentTime + i * dur); o.stop(audioCtx.currentTime + (i + 1) * dur + 0.1);
      });
    } catch (e) {}
  }
  var sfx = {
    good: function () { beep([660, 880], 0.09); },
    bad: function () { beep([196], 0.22, 'triangle'); },
    win: function () { beep([523, 659, 784, 1047], 0.11); }
  };

  /* ---------- 撒花 ---------- */
  function confetti() {
    var colors = ['#6F00FF', '#F9F339', '#A050FF', '#00B578', '#7C9CFD'];
    for (var i = 0; i < 46; i++) {
      var el = document.createElement('div');
      el.className = 'confetti';
      var s = 6 + Math.random() * 8;
      el.style.cssText = 'left:' + (Math.random() * 100) + 'vw;width:' + s + 'px;height:' + (s * 1.4) + 'px;background:' + colors[i % colors.length] + ';animation-duration:' + (1.8 + Math.random() * 1.6) + 's;animation-delay:' + (Math.random() * 0.5) + 's;';
      document.body.appendChild(el);
      setTimeout(function (n) { return function () { n.remove(); }; }(el), 4200);
    }
  }

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }
  function allLessons() {
    var out = [];
    DATA.units.forEach(function (u, ui) {
      u.lessons.forEach(function (l, li) { out.push({ unit: u, ui: ui, lesson: l, li: li }); });
    });
    return out;
  }
  function lessonDone(id) { return !!state.lessons[id]; }
  function lessonUnlocked(flatIdx, flat) {
    if (flatIdx === 0) return true;
    return lessonDone(flat[flatIdx - 1].lesson.id);
  }
  function currentTitle() {
    var t = TITLES[0];
    TITLES.forEach(function (x) { if (state.xp >= x.xp) t = x; });
    return t;
  }
  function nextTitle() {
    for (var i = 0; i < TITLES.length; i++) if (state.xp < TITLES[i].xp) return TITLES[i];
    return null;
  }
  var LESSON_INDEX = null;
  function lessonById(id) {
    if (!LESSON_INDEX) {
      LESSON_INDEX = {};
      DATA.units.forEach(function (u, ui) {
        u.lessons.forEach(function (l) { LESSON_INDEX[l.id] = { lesson: l, unit: u, ui: ui }; });
      });
    }
    return LESSON_INDEX[id] || null;
  }
  function questionByRef(ref) {
    var e = lessonById(ref.id);
    return (e && e.lesson.questions[ref.q]) || null;
  }
  function grantBadges() {
    var earned = [];
    function chk(id, cond) {
      if (cond && state.badges.indexOf(id) < 0) { state.badges.push(id); earned.push(id); }
    }
    chk('first', Object.keys(state.lessons).length >= 1);
    chk('streak3', state.streak >= 3);
    chk('streak7', state.streak >= 7);
    DATA.units.forEach(function (u) {
      chk(u.id, u.lessons.every(function (l) { return lessonDone(l.id); }));
    });
    chk('daily5', state.dailyTotal >= 5);
    chk('xp1000', state.xp >= 1000);
    chk('cleaner', state.everWrong && state.wrong.length === 0);
    save();
    return earned;
  }
  function showBadgePopups(ids, then) {
    if (!ids.length) { if (then) then(); return; }
    var b = BADGES.filter(function (x) { return x.id === ids[0]; })[0];
    if (!b) { showBadgePopups(ids.slice(1), then); return; }
    var pop = document.createElement('div');
    pop.className = 'badge-pop';
    pop.innerHTML = '<div class="badge-card"><div class="badge-emoji">' + b.emoji + '</div>' +
      '<div class="badge-name">获得徽章 · ' + esc(b.name) + '</div>' +
      '<div class="badge-desc">' + esc(b.desc) + '</div>' +
      '<button class="btn btn-primary">太强了</button></div>';
    document.body.appendChild(pop);
    sfx.win();
    pop.querySelector('button').onclick = function () {
      pop.remove();
      showBadgePopups(ids.slice(1), then);
    };
  }

  /* ================= 路由 ================= */
  var view = 'home';
  function go(v) {
    view = v;
    $nav.querySelectorAll('.nav-btn').forEach(function (b) {
      b.classList.toggle('active', b.dataset.view === v);
    });
    $nav.classList.remove('hidden');
    window.scrollTo(0, 0);
    if (v === 'home') renderHome();
    else if (v === 'daily') renderDaily();
    else if (v === 'review') renderReview();
    else if (v === 'profile') renderProfile();
  }
  $nav.querySelectorAll('.nav-btn').forEach(function (b) {
    b.addEventListener('click', function () { go(b.dataset.view); });
  });

  function topbar() {
    var lit = streakLitToday();
    return '<div class="topbar"><div class="logo">🦄 美股新手村<span class="logo-by">✦ by Bobby</span></div>' +
      '<div class="stat-pill pill-streak' + (lit ? '' : ' cold') + '"><span class="ico">🔥</span>' + state.streak + '</div>' +
      '<div class="stat-pill pill-xp"><span class="ico">💎</span>' + state.xp + '</div></div>';
  }
  function marketBar() {
    var m = marketStatus();
    return '<div class="market-bar"><span class="market-dot ' + m.key + '"></span>' +
      '<span>美股现在：<b>' + m.label + '</b>' + (m.time ? ' · 美东 ' + m.time : '') + '</span></div>';
  }

  /* ================= 首页地图 ================= */
  function renderHome() {
    refreshStreak();
    var flat = allLessons();
    var html = topbar() + marketBar() + '<div class="map fade-in">';
    var flatIdx = 0;
    var zig = ['', 'off-l', '', 'off-r'];
    var firstCurrent = true;

    DATA.units.forEach(function (u, ui) {
      var doneCount = u.lessons.filter(function (l) { return lessonDone(l.id); }).length;
      var unitUnlocked = flatIdx === 0 || lessonDone(flat[flatIdx - 1].lesson.id) || doneCount > 0;
      html += '<div class="unit-head' + (unitUnlocked ? '' : ' locked') + '">' +
        '<div class="u-emoji">' + u.emoji + '</div>' +
        '<div class="u-title">单元 ' + (ui + 1) + ' · ' + esc(u.title) + '</div>' +
        '<div class="u-sub">' + esc(u.subtitle) + '</div>' +
        '<div class="u-progress">' + doneCount + ' / ' + u.lessons.length + '</div></div>';
      html += '<div class="path">';
      u.lessons.forEach(function (l, li) {
        var unlocked = lessonUnlocked(flatIdx, flat);
        var done = lessonDone(l.id);
        var cur = unlocked && !done;
        var cls = done ? 'done' : (cur ? 'current' : 'locked');
        if (l.boss) cls += ' boss';
        var inner;
        if (done) {
          var st = state.lessons[l.id].stars;
          inner = (l.boss ? '👑' : '✓') + '<div class="stars">' + '★★★'.slice(0, st) + '<span style="opacity:.35">' + '★★★'.slice(st) + '</span></div>';
        } else if (cur) {
          inner = (firstCurrent ? '<div class="start-tip">从这里开始</div>' : '') + (l.boss ? '👑' : '▶');
          firstCurrent = false;
        } else {
          inner = l.boss ? '👑' : '🔒';
        }
        html += '<div class="node-row ' + zig[(flatIdx) % 4] + '">' +
          '<button class="node ' + cls + '" data-lesson="' + esc(l.id) + '" ' + (unlocked ? '' : 'disabled') + '>' +
          inner + '<span class="n-label">' + esc(l.title) + '</span></button></div>';
        flatIdx++;
      });
      html += '</div>';
    });
    html += '</div>';
    $app.innerHTML = html;
    $app.querySelectorAll('.node[data-lesson]').forEach(function (btn) {
      if (btn.disabled) return;
      btn.addEventListener('click', function () { startLesson(btn.dataset.lesson); });
    });
  }

  /* ================= 课程会话 ================= */
  var session = null;

  function startLesson(lessonId) {
    var found = null;
    DATA.units.forEach(function (u, ui) {
      u.lessons.forEach(function (l, li) { if (l.id === lessonId) found = { u: u, ui: ui, l: l, li: li }; });
    });
    if (!found) return;
    var qs = found.l.questions.map(function (q, qi) {
      return { q: q, ref: { id: found.l.id, q: qi }, retry: false };
    });
    var LK = window.LabKit;
    session = {
      kind: 'lesson', lesson: found.l, unit: found.u,
      queue: qs, idx: 0,
      total: qs.length, firstCorrect: 0,
      hearts: found.l.boss ? CFG.heartsBoss : CFG.hearts,
      xp: 0, showIntro: !!found.l.intro,
      showLab: !!(LK && LK.has(found.l.id))
    };
    $nav.classList.add('hidden');
    renderSession();
  }

  function startQuiz(kind, questions, meta) {
    session = {
      kind: kind, queue: questions.map(function (x) { return { q: x.q, ref: x.ref, retry: false }; }),
      idx: 0, total: questions.length, firstCorrect: 0,
      hearts: Infinity, xp: 0, showIntro: false, meta: meta || {}
    };
    $nav.classList.add('hidden');
    renderSession();
  }

  function quitSession() {
    session = null;
    go('home');
  }

  function renderSession() {
    var s = session;
    if (!s) return;
    if (s.showIntro) { renderIntro(); return; }
    if (s.showLab) { renderLab(); return; }
    if (s.idx >= s.queue.length) { finishSession(); return; }
    var item = s.queue[s.idx];
    var q = item.q;
    var progress = Math.round((s.idx / s.queue.length) * 100);
    var heartsHtml = s.hearts === Infinity ? '' :
      '<div class="hearts">❤️ ' + s.hearts + '</div>';
    var typeTag = { choice: '单选题', tf: '判断题', match: '配对题', order: '排序题', blank: '选词填空' }[q.type] || '题目';
    if (item.retry) typeTag += ' · 再来一次';

    /* 教-考闭环：新知识随题微教学（复习/每日挑战为回忆模式，不给拐杖） */
    var teachHtml = (q.teach && s.kind === 'lesson') ?
      '<div class="teach-box"><div class="teach-tag">📖 新知识 · 先看这个</div><div class="teach-body">' + esc(q.teach) + '</div></div>' : '';

    var html = '<div class="lesson-top"><button class="quit-btn" id="quit">✕</button>' +
      '<div class="progress-track"><div class="progress-fill" style="width:' + progress + '%"></div></div>' +
      heartsHtml + '</div><div class="q-area fade-in"><div class="q-type-tag">' + typeTag + '</div>' + teachHtml;

    if (q.type === 'choice' || q.type === 'tf' || q.type === 'blank') html += renderChoiceLike(q);
    else if (q.type === 'match') html += renderMatch(q);
    else if (q.type === 'order') html += renderOrder(q);
    html += '</div><div class="check-bar"><button class="btn btn-up" id="check" disabled>检查</button></div>';
    $app.innerHTML = html;
    document.getElementById('quit').onclick = function () {
      if (s.kind === 'lesson' && s.idx > 0) {
        if (!window.confirm('中途退出不保存本关进度，确定吗？')) return;
      }
      quitSession();
    };
    if (q.type === 'choice' || q.type === 'tf' || q.type === 'blank') bindChoiceLike(q);
    else if (q.type === 'match') bindMatch(q);
    else if (q.type === 'order') bindOrder(q);
    window.scrollTo(0, 0);
  }

  function renderIntro() {
    var s = session, intro = s.lesson.intro;
    $app.innerHTML = '<div class="lesson-top"><button class="quit-btn" id="quit">✕</button>' +
      '<div class="progress-track"><div class="progress-fill" style="width:0%"></div></div></div>' +
      '<div class="q-area fade-in"><div class="card intro-card">' +
      '<div class="intro-mascot">🦄</div><span class="intro-tag">知识卡片 · Bobby 开讲 ✦</span>' +
      '<div class="intro-title">' + esc(intro.title) + '</div>' +
      '<div class="intro-body">' + esc(intro.body) + '</div></div></div>' +
      '<div class="check-bar"><button class="btn btn-primary" id="check">懂了，开始答题</button></div>';
    document.getElementById('quit').onclick = quitSession;
    document.getElementById('check').onclick = function () {
      s.showIntro = false;
      renderSession();
    };
  }

  /* ---- 互动实验室 ---- */
  function renderLab() {
    var s = session, LK = window.LabKit;
    var meta = LK.meta(s.lesson.id);
    $app.innerHTML = '<div class="lesson-top"><button class="quit-btn" id="quit">✕</button>' +
      '<div class="progress-track"><div class="progress-fill" style="width:4%"></div></div></div>' +
      '<div class="q-area fade-in"><div class="lab-head">' +
      '<div class="q-type-tag">' + (meta.tag || '🧪 动手实验') + '</div>' +
      '<div class="lab-title">' + esc(meta.title) + '</div>' +
      '<div class="lab-goal">🎯 任务：' + esc(meta.goal) + '</div></div>' +
      '<div id="lab-mount"></div></div>' +
      '<div class="check-bar"><button class="btn btn-ghost" id="lab-skip">先跳过，直接答题</button></div>';
    document.getElementById('quit').onclick = quitSession;
    document.getElementById('lab-skip').onclick = function () {
      s.showLab = false;
      renderSession();
    };
    LK.render(s.lesson.id, document.getElementById('lab-mount'), function (conclusion) {
      if (!session || session !== s) return;
      s.xp += 15;
      save();
      sfx.win();
      var fb = document.createElement('div');
      fb.className = 'feedback ok';
      fb.innerHTML = '<div class="fb-title">🧪 实验成功！</div>' +
        '<div class="fb-expl">🦄 ' + esc(conclusion) + '</div>' +
        '<div class="fb-xp">+15 XP</div>' +
        '<button class="btn btn-up">带着结论去答题</button>';
      document.body.appendChild(fb);
      void fb.offsetHeight;
      fb.classList.add('show');
      var cb = document.querySelector('.check-bar');
      if (cb) cb.style.visibility = 'hidden';
      fb.querySelector('button').onclick = function () {
        fb.remove();
        s.showLab = false;
        renderSession();
      };
    });
    window.scrollTo(0, 0);
  }

  /* ---- 知识卡牌 ---- */
  function showCardPop(lessonId, then) {
    var LK = window.LabKit;
    var card = LK && LK.cardFor(lessonId);
    if (!card || state.cards.indexOf(lessonId) >= 0) { if (then) then(); return; }
    state.cards.push(lessonId);
    save();
    var pop = document.createElement('div');
    pop.className = 'badge-pop';
    pop.innerHTML = '<div class="badge-card"><div style="font-size:13px;font-weight:800;color:var(--text-2);margin-bottom:12px">🎁 掉落知识卡牌</div>' +
      '<div class="kcard rar-' + card.rarity + '"><div class="kcard-in">' +
      '<div class="kcard-emoji">' + card.emoji + '</div>' +
      '<div class="kcard-name">' + esc(card.name) + '</div>' +
      '<span class="kcard-rar rar-' + card.rarity + '">' + card.rarity + '</span>' +
      '<div class="kcard-text">' + esc(card.text) + '</div></div></div>' +
      '<button class="btn btn-primary" style="margin-top:16px">收下</button></div>';
    document.body.appendChild(pop);
    if (card.rarity === 'SSR') { confetti(); sfx.win(); } else { sfx.good(); }
    pop.querySelector('button').onclick = function () {
      pop.remove();
      if (then) then();
    };
  }

  /* ---- 单选 / 判断 / 填空 ---- */
  function renderChoiceLike(q) {
    var html = '';
    if (q.type === 'blank') {
      var parts = esc(q.prompt).split('____');
      html += '<div class="blank-sentence">' + parts.join('<span class="blank-hole" id="hole">？</span>') + '</div>';
    } else {
      html += '<div class="q-prompt">' + esc(q.prompt) + '</div>';
    }
    if (q.type === 'tf') {
      html += '<div class="opts opts-tf">' +
        '<button class="opt" data-i="1">✅ 对</button>' +
        '<button class="opt" data-i="0">❌ 错</button></div>';
    } else {
      html += '<div class="opts">';
      (q._shuffled = q._shuffled || shuffle(q.options.map(function (o, i) { return { o: o, i: i }; })));
      q._shuffled.forEach(function (x) {
        html += '<button class="opt" data-i="' + x.i + '">' + esc(x.o) + '</button>';
      });
      html += '</div>';
    }
    return html;
  }
  function bindChoiceLike(q) {
    var sel = null;
    var $check = document.getElementById('check');
    var opts = $app.querySelectorAll('.opt');
    opts.forEach(function (o) {
      o.addEventListener('click', function () {
        opts.forEach(function (x) { x.classList.remove('sel'); });
        o.classList.add('sel');
        sel = parseInt(o.dataset.i, 10);
        if (q.type === 'blank') {
          var hole = document.getElementById('hole');
          if (hole) { hole.textContent = q.options[sel]; hole.classList.add('filled'); }
        }
        $check.disabled = false;
      });
    });
    $check.onclick = function () {
      var correct = (q.type === 'tf') ? (sel === 1) === !!q.answerBool : sel === q.answerIndex;
      opts.forEach(function (o) {
        var i = parseInt(o.dataset.i, 10);
        var isRight = (q.type === 'tf') ? ((i === 1) === !!q.answerBool) : i === q.answerIndex;
        if (isRight) o.classList.add('good');
        else if (i === sel) o.classList.add('bad');
        else o.classList.add('dim');
      });
      var rightText = (q.type === 'tf') ? (q.answerBool ? '对' : '错') : q.options[q.answerIndex];
      settle(correct, rightText);
    };
  }

  /* ---- 配对 ---- */
  function renderMatch(q) {
    var lefts = shuffle(q.pairs.map(function (p, i) { return { t: p.left, i: i }; }));
    var rights = shuffle(q.pairs.map(function (p, i) { return { t: p.right, i: i }; }));
    q._lefts = lefts; q._rights = rights;
    var html = '<div class="q-prompt">' + esc(q.prompt) + '</div><div class="match-grid"><div class="match-col">';
    lefts.forEach(function (x, idx) { html += '<button class="opt m-left" data-i="' + x.i + '">' + esc(x.t) + '</button>'; });
    html += '</div><div class="match-col">';
    rights.forEach(function (x, idx) { html += '<button class="opt m-right" data-i="' + x.i + '">' + esc(x.t) + '</button>'; });
    html += '</div></div>';
    return html;
  }
  function bindMatch(q) {
    var selL = null, selR = null, matched = 0, mistakes = 0;
    var $check = document.getElementById('check');
    $check.style.display = 'none';
    function tryMatch() {
      if (selL == null || selR == null) return;
      var L = $app.querySelector('.m-left[data-i="' + selL + '"]');
      var R = $app.querySelector('.m-right[data-i="' + selR + '"]');
      if (selL === selR) {
        L.classList.remove('sel'); R.classList.remove('sel');
        L.classList.add('matched'); R.classList.add('matched');
        matched++;
        beep([760 + matched * 60], 0.08);
        if (matched === q.pairs.length) {
          setTimeout(function () {
            $check.style.display = '';
            settle(mistakes === 0, null, mistakes > 0 ? '有 ' + mistakes + ' 次配错，看看解析' : null);
          }, 350);
        }
      } else {
        mistakes++;
        L.classList.add('shake'); R.classList.add('shake');
        sfx.bad();
        setTimeout(function () {
          L.classList.remove('shake', 'sel'); R.classList.remove('shake', 'sel');
        }, 380);
      }
      selL = null; selR = null;
    }
    $app.querySelectorAll('.m-left').forEach(function (o) {
      o.addEventListener('click', function () {
        if (o.classList.contains('matched')) return;
        $app.querySelectorAll('.m-left').forEach(function (x) { x.classList.remove('sel'); });
        o.classList.add('sel'); selL = parseInt(o.dataset.i, 10); tryMatch();
      });
    });
    $app.querySelectorAll('.m-right').forEach(function (o) {
      o.addEventListener('click', function () {
        if (o.classList.contains('matched')) return;
        $app.querySelectorAll('.m-right').forEach(function (x) { x.classList.remove('sel'); });
        o.classList.add('sel'); selR = parseInt(o.dataset.i, 10); tryMatch();
      });
    });
  }

  /* ---- 排序 ---- */
  function renderOrder(q) {
    var bank = shuffle(q.items.map(function (t, i) { return { t: t, i: i }; }));
    q._bank = bank;
    var html = '<div class="q-prompt">' + esc(q.prompt) + '</div>' +
      '<div class="order-hint">按顺序点选，点错了可以点它撤回</div>' +
      '<div class="order-slots" id="slots"></div><div class="order-bank" id="bank">';
    bank.forEach(function (x) {
      html += '<button class="chip" data-i="' + x.i + '">' + esc(x.t) + '</button>';
    });
    html += '</div>';
    return html;
  }
  function bindOrder(q) {
    var placed = [];
    var $check = document.getElementById('check');
    var $slots = document.getElementById('slots');
    var $bank = document.getElementById('bank');
    function redraw() {
      $slots.innerHTML = '';
      placed.forEach(function (i, pos) {
        var b = document.createElement('button');
        b.className = 'chip in-slot';
        b.innerHTML = '<span class="chip-num">' + (pos + 1) + '</span>' + esc(q.items[i]);
        b.onclick = function () {
          placed.splice(pos, 1);
          $bank.querySelector('.chip[data-i="' + i + '"]').style.display = '';
          redraw();
        };
        $slots.appendChild(b);
      });
      $check.disabled = placed.length !== q.items.length;
    }
    $bank.querySelectorAll('.chip').forEach(function (c) {
      c.addEventListener('click', function () {
        placed.push(parseInt(c.dataset.i, 10));
        c.style.display = 'none';
        redraw();
      });
    });
    redraw();
    $check.onclick = function () {
      var correct = placed.every(function (v, i) { return v === i; });
      settle(correct, correct ? null : q.items.join(' → '));
    };
  }

  /* ---- 判定 & 反馈 ---- */
  function settle(correct, rightText, subNote) {
    var s = session, item = s.queue[s.idx], q = item.q;
    state.stats.answered++;
    if (correct) state.stats.correct++;

    var gained = 0;
    if (correct) {
      if (s.kind === 'lesson') gained = item.retry ? CFG.xpRetry : CFG.xpFirst;
      else if (s.kind === 'daily') gained = CFG.xpDaily;
      else gained = CFG.xpReview;
      s.xp += gained;
      if (!item.retry) s.firstCorrect++;
      if (s.kind === 'review') removeFromWrong(item.ref);
      sfx.good();
    } else {
      sfx.bad();
      if (!item.retry) {
        if (s.hearts !== Infinity) s.hearts--;
        addToWrong(item.ref);
        s.queue.push({ q: q, ref: item.ref, retry: true });
      }
    }
    save();

    var praise = ['答对了！', '漂亮！', '就是这样！', '稳！', '有点东西啊！'];
    var comfort = ['没事，记住它', '差一点点', '这个坑很多人踩', '错过一次就不会再错'];
    var fb = document.createElement('div');
    fb.className = 'feedback ' + (correct ? 'ok' : 'bad');
    fb.innerHTML = '<div class="fb-title">' + (correct ? '✅ ' + praise[Math.floor(Math.random() * praise.length)] : '❌ ' + comfort[Math.floor(Math.random() * comfort.length)]) + '</div>' +
      (!correct && rightText ? '<div class="fb-answer">正确答案：' + esc(rightText) + '</div>' : '') +
      (subNote ? '<div class="fb-answer">' + esc(subNote) + '</div>' : '') +
      '<div class="fb-expl">🦄 ' + esc(q.explanation) + '</div>' +
      (correct && gained ? '<div class="fb-xp">+' + gained + ' XP</div>' : '') +
      '<button class="btn ' + (correct ? 'btn-up' : 'btn-primary') + '">继续</button>';
    document.body.appendChild(fb);
    void fb.offsetHeight; /* 强制 reflow，确保过渡动画从屏幕外开始且不依赖 rAF */
    fb.classList.add('show');
    var cb = document.querySelector('.check-bar');
    if (cb) cb.style.visibility = 'hidden';
    var hEl = document.querySelector('.hearts');
    if (hEl && s.hearts !== Infinity) hEl.textContent = '❤️ ' + s.hearts;

    fb.querySelector('button').onclick = function () {
      fb.remove();
      if (s.hearts !== Infinity && s.hearts <= 0) { renderFail(); return; }
      s.idx++;
      renderSession();
    };
  }

  function addToWrong(ref) {
    state.everWrong = true;
    for (var i = 0; i < state.wrong.length; i++) {
      var w = state.wrong[i];
      if (w.id === ref.id && w.q === ref.q) { w.n++; save(); return; }
    }
    state.wrong.push({ id: ref.id, q: ref.q, n: 1 });
    save();
  }
  function removeFromWrong(ref) {
    state.wrong = state.wrong.filter(function (w) {
      return !(w.id === ref.id && w.q === ref.q);
    });
    save();
  }

  /* ---- 结算 ---- */
  function finishSession() {
    var s = session;
    if (s.kind === 'lesson') {
      var acc = s.firstCorrect / s.total;
      var stars = acc >= CFG.star3 ? 3 : acc >= CFG.star2 ? 2 : 1;
      var bonus = s.lesson.boss ? CFG.xpBossBonus : CFG.xpLessonBonus;
      s.xp += bonus;
      state.xp += s.xp;
      var prev = state.lessons[s.lesson.id];
      var firstClear = !prev;
      if (!prev || prev.stars < stars) state.lessons[s.lesson.id] = { stars: stars };
      if (s.lesson.boss && stars === 3 && state.badges.indexOf('boss100') < 0) state.badges.push('boss100');
      markActiveToday();
      save();
      var earned = grantBadges();
      confetti(); sfx.win();
      var accPct = Math.round(acc * 100);
      var mascotSay = stars === 3 ? '全对通关，Bobby 给你跪了' : stars === 2 ? '不错不错，错的都进错题本了' : '通关了！错题本里见';
      $app.innerHTML = '<div class="result-page fade-in"><span class="result-mascot">🦄</span>' +
        '<div class="result-title">' + (s.lesson.boss ? 'Boss 战胜利！' : '通关！') + '</div>' +
        '<div class="result-sub">' + esc(s.lesson.title) + ' · ' + mascotSay + '</div>' +
        '<div class="result-stars">' + '⭐'.repeat(stars) + '<span style="filter:grayscale(1);opacity:.3">' + '⭐'.repeat(3 - stars) + '</span></div>' +
        '<div class="result-stats">' +
        '<div class="rs-box"><div class="rs-num xp">+' + s.xp + '</div><div class="rs-label">获得 XP</div></div>' +
        '<div class="rs-box"><div class="rs-num acc">' + accPct + '%</div><div class="rs-label">首答正确率</div></div>' +
        '<div class="rs-box"><div class="rs-num" style="color:#FF9600">🔥' + state.streak + '</div><div class="rs-label">连胜天数</div></div>' +
        '</div><div class="result-actions"><button class="btn btn-primary" id="cont">继续</button></div></div>';
      var lid = s.lesson.id;
      document.getElementById('cont').onclick = function () {
        var after = function () { session = null; go('home'); };
        showBadgePopups(earned, firstClear ? function () { showCardPop(lid, after); } : after);
      };
    } else if (s.kind === 'daily') {
      state.xp += s.xp;
      state.daily = { date: todayStr(), done: true, score: s.firstCorrect };
      state.dailyTotal++;
      markActiveToday();
      save();
      var earned2 = grantBadges();
      confetti(); sfx.win();
      $app.innerHTML = '<div class="result-page fade-in"><span class="result-mascot">⚡</span>' +
        '<div class="result-title">每日挑战完成！</div>' +
        '<div class="result-sub">答对 ' + s.firstCorrect + ' / ' + s.total + ' · 连胜保住了</div>' +
        '<div class="result-stats">' +
        '<div class="rs-box"><div class="rs-num xp">+' + s.xp + '</div><div class="rs-label">获得 XP</div></div>' +
        '<div class="rs-box"><div class="rs-num" style="color:#FF9600">🔥' + state.streak + '</div><div class="rs-label">连胜天数</div></div>' +
        '</div><div class="result-actions"><button class="btn btn-primary" id="cont">继续</button></div></div>';
      document.getElementById('cont').onclick = function () {
        showBadgePopups(earned2, function () { session = null; go('daily'); });
      };
    } else {
      state.xp += s.xp;
      save();
      var earned3 = grantBadges();
      sfx.win();
      $app.innerHTML = '<div class="result-page fade-in"><span class="result-mascot">📕</span>' +
        '<div class="result-title">复习完成！</div>' +
        '<div class="result-sub">答对 ' + s.firstCorrect + ' / ' + s.total + ' · 答对的已移出错题本</div>' +
        '<div class="result-stats">' +
        '<div class="rs-box"><div class="rs-num xp">+' + s.xp + '</div><div class="rs-label">获得 XP</div></div>' +
        '<div class="rs-box"><div class="rs-num acc">' + state.wrong.length + '</div><div class="rs-label">剩余错题</div></div>' +
        '</div><div class="result-actions"><button class="btn btn-primary" id="cont">继续</button></div></div>';
      document.getElementById('cont').onclick = function () {
        showBadgePopups(earned3, function () { session = null; go('review'); });
      };
    }
  }

  function renderFail() {
    var s = session;
    $app.innerHTML = '<div class="result-page fade-in"><span class="result-mascot" style="animation:none">😵‍💫</span>' +
      '<div class="result-title">心碎了一地…</div>' +
      '<div class="result-sub">别慌，巴菲特也不是一天练成的。<br>错的题都记进错题本了，再来一次就熟了。</div>' +
      '<div class="result-actions">' +
      '<button class="btn btn-primary" id="retry">再挑战一次</button>' +
      '<button class="btn btn-ghost" id="back">回地图</button></div></div>';
    var lid = s.lesson.id;
    document.getElementById('retry').onclick = function () { startLesson(lid); };
    document.getElementById('back').onclick = quitSession;
  }

  /* ================= 每日挑战 ================= */
  function unlockedQuestionPool() {
    var flat = allLessons(), pool = [];
    flat.forEach(function (x, i) {
      if (lessonDone(x.lesson.id)) {
        x.lesson.questions.forEach(function (q, qi) {
          pool.push({ q: q, ref: { id: x.lesson.id, q: qi } });
        });
      }
    });
    if (!pool.length) {
      var first = flat[0];
      first.lesson.questions.forEach(function (q, qi) {
        pool.push({ q: q, ref: { id: first.lesson.id, q: qi } });
      });
    }
    return pool;
  }

  function renderDaily() {
    refreshStreak();
    var doneToday = state.daily.date === todayStr() && state.daily.done;
    var html = topbar() + '<div class="page fade-in">' +
      '<div class="page-title">⚡ 每日挑战</div>' +
      '<div class="page-sub">每天 5 道混合题，从你学过的关卡里随机抽。完成即点亮今日连胜 🔥</div>';
    if (doneToday) {
      html += '<div class="card hero-card"><div class="hero-emoji">✅</div>' +
        '<div class="hero-title">今天已完成</div>' +
        '<div class="hero-sub">答对 ' + state.daily.score + ' / ' + CFG.dailyCount + ' · 明天再来，连胜等你续</div>' +
        '<button class="btn btn-ghost" id="go-map">去学新关卡</button></div>';
    } else {
      html += '<div class="card hero-card"><div class="hero-emoji">⚡</div>' +
        '<div class="hero-title">今日挑战待完成</div>' +
        '<div class="hero-sub">' + (streakLitToday() ? '今日连胜已点亮，挑战纯赚 XP' : '完成挑战即可点亮今日 🔥') + '</div>' +
        '<button class="btn btn-primary" id="start-daily">开始挑战</button></div>';
    }
    html += '</div>';
    $app.innerHTML = html;
    var sd = document.getElementById('start-daily');
    if (sd) sd.onclick = function () {
      var pool = shuffle(unlockedQuestionPool()).slice(0, CFG.dailyCount);
      startQuiz('daily', pool);
    };
    var gm = document.getElementById('go-map');
    if (gm) gm.onclick = function () { go('home'); };
  }

  /* ================= 错题本 ================= */
  function renderReview() {
    var html = topbar() + '<div class="page fade-in"><div class="page-title">📕 错题本</div>';
    if (!state.wrong.length) {
      html += '<div class="empty"><div class="e-emoji">🎉</div><div class="e-text">错题本空空如也<br>' + (state.everWrong ? '全部清干净了，清道夫就是你' : '目前还没有错题，去闯关吧') + '</div></div></div>';
      $app.innerHTML = html;
      return;
    }
    html += '<div class="page-sub">答错的题都在这，复习答对就移出。趁热打铁，别让它们过夜。</div>' +
      '<button class="btn btn-primary" id="start-review" style="margin-bottom:6px">开始复习（' + Math.min(state.wrong.length, CFG.reviewCount) + ' 题）</button>';
    var byUnit = {};
    state.wrong.forEach(function (w) {
      var e = lessonById(w.id);
      if (!e) return;
      (byUnit[e.ui] = byUnit[e.ui] || []).push(w);
    });
    Object.keys(byUnit).map(Number).sort(function (a, b) { return a - b; }).forEach(function (ui) {
      var u = DATA.units[ui];
      if (!u) return;
      html += '<div class="wrong-group"><div class="wrong-unit-title">' + u.emoji + ' ' + esc(u.title) + '</div>';
      byUnit[ui].forEach(function (w) {
        var q = questionByRef(w);
        if (!q) return;
        html += '<div class="card wrong-item"><span class="w-ico">❌</span><span class="w-text">' + esc(q.prompt) + '</span><span class="w-count">错 ' + w.n + ' 次</span></div>';
      });
      html += '</div>';
    });
    html += '</div>';
    $app.innerHTML = html;
    document.getElementById('start-review').onclick = function () {
      var items = shuffle(state.wrong).slice(0, CFG.reviewCount).map(function (w) {
        return { q: questionByRef(w), ref: { id: w.id, q: w.q } };
      }).filter(function (x) { return x.q; });
      startQuiz('review', items);
    };
  }

  /* ================= 我的 ================= */
  function renderProfile() {
    refreshStreak();
    var t = currentTitle(), nt = nextTitle();
    var acc = state.stats.answered ? Math.round(state.stats.correct / state.stats.answered * 100) : 0;
    var doneLessons = Object.keys(state.lessons).length;
    var totalLessons = allLessons().length;
    var html = topbar() + '<div class="page fade-in">' +
      '<div class="card profile-head"><div class="avatar">' + t.emoji + '</div><div>' +
      '<div class="p-name">美股练习生</div>' +
      '<div class="p-title">' + t.emoji + ' ' + esc(t.name) + '</div>' +
      (nt ? '<div class="p-next">还差 ' + (nt.xp - state.xp) + ' XP 晋升「' + esc(nt.name) + '」</div>' : '<div class="p-next">已达最高称号 👑</div>') +
      '</div></div>' +
      '<div class="stats-grid">' +
      '<div class="stat-box"><div class="s-num" style="color:#FF9600">🔥' + state.streak + '</div><div class="s-label">连胜天数</div></div>' +
      '<div class="stat-box"><div class="s-num" style="color:var(--brand)">💎' + state.xp + '</div><div class="s-label">总 XP</div></div>' +
      '<div class="stat-box"><div class="s-num">' + doneLessons + '/' + totalLessons + '</div><div class="s-label">已通关卡</div></div>' +
      '<div class="stat-box"><div class="s-num" style="color:var(--up)">' + acc + '%</div><div class="s-label">总正确率</div></div>' +
      '</div>';

    /* 股票世界杯选出的本命股票 */
    var fav = null;
    try { fav = JSON.parse(localStorage.getItem('bullcamp_fav_stock') || 'null'); } catch (e) {}
    if (fav && fav.t) {
      html += '<div class="card fav-stock"><span class="fav-emoji">' + esc(fav.e || '⭐') + '</span>' +
        '<div class="fav-info"><div class="fav-name">本命股票 · ' + esc(fav.n) + '</div>' +
        '<div class="fav-tip">股票世界杯连赢三轮的冠军 🏆</div></div>' +
        '<span class="cup-ticker">' + esc(fav.t) + '</span></div>';
    }

    html += '<div class="card" style="padding:15px 17px"><div style="font-size:14px;font-weight:800">📅 最近 14 天</div><div class="cal-strip">';
    for (var i = 13; i >= 0; i--) {
      var ds = todayStr(-i);
      var lit = !!state.history[ds];
      html += '<div class="cal-day"><div class="cal-dot' + (lit ? ' lit' : '') + '">' + (lit ? '🔥' : '') + '</div><div class="cal-label">' + ds.slice(8) + '</div></div>';
    }
    html += '</div></div>';

    var LK = window.LabKit;
    if (LK) {
      var dexTotal = 0, dexHtml = '';
      allLessons().forEach(function (x) {
        var card = LK.cardFor(x.lesson.id);
        if (!card) return;
        dexTotal++;
        var owned = state.cards.indexOf(x.lesson.id) >= 0;
        dexHtml += '<div class="dex-cell rar-' + card.rarity + (owned ? '' : ' off') + '"><div class="dex-in">' +
          '<div class="dex-emoji">' + (owned ? card.emoji : '❔') + '</div>' +
          '<div class="dex-name">' + (owned ? esc(card.name) : '？？？') + '</div>' +
          '<div class="dex-rar">' + card.rarity + '</div></div></div>';
      });
      html += '<div class="section-title">🎴 知识卡牌图鉴（' + state.cards.length + '/' + dexTotal + '）</div><div class="dex-grid">' + dexHtml + '</div>';
    }

    html += '<div class="section-title">🏅 徽章墙（' + state.badges.length + '/' + BADGES.length + '）</div><div class="badges-grid">';
    BADGES.forEach(function (b) {
      var got = state.badges.indexOf(b.id) >= 0;
      html += '<div class="badge-cell' + (got ? '' : ' off') + '"><div class="b-emoji">' + b.emoji + '</div><div class="b-name">' + esc(b.name) + '</div></div>';
    });
    html += '</div>';

    html += '<div class="section-title">⚙️ 设置</div>' +
      '<div class="card toggle-row"><span>音效</span><div class="switch' + (state.sound ? ' on' : '') + '" id="snd"></div></div>' +
      '<button class="danger-btn" id="reset">清空进度重新开始</button></div>';
    $app.innerHTML = html;
    document.getElementById('snd').onclick = function () {
      state.sound = !state.sound; save(); renderProfile();
    };
    document.getElementById('reset').onclick = function () {
      if (window.confirm('确定清空所有进度、XP 和连胜吗？此操作不可恢复。')) {
        localStorage.removeItem(KEY);
        state = defaults();
        go('home');
      }
    };
  }

  /* ================= 启动 ================= */
  refreshStreak();
  go('home');
})();
