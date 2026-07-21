/* ============ 互动实验室 LabKit + 知识卡牌 ============ */
(function () {
  'use strict';

  /* ---------- 卡牌图鉴：每关首通掉落 ---------- */
  var CARDS = {
    u1l1: { name: '股票', emoji: '🧾', rarity: 'N', text: '公司所有权的碎片，买了就是股东。' },
    u1l2: { name: '市值', emoji: '💰', rarity: 'R', text: '股价×总股本，比公司大小看它不看股价。' },
    u1l3: { name: '标普500', emoji: '🏆', rarity: 'R', text: '500家大公司，"大盘涨了"多半说它。' },
    u1l4: { name: '新手村毕业证', emoji: '🎓', rarity: 'SSR', text: '股票=所有权，价格=预期，指数=一篮子。' },
    u2l1: { name: '交易所双雄', emoji: '🏛️', rarity: 'R', text: '纽交所1792老钱风，纳斯达克1971全电子。' },
    u2l2: { name: 'T+0', emoji: '⏰', rarity: 'R', text: '美股当日可买卖，个股没有涨跌停。' },
    u2l3: { name: '盘前盘后', emoji: '🌙', rarity: 'SR', text: '人少、点差大、波动猛，财报都在盘外发。' },
    u2l4: { name: '熔断', emoji: '🚦', rarity: 'R', text: '标普跌7%/13%各停15分钟，20%当日休市。' },
    u2l5: { name: '市场活地图', emoji: '🗺️', rarity: 'SSR', text: '几点开门、去哪交易、何时熔断，全通了。' },
    u3l1: { name: '限价单', emoji: '🎯', rarity: 'SR', text: '保价格不保成交；市价单正好反过来。' },
    u3l2: { name: '点差', emoji: '👀', rarity: 'SR', text: '买一卖一之间的缝，是看不见的成本。' },
    u3l3: { name: '碎股', emoji: '🍰', rarity: 'N', text: '0.01股也能买，一杯奶茶钱就能上车。' },
    u3l4: { name: '止损单', emoji: '🛡️', rarity: 'R', text: '触发后变市价单，跳空时可能滑过设定价。' },
    u3l5: { name: '下单老司机证', emoji: '🚗', rarity: 'SSR', text: '会挂单、懂点差、设止损，稳。' },
    u4l1: { name: 'K线', emoji: '🕯️', rarity: 'SR', text: '开高低收一根线，美股绿涨红跌。' },
    u4l2: { name: '成交量', emoji: '📊', rarity: 'R', text: '价格要结合量看才有意义。' },
    u4l3: { name: '市盈率PE', emoji: '🔍', rarity: 'R', text: '股价÷每股收益≈按当前盈利回本几年。' },
    u4l4: { name: '财报季', emoji: '📅', rarity: 'R', text: '看营收、EPS、指引，比的是预期。' },
    u4l5: { name: '行情阅读者证', emoji: '📖', rarity: 'SSR', text: 'K线、量、估值、财报，都能看懂了。' },
    u5l1: { name: '杠杆', emoji: '⚡', rarity: 'SR', text: '借钱放大一切：2倍杠杆跌50%就归零。' },
    u5l2: { name: 'Margin Call', emoji: '📞', rarity: 'SR', text: '净值跌破维持线：要么补钱，要么被强平。' },
    u5l3: { name: '杠杆ETF', emoji: '🎢', rarity: 'R', text: '3倍指的是"当日"涨跌幅，不是长期。' },
    u5l4: { name: '波动损耗', emoji: '🕳️', rarity: 'SSR', text: '+10%再-10%≠回原点，3倍ETF在震荡中融化。' },
    u5l5: { name: '做空', emoji: '📉', rarity: 'R', text: '先借后卖赚差价，亏损理论上无上限。' },
    u5l6: { name: '杠杆驯兽师证', emoji: '🦁', rarity: 'SSR', text: '懂杠杆、会算磨损、敬畏爆仓。' },
    u9l1: { name: '赚钱机器', emoji: '🏭', rarity: 'SR', text: '股票=公司未来赚钱能力的一小份。' },
    u9l2: { name: '股权融资', emoji: '🤝', rarity: 'R', text: '卖股份换钱不用还，投资人共担风险。' },
    u9l3: { name: '二级市场', emoji: '🔁', rarity: 'SR', text: '你买股票的钱给了上家股民，不进公司。' },
    u9l4: { name: '回购', emoji: '♻️', rarity: 'R', text: '公司买回股票注销，每股含金量变高。' },
    u9l5: { name: '金融基础毕业证', emoji: '💸', rarity: 'SSR', text: '本质、融资、一二级、分红回购全通。' },
    u10l1: { name: '价格与价值', emoji: '🏷️', rarity: 'R', text: '贵贱看价格vs赚钱能力，不看标签数字。' },
    u10l2: { name: 'PE温度计', emoji: '🌡️', rarity: 'SR', text: '市场为1元利润出的价，也是情绪温度。' },
    u10l3: { name: '三把尺子', emoji: '📏', rarity: 'R', text: '有利润PE、没利润PS、重资产PB。' },
    u10l4: { name: '盈利收益率', emoji: '⚓', rarity: 'SR', text: '1÷PE，和存款利率比贵贱的桥梁。' },
    u10l5: { name: '估值师执照', emoji: '⚖️', rarity: 'SSR', text: '称重定价、三把尺子、三种锚全掌握。' },
    u7l1: { name: '恒生指数', emoji: '🏮', rarity: 'R', text: '港股大盘代表，腾讯美团小米都在里面。' },
    u7l2: { name: '午休', emoji: '🍱', rarity: 'R', text: '12:00-13:00 全港停止交易，美股没有。' },
    u7l3: { name: '一手', emoji: '✋', rarity: 'SR', text: '港股按手买，一手几股每家公司自己定。' },
    u7l4: { name: '印花税', emoji: '🧾', rarity: 'SR', text: '港股买卖双向各收 0.1%，美股没有这项。' },
    u7l5: { name: '港股通行证', emoji: '🇭🇰', rarity: 'SSR', text: '零时差、有午休、按手买，港股规则全通。' },
    u8l1: { name: 'TQQQ', emoji: '🚀', rarity: 'R', text: '纳指100当日3倍，Ultra/Bull 是杠杆暗号。' },
    u8l2: { name: '反向ETF', emoji: '🙃', rarity: 'R', text: 'SQQQ 指数跌它涨，同样每日重置照样磨损。' },
    u8l3: { name: '仓位纪律', emoji: '🧯', rarity: 'SR', text: '短线、小仓位、设止损，费率是QQQ的4倍。' },
    u8l4: { name: '回本数学', emoji: '📉', rarity: 'SSR', text: '2022纳指-33%时TQQQ-79%，回本要+376%。' },
    u8l5: { name: '杠杆ETF驾照', emoji: '🪪', rarity: 'SSR', text: '会选、会空、懂纪律、记得2022。' },
    u6l1: { name: 'FOMO', emoji: '🔥', rarity: 'R', text: '害怕错过是追高的开始，人多的地方别去。' },
    u6l2: { name: '分散', emoji: '🧺', rarity: 'R', text: '鸡蛋别放一个篮子，永远留点现金。' },
    u6l3: { name: '杀猪盘', emoji: '🐷', rarity: 'SR', text: '"保本高收益"四个字出现=诈骗。' },
    u6l4: { name: '复利', emoji: '⏳', rarity: 'SSR', text: '72÷年化≈翻倍年数，时间是最大的杠杆。' },
    u6l5: { name: '毕业证书', emoji: '👑', rarity: 'SSR', text: '韭菜防身术满级，市场见。' }
  };

  var LABS = {
    u1l2: { type: 'stockcup', title: '股票世界杯', goal: '滑动卡片 2 选 1，选出你的本命股票', tag: '🎮 互动小游戏' },
    u2l3: { type: 'session', title: '下单时钟', goal: '拨动时钟，在盘前/盘中/休市各下一次单' },
    u3l2: { type: 'orderbook', title: '点差实验室', goal: '市价买一次、限价挂一次，再去冷门股踩个坑' },
    u4l1: { type: 'candle', title: '捏一根K线', goal: '完成 3 个捏K线小任务' },
    u5l2: { type: 'leverage', title: '爆仓模拟器', goal: '把模拟盘玩到爆仓（这里爆仓不花钱）' },
    u5l4: { type: 'decay', title: '磨损制造机', goal: '亲手让 3倍ETF 比标的多亏 8 个百分点' },
    u6l4: { type: 'compound', title: '复利时光机', goal: '只用调滑杆，让 1 万块变成 4 万块' },
    u10l2: { type: 'pevalue', title: '奶茶店估值器', goal: '完成三次定价：常温、发烧、遇冷' },
    u7l2: { type: 'hksession', title: '港股下单时钟', goal: '在早市/午市、午休、收市后各下一次单' },
    u8l4: { type: 'replay2022', title: '2022熊市回放机', goal: '按完四个季度，看看拿一年 TQQQ 会怎样' }
  };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function el(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.firstElementChild ? d : d;
  }
  function fmtPct(x) { return (x >= 0 ? '+' : '') + (x * 100).toFixed(1) + '%'; }
  function fmtMoney(x) { return Math.round(x).toLocaleString('zh-CN'); }

  /* ---------- 折线画布 ---------- */
  function drawLines(canvas, series, colors, base) {
    var ctx = canvas.getContext('2d');
    var W = canvas.width, H = canvas.height, PAD = 8;
    ctx.clearRect(0, 0, W, H);
    var all = [];
    series.forEach(function (s) { all = all.concat(s); });
    var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all);
    if (mx - mn < 1e-6) { mx = mn + 1; }
    function X(i, n) { return PAD + (W - 2 * PAD) * (n <= 1 ? 0 : i / (n - 1)); }
    function Y(v) { return H - PAD - (H - 2 * PAD) * ((v - mn) / (mx - mn)); }
    if (base != null && base >= mn && base <= mx) {
      ctx.strokeStyle = 'rgba(128,128,160,.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath(); ctx.moveTo(PAD, Y(base)); ctx.lineTo(W - PAD, Y(base)); ctx.stroke();
      ctx.setLineDash([]);
    }
    series.forEach(function (s, si) {
      ctx.strokeStyle = colors[si];
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      s.forEach(function (v, i) {
        var x = X(i, s.length), y = Y(v);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      var lx = X(s.length - 1, s.length), ly = Y(s[s.length - 1]);
      ctx.fillStyle = colors[si];
      ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, 7); ctx.fill();
    });
  }

  /* ============ 各实验引擎 ============ */
  var ENGINES = {};

  /* ---- 股票世界杯：滑卡 2 选 1，选出本命股票 ---- */
  ENGINES.stockcup = function (mount, done) {
    var STOCKS = [
      { t: 'AAPL', n: '苹果', e: '🍎', d: 'iPhone在手，全球最会赚钱的公司之一' },
      { t: 'TSLA', n: '特斯拉', e: '🚗', d: '电动车顶流，马斯克的情绪过山车' },
      { t: 'NVDA', n: '英伟达', e: '🎮', d: 'AI淘金热里那个卖铲子的' },
      { t: 'MCD', n: '麦当劳', e: '🍟', d: '卖汉堡是副业，全球收租才是主业' },
      { t: 'KO', n: '可口可乐', e: '🥤', d: '巴菲特一拿就是三十多年' },
      { t: 'DIS', n: '迪士尼', e: '🏰', d: '米老鼠+漫威+星战，快乐印钞机' },
      { t: 'SBUX', n: '星巴克', e: '☕', d: '打工人的续命水，一杯杯喝出来的市值' },
      { t: 'NKE', n: '耐克', e: '👟', d: 'Just Do It，一个对钩卖遍全球' }
    ];
    var pool = STOCKS.slice();
    for (var si = pool.length - 1; si > 0; si--) {
      var sj = Math.floor(Math.random() * (si + 1));
      var sw = pool[si]; pool[si] = pool[sj]; pool[sj] = sw;
    }
    var ROUNDS = [
      { name: '⚔️ 八强赛', hint: '👆 点击 或 滑走你更喜欢的那张卡' },
      { name: '🔥 半决赛', hint: '越来越难选了吧？跟着感觉走' },
      { name: '🏆 总决赛', hint: '最后一战，选出你的唯一' }
    ];
    var round = 0, match = 0, cur = pool, winners = [], busy = false;

    mount.innerHTML =
      '<div class="lab-stage cup-stage">' +
      '<div class="cup-top"><span class="cup-round" id="cup-round"></span><span class="cup-count" id="cup-count"></span></div>' +
      '<div class="cup-adv" id="cup-adv"></div>' +
      '<div class="cup-arena" id="cup-arena"></div>' +
      '<div class="cup-hint" id="cup-hint"></div></div>';
    var $ = function (s) { return mount.querySelector(s); };

    function cardHtml(s, side) {
      return '<div class="cup-card enter-' + side + '">' +
        '<div class="cup-stamp">晋级 ✓</div>' +
        '<div class="cup-emoji">' + s.e + '</div>' +
        '<div class="cup-name">' + esc(s.n) + '</div>' +
        '<div class="cup-ticker">' + esc(s.t) + '</div>' +
        '<div class="cup-desc">' + esc(s.d) + '</div></div>';
    }

    function paintMeta() {
      $('#cup-round').textContent = ROUNDS[round].name;
      $('#cup-count').textContent = '第 ' + Math.min(match + 1, cur.length / 2) + '/' + (cur.length / 2) + ' 场';
      $('#cup-hint').textContent = ROUNDS[round].hint;
      var seats = cur.length / 2, html = '';
      for (var i = 0; i < seats; i++) {
        html += '<span class="cup-seat' + (winners[i] ? ' filled' : '') + '">' + (winners[i] ? winners[i].e : '') + '</span>';
      }
      $('#cup-adv').innerHTML = html;
    }

    function renderMatch() {
      busy = false;
      var a = cur[match * 2], b = cur[match * 2 + 1];
      paintMeta();
      var arena = $('#cup-arena');
      arena.innerHTML = cardHtml(a, 'l') + '<div class="cup-vs">VS</div>' + cardHtml(b, 'r');
      var cards = arena.querySelectorAll('.cup-card');
      bindCard(cards[0], a, cards[1], 'l');
      bindCard(cards[1], b, cards[0], 'r');
    }

    function bindCard(el, stock, rival, side) {
      var sx = 0, sy = 0, dx = 0, dy = 0, dragging = false;
      el.addEventListener('pointerdown', function (ev) {
        if (busy) return;
        dragging = true; sx = ev.clientX; sy = ev.clientY; dx = dy = 0;
        el.classList.remove('enter-l', 'enter-r');
        el.classList.add('dragging');
        try { el.setPointerCapture(ev.pointerId); } catch (e) {}
      });
      el.addEventListener('pointermove', function (ev) {
        if (!dragging || busy) return;
        dx = ev.clientX - sx; dy = ev.clientY - sy;
        el.style.transform = 'translate(' + dx + 'px,' + dy * 0.5 + 'px) rotate(' + dx * 0.07 + 'deg)';
      });
      function release() {
        if (!dragging) return;
        dragging = false;
        el.classList.remove('dragging');
        var dist = Math.sqrt(dx * dx + dy * dy);
        /* 甩出超过阈值 = 选它；几乎没动 = 点选；中间量 = 弹回 */
        if (!busy && (dist >= 56 || dist < 8)) pick(el, stock, rival, side);
        else el.style.transform = '';
      }
      el.addEventListener('pointerup', release);
      el.addEventListener('pointercancel', function () {
        dragging = false;
        el.classList.remove('dragging');
        el.style.transform = '';
      });
    }

    function pick(el, stock, rival, side) {
      busy = true;
      el.style.transform = '';
      el.classList.add('win');
      rival.classList.add('lose', side === 'l' ? 'right' : 'left');
      winners.push(stock);
      paintMeta();
      setTimeout(function () {
        match++;
        if (match * 2 >= cur.length) {
          cur = winners; winners = []; match = 0; round++;
          if (cur.length === 1) { crown(cur[0]); return; }
        }
        renderMatch();
      }, 820);
    }

    function burst() {
      var colors = ['#6F00FF', '#A050FF', '#F9F339', '#00B578', '#7C9CFD', '#FF4B4B'];
      for (var k = 0; k < 44; k++) {
        var c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = Math.random() * 100 + 'vw';
        var sz = 6 + Math.random() * 7;
        c.style.width = sz + 'px';
        c.style.height = sz * (0.5 + Math.random()) + 'px';
        c.style.background = colors[k % colors.length];
        c.style.animationDuration = (1.3 + Math.random() * 1.5) + 's';
        c.style.animationDelay = Math.random() * 0.25 + 's';
        document.body.appendChild(c);
        (function (n) { setTimeout(function () { n.remove(); }, 3200); })(c);
      }
    }

    function crown(champ) {
      try { localStorage.setItem('bullcamp_fav_stock', JSON.stringify({ t: champ.t, n: champ.n, e: champ.e })); } catch (e) {}
      mount.querySelector('.cup-stage').innerHTML =
        '<div class="cup-final">' +
        '<div class="cup-crown">👑</div>' +
        '<div class="kcard rar-SSR"><div class="kcard-in">' +
        '<div class="cup-emoji" style="font-size:56px">' + champ.e + '</div>' +
        '<div class="kcard-name">' + esc(champ.n) + '</div>' +
        '<span class="cup-ticker">' + esc(champ.t) + '</span>' +
        '<div class="kcard-text">' + esc(champ.d) + '</div></div></div>' +
        '<div class="cup-final-t">🏆 你的本命股票诞生！</div>' +
        '<div class="cup-final-sub">连赢三轮的冠军：' + esc(champ.n) + '（' + esc(champ.t) + '）<br>已收进「我的」页，随时能回去看它</div>' +
        '<button class="lab-btn hot cup-done" id="cup-done">🎉 就是它了！</button></div>';
      burst();
      $('#cup-done').addEventListener('click', function () {
        done('本命股票选好了：' + champ.n + '，代码 ' + champ.t + '。美股下单认代码不认名字——像 ' + champ.t + ' 这样的字母组合，就是公司在市场里的身份证。接下来这关就来搞清楚：你的本命股为什么天天上蹿下跳。');
      });
    }

    renderMatch();
  };

  /* ---- 磨损制造机 ---- */
  ENGINES.decay = function (mount, done) {
    var base = 100, etf = 100, hb = [100], he = [100], finished = false, mooned = false;
    mount.innerHTML =
      '<div class="lab-stage"><canvas class="lab-canvas" width="640" height="240"></canvas>' +
      '<div class="lab-legend"><span><i style="background:#7C9CFD"></i>标的指数</span><span><i style="background:#A050FF"></i>3倍杠杆ETF</span></div>' +
      '<div class="lab-stats"><div class="lab-stat"><b id="lb-b">100.0</b><span>标的 <em id="lb-bp">+0.0%</em></span></div>' +
      '<div class="lab-stat"><b id="lb-e">100.0</b><span>3倍ETF <em id="lb-ep">+0.0%</em></span></div>' +
      '<div class="lab-stat"><b id="lb-d" style="color:var(--down)">0.0</b><span>被磨掉的差距(pp)</span></div></div>' +
      '<div class="lab-note" id="lb-note">试试下面的按钮，注意两条线的关系 👇</div>' +
      '<div class="lab-btns"><button class="lab-btn" data-a="up">📈 涨10%</button><button class="lab-btn" data-a="down">📉 跌10%</button><button class="lab-btn hot" data-a="chop">🌊 震荡4天</button><button class="lab-btn ghost" data-a="reset">↺ 重来</button></div></div>';
    var cv = mount.querySelector('canvas');
    function paint() {
      drawLines(cv, [hb, he], ['#7C9CFD', '#A050FF'], 100);
      var bp = base / 100 - 1, ep = etf / 100 - 1, diff = (bp - ep) * 100;
      mount.querySelector('#lb-b').textContent = base.toFixed(1);
      mount.querySelector('#lb-e').textContent = etf.toFixed(1);
      mount.querySelector('#lb-bp').textContent = fmtPct(bp);
      mount.querySelector('#lb-ep').textContent = fmtPct(ep);
      mount.querySelector('#lb-d').textContent = diff.toFixed(1);
      var note = mount.querySelector('#lb-note');
      if (!finished && !mooned && bp > 0.2 && ep > 3 * bp) {
        mooned = true;
        note.textContent = '🧐 有意思：单边上涨时它居然不止3倍（复利同向）！但先别高兴，试试"震荡4天"…';
      }
      if (!finished && diff >= 8) {
        finished = true;
        done('你亲手做出了磨损！同一段行情：标的 ' + fmtPct(bp) + '，3倍ETF 却是 ' + fmtPct(ep) + '，凭空少了 ' + diff.toFixed(1) + ' 个百分点。每日重置的杠杆在震荡里反复"追涨杀跌"，把自己磨没了——单边趋势它很爽，横盘震荡它融化。所以它是短线工具，不是存钱罐。');
      }
    }
    function day(r) { base *= (1 + r); etf *= (1 + 3 * r); hb.push(base); he.push(etf); }
    mount.querySelectorAll('.lab-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        var a = b.dataset.a;
        if (a === 'up') day(0.10);
        else if (a === 'down') day(-0.10);
        else if (a === 'chop') {
          var signs = [0.10, -0.10, 0.10, -0.10];
          for (var i = signs.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = signs[i]; signs[i] = signs[j]; signs[j] = t; }
          signs.forEach(day);
        } else { base = 100; etf = 100; hb = [100]; he = [100]; }
        paint();
      });
    });
    paint();
  };

  /* ---- 爆仓模拟器 ---- */
  ENGINES.leverage = function (mount, done) {
    var lev = 0, equity = 10000, noLev = 10000, day = 0, dead = false;
    mount.innerHTML =
      '<div class="lab-stage"><div class="lab-note" id="lv-note">第一步：选一个杠杆倍数（想体验爆仓建议胆子大点）</div>' +
      '<div class="lab-btns" id="lv-pick"><button class="lab-btn" data-l="1">1倍(不借钱)</button><button class="lab-btn" data-l="2">2倍</button><button class="lab-btn hot" data-l="5">5倍</button></div>' +
      '<div id="lv-game" style="display:none">' +
      '<div class="lab-meter"><div class="lab-meter-fill" id="lv-fill" style="width:100%"></div><div class="lab-meter-line" style="left:30%"></div></div>' +
      '<div class="lab-meter-cap"><span>💀 强平线 ¥3,000（维持保证金）</span><span id="lv-day">第 0 天</span></div>' +
      '<div class="lab-stats"><div class="lab-stat"><b id="lv-eq">¥10,000</b><span>你的净值(<em id="lv-lev"></em>)</span></div>' +
      '<div class="lab-stat"><b id="lv-nl">¥10,000</b><span>不加杠杆的平行宇宙</span></div>' +
      '<div class="lab-stat"><b id="lv-mv">—</b><span>今日标的涨跌</span></div></div>' +
      '<div class="lab-btns"><button class="lab-btn hot" id="lv-go">⏭ 过一天</button><button class="lab-btn ghost" id="lv-re">↺ 重开一局</button></div></div></div>';
    var $ = function (s) { return mount.querySelector(s); };
    mount.querySelectorAll('#lv-pick .lab-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        lev = parseInt(b.dataset.l, 10);
        $('#lv-pick').style.display = 'none';
        $('#lv-game').style.display = '';
        $('#lv-lev').textContent = lev + '倍';
        $('#lv-note').textContent = lev === 1 ? '1倍老实人是很难爆仓的…要不重开选个5倍？' : '本金1万，' + lev + '倍杠杆 = 操作 ' + lev + ' 万的仓位。开始过日子吧。';
      });
    });
    $('#lv-re').addEventListener('click', function () {
      lev = 0; equity = 10000; noLev = 10000; day = 0; dead = false;
      $('#lv-pick').style.display = ''; $('#lv-game').style.display = 'none';
      $('#lv-note').textContent = '第一步：选一个杠杆倍数（想体验爆仓建议胆子大点）';
    });
    $('#lv-go').addEventListener('click', function () {
      if (dead || !lev) return;
      day++;
      var r = (0.02 + Math.random() * 0.06) * (Math.random() < 0.5 ? -1 : 1);
      equity = equity * (1 + lev * r);
      noLev = noLev * (1 + r);
      $('#lv-day').textContent = '第 ' + day + ' 天';
      $('#lv-eq').textContent = '¥' + fmtMoney(Math.max(0, equity));
      $('#lv-nl').textContent = '¥' + fmtMoney(noLev);
      var mv = $('#lv-mv');
      mv.textContent = fmtPct(r) + ' → 你 ' + fmtPct(lev * r);
      mv.style.color = r >= 0 ? 'var(--up)' : 'var(--down)';
      var pct = Math.max(0, Math.min(100, equity / 10000 * 100));
      $('#lv-fill').style.width = pct + '%';
      $('#lv-fill').style.background = equity <= 4500 ? 'var(--down)' : '';
      if (equity <= 3000 && !dead) {
        dead = true;
        $('#lv-note').textContent = '💥 BOOM！净值跌破强平线，券商把你的仓位强制卖了。';
        done('第 ' + day + ' 天，一根 ' + fmtPct(r) + ' 的阴线在 ' + lev + ' 倍杠杆下变成了 ' + fmtPct(lev * r) + '，你的净值击穿维持保证金线，被强制平仓离场。而平行宇宙里不加杠杆的你还有 ¥' + fmtMoney(noLev) + '，完全活得下去。记住：杠杆不改变方向，只加快结局——而且借的钱每天都在算利息。');
      } else if (day >= 15 && !dead && lev === 1) {
        $('#lv-note').textContent = '看，1倍杠杆过了 ' + day + ' 天也没事。想看爆仓？重开一局选5倍。';
      }
    });
  };

  /* ---- 下单时钟 ---- */
  ENGINES.session = function (mount, done) {
    var hour = 8.0; /* 美东小时，从盘前开始 */
    var tried = { open: false, ext: false, closed: false };
    mount.innerHTML =
      '<div class="lab-stage"><div class="lab-clock"><div><div class="lab-clock-t" id="sc-et">--:--</div><div class="lab-clock-l">🇺🇸 美东时间</div></div>' +
      '<div><div class="lab-clock-t" id="sc-bj">--:--</div><div class="lab-clock-l">🇨🇳 北京时间(夏令)</div></div>' +
      '<div class="lab-pill" id="sc-st">—</div></div>' +
      '<input type="range" class="lab-range" id="sc-r" min="0" max="47" step="1" value="16">' +
      '<div class="lab-note" id="sc-note">拖动滑杆改变时间，然后试着下单</div>' +
      '<div class="lab-btns"><button class="lab-btn hot" id="sc-buy">🛒 现在下市价单</button></div>' +
      '<div class="lab-todo" id="sc-todo"></div></div>';
    var $ = function (s) { return mount.querySelector(s); };
    function status() {
      var m = hour * 60;
      if (m >= 240 && m < 570) return { k: 'ext', label: '盘前 4:00-9:30', cls: 'warn' };
      if (m >= 570 && m < 960) return { k: 'open', label: '盘中 9:30-16:00', cls: 'ok' };
      if (m >= 960 && m < 1200) return { k: 'ext', label: '盘后 16:00-20:00', cls: 'warn' };
      return { k: 'closed', label: '休市', cls: 'off' };
    }
    function fmt(h) {
      var hh = Math.floor(h) % 24, mm = Math.round((h - Math.floor(h)) * 60);
      return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    }
    function todo() {
      $('#sc-todo').innerHTML =
        '<span class="' + (tried.open ? 'done' : '') + '">' + (tried.open ? '✅' : '⬜') + ' 盘中下单</span>' +
        '<span class="' + (tried.ext ? 'done' : '') + '">' + (tried.ext ? '✅' : '⬜') + ' 盘前/盘后下单</span>' +
        '<span class="' + (tried.closed ? 'done' : '') + '">' + (tried.closed ? '✅' : '⬜') + ' 休市时下单</span>';
    }
    function paint() {
      var st = status();
      $('#sc-et').textContent = fmt(hour);
      $('#sc-bj').textContent = fmt(hour + 12);
      var pill = $('#sc-st');
      pill.textContent = st.label;
      pill.className = 'lab-pill ' + st.cls;
      todo();
    }
    $('#sc-r').addEventListener('input', function () { hour = this.value / 2; paint(); });
    $('#sc-buy').addEventListener('click', function () {
      var st = status(), note = $('#sc-note');
      if (st.k === 'open') {
        tried.open = true;
        note.innerHTML = '⚡ <b>0.1秒成交</b>。盘中流动性最好，点差只有1分钱，市价单几乎无损耗。';
      } else if (st.k === 'ext') {
        tried.ext = true;
        note.innerHTML = '🌙 成交是成交了，但<b>贵了0.8%</b>——盘外参与者少、点差是盘中的几十倍，而且很多券商此时只接受限价单。财报偏偏都在这时候发布。';
      } else {
        tried.closed = true;
        note.innerHTML = '😴 市场睡了，订单<b>进队列等开盘</b>。明早开盘价可能和昨天收盘差很远（跳空），你的成交价没人能保证。';
      }
      todo();
      if (tried.open && tried.ext && tried.closed) {
        done('同一只股票，不同时刻下单待遇天差地别：盘中(9:30-16:00 ET)秒成交点差小；盘前盘后能交易但人少点差大、常只能挂限价单；休市只能排队赌开盘跳空。重要财报几乎都在盘外发布——所以盘后常见暴涨暴跌，但那恰恰是流动性最差、最容易买贵卖便宜的时候。');
      }
    });
    paint();
  };

  /* ---- 点差实验室 ---- */
  ENGINES.orderbook = function (mount, done) {
    var stock = 'AAPL', limitFlip = 0;
    var tried = { mkt: false, lmt: false, cold: false };
    var BOOKS = {
      AAPL: { name: '苹果 AAPL（顶流）', bid: 100.00, ask: 100.05, bq: 300, aq: 200 },
      XYZ: { name: '冷门小票 XYZ', bid: 9.50, ask: 10.00, bq: 20, aq: 15 }
    };
    mount.innerHTML =
      '<div class="lab-stage"><div class="lab-btns" id="ob-tabs"><button class="lab-btn sel" data-s="AAPL">🍎 AAPL</button><button class="lab-btn" data-s="XYZ">🕸️ 冷门股XYZ</button></div>' +
      '<div class="lab-book"><div class="lab-book-row ask"><span>卖一 <b id="ob-ask"></b></span><span id="ob-aq"></span></div>' +
      '<div class="lab-book-mid" id="ob-sp"></div>' +
      '<div class="lab-book-row bid"><span>买一 <b id="ob-bid"></b></span><span id="ob-bq"></span></div></div>' +
      '<div class="lab-note" id="ob-note">上面是盘口：想买的话，你出多少钱？</div>' +
      '<div class="lab-btns"><button class="lab-btn hot" id="ob-mkt">🚀 市价买入</button><button class="lab-btn" id="ob-lmt">⏳ 按买一价挂限价单</button></div>' +
      '<div class="lab-todo" id="ob-todo"></div></div>';
    var $ = function (s) { return mount.querySelector(s); };
    function paint() {
      var b = BOOKS[stock];
      $('#ob-ask').textContent = '$' + b.ask.toFixed(2);
      $('#ob-bid').textContent = '$' + b.bid.toFixed(2);
      $('#ob-aq').textContent = b.aq + ' 股';
      $('#ob-bq').textContent = b.bq + ' 股';
      var spr = b.ask - b.bid, mid = (b.ask + b.bid) / 2;
      $('#ob-sp').textContent = '↕ 点差 $' + spr.toFixed(2) + '（占价格 ' + (spr / mid * 100).toFixed(2) + '%）';
      $('#ob-todo').innerHTML =
        '<span class="' + (tried.mkt ? 'done' : '') + '">' + (tried.mkt ? '✅' : '⬜') + ' 市价成交</span>' +
        '<span class="' + (tried.lmt ? 'done' : '') + '">' + (tried.lmt ? '✅' : '⬜') + ' 限价挂单</span>' +
        '<span class="' + (tried.cold ? 'done' : '') + '">' + (tried.cold ? '✅' : '⬜') + ' 在冷门股买贵一次</span>';
    }
    function check() {
      if (tried.mkt && tried.lmt && tried.cold) {
        done('看到了吧：市价单按"卖一价"立刻成交，你永远比中间价多付半个点差——苹果这种顶流只亏1分钱，冷门股能坑你2.6%；限价单能锁住价格，但没人卖给你就一直挂着。所以：流动性好的股票随便市价，冷门股一定用限价单，点差就是你看不见的手续费。');
      }
    }
    mount.querySelectorAll('#ob-tabs .lab-btn').forEach(function (b) {
      b.addEventListener('click', function () {
        stock = b.dataset.s;
        mount.querySelectorAll('#ob-tabs .lab-btn').forEach(function (x) { x.classList.remove('sel'); });
        b.classList.add('sel');
        $('#ob-note').textContent = stock === 'XYZ' ? '注意这个盘口的点差…再试试市价买？' : '上面是盘口：想买的话，你出多少钱？';
        paint();
      });
    });
    $('#ob-mkt').addEventListener('click', function () {
      var b = BOOKS[stock], mid = (b.ask + b.bid) / 2, extra = (b.ask - mid) / mid * 100;
      if (stock === 'AAPL') {
        tried.mkt = true;
        $('#ob-note').innerHTML = '⚡ 成交 @ $' + b.ask.toFixed(2) + '（卖一价）。比中间价多付了 ' + extra.toFixed(2) + '%，顶流股的点差损耗几乎可以无视。';
      } else {
        tried.cold = true; tried.mkt = true;
        $('#ob-note').innerHTML = '💸 成交 @ $10.00，但中间价才 $9.75——你瞬间多付了 <b>' + extra.toFixed(1) + '%</b>！冷门股的点差是真金白银的坑。';
      }
      paint(); check();
    });
    $('#ob-lmt').addEventListener('click', function () {
      var b = BOOKS[stock];
      $('#ob-note').textContent = '⏳ 已按买一价 $' + b.bid.toFixed(2) + ' 挂单，等待有人愿意卖…';
      setTimeout(function () {
        limitFlip++;
        if (limitFlip % 2 === 1) {
          tried.lmt = true;
          $('#ob-note').innerHTML = '✅ 等到了！有人按 $' + b.bid.toFixed(2) + ' 卖给你，<b>一分点差都没多付</b>。这就是限价单：保价格。';
        } else {
          $('#ob-note').innerHTML = '😤 等了一整天没人卖，废单收场。限价单<b>保价格但不保成交</b>——再挂一次试试？';
        }
        paint(); check();
      }, 1200);
    });
    paint();
  };

  /* ---- 捏K线 ---- */
  ENGINES.candle = function (mount, done) {
    var o = 100, c = 104, h = 106, l = 98;
    var tasks = [
      { id: 0, name: '捏出一根大阳线（实体≥8）', test: function () { return c - o >= 8; }, done: false },
      { id: 1, name: '捏出一根大阴线（实体≥8）', test: function () { return o - c >= 8; }, done: false },
      { id: 2, name: '捏出长上影线（冲高回落）', test: function () { return h - Math.max(o, c) >= 6 && Math.abs(c - o) <= 4; }, done: false }
    ];
    mount.innerHTML =
      '<div class="lab-stage"><div class="lab-candle-wrap"><div class="lab-candle-area" id="cd-area"><div class="lab-wick" id="cd-wick"></div><div class="lab-body" id="cd-body"></div></div>' +
      '<div class="lab-candle-info" id="cd-info"></div></div>' +
      '<div class="lab-sliders">' +
      '<label>开盘 <b id="v-o">100</b><input type="range" class="lab-range" id="r-o" min="90" max="110" value="100"></label>' +
      '<label>收盘 <b id="v-c">104</b><input type="range" class="lab-range" id="r-c" min="90" max="110" value="104"></label>' +
      '<label>最高 <b id="v-h">106</b><input type="range" class="lab-range" id="r-h" min="90" max="115" value="106"></label>' +
      '<label>最低 <b id="v-l">98</b><input type="range" class="lab-range" id="r-l" min="85" max="110" value="98"></label></div>' +
      '<div class="lab-todo lab-todo-col" id="cd-tasks"></div></div>';
    var $ = function (s) { return mount.querySelector(s); };
    function paint() {
      h = Math.max(h, o, c); l = Math.min(l, o, c);
      $('#r-h').value = h; $('#r-l').value = l;
      $('#v-o').textContent = o; $('#v-c').textContent = c; $('#v-h').textContent = h; $('#v-l').textContent = l;
      var top = 115, span = 30; /* 85-115 映射到 180px */
      function Y(v) { return (top - v) / span * 180; }
      var wick = $('#cd-wick'), body = $('#cd-body');
      wick.style.top = Y(h) + 'px';
      wick.style.height = Math.max(2, Y(l) - Y(h)) + 'px';
      var bt = Y(Math.max(o, c)), bh = Math.max(3, Math.abs(Y(o) - Y(c)));
      body.style.top = bt + 'px';
      body.style.height = bh + 'px';
      var up = c >= o;
      body.style.background = up ? 'var(--up)' : 'var(--down)';
      $('#cd-info').innerHTML = (up ? '<b style="color:var(--up)">阳线(涨)</b>' : '<b style="color:var(--down)">阴线(跌)</b>') + '<br>开' + o + ' 收' + c + '<br>高' + h + ' 低' + l;
      var allDone = true;
      tasks.forEach(function (t) { if (!t.done && t.test()) t.done = true; if (!t.done) allDone = false; });
      $('#cd-tasks').innerHTML = tasks.map(function (t) {
        return '<span class="' + (t.done ? 'done' : '') + '">' + (t.done ? '✅' : '⬜') + ' ' + esc(t.name) + '</span>';
      }).join('');
      if (allDone) {
        done('一根K线四个价：开、高、低、收。实体是开收之间的博弈结果，影线是盘中试探的痕迹——长上影=冲高被砸回来，多头没顶住。还有最容易踩的坑：美股惯例绿涨红跌，和A股正好相反，看盘别搞反方向。');
      }
    }
    [['r-o', function (v) { o = v; }], ['r-c', function (v) { c = v; }], ['r-h', function (v) { h = v; }], ['r-l', function (v) { l = v; }]].forEach(function (pair) {
      $('#' + pair[0]).addEventListener('input', function () { pair[1](parseInt(this.value, 10)); paint(); });
    });
    paint();
  };

  /* ---- 复利时光机 ---- */
  ENGINES.compound = function (mount, done) {
    var r = 5, n = 10, finished = false;
    mount.innerHTML =
      '<div class="lab-stage"><canvas class="lab-canvas" width="640" height="220"></canvas>' +
      '<div class="lab-stats"><div class="lab-stat"><b id="cp-fv">—</b><span>1万元变成</span></div>' +
      '<div class="lab-stat"><b id="cp-x">—</b><span>翻了几倍</span></div>' +
      '<div class="lab-stat"><b id="cp-72">—</b><span>72法则:翻倍约需</span></div></div>' +
      '<div class="lab-sliders">' +
      '<label>年化收益 <b id="cp-r">5%</b><input type="range" class="lab-range" id="cp-rr" min="1" max="15" value="5"></label>' +
      '<label>投资年数 <b id="cp-n">10年</b><input type="range" class="lab-range" id="cp-nn" min="1" max="40" value="10"></label></div>' +
      '<div class="lab-note" id="cp-note">拖拖看：是年化重要，还是年数重要？</div></div>';
    var $ = function (s) { return mount.querySelector(s); };
    var cv = mount.querySelector('canvas');
    function paint() {
      var fv = 10000 * Math.pow(1 + r / 100, n);
      var series = [];
      for (var i = 0; i <= n; i++) series.push(10000 * Math.pow(1 + r / 100, i));
      drawLines(cv, [series], ['#A050FF'], 10000);
      $('#cp-fv').textContent = '¥' + fmtMoney(fv);
      $('#cp-x').textContent = (fv / 10000).toFixed(1) + '倍';
      $('#cp-72').textContent = (72 / r).toFixed(0) + '年';
      $('#cp-r').textContent = r + '%';
      $('#cp-n').textContent = n + '年';
      if (!finished && fv >= 40000) {
        finished = true;
        done('翻4倍=翻倍两次。72法则口算：72÷' + r + '≈' + Math.round(72 / r) + '年翻一倍，两倍就是' + Math.round(2 * 72 / r) + '年左右——和你调出来的 ' + n + '年/年化' + r + '% 对上了。复利前期慢得让人想放弃，后期陡得不讲道理：巴菲特99%的财富是50岁后赚到的。比起追求刺激的年化，"在市场里待得够久"才是普通人最大的杠杆。');
      }
    }
    $('#cp-rr').addEventListener('input', function () { r = parseInt(this.value, 10); paint(); });
    $('#cp-nn').addEventListener('input', function () { n = parseInt(this.value, 10); paint(); });
    paint();
  };

  /* ---- 奶茶店估值器（PE 直觉） ---- */
  ENGINES.pevalue = function (mount, done) {
    var profit = 10, pe = 25;
    var tasks = { normal: false, hot: false, cold: false };
    mount.innerHTML =
      '<div class="lab-stage"><div class="lab-stats"><div class="lab-stat"><b id="pv-val" style="font-size:22px">—</b><span>这家奶茶店的估值</span></div></div>' +
      '<div class="lab-sliders">' +
      '<label>店铺年利润 <b id="pv-p">10万</b><input type="range" class="lab-range" id="pv-pp" min="5" max="50" value="10"></label>' +
      '<label>市场愿出的倍数(PE) <b id="pv-e">25倍</b><input type="range" class="lab-range" id="pv-ee" min="5" max="60" value="25"></label></div>' +
      '<div class="lab-note" id="pv-note">同一家店，倍数不同价格天差地别。试试完成三个定价任务 👇</div>' +
      '<div class="lab-todo lab-todo-col" id="pv-todo"></div></div>';
    var $ = function (s) { return mount.querySelector(s); };
    function paint() {
      var val = profit * pe;
      $('#pv-val').textContent = val + ' 万';
      $('#pv-p').textContent = profit + '万';
      $('#pv-e').textContent = pe + '倍';
      var note = $('#pv-note');
      if (pe >= 45 && !tasks.hot) {
        tasks.hot = true;
        note.innerHTML = '🔥 ' + pe + '倍！市场为1元利润掏' + pe + '元——对未来疯狂乐观，也可能是泡沫在烧。';
      } else if (pe <= 8 && !tasks.cold) {
        tasks.cold = true;
        note.innerHTML = '🥶 ' + pe + '倍：要么是没人发现的便宜货，要么是大家觉得这生意没未来。低价也要问为什么。';
      } else if (pe >= 14 && pe <= 20 && profit === 10 && !tasks.normal) {
        tasks.normal = true;
        note.innerHTML = '✅ 年赚10万 × ' + pe + '倍 = ' + val + '万，这是市场的"常温"定价区间。';
      }
      $('#pv-todo').innerHTML =
        '<span class="' + (tasks.normal ? 'done' : '') + '">' + (tasks.normal ? '✅' : '⬜') + ' 常温定价：年利润调到10万，倍数调到14-20倍</span>' +
        '<span class="' + (tasks.hot ? 'done' : '') + '">' + (tasks.hot ? '✅' : '⬜') + ' 发烧定价：把倍数拉到45倍以上</span>' +
        '<span class="' + (tasks.cold ? 'done' : '') + '">' + (tasks.cold ? '✅' : '⬜') + ' 遇冷定价：把倍数压到8倍以下</span>';
      if (tasks.normal && tasks.hot && tasks.cold) {
        done('估值=利润×倍数。利润是店自己的本事，倍数是市场的情绪：45倍是抢购的狂热（可能是泡沫），8倍是无人问津的冷清（可能是便宜货也可能是烂生意），15-20倍是历史常温。买股票前先看一眼：你付的是常温价、发烧价、还是跳楼价。');
      }
    }
    $('#pv-pp').addEventListener('input', function () { profit = parseInt(this.value, 10); paint(); });
    $('#pv-ee').addEventListener('input', function () { pe = parseInt(this.value, 10); paint(); });
    paint();
  };

  /* ---- 港股下单时钟（有午休的市场） ---- */
  ENGINES.hksession = function (mount, done) {
    var hour = 9.5;
    var tried = { trade: false, lunch: false, closed: false };
    mount.innerHTML =
      '<div class="lab-stage"><div class="lab-clock"><div><div class="lab-clock-t" id="hk-t">--:--</div><div class="lab-clock-l">🇭🇰 香港时间 = 北京时间</div></div>' +
      '<div class="lab-pill" id="hk-st">—</div></div>' +
      '<input type="range" class="lab-range" id="hk-r" min="0" max="47" step="1" value="19">' +
      '<div class="lab-note" id="hk-note">好消息：港股和北京零时差，不用熬夜。拖时间试试下单 👇</div>' +
      '<div class="lab-btns"><button class="lab-btn hot" id="hk-buy">🛒 现在下单买腾讯</button></div>' +
      '<div class="lab-todo" id="hk-todo"></div></div>';
    var $ = function (s) { return mount.querySelector(s); };
    function status() {
      var m = hour * 60;
      if (m >= 540 && m < 570) return { k: 'auction', label: '开市前竞价 9:00-9:30', cls: 'warn' };
      if (m >= 570 && m < 720) return { k: 'am', label: '早市 9:30-12:00', cls: 'ok' };
      if (m >= 720 && m < 780) return { k: 'lunch', label: '午休 12:00-13:00', cls: 'warn' };
      if (m >= 780 && m < 960) return { k: 'pm', label: '午市 13:00-16:00', cls: 'ok' };
      return { k: 'closed', label: '休市', cls: 'off' };
    }
    function fmt(h) {
      var hh = Math.floor(h) % 24, mm = Math.round((h - Math.floor(h)) * 60);
      return String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    }
    function todo() {
      $('#hk-todo').innerHTML =
        '<span class="' + (tried.trade ? 'done' : '') + '">' + (tried.trade ? '✅' : '⬜') + ' 早市/午市成交</span>' +
        '<span class="' + (tried.lunch ? 'done' : '') + '">' + (tried.lunch ? '✅' : '⬜') + ' 午休时下单</span>' +
        '<span class="' + (tried.closed ? 'done' : '') + '">' + (tried.closed ? '✅' : '⬜') + ' 收市后下单</span>';
    }
    function paint() {
      var st = status();
      $('#hk-t').textContent = fmt(hour);
      var pill = $('#hk-st');
      pill.textContent = st.label;
      pill.className = 'lab-pill ' + st.cls;
      todo();
    }
    $('#hk-r').addEventListener('input', function () { hour = this.value / 2; paint(); });
    $('#hk-buy').addEventListener('click', function () {
      var st = status(), note = $('#hk-note');
      if (st.k === 'am' || st.k === 'pm') {
        tried.trade = true;
        note.innerHTML = '⚡ <b>成交！</b>连续交易时段正常撮合。注意现在是北京时间——你没熬夜。';
      } else if (st.k === 'lunch') {
        tried.lunch = true;
        note.innerHTML = '🍱 <b>全港吃午饭去了！</b>12:00-13:00 全市场停止交易，订单挂起，等 13:00 午市开盘再撮合。美股可没有午休这回事。';
      } else if (st.k === 'auction') {
        note.innerHTML = '📋 开市前竞价时段：订单进集合竞价池，9:30 按竞价结果一次性开盘。';
      } else {
        tried.closed = true;
        note.innerHTML = '😴 收市了。港股 16:00 收盘，订单排队到下个交易日 9:30。';
      }
      todo();
      if (tried.trade && tried.lunch && tried.closed) {
        done('港股和北京零时差：早市 9:30-12:00、午休 12:00-13:00、午市 13:00-16:00。午休全市场停摆一小时是港股特色，美股则是 9:30-16:00 连续交易不吃饭。对上班族的好消息：港股在你摸鱼的时间开门，不用像炒美股那样熬到半夜。');
      }
    });
    paint();
  };

  /* ---- 2022熊市回放机（真实历史行情） ---- */
  ENGINES.replay2022 = function (mount, done) {
    var Q = [
      { name: '2022 Q1', r: -0.091 },
      { name: '2022 Q2', r: -0.225 },
      { name: '2022 Q3', r: -0.046 },
      { name: '2022 Q4', r: -0.003 }
    ];
    var i = 0, ndx = 100, tq = 100, hn = [100], ht = [100];
    mount.innerHTML =
      '<div class="lab-stage"><canvas class="lab-canvas" width="640" height="240"></canvas>' +
      '<div class="lab-legend"><span><i style="background:#7C9CFD"></i>纳指100</span><span><i style="background:#A050FF"></i>TQQQ（3倍做多）</span></div>' +
      '<div class="lab-stats"><div class="lab-stat"><b id="rp-n">100.0</b><span>纳指100 <em id="rp-np">0%</em></span></div>' +
      '<div class="lab-stat"><b id="rp-t">100.0</b><span>TQQQ <em id="rp-tp">0%</em></span></div>' +
      '<div class="lab-stat"><b id="rp-back">—</b><span>TQQQ回本需再涨</span></div></div>' +
      '<div class="lab-note" id="rp-note">这是2022年的真实行情（按季近似）。年初你各买了100元，按下按钮开始过这一年 👇</div>' +
      '<div class="lab-btns"><button class="lab-btn hot" id="rp-go">▶ 过一个季度（2022 Q1）</button></div></div>';
    var $ = function (s) { return mount.querySelector(s); };
    var cv = mount.querySelector('canvas');
    function paint() {
      drawLines(cv, [hn, ht], ['#7C9CFD', '#A050FF'], 100);
      $('#rp-n').textContent = ndx.toFixed(1);
      $('#rp-t').textContent = tq.toFixed(1);
      $('#rp-np').textContent = ((ndx / 100 - 1) * 100).toFixed(0) + '%';
      $('#rp-tp').textContent = ((tq / 100 - 1) * 100).toFixed(0) + '%';
      $('#rp-back').textContent = tq < 100 ? '+' + ((100 / tq - 1) * 100).toFixed(0) + '%' : '已回本';
    }
    $('#rp-go').addEventListener('click', function () {
      if (i >= Q.length) return;
      var q = Q[i];
      ndx *= (1 + q.r);
      tq *= (1 + 3 * q.r);
      hn.push(ndx); ht.push(tq);
      i++;
      paint();
      var btn = $('#rp-go');
      if (i < Q.length) {
        btn.textContent = '▶ 过一个季度（' + Q[i].name + '）';
        $('#rp-note').textContent = q.name + '：纳指 ' + (q.r * 100).toFixed(1) + '%，TQQQ 单季约 ' + (q.r * 300).toFixed(0) + '%。继续。';
      } else {
        btn.style.display = 'none';
        done('2022年全年：纳指100 约 -33%，TQQQ 却是约 -80%——不是 -33%×3=-99%，也远不止3倍疼。最残酷的是回本数学：跌33%只需涨49%回本，跌80%却要涨 +400%。后来纳指创了新高，2022年初买TQQQ拿着不动的人还在坑底仰望。3倍ETF是短跑鞋，穿它跑马拉松会要命。');
      }
    });
    paint();
  };

  /* ============ 对外接口 ============ */
  window.LabKit = {
    labs: LABS,
    cards: CARDS,
    has: function (lessonId) { return !!LABS[lessonId]; },
    meta: function (lessonId) { return LABS[lessonId]; },
    cardFor: function (lessonId) { return CARDS[lessonId]; },
    render: function (lessonId, mountEl, onComplete) {
      var lab = LABS[lessonId];
      if (!lab || !ENGINES[lab.type]) { onComplete(''); return; }
      ENGINES[lab.type](mountEl, onComplete);
    }
  };
})();
