# 投资 Agent 开源项目：教学选型核验

核对日期：2026-09-22。本轮只读查阅官方仓库 README、入口、配置、关键实现和 LICENSE；没有安装、运行项目、调用模型或金融数据 API，也没有复现收益。以下“教学修改”是建议练习，不表示已实现。

## 结论

本轮三个候选中，推荐 **ai-hedge-fund 和 TradingAgents**，但不必把两者都纳入必修。若只选一个 LLM 项目做深，优先 **ai-hedge-fund**：YAML 配置能直接承接权重、风控、换仓与基准的投资课程，并具有跨期持仓和现金模拟。TradingAgents 可作为理解“数据—分析—辩论—决策”的阅读对照或替代选项。**RD-Agent** 适合更后的量化研究扩展，需要先学 Python、因子、训练验证测试划分和 Qlib；它的默认量化模板还是中国市场，不能直接当作开箱即用的美股项目。

三者都应先教读懂输入、输出和证据，再教运行与改参数。参数变化后“结果不同”不是“改进有效”；毕业练习应要求固定数据范围、保留版本、比较基准，并解释失败案例。

## 热度与版本快照

元数据直接读取 GitHub 官方 `repos/{owner}/{repo}` API；星数仅是查询时的关注度，不代表教学质量、正确性或收益。`pushed_at` 是仓库推送时间，UTC；它不等于发布日。

