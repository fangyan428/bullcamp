/* BullCamp deterministic teaching models. All price paths are synthetic. */
(function (root) {
  'use strict';
  const paths = {
    recovery: [100, 85, 70, 75, 90, 110, 105, 95, 115, 120, 112, 125],
    rising: [100, 105, 110, 117, 121, 125, 130, 136, 140, 145, 151, 160],
    falling: [100, 95, 90, 82, 75, 78, 70, 65, 68, 61, 57, 50],
    sideways: [100, 110, 98, 108, 96, 106, 95, 105, 94, 104, 93, 100]
  };
  const pct = n => (n * 100).toFixed(2) + '%';
  const money = n => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 2 });
  const stat = (label, value) => ({ label, value });
  function dca(p) {
    const prices = paths[p.path] || paths.recovery;
    function schedule(plan) {
      let shares = 0, total = 0, fees = 0, cash = 0;
      const rows = [], values = [];
      prices.forEach((price, i) => {
        const added = p.funding === 'lump' ? (i === 0 ? 12 * p.monthly : 0) : p.monthly;
        cash += added; total += added;
        // Waiting signal only sees the previous two observations, never execution price.
        const ready = plan !== 'wait' || (i >= 2 && prices[i-1] < prices[i-2]);
        const budget = ready ? (plan === 'fixed' ? Math.min(cash,p.monthly) : cash) : 0;
        const fee = budget * p.fee / 100;
        shares += (budget - fee) / price; cash -= budget; fees += fee;
        const value = shares * price + cash;
        rows.push([i + 1, money(price), money(total), shares.toFixed(3), money(cash), money(value)]);
        values.push(value);
      });
      const value = values.at(-1);
      return { rows, values, value, total, fees, cash, profit:value-total };
    }
    const result = schedule(p.plan || 'fixed'), baseline = schedule('fixed');
    return { stats: [stat('可用资金总额', money(result.total)), stat('所选计划期末资产', money(result.value)), stat('投资损益', money(result.profit)), stat('每期定额对照', money(baseline.value))], headers: ['期数', '价格', '到账本金', '份额', '现金', '总资产'], rows:result.rows, series: [{ name: '所选计划', values:result.values }, { name: '同资金定额对照', values:baseline.values }], note: '原创 12 期路径，允许碎股、现金收益为零、无分红与税。两条计划共享资金到达条件。等待规则：看到前一期比再前一期下跌后，在本期按给定价格投入可用现金；不是知道本期价格后才决定成交。累计费用 '+money(result.fees)+'。损益/本金不等于年化收益。', raw:result };
  }
  function backtest(prices, p) {
    let cash = 10000, shares = 0, fees = 0, trades = 0, peak = 10000, maxDrawdown = 0;
    const values = [10000], rows = [];
    // At t, use only closes strictly before t; trade at t's given execution price.
    for (let t = 1; t < prices.length; t++) {
      const lookback = Math.max(1, Math.round(p.lookback));
      const history = prices.slice(Math.max(0, t - lookback), t);
      const mean = history.reduce((a, b) => a + b, 0) / history.length;
      const signal = p.rule === 'hold' || (history.length >= lookback && prices[t - 1] > mean);
      const before = cash + shares * prices[t];
      const target = signal ? p.weight / 100 : 0;
      const desired = before * target / prices[t];
      const delta = desired - shares;
      if (Math.abs(delta) > 0.0001) {
        const feeRate = p.cost / 100;
        const quantity = delta > 0 ? Math.min(delta, cash / (prices[t] * (1 + feeRate))) : delta;
        const cost = Math.abs(quantity) * prices[t] * feeRate;
        cash -= quantity * prices[t] + cost; shares += quantity; fees += cost; trades++;
      }
      const value = cash + shares * prices[t];
      peak = Math.max(peak, value); maxDrawdown = Math.max(maxDrawdown, 1 - value / peak);
      values.push(value);
      rows.push([t + 1, money(prices[t]), signal ? '目标持仓' : '现金', money(cash), money(value)]);
    }
    return { values, rows, fees, trades, value: values.at(-1), maxDrawdown };
  }
  function run(type, p) {
    const out = { stats: [], rows: [], note: '教学简化模型，全部金额和概率均为给定条件。' };
    switch (type) {
      case 'cash': {
        const profit = p.ending - p.start - p.deposit - p.fee;
        out.stats = [stat('净期末资产', money(p.ending - p.fee)), stat('累计本金', money(p.start + p.deposit)), stat('投资损益', money(profit))];
        out.note = '期末资产为扣除本项费用前的金额；本期没有取款。追加本金不计作投资收益。'; out.raw = { profit }; break;
      }
      case 'compound': {
        const values = [p.principal]; let value = p.principal;
        for (let i = 0; i < p.years; i++) { value *= 1 + (p.rate - p.fee) / 100; values.push(value); }
        out.stats = [stat('期末资产', money(value)), stat('累计变化', money(value - p.principal))]; out.series = [{ name: '假设路径', values }];
        out.note = '给定固定年收益率，年末按净收益率复利；费率直接相减是教学简化，并非实际每日扣费算法，也不是收益预测。'; out.raw = { value }; break;
      }
      case 'risk': {
        const expected = p.prob / 100 * p.up + (1 - p.prob / 100) * p.down;
        out.stats = [stat('给定概率下的期望收益', pct(expected / 100)), stat('不利情境资产', money(p.capital * (1 + p.down / 100))), stat('有利情境资产', money(p.capital * (1 + p.up / 100)))];
        out.note = '只有两个教学情境，概率由题目给定。期望不是一次投资必然实现的结果，也未包含所有现实风险。'; out.raw = { expected }; break;
      }
      case 'cashflow': {
        const profit = p.sales - p.expenses - p.depreciation, operating = p.sales - p.expenses - p.receivable, free = operating - p.capex;
        out.stats = [stat('简化利润', money(profit)), stat('经营现金流', money(operating)), stat('扣资本开支后现金', money(free))];
        out.headers = ['事项', '金额']; out.rows = [['确认收入', money(p.sales)], ['现金经营支出', money(p.expenses)], ['非现金折旧', money(p.depreciation)], ['应收账款增加', money(p.receivable)], ['资本开支', money(p.capex)]];
        out.note = '忽略税、利息和其他营运资本变化；没有将折旧再次作为现金支出。不是完整公司自由现金流模型。'; out.raw = { profit, operating, free }; break;
      }
      case 'dcf': {
        if (p.discount <= p.terminal) return { ...out, error: '折现率必须大于永续增长率；请修正假设后再计算。' };
        let value = 0, cash = p.cash, rows = [];
        for (let t = 1; t <= 5; t++) { cash *= 1 + p.growth / 100; const pv = cash / Math.pow(1 + p.discount / 100, t); value += pv; rows.push([t, money(cash), money(pv)]); }
        const tv = cash * (1 + p.terminal / 100) / ((p.discount - p.terminal) / 100);
        const pvTerminal = tv / Math.pow(1 + p.discount / 100, 5); value += pvTerminal;
        out.stats = [stat('模型估值', money(value)), stat('终值现值占比', pct(pvTerminal / value))]; out.headers = ['年', '股权现金流', '现值']; out.rows = rows;
        out.note = '现金流为给定的股权自由现金流，折现率为股权要求回报；预测 5 年，之后永续增长。增长隐含再投资已反映在输入现金流中。'; out.raw = { value, pvTerminal }; break;
      }
      case 'multiple': {
        const old = p.eps * p.pe, nextEPS = p.eps * (1 + p.growth / 100), next = nextEPS * p.nextPE;
        out.stats = [stat('初始价格', money(old)), stat('下一期 EPS', money(nextEPS)), stat('情境价格', money(next)), stat('价格收益', pct(next / old - 1))];
        out.note = 'EPS 与未来倍数均为情境输入；忽略分红、税与费用。乘法能分解价格，不能预测未来 EPS 或 PE。'; out.raw = { old, next, nextEPS }; break;
      }
      case 'dca': return dca(p);
      case 'allocation': {
        const cash = 100 - p.stock - p.bond;
        if (cash < 0) return { ...out, error: '股票与债券权重合计超过 100%，请为现金留下非负权重。' };
        const change = (p.stock * p.stockReturn + p.bond * p.bondReturn) / 10000;
        out.stats = [stat('现金权重', pct(cash / 100)), stat('组合情境收益', pct(change)), stat('期末资产', money(p.capital * (1 + change)))];
        out.rows = [['股票', p.stock + '%', p.stockReturn + '%'], ['债券', p.bond + '%', p.bondReturn + '%'], ['现金', cash + '%', '0%']]; out.headers = ['资产', '权重', '给定收益'];
        out.note = '单期固定权重，现金收益设为零，忽略费用。这里只计算给定情境，不根据资产类别预测回报。'; out.raw = { change, cash }; break;
      }
      case 'order': {
        const executable = p.kind === 'market' || p.limit >= p.ask;
        const affordable = Math.max(0, Math.floor((p.cash - p.fee) / p.ask));
        const quantity = executable ? Math.max(0, Math.min(p.quantity, p.depth, affordable)) : 0;
        const cost = quantity ? quantity * p.ask + p.fee : 0;
        out.stats = [stat('成交股数', quantity), stat('未成交股数', p.quantity - quantity), stat('成交后现金', money(p.cash - cost))];
        out.note = '买单教学撮合：仅有一档卖价与给定深度，不模拟队列、跳价和真实券商规则；费用仅成交时收一次。'; out.raw = { quantity, cost }; break;
      }
      case 'rebalance': {
        const total = p.stock + p.other, target = total * p.target / 100, trade = target - p.stock;
        if (total <= 0) return { ...out, error:'总资产须大于零。' };
        out.stats = [stat('调整前股票占比', pct(p.stock / total)), stat('目标股票市值', money(target)), stat(trade >= 0 ? '需转入股票' : '需转出股票', money(Math.abs(trade)))];
        out.note = '其余资产作为可调资金池，忽略费用与份额限制。再平衡的任务是恢复目标风险暴露，不保证提高收益。'; out.raw = { trade, total }; break;
      }
      case 'cost': {
        const fees = p.turnover * p.cost / 100;
        const net = p.gross - fees;
        out.stats = [stat('成本拖累（百分点）', fees.toFixed(2)), stat('简化净收益', pct(net / 100)), stat('相对基准（百分点）', (net - p.benchmark).toFixed(2))];
        out.note = '换手为年交易金额/平均资产的百分数，单边成本为每笔交易金额的百分数；直接扣减是近似，不含税、时点复利与风险调整。'; out.raw = { net, fees }; break;
      }
      case 'strategy': {
        const prices = paths[p.path] || paths.sideways;
        const result = backtest(prices, p);
        const baseline = backtest(prices, { ...p, rule: 'hold', weight: 100 });
        out.stats = [stat('策略期末资产', money(result.value)), stat('同成本持有对照', money(baseline.value)), stat('累计交易费用', money(result.fees)), stat('最大回撤', pct(result.maxDrawdown))];
        out.headers = ['期', '执行价', '信号', '现金', '资产']; out.rows = result.rows;
        out.series = [{ name: '策略', values: result.values }, { name: '持有对照', values: baseline.values }];
        out.note = '12 期原创路径；t 期只用 t 之前价格发信号，按 t 期给定价格成交。允许碎股、无分红/税/滑点。持有对照也在第 2 期开始。教学路径不能证明现实有效。'; out.raw = result; break;
      }
      case 'arbitrage': {
        const expected = p.prob / 100 * p.offer + (1 - p.prob / 100) * p.fail - p.cost;
        out.stats = [stat('成功毛价差', money(p.offer - p.price)), stat('给定概率下期望损益/股', money(expected - p.price)), stat('失败损失/股（含成本）', money(p.fail - p.price - p.cost))];
        out.note = '概率与失败价格均是教学假设，未计等待时间价值、延期、借券与融资；并购价差并非无风险套利。'; out.raw = { expected }; break;
      }
      case 'leverage': {
        const assets = (p.equity + p.loan) * (1 + p.change / 100), equity = assets - p.loan, ratio = assets > 0 ? equity / assets : 0;
        out.stats = [stat('变化后资产', money(assets)), stat('变化后净值', money(equity)), stat('权益比例', pct(ratio)), stat('示例维持线', ratio < p.maintenance / 100 ? '低于维持线' : '尚在线上')];
        out.note = '固定负债、不计利息；维持比例由情境给定。真实券商可能提高要求或直接处置头寸，不能假定一定先通知补款。'; out.raw = { assets, equity, ratio }; break;
      }
      case 'dilution': {
        const before = p.profit / p.shares, after = p.profit * (1 + p.growth / 100) / (p.shares + p.issue);
        out.stats = [stat('初始 EPS', money(before)), stat('增发后 EPS', money(after)), stat('EPS 变化', pct(after / before - 1))];
        out.note = '以相同期间口径作简化比较；实际 EPS 使用加权平均股数，并区分基本与稀释口径。'; out.raw = { before, after }; break;
      }
      default: out.error = '未找到这个模型。';
    }
    return out;
  }
  const api = { run, dca, backtest, paths, pct, money };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.BullModels = api;
})(typeof window !== 'undefined' ? window : globalThis);
