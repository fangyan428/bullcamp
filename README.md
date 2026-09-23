# BullCamp · 投资探索营

一套融合投资知识、可操作实验和 Agent 审核的中文教程游戏。**6 个基础任务 + 10 章 40 个任务，共 46 关**；主线全部可离线完成，无登录、API 或外部数据依赖。

面向只掌握 BullCamp 基本概念的学习者。通过具体问题、短讲解、例题、参数实验、Agent 记录核查、新情境题与复盘，建立自己的判断过程。内容以 Damodaran《Investment Philosophies》第二版及公开课的方法谱系为骨架，不是全书逐章替代。

## 开始学习

在线入口：[投资探索营](https://fangyan428.github.io/bullcamp/)。无需登录，学习进度保存在当前浏览器；本地与线上存档分别保存，可在“学习档案”通过 JSON 导出／导入迁移。

直接打开 [`dist/投资探索营.html`](dist/投资探索营.html)，或启动本地预览：

```bash
python3 -m http.server 8765 --bind 127.0.0.1
# 打开 http://127.0.0.1:8765
```

新的存档键为 `bullcamp_academy_v1`，不会覆盖原版的 `bullcamp_state`。线上仅发布新版探索营，不包含原版入口和课程。Git 历史与仓库中的原版源文件保留来源，MIT 许可继续随发布包提供。

## 课程结构

| 阶段 | 任务数 | 知识与操作一起练 |
|---|---:|---|
| 基础补给站 | 6 | 本金与收益、概率与风险、现金与利润、折现、公平比较、证据 |
| 第一份指数计划 | 4 | 基金资料、纳指概念、定投与资金到达时间、订单、计划变更 |
| 照看你的账户 | 4 | 分散、成交账本、再平衡、资金流与绩效 |
| 走进一家公司 | 4 | 生意、三张报表、取数口径、稀释、研究摘要 |
| 给未来一个价格 | 4 | 股权现金流、折现、情境敏感性、相对倍数、预期 |
| 两种投资视角 | 4 | 价值筛选、价值陷阱、成长、比较两种解释 |
| 新消息，新判断 | 4 | 数据公开时点、市场预期、事件研究、更新判断 |
| 把想法变成规则 | 4 | 信号、规则、仓位、执行时点、择时与回场 |
| 收益曲线之后 | 4 | 基准、偏差、费用代码、锁定条件后揭示检验路径 |
| 价差与资金压力 | 4 | 纯套利条件、保证金、并购情境、资金约束 |
| 你的独立研究 | 4 | 理念匹配、修改配置、独立案例、毕业记录 |

每关五步：**理解 → 操作 → 审核 → 迁移 → 复盘**。包含 184 项结构化检查，其中 92 项为新情境题；46 份明确标注的 Agent 教学样本；14 类在主线使用的计算模型；24 项基础概念速查。

- 定投实验对齐资金到达条件、计入未投入现金，可比较定额、有钱即投和等待规则。
- 回测在执行期只读取之前的价格，保留现金、费用、基准和假设。
- 费用练习实际解析限定算术表达式；JSON 配置实际检查预算和仓位约束。
- 第八章与毕业任务保留一次锁定参数后揭示的教学检验；看过的数据不再称为未见样本。
- 错题保留首次作答与订正记录；复盘和 Agent 任务草稿为明确标识的自评。课程不按收益排名。
- 所有公司、行情、概率与财报数字均是原创教学材料，不冒充历史市场数据。

## Python 与真实开源项目

“补充实践”可下载内嵌 ZIP。标准库 Python 实验无需联网，包含数据、配置、账本实验、待修费用函数、测试和运行记录模板。详见 [`practice/README.md`](practice/README.md)。

```bash
python3 practice/lab.py --config practice/config.json --output experiment.json
python3 -m unittest discover -s practice -p 'test_lab.py'
# 学员练习：初次有意失败，修复 exercise.py 后再跑
python3 practice/test_exercise.py
```

真实项目指引包括 TradingAgents、AI Hedge Fund、Qlib，固定到已核查的提交，说明代码入口、修改点与验收要求。RD-Agent 为进一步延伸。**本交付未安装或实跑这些第三方 Agent，未调用付费 API，未连接证券账户。**它们只是补充，不阻塞 46 关主线。

真实项目的环境、模型/数据服务、市场适配与费用需要单独配置。Qlib 示例默认中国市场，其固定版本的官方数据下载存在限制；课程不承诺一键获取美股数据。网页教学配置不是上游配置格式。

## 验证与构建

```bash
node tests/models.test.js
node tests/course.test.js
python3 -m unittest discover -s practice -p 'test_lab.py'
python3 tools/build_academy.py
```

构建脚本同时更新内嵌 Python 练习包 `js/practice-bundle.js` 与完整单文件 HTML。原版构建工具仍供原版使用。

## GitHub Pages 发布

发布来源为 **Deploy from a branch → gh-pages → / (root)**。更新时运行下列发布命令：先验证课程、模型与 Python 实验，再构建并推送专用发布分支，GitHub Pages 自动上线该分支。需要 Git、Node.js、Python 和已登录的 GitHub CLI（`gh`）。

```bash
python3 tools/deploy_pages.py
```

仅推送 `main` 不更新线上网页，修改后需执行上述命令。发布脚本在临时目录操作，不切换当前工作分支，也不强制覆盖远端提交。

只构建并本地预览：

```bash
python3 tools/build_pages.py
python3 -m http.server 8765 --bind 127.0.0.1 --directory _site
```

`_site/` 为专用发布目录，仅含新版单文件网页、Python 练习 ZIP、许可证和 `.nojekyll`，不会发布整个仓库或原版课程。所有脚本与样式内联，兼容 `/bullcamp/` 项目路径。页面更新不会主动清除浏览器进度；换设备或清除网站数据前，请先导出 JSON。

| 文件 | 用途 |
|---|---|
| `js/curriculum.js`、`js/curriculum-more.js` | 46 关讲解、案例、题目和来源 |
| `js/models.js`、`js/controls.js` | 确定计算、输入范围与实验参数 |
| `js/learning.js` | 判分、存档、表达式与配置验证 |
| `js/academy.js`、`css/academy.css` | 路线与任务工作台 |
| `js/resources.js` | 概念手册与固定版本实践指引 |
| `practice/` | 原创离线 Python 实验 |
| `tests/` | 金融行为、课程结构与学习状态测试 |

范围与来源：[`实施计划`](docs/实施计划.md)、[`课程来源与实操审校`](docs/课程来源与实操审校.md)、[`书籍资料`](docs/investment-philosophies-sources.md)、[`开源项目核查`](docs/agent-project-research.md)。此前带“待确认”的文档保留为设计历史，当前范围以实施计划为准。

## 许可与归属

基于 [wcy4213/bullcamp](https://github.com/wcy4213/bullcamp) 的 MIT 项目扩展，保留原版与 LICENSE。第三方项目仅提供固定源码链接和原创说明，没有把第三方源代码或市场数据重新分发进主线。外部项目与数据的使用条件分别适用。