| 官方仓库与 API 来源 | stars | pushed_at | 核验 main commit |
|---|---:|---|---|
| [TradingAgents](https://github.com/TauricResearch/TradingAgents) · [API](https://api.github.com/repos/TauricResearch/TradingAgents) | 108,065 | 2026-09-18 05:43:45Z | `2d17df8da1536c121e4d7395ac5a5dcec9e96d6f` |
| [ai-hedge-fund](https://github.com/virattt/ai-hedge-fund) · [API](https://api.github.com/repos/virattt/ai-hedge-fund) | 63,666 | 2026-09-18 14:54:26Z | `154a8b2f46dca0f40764d814e4e747b0ad71f4c4` |
| [RD-Agent](https://github.com/microsoft/RD-Agent) · [API](https://api.github.com/repos/microsoft/RD-Agent) | 14,712 | 2026-09-15 13:31:18Z | `4834df2b6f3e417e5d0512dfe4fd24a8ac338b05` |

以下源码链接固定到上述 commit，避免课程被 `main` 后续变更悄悄改变。

## 1. TradingAgents：研究型多 Agent 入门

**当前可做什么。** 已核验版本是 `0.5.0`。CLI 入口 `tradingagents` 对应 `cli.main:app`；Python 入口是 `TradingAgentsGraph.propagate(ticker, date)`。分析员、看多/看空研究员、交易员和风险/组合经理通过 LangGraph 组织，返回研究报告与决策。可配置模型、数据源、辩论轮数和持仓上下文。[README][ta-readme] · [包入口][ta-package]

**回测与执行边界。** `tradingagents/backtest.py` 在“股票 × 日期”网格上评估决策，按评级汇总方向命中和相对基准收益。该文件明确没有成交数量、成交价格及现金账本；各网格单元独立，传入的组合也不跨单元演化。因此不能把它说成完整组合回测或券商执行系统。README 的模拟交易所叙述不应覆盖更具体的实现界限。[回测实现][ta-backtest]

**新手前置。** 会读价格/价值、财报、基准和风险；知道终端、Python 环境、字典、函数、JSON、环境变量、API key 与调用费用。README 演示 Python 3.12，而包元数据要求 `>=3.10`；课程宜固定一种实际验收过的环境，而不是向新手提供多个任选组合。[环境说明][ta-readme] · [Python 要求][ta-package]

**可教的具体修改。** 以下键已在 `tradingagents/default_config.py` 核验：[配置源码][ta-config]

| 从浅到深的练习 | 修改位置 | 学习验收 |
|---|---|---|
| 将报告语言改为中文 | `output_language` | 报告语言变化；能说明内部流程与输出语言不同 |
| 比较不同研究深度 | `max_debate_rounds`、`max_risk_discuss_rounds` | 比较证据、调用量和耗时，不能以篇幅评分 |
| 更换快/慢模型 | `quick_think_llm`、`deep_think_llm` | 保留相同股票日期，记录模型版本与失败 |
| 更换评价窗口和基准 | `holding_period_days`、`benchmark_ticker` | 能解释比较对象和持有期改变了什么 |
| 审查历史信息来源 | `data_vendors` 与分析员目录 | 为每项证据标出可得日期，识别缺失数据 |

更深层的阅读入口是 `tradingagents/agents/analysts/`、`agents/researchers/`、`agents/managers/`、`dataflows/`、`graph/`。先读一个分析员及其工具，再追踪全图，不要求新手一次读完整框架。[固定版本目录][ta-tree]

**成本与数据。** 远程 LLM 按供应商收费；数据源有 yfinance、Alpha Vantage、SEC EDGAR、FRED 等路径，各自有覆盖、配额和可用性条件。可选择本地模型，但仍需本地算力和适配。轮数、股票数、日期数与资料长度都会影响调用量。不能承诺“免费运行”或固定单次价格。[README][ta-readme] · [配置][ta-config]

**许可。** 当前是 **Apache-2.0**，不是一些旧介绍中的 MIT。分发改版需随附许可证、保留适用声明、标注修改，并处理上游若包含的 NOTICE；许可证不授权借用商标背书。[LICENSE][ta-license]

**未验证。** 数据服务真实响应、依赖兼容性、模型成本、历史文本可复现性、所有时间过滤路径及输出质量均未实测。README 同时存在强化时点一致性和文本源随时间变化的说明，不能据此宣称已经消除所有前视偏差。[README][ta-readme]

## 2. ai-hedge-fund：从投资观点到组合回测

**当前可做什么。** 当前包版本为 `2.3.0`，命令 `aihf` 进入 `hedge_fund.run:main`；无参数启动终端界面，也可读取 mandate YAML 执行一个周期或历史回测。核心目录已经是 `hedge_fund/`，不要直接照搬旧教程的 `src/main.py`。股票集合在运行时通过 `--tickers` 提供，mandate 定义资金、策略、人员模型、风控、频率和基准。[README][ai-readme] · [包入口][ai-package] · [mandate 示例][ai-mandate]

**实际执行边界。** `backtest_fund` 用同一 `run_cycle` 跨日期运行，现金和持仓持续存在，产出净值、基准、回撤、Sharpe 等结果。但当前 `SimBroker` 全量按参考价成交，滑点和费用还是未来扩展，保证金也没有建模；不能把这个结果直接视为真实可交易绩效。源码目录目前提供模拟 broker，内部说明把外部 paper/live broker 列为计划。[基金回测][ai-backtest] · [模拟 broker][ai-sim] · [内部架构说明][ai-core]

**新手前置。** 除前一个项目所需知识外，要理解组合权重、净/总敞口、换仓、现金与持仓、基准、回撤，以及 YAML 缩进。若开始改 Python，需要知道接口、类型与小型测试。包要求 Python `^3.11`。[包元数据][ai-package]

**可教的具体修改。** [mandate][ai-mandate]、[策略 YAML][ai-strategy] 与 [Graham Agent][ai-graham] 给出明确路径：

| 练习 | 具体修改 | 学习验收 |
|---|---|---|
| 把单股风险压低 | `risk.max_position_pct` 从示例值 0.25 改为 0.10 | 查看风险截断记录与最终权重 |
| 对比换仓频率 | `rebalance: weekly` 改为 `monthly` | 对比订单数、净值与遗漏的信息；指出当前成本缺项 |
| 对比投资理念混合 | `strategies[].weight`、`models[].weight` | 区分策略资金分配与同策略模型权重 |
| 从配置进入源码 | 阅读/修改 `signals/graham.py` 的系统提示词 | 用相同输入检查证据约束和 JSON 输出，不以名人风格判断正确 |
| 加一个原创分析员 | 参考 `AlphaModel.predict(...) -> Signal` 接口 | 在固定样例验证输出、缺失数据处理和可注册性 |
| 补齐一项回测假设 | 在 `brokers/sim.py` 设计简单费用/滑点模型 | 解释买卖两侧、现金扣减和回测净收益变化 |

名人 Agent 是作者写的风格化提示词，不能称为本人意见、授权或复现本人能力；例如 Graham 文件本身明确说明这一点。[Graham 实现][ai-graham]

**成本与数据。** 顶层 README 要求 Financial Datasets 数据 key；使用 LLM 投资者 Agent 时还需一个支持的模型服务 key。纯规则模型与 LLM Agent 的依赖不同，应分开设置教学预算。缓存可减少重复取数，但不能据此承诺所有离线重跑都不产生费用。[README][ai-readme] · [内部架构][ai-core]

**许可。** 当前为 **MIT**；分发软件副本或实质部分需要保留版权和许可文本。README 的教育研究定位也应在教学中准确保留。项目软件许可不自动授予第三方金融数据的再分发权。[LICENSE][ai-license] · [README][ai-readme]

**未验证。** 未运行 CLI/回测；未验证数据供应商价格和套餐、实际历史覆盖、时点数据完整性或真实成交。内部 README 页首仍描述 v2 尚未接入旧应用，但顶层 README 和当前包入口已切到 `aihf`；这是文档状态不一致，应以固定版本入口为课程依据，发布前跑通验收。[内部说明][ai-core] · [包入口][ai-package]

## 3. RD-Agent：高级量化研发扩展

**当前可做什么。** 这是通用研发 Agent 框架；金融路径包括因子生成、模型生成及因子/模型联合迭代。`rdagent fin_factor`、`fin_model`、`fin_quant` 进入 Qlib 研发循环。它让 Agent 提出假设、写实现、运行实验并依据反馈继续研究；金融部分依赖 Qlib 的训练和组合分析流程。本轮核验的入口不是现成的券商自动下单服务。[README][rd-readme] · [CLI][rd-cli]

**新手前置。** Python、Linux 与 Docker、表格时间序列、收益标签、因子、模型训练、时间划分、过拟合、基准与交易成本；随后再接触自动研究。官方当前说明仅支持 Linux，多数场景依赖 Docker，配置还涉及聊天与 embedding 能力。[运行要求][rd-readme]

**可教的具体修改。** `rdagent/app/qlib_rd_loop/conf.py` 定义训练/验证/测试日期、`evolving_n` 与配置环境前缀；CLI 暴露 `--loop-n`、`--step-n`、`--all-duration`。`factor_template/conf_baseline.yaml` 定义 `topk`、`n_drop`、买卖费用、模型参数和基准。[循环配置][rd-conf] · [CLI][rd-cli] · [基准模板][rd-yaml]

建议练习依次是：读懂一次假设—代码—反馈；限制循环并估计资源消耗；只用验证段挑选参数；固定测试段后比较 `topk`/换手/成本；检查 Agent 生成因子是否使用未来数据。`evolving_n` 与外层 `--loop-n` 所控制的层级需要分别讲清，不能混为一个“运行次数”。

**默认市场必须明确。** 已读模板是 `~/.qlib/qlib_data/cn_data`、`region: cn`、`csi300` 和 `SH000300`，且有中国市场相关交易约束。若教材坚持美股，要另做数据、股票池、基准、交易制度与费用的整体适配和验收，不能只把显示文字换成 SPY。[模板原文][rd-yaml]

**成本与数据。** 需要聊天/embedding 调用、市场数据、Docker 环境和反复训练的计算资源。README 的论文实验预算或收益数字属于特定实验条件，不能写成学生每次运行的报价或成果保证。[README][rd-readme]

**许可。** 当前为 **MIT**，保留版权和许可文本；另行核对所选模型、市场数据与报告材料的条款。[LICENSE][rd-license]

**未验证。** 未下载 Qlib 数据、未运行容器、未测算训练时间/费用、未核验实验收益；未完成美股适配。它适合作为研究方法与代码审查的高级项目，不适合作为第一段零基础教程。

## 教学项目的收束建议

主线只选 ai-hedge-fund 做深：读懂并修改一个 mandate，运行固定窗口模拟，解释风险截断和订单，补充一种交易成本后重新评价。TradingAgents 留作架构阅读：交付一份可追溯研究报告的结构分析，并解释为什么它的回测结果不是组合净收益；若希望侧重辩论型 Agent，可替换为主项目。这样不必为两个快速变化的 LLM 框架同时维护完整课程。

课程可另外由 Qlib 承担规范的因子、时间划分和组合实验；Qlib 的独立选型核验由主任务完成，本备忘录不替代它。RD-Agent 仅作为掌握实验框架后的有条件进阶项目，重点是自动研究的证据审查。

在进入真实外部 API 前，教程可先使用原创的固定数据与预录 Agent 输出教授结构；真正运行开源项目作为后续实验关。预录输出必须标注，不能让玩家误以为游戏已实际连接对应模型或数据服务。

[ta-readme]: https://github.com/TauricResearch/TradingAgents/blob/2d17df8da1536c121e4d7395ac5a5dcec9e96d6f/README.md
[ta-package]: https://github.com/TauricResearch/TradingAgents/blob/2d17df8da1536c121e4d7395ac5a5dcec9e96d6f/pyproject.toml
[ta-backtest]: https://github.com/TauricResearch/TradingAgents/blob/2d17df8da1536c121e4d7395ac5a5dcec9e96d6f/tradingagents/backtest.py
[ta-config]: https://github.com/TauricResearch/TradingAgents/blob/2d17df8da1536c121e4d7395ac5a5dcec9e96d6f/tradingagents/default_config.py
[ta-tree]: https://github.com/TauricResearch/TradingAgents/tree/2d17df8da1536c121e4d7395ac5a5dcec9e96d6f/tradingagents
[ta-license]: https://github.com/TauricResearch/TradingAgents/blob/2d17df8da1536c121e4d7395ac5a5dcec9e96d6f/LICENSE
[ai-readme]: https://github.com/virattt/ai-hedge-fund/blob/154a8b2f46dca0f40764d814e4e747b0ad71f4c4/README.md
[ai-package]: https://github.com/virattt/ai-hedge-fund/blob/154a8b2f46dca0f40764d814e4e747b0ad71f4c4/pyproject.toml
[ai-mandate]: https://github.com/virattt/ai-hedge-fund/blob/154a8b2f46dca0f40764d814e4e747b0ad71f4c4/hedge_fund/fund/example.yaml
[ai-strategy]: https://github.com/virattt/ai-hedge-fund/blob/154a8b2f46dca0f40764d814e4e747b0ad71f4c4/hedge_fund/strategies/deep-value.yaml
[ai-graham]: https://github.com/virattt/ai-hedge-fund/blob/154a8b2f46dca0f40764d814e4e747b0ad71f4c4/hedge_fund/signals/graham.py
[ai-backtest]: https://github.com/virattt/ai-hedge-fund/blob/154a8b2f46dca0f40764d814e4e747b0ad71f4c4/hedge_fund/backtesting/fund.py
[ai-sim]: https://github.com/virattt/ai-hedge-fund/blob/154a8b2f46dca0f40764d814e4e747b0ad71f4c4/hedge_fund/brokers/sim.py
[ai-core]: https://github.com/virattt/ai-hedge-fund/blob/154a8b2f46dca0f40764d814e4e747b0ad71f4c4/hedge_fund/README.md
[ai-license]: https://github.com/virattt/ai-hedge-fund/blob/154a8b2f46dca0f40764d814e4e747b0ad71f4c4/LICENSE
[rd-readme]: https://github.com/microsoft/RD-Agent/blob/4834df2b6f3e417e5d0512dfe4fd24a8ac338b05/README.md
[rd-cli]: https://github.com/microsoft/RD-Agent/blob/4834df2b6f3e417e5d0512dfe4fd24a8ac338b05/rdagent/app/cli.py
[rd-conf]: https://github.com/microsoft/RD-Agent/blob/4834df2b6f3e417e5d0512dfe4fd24a8ac338b05/rdagent/app/qlib_rd_loop/conf.py
[rd-yaml]: https://github.com/microsoft/RD-Agent/blob/4834df2b6f3e417e5d0512dfe4fd24a8ac338b05/rdagent/scenarios/qlib/experiment/factor_template/conf_baseline.yaml
[rd-license]: https://github.com/microsoft/RD-Agent/blob/4834df2b6f3e417e5d0512dfe4fd24a8ac338b05/LICENSE
