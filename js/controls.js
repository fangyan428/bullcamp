(function(root) {
  const n = (key, label, value, min, max, step = 1) => ({ key, label, value, min, max, step });
  const select = (key, label, value, options) => ({ key, label, value, options });
  const path = () => select('path', '原创价格路径', 'recovery', { recovery: '先跌后修复', rising: '持续上涨', falling: '持续下跌', sideways: '往复震荡' });
  const controls = {
    cash: [n('start','期初本金 $',1000,0,1000000),n('deposit','期间追加 $',200,0,1000000),n('ending','扣费前期末资产 $',1260,0,3000000),n('fee','待扣费用 $',10,0,10000)],
    compound: [n('principal','本金 $',1000,1,1000000),n('rate','假设年收益 %',7,-90,100,0.1),n('fee','简化年费率 %',1,0,10,0.1),n('years','年数',10,1,50)],
    risk: [n('prob','有利情境概率 %',60,0,100),n('up','有利情境收益 %',20,0,500),n('down','不利情境收益 %',-25,-100,0),n('capital','本金 $',1000,1,1000000)],
    cashflow: [n('sales','已确认收入 $',200,0,10000),n('expenses','现金经营支出 $',120,0,10000),n('depreciation','折旧 $',20,0,10000),n('receivable','应收账款增加 $',50,-10000,10000),n('capex','资本开支 $',40,0,10000)],
    dcf: [n('cash','第 0 年股权现金流 $',10,0.1,10000,0.1),n('growth','前 5 年增长 %',5,-90,100,0.5),n('discount','股权要求回报 %',10,0.1,60,0.1),n('terminal','之后永续增长 %',2,-10,10,0.5)],
    multiple: [n('eps','初始每股收益 $',5,0.1,1000,0.1),n('pe','初始市盈率',30,1,200),n('growth','下一期盈利增长 %',20,-99,300),n('nextPE','下一期市盈率',20,1,200)],
    dca: [path(),select('funding','资金到达条件','salary',{salary:'逐期到账',lump:'首期全部到账'}),select('plan','所选投入规则','fixed',{fixed:'每期定额',all:'到账即投',wait:'下跌后投入'}),n('monthly','每份资金额 $',100,1,100000),n('fee','每次投入费用 %',0.1,0,10,0.1)],
    allocation: [n('stock','股票权重 %',60,0,100),n('bond','债券权重 %',30,0,100),n('stockReturn','股票情境收益 %',-20,-100,200),n('bondReturn','债券情境收益 %',5,-100,100),n('capital','本金 $',10000,1,1000000)],
    order: [select('kind','买单类型','limit',{limit:'限价单',market:'市价单'}),n('limit','买入限价 $',100,0.1,10000,0.1),n('ask','卖方报价 $',101,0.1,10000,0.1),n('cash','可用现金 $',1000,0,1000000),n('fee','成交一次固定费用 $',1,0,100,0.1),n('quantity','委托股数',10,1,10000),n('depth','该档可供成交股数',5,0,10000)],
    rebalance: [n('stock','当前股票市值 $',700,1,1000000),n('other','其他可调资产 $',300,0,1000000),n('target','目标股票比例 %',60,0,100)],
    cost: [n('turnover','年交易金额 / 平均资产 %',600,0,10000),n('cost','单边交易成本 %',0.5,0,10,0.05),n('gross','策略毛收益 %',12,-100,300,0.5),n('benchmark','基准净收益 %',10,-100,300,0.5)],
    strategy: [path(),select('rule','交易规则','trend',{trend:'价格高于历史均价',hold:'保持目标仓位'}),n('lookback','历史窗口期数',3,2,8),n('weight','目标持仓 %',80,0,100),n('cost','单边交易成本 %',0.2,0,10,0.1)],
    arbitrage: [n('price','当前股价 $',90,1,1000),n('offer','成功收购价 $',100,1,1000),n('fail','失败情境价格 $',60,0,1000),n('prob','假设成功概率 %',80,0,100),n('cost','预计成本 / 股 $',1,0,100,0.1)],
    leverage: [n('equity','初始自有资金 $',100,1,1000000),n('loan','初始借款 $',100,0,1000000),n('change','资产价格变化 %',-20,-100,200),n('maintenance','情境维持权益比例 %',30,0,100)],
    dilution: [n('profit','初始总利润 $',100,0.1,100000,0.1),n('shares','初始股数',100,1,100000),n('growth','总利润增长 %',20,-99,500),n('issue','增发股数',40,0,100000)]
  };
  const defaults = type => Object.fromEntries((controls[type] || []).map(c => [c.key, c.value]));
  const validate = (type, values) => (controls[type] || []).flatMap(c => c.options ? (Object.hasOwn(c.options, values[c.key]) ? [] : [`${c.label}：请选择给定选项。`]) : (!Number.isFinite(values[c.key]) || values[c.key] < c.min || values[c.key] > c.max || (c.step === 1 && !Number.isInteger(values[c.key])) ? [`${c.label}：请输入 ${c.min}–${c.max}${c.step === 1 ? ' 的整数' : ' 之间的数字'}。`] : []));
  root.BullControls = { controls, defaults, validate };
  if (typeof module !== 'undefined') module.exports = root.BullControls;
})(typeof window !== 'undefined' ? window : globalThis);
