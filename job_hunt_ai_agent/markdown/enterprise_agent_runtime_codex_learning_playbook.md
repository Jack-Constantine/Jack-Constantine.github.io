# 企业级 Agent 项目 Codex 协作式学习手册

> 配套文档：`enterprise_agent_runtime_prd.md`、`enterprise_agent_runtime_tech_learning.md`、`enterprise_agent_runtime_frontend_design.md`  
> 目标：边做工业级 Agent 项目，边真正学会对应技术栈。Codex 负责放大你的执行力，你负责掌握设计判断、核心代码、调试方法和面试表达。

---

## 1. 这份手册解决什么问题

你现在最大的风险不是“项目做不出来”，而是：

- 项目能跑，但你说不清楚为什么这么设计。
- 代码很多，但你不知道每个模块的输入、输出、边界和失败模式。
- 简历写得工业级，但面试官一问上下文管理、权限控制、MCP、Agent Harness、eval，就暴露是 AI 代写。
- 纯自己写效率太低，纯让 Codex 写又学不到。

所以本项目不采用“让 Codex 一次性把项目写完”的方式，而采用：

```text
理解目标 -> Codex 小步搭骨架 -> 你读代码 -> 你亲手改一处 -> Codex review -> 跑测试 -> 写复盘 -> 面试问答
```

判断一个模块是否完成，不看代码量，看你能不能做到：

- 用 3 分钟解释它为什么存在。
- 画出它的数据流。
- 说清楚它依赖哪些模块，不依赖哪些模块。
- 说清楚它失败时怎么排查。
- 能独立改一个小需求并补测试。

---

## 2. 你和 Codex 的分工

### 2.1 Codex 适合做什么

| 类型 | 让 Codex 做 | 原因 |
|---|---|---|
| 项目初始化 | 生成目录结构、配置、基础脚手架 | 低价值重复劳动，适合自动化 |
| 样板代码 | FastAPI 路由、Pydantic model、React 页面骨架 | 写法标准，重点是你理解结构 |
| 测试辅助 | 生成 pytest、mock、fixture、前端测试思路 | 帮你形成工程化习惯 |
| 代码解释 | 按文件解释职责、输入输出、调用链 | 让你快速建立 mental model |
| Code review | 找 bug、边界条件、缺测试、权限漏洞 | 提升工程质量 |
| Debug 辅助 | 分析报错、定位链路、给排查步骤 | 训练你看日志和 trace |
| 面试训练 | 扮演面试官追问模块设计 | 把项目转成表达能力 |

### 2.2 你必须亲手做什么

| 类型 | 你必须做 | 原因 |
|---|---|---|
| 需求判断 | 每个模块 P0/P1/P2 取舍 | 面试官看重你的产品和工程判断 |
| 核心解释 | 给每个模块写 5-10 行解释 | 防止“会跑但不会讲” |
| 小改动 | 每个模块至少亲手改一个函数或测试 | 建立代码控制感 |
| 测试理解 | 解释每个测试覆盖什么 | 不懂测试就不懂工程边界 |
| Debug 记录 | 记录一次失败、原因、修复过程 | 面试常问“你遇到过什么问题” |
| 面试问答 | 自己先答，再让 Codex 批改 | 训练表达，不是背答案 |

### 2.3 禁止的协作方式

不要这样问 Codex：

```text
帮我把这个项目全部写完。
```

```text
直接实现所有功能，不用解释。
```

```text
报错了，直接修。
```

```text
帮我写一份能放简历上的项目介绍。
```

原因很直接：这些问法会让你变成旁观者。旁观者很难通过技术面。

推荐这样问：

```text
先别写代码。请解释这个模块的职责、输入输出、边界、最小实现和常见坑。
```

```text
只生成 3 个文件以内的最小骨架，核心逻辑留 TODO 给我写。
```

```text
你写完后逐文件解释，并给我 5 个检查问题。等我回答后再继续。
```

```text
我自己改了这个函数。请做 code review，不要直接改，先指出风险和缺的测试。
```

---

## 3. 核心学习协议

每个模块都按同一套协议推进。

### 3.1 六步循环

```text
1. Concept
   先让 Codex 解释概念和模块边界，不写代码。

2. Skeleton
   让 Codex 生成最小骨架，最多 3 个文件，最多一个核心流程。

3. Reading
   你逐文件读代码，并写出自己的理解。

4. Manual Change
   你亲手改一个小功能、参数、边界条件或测试。

5. Review
   让 Codex review 你的解释和改动。

6. Checkpoint
   跑测试，记录学习日志，生成面试问答。
```

### 3.2 每个模块的完成标准

一个模块只有同时满足下面条件，才算完成：

- 代码能跑。
- 有至少一个自动化测试。
- 你写了模块卡片。
- 你亲手改过至少一处核心逻辑或测试。
- 你能回答 Codex 提出的 5 个检查问题。
- 你能用面试语言讲清楚设计取舍。

### 3.3 Patch 大小限制

为了保证你能读懂，前两周所有 Codex 代码修改遵守：

| 场景 | 限制 |
|---|---|
| 新模块第一版 | 不超过 3 个文件 |
| 单次 patch | 尽量不超过 150 行核心代码 |
| API + Runtime 联调 | 可以超过 3 个文件，但必须先给调用链说明 |
| 前端页面 | 一次只做一个页面或一个组件组 |
| 配置文件 | 可以一次性生成，但必须解释每个服务用途 |

如果 Codex 生成太多代码，你要立刻要求：

```text
这次改动太大。请回退到最小可运行切片，只保留 P0，其他功能写成 TODO。
```

---

## 4. 建议建立的学习资产

项目根目录建议最终形成这些文档资产：

```text
docs/
  learning_log.md
  interview_notes.md
  debug_diary.md
  module_cards/
    01_fastapi_gateway.md
    02_langgraph_runtime.md
    03_skill_registry.md
    04_tool_layer.md
    05_mcp_integration.md
    06_rag_context.md
    07_permission_approval.md
    08_agent_harness.md
    09_observability.md
    10_frontend_console.md
  decisions/
    ADR-001-agent-runtime-boundary.md
    ADR-002-why-mcp.md
    ADR-003-permission-model.md
    ADR-004-harness-design.md
```

这些不是装饰品。它们的作用是把“AI 写代码”转化为“你能讲清楚项目”。

---

## 5. 模块学习卡片模板

每完成一个模块，复制下面模板到 `docs/module_cards/`。

```markdown
# 模块名

## 1. 这个模块解决什么问题

用 3-5 行说明它为什么存在。

## 2. 输入与输出

| 输入 | 来源 | 格式 |
|---|---|---|
| | | |

| 输出 | 去向 | 格式 |
|---|---|---|
| | | |

## 3. 核心流程

用 5-8 行描述主链路。

## 4. 我亲手改了什么

- 改动点：
- 为什么改：
- 如何验证：

## 5. 测试覆盖

| 测试 | 覆盖什么 |
|---|---|
| | |

## 6. 失败模式

| 失败 | 表现 | 排查方式 |
|---|---|---|
| | | |

## 7. 面试表达

如果面试官问“这个模块怎么设计”，我会这样回答：

> ...

## 8. 我还不懂什么

- 
```

---

## 6. Codex 提示词模板

### 6.1 开始一个模块前

```text
基于 enterprise_agent_runtime_prd.md 和 enterprise_agent_runtime_tech_learning.md，
我们现在只做【模块名】的 P0。

先不要写代码。请回答：
1. 这个模块在整个 Agent Runtime 中的职责是什么？
2. 它的输入、输出、依赖分别是什么？
3. 最小可运行版本需要哪些文件？
4. 哪些功能先不做？
5. 我需要先理解哪些概念？
```

### 6.2 让 Codex 写最小骨架

```text
现在请只生成【模块名】的最小骨架。
限制：
- 最多改 3 个文件。
- 不实现扩展功能。
- 核心业务逻辑可以留 TODO 给我。
- 写完后逐文件解释。
- 最后给我 5 个检查问题。
```

### 6.3 让 Codex 保留学习空间

```text
这部分我想自己练。请只写 failing test 和接口定义，不要写实现。
我实现后你再 review。
```

### 6.4 让 Codex 审查你的理解

```text
我对这个模块的理解如下：
【粘贴你的解释】

请检查：
1. 哪些地方理解错了？
2. 哪些地方说得太泛？
3. 面试时这样讲是否可信？
4. 还缺哪些关键术语？
```

### 6.5 让 Codex 做 code review

```text
我刚刚亲手改了【功能/测试】。
请做 code review。
要求：
- 先列风险和 bug。
- 不要直接改代码。
- 指出缺少的测试。
- 告诉我这个改动对上下游模块有什么影响。
```

### 6.6 报错时不要直接让 Codex 修

错误问法：

```text
报错了，帮我修。
```

正确问法：

```text
下面是报错和相关代码。
请先不要改代码。
请按这个格式分析：
1. 报错发生在哪一层？
2. 最可能的 3 个原因是什么？
3. 我应该先打印或检查什么？
4. 如果要修，最小改动是什么？
```

### 6.7 面试训练

```text
请扮演 AI Agent 开发实习岗位面试官，围绕【模块名】连续追问我 10 个问题。
要求：
- 从基础概念问到工程细节。
- 每次只问一个问题。
- 我回答后你指出问题，再继续追问。
```

---

## 7. 项目垂直切片顺序

不要按技术栈横向学习，例如“先学完 FastAPI、再学完 LangGraph、再学完 React”。这样很慢，而且容易忘。

应该按垂直切片推进：每个切片都能跑，都能演示，都能学到一个核心能力。

### 7.1 Slice 0：项目骨架与学习合同

目标：

- 建 repo 结构。
- 建 `docs/learning_log.md`、`docs/interview_notes.md`、`docs/module_cards/`。
- 建最小后端、前端、测试目录。
- 明确“每个模块必须写卡片”的规则。

Codex 做：

- 生成目录结构。
- 初始化 Python、Node、Docker 基础配置。
- 写最小 README。

你做：

- 手动阅读目录结构。
- 在 `learning_log.md` 写第一条记录：为什么做这个项目、目标岗位是什么、你现在最弱的 3 个点是什么。
- 把 PRD 中的 P0 范围复述成自己的话。

验收：

- 能说清楚 backend、frontend、mcp-server、harness、docs 各自放什么。
- 能运行一个空测试。

Codex 提示词：

```text
请基于现有三份 markdown，设计项目目录结构。
先不要写完整业务代码，只创建最小可运行骨架和学习文档模板。
写完后解释每个目录的职责。
```

### 7.2 Slice 1：FastAPI Gateway + Mock Run

目标：

- 实现 `POST /api/runs`。
- 不接 LLM，只返回 mock run。
- 前端或 curl 能看到 run_id、status、trace steps。

学什么：

- FastAPI 路由。
- Pydantic request/response schema。
- API 边界设计。
- 为什么前端只调用 Gateway。

Codex 做：

- 写 FastAPI app 骨架。
- 写 request/response model。
- 写一个 mock service。
- 写 pytest。

你做：

- 亲手修改一个 response 字段，例如增加 `risk_level` 或 `selected_skill`。
- 亲手补一个测试，验证字段存在。
- 写模块卡片 `01_fastapi_gateway.md`。

验收：

- `pytest` 通过。
- 你能解释为什么 schema 不能随便返回 dict。
- 你能解释 Gateway 和 Runtime 为什么分层。

面试 checkpoint：

```text
Q：为什么 Agent 平台需要 API Gateway，而不是前端直接调 LangGraph 或 MCP？
```

### 7.3 Slice 2：LangGraph Runtime 的最小状态机

目标：

- 用 LangGraph 表示 Router -> Planner -> Executor -> Synthesizer。
- 先不接真实 LLM，每个节点返回固定结果。
- trace 记录每个节点输入输出。

学什么：

- 状态机。
- Agent workflow。
- 节点边界。
- trace 结构。

Codex 做：

- 搭 LangGraph 最小工作流。
- 定义 `AgentState`。
- 写一个 run service 调用 graph。

你做：

- 亲手新增一个节点字段，例如 `evidence_refs`。
- 让一个测试检查 trace 中包含该字段。
- 画出 Runtime 执行流。

验收：

- 输入一个 CI 失败任务，输出固定分析结果。
- trace 至少包含 router、planner、executor、synthesizer。
- 你能解释为什么用状态图，而不是一个超长函数。

面试 checkpoint：

```text
Q：LangGraph 在这个项目里解决了什么？不用它能不能做？
```

### 7.4 Slice 3：Skill Registry

目标：

- 用 YAML/JSON 定义 skill。
- 每个 skill 绑定 prompt、allowed_tools、risk_policy、eval_tags。
- Runtime 根据任务选择 skill。

学什么：

- Skills 与 Tools 的区别。
- prompt、工具权限、评测标签如何绑定。
- 配置驱动设计。

Codex 做：

- 设计 skill schema。
- 写 loader 和 validator。
- 写 2 个 skill 示例：`ci_triage`、`incident_triage`。

你做：

- 亲手新增一个 `issue_planning` skill。
- 故意写错一个字段，看 Pydantic validator 如何报错。
- 写模块卡片 `03_skill_registry.md`。

验收：

- Runtime 能返回 selected_skill。
- skill 配置错误会在启动或加载时失败。
- 你能解释 Skill 和 Tool 的边界。

面试 checkpoint：

```text
Q：为什么不把所有 prompt 和 tool 权限硬编码在代码里？
```

### 7.5 Slice 4：Tool Layer 与本地工具调用

目标：

- 实现 tool registry。
- 本地 mock 工具：`repo.search_code`、`ci.get_logs`、`ticket.create_draft`。
- 工具调用前检查 schema 和 risk tier。

学什么：

- Tool Calling。
- 函数 schema。
- 参数校验。
- 工具失败处理。

Codex 做：

- 写 tool interface。
- 写 registry。
- 写 2-3 个 mock tools。
- 写工具调用 trace。

你做：

- 亲手实现一个 mock tool。
- 亲手加一个参数校验失败测试。
- 记录一次 tool error 的 debug diary。

验收：

- Agent 执行时能调用工具并写入 trace。
- 参数错误不会让系统崩溃，而是返回结构化错误。
- 你能解释 tool schema 为什么重要。

面试 checkpoint：

```text
Q：Agent 为什么不能直接执行任意 Python 函数？
```

### 7.6 Slice 5：RAG 与上下文管理

目标：

- 建文档 ingestion。
- 用 Qdrant 或本地 FAISS 做检索。
- Runtime 把 top-k evidence 放进上下文。
- 输出必须引用 evidence id。

学什么：

- chunking。
- embedding。
- top-k retrieval。
- context budget。
- evidence-grounded answer。

Codex 做：

- 搭最小 ingestion pipeline。
- 写 retrieval interface。
- 写 mock 文档和测试。

你做：

- 亲手调 chunk size 或 top-k，观察结果变化。
- 亲手写一个检索失败 case。
- 写模块卡片 `06_rag_context.md`。

验收：

- 最终答案包含 evidence refs。
- 检索为空时系统能 fallback。
- 你能解释上下文不是越多越好。

面试 checkpoint：

```text
Q：RAG 失败时你怎么判断是切分问题、召回问题、排序问题还是生成问题？
```

### 7.7 Slice 6：MCP 集成

目标：

- 用 TypeScript 写一个 MCP server。
- 暴露至少一个工具，例如 `repo.search_code` 或 `ci.get_logs`。
- Python Runtime 通过 MCP client 调用。

学什么：

- MCP server/client/tools/resources。
- 标准化工具接入。
- 跨语言服务边界。
- 工具独立部署。

Codex 做：

- 生成 MCP server 最小骨架。
- 写一个 mock tool。
- 写 Python 调用示例。

你做：

- 亲手新增一个 MCP tool。
- 亲手改一次 tool schema。
- 解释为什么这个工具适合放在 MCP server，而不是 Python 本地函数。

验收：

- MCP server 能独立启动。
- Runtime 能调用 MCP tool。
- trace 中能区分 local tool 和 MCP tool。

面试 checkpoint：

```text
Q：MCP 对企业 Agent 平台的价值是什么？它是不是只是换一种 function call？
```

### 7.8 Slice 7：权限、审批与审计

目标：

- 实现 RBAC + risk tier + approval gate。
- R0/R1 可直接执行。
- R2 生成 approval request。
- R3 blocked 或 draft-only。

学什么：

- 权限模型。
- human-in-the-loop。
- 审计日志。
- 高风险操作降级。

Codex 做：

- 写 permission policy。
- 写 approval model。
- 写 `/api/approvals`。
- 写审计记录。

你做：

- 亲手新增一个风险规则。
- 亲手写一个“无权限用户不能执行 R2 tool”的测试。
- 写模块卡片 `07_permission_approval.md`。

验收：

- 高风险工具不会被直接执行。
- 审批通过或拒绝都有审计记录。
- 前端能显示不同角色的按钮状态。

面试 checkpoint：

```text
Q：你如何防止 Agent 调用工具造成生产事故？
```

### 7.9 Slice 8：Agent Harness、Eval 与 Replay

目标：

- 建 eval dataset。
- 支持批量运行 case。
- 支持 replay trace。
- grader 输出 routing、tool_choice、evidence、permission、final_answer 分数。

学什么：

- Agent Harness。
- eval case 设计。
- rule-based grader。
- regression test。
- failure taxonomy。

Codex 做：

- 写 harness runner。
- 写 eval case schema。
- 写 2-3 个 grader。
- 写 eval report。

你做：

- 亲手新增 3 个 eval case。
- 亲手调整一个 grader 规则。
- 写一条失败分析：为什么这个 case 没过。

验收：

- 可以运行 eval suite。
- 能看到通过率和失败原因。
- 改 prompt 或 tool 后能比较前后结果。

面试 checkpoint：

```text
Q：Agent Harness 和普通单元测试有什么区别？
```

### 7.10 Slice 9：可观测性

目标：

- 每次 run 记录 trace、latency、token/cost、tool success rate。
- 接 Langfuse/LangSmith 之一。
- 接 Prometheus/Grafana 做服务指标。

学什么：

- LLM trace。
- 服务 metrics。
- 日志、指标、链路的区别。
- 线上排障。

Codex 做：

- 接 tracing middleware。
- 写 metrics endpoint。
- 写 System Health mock。

你做：

- 亲手新增一个 metric。
- 亲手制造一次 tool failure，观察 trace。
- 写 debug diary。

验收：

- Run Detail 能看到完整 trace。
- System Health 能看到组件状态。
- 你能解释 Agent 出错时先看什么。

面试 checkpoint：

```text
Q：如果用户说 Agent 最近效果变差了，你怎么定位？
```

### 7.11 Slice 10：前端控制台 P0

目标：

- 按 `enterprise_agent_runtime_frontend_design.md` 实现 P0 页面：
- Run Workbench。
- Run Trace Detail。
- Approval Queue。
- Eval Dashboard。

学什么：

- React + TypeScript。
- TanStack Query。
- 路由。
- 控制台信息架构。
- 用 UI 表达 trace、权限、eval。

Codex 做：

- 生成 Vite + React 骨架。
- 写 API client。
- 写页面组件骨架。
- 写 mock 数据或对接后端 API。

你做：

- 亲手改一个组件，例如 `TraceTimeline` 或 `RiskBadge`。
- 亲手加一个 loading/error 状态。
- 解释为什么这个前端不是聊天窗口。

验收：

- 面试官 5 分钟内能看到 run、trace、approval、eval。
- 前端能体现 Skills、Tools、MCP、权限、Harness。
- 你能解释前端如何服务 Agent 工程化，而不是只做展示。

面试 checkpoint：

```text
Q：这个项目为什么需要前端？CLI 不够吗？
```

### 7.12 Slice 11：生产化与作品集包装

目标：

- Docker Compose 一键启动。
- GitHub Actions 跑测试。
- README 写清楚架构、启动、Demo、限制。
- 准备简历和面试讲解材料。

学什么：

- 服务编排。
- CI。
- 环境变量。
- Demo 脚本。
- 项目包装。

Codex 做：

- 写 Docker Compose。
- 写 GitHub Actions。
- 整理 README。
- 生成 Demo checklist。

你做：

- 亲手从零启动一次项目。
- 亲手修一个启动失败问题。
- 录制或写一份 5 分钟 Demo 讲稿。

验收：

- 新机器按 README 能跑起来。
- 测试在 CI 中通过。
- 你能完整讲一遍项目架构和权衡。

面试 checkpoint：

```text
Q：如果这个系统要上线给真实研发团队用，下一步你会补什么？
```

---

## 8. 四周执行节奏

### 第 1 周：主链路跑通

目标：先让系统像一个 Agent Runtime，而不是一堆技术名词。

| 天 | 做什么 | 学什么 | 你必须产出 |
|---|---|---|---|
| Day 1 | Slice 0 项目骨架 | 项目边界 | learning_log 第一条 |
| Day 2 | Slice 1 FastAPI Gateway | API/schema | Gateway 模块卡片 |
| Day 3 | Slice 2 LangGraph mock runtime | 状态机 | Runtime 流程图 |
| Day 4 | Slice 3 Skill Registry | skill/tool 边界 | 新增 issue_planning skill |
| Day 5 | Slice 4 本地 Tool Layer | tool schema | 亲手实现一个 tool |
| Day 6 | 集成 run -> skill -> graph -> tool | 调用链 | 一次端到端测试 |
| Day 7 | 复盘 + 面试问答 | 表达 | interview_notes 第一版 |

第 1 周不要追求真实 LLM 效果。重点是架构和链路。

### 第 2 周：RAG、MCP、权限

目标：让项目从 demo 变成企业集成型 Agent。

| 天 | 做什么 | 学什么 | 你必须产出 |
|---|---|---|---|
| Day 8 | RAG ingestion | chunk/embedding | 一份 mock docs |
| Day 9 | Retrieval + evidence refs | context budget | RAG 模块卡片 |
| Day 10 | MCP server 骨架 | MCP 概念 | MCP server 能启动 |
| Day 11 | Python 调 MCP | 跨服务调用 | 新增一个 MCP tool |
| Day 12 | RBAC + risk tier | 权限模型 | 一条风险规则 |
| Day 13 | approval gate | human-in-loop | approval API |
| Day 14 | 复盘 + 面试问答 | 安全表达 | 权限/MCP 问答 |

第 2 周的关键是你能解释：为什么企业 Agent 不能只靠 prompt。

### 第 3 周：Agent Harness、评测、可观测

目标：证明你知道 Agent 不是“能回答一次”就结束，而是需要持续评测和调试。

| 天 | 做什么 | 学什么 | 你必须产出 |
|---|---|---|---|
| Day 15 | eval case schema | eval 设计 | 5 个 eval cases |
| Day 16 | harness runner | 批量运行 | eval report |
| Day 17 | graders | 评分规则 | 调整一个 grader |
| Day 18 | replay trace | 回放 | 失败复盘一条 |
| Day 19 | Langfuse/LangSmith | LLM trace | trace 截图或说明 |
| Day 20 | Prometheus/Grafana | 服务指标 | 一个自定义 metric |
| Day 21 | 复盘 + 面试问答 | 观测表达 | Harness 模块卡片 |

第 3 周是简历区分度最高的一周。很多项目只有 Agent，没有 Harness。

### 第 4 周：前端、生产化、作品集

目标：把项目变成可演示、可启动、可讲解的作品。

| 天 | 做什么 | 学什么 | 你必须产出 |
|---|---|---|---|
| Day 22 | React 项目骨架 | 前端结构 | 路由和布局 |
| Day 23 | Run Workbench | 表单/API | 提交 run |
| Day 24 | Trace Detail | trace UI | TraceTimeline 改动 |
| Day 25 | Approval Queue | 权限 UI | RiskBadge 改动 |
| Day 26 | Eval Dashboard | 图表 | eval 趋势图 |
| Day 27 | Docker Compose | 部署 | 一键启动 |
| Day 28 | README + Demo + 简历 | 包装 | 5 分钟讲稿 |

第 4 周不要把时间浪费在过度美化。前端必须服务于工业能力展示：trace、approval、eval、health。

---

## 9. 每天的固定训练流程

每天建议按这个节奏：

| 时间 | 任务 | 产出 |
|---|---|---|
| 15 分钟 | 读当天模块相关文档 | 写 3 个关键词 |
| 30 分钟 | 让 Codex 解释概念和边界 | 记录模块输入输出 |
| 60-90 分钟 | Codex 小步实现或补骨架 | 可运行代码 |
| 30 分钟 | 你亲手改一处 | commit 或 diff |
| 20 分钟 | 跑测试 + 让 Codex review | 修复问题 |
| 10 分钟 | 写 learning log | 当天复盘 |
| 10 分钟 | 面试 Q&A | 记录一问一答 |

如果当天时间不够，优先顺序是：

```text
跑通最小链路 > 你亲手改一处 > 写模块卡片 > 扩展功能
```

---

## 10. Learning Log 模板

每天写一条，不需要长，但必须具体。

```markdown
## YYYY-MM-DD

### 今天做了什么

- 

### 我学到的 3 个概念

1. 
2. 
3. 

### 我亲手改了什么

- 文件：
- 改动：
- 验证：

### 今天遇到的一个问题

- 现象：
- 原因：
- 解决：

### 面试可讲点

> 

### 明天要做什么

- 
```

---

## 11. 什么时候让 Codex 写，什么时候自己写

| 任务 | Codex 写 | 你写 | 原因 |
|---|---:|---:|---|
| 目录结构 | 是 | 读懂即可 | 重复劳动 |
| Pydantic schema 第一版 | 是 | 改字段/补校验 | 学 API 契约 |
| FastAPI route 样板 | 是 | 补测试/改错误处理 | 学接口边界 |
| LangGraph 节点骨架 | 是 | 改 state 字段/节点逻辑 | 学状态流 |
| Skill YAML | 部分 | 至少手写一个 skill | 学配置驱动 |
| Tool schema | 部分 | 至少手写一个 tool | 学工具抽象 |
| 权限规则 | 部分 | 至少手写一条规则和测试 | 学安全边界 |
| Grader | 部分 | 至少改一个评分规则 | 学 eval 判断 |
| React 页面骨架 | 是 | 改一个核心组件 | 学 UI 数据流 |
| README | Codex 起草 | 你必须改成自己的表达 | 面试不能背 AI 文案 |
| 简历项目描述 | Codex 提供草稿 | 你最终定稿 | 必须和你真实掌握一致 |

---

## 12. Debug 时怎么借助 Codex 学东西

Debug 是最容易真正学会工程的环节。不要跳过。

### 12.1 Debug 记录模板

```markdown
# Debug Diary: 标题

## 1. 现象

运行什么命令，出现什么报错。

## 2. 第一判断

我认为问题可能在：

- 

## 3. Codex 帮我分析了什么

- 

## 4. 最终原因

- 

## 5. 修复方式

- 

## 6. 下次如何避免

- 

## 7. 面试表达

> 我当时遇到过一个问题...
```

### 12.2 Debug 提示词

```text
请把这个问题当成一次工程排障训练。
不要直接给最终代码。
请先告诉我：
1. 这个错误属于配置、依赖、类型、运行时、网络还是数据问题？
2. 应该先看哪 3 个文件或日志？
3. 如何设计最小复现？
4. 修复后应该补什么测试？
```

---

## 13. 用 Codex 做代码审查

每个 slice 结束后都让 Codex 做一次 review。

提示词：

```text
请以 code review 的方式审查当前改动。
重点看：
1. 是否有真实 bug。
2. 是否有权限或安全风险。
3. 是否有边界条件没测。
4. 是否违反 enterprise_agent_runtime_prd.md 的设计。
5. 是否有过度工程或不必要复杂度。

请先列 findings，再给建议。不要直接修改。
```

你要把 review 结果分三类：

| 类型 | 处理 |
|---|---|
| 必修 bug | 当天修 |
| 缺测试 | 尽量当天补 |
| 架构建议 | 记录到 ADR 或 TODO，不要随便扩大范围 |

---

## 14. 用 Codex 训练面试表达

面试训练不是最后一周才做，而是每个模块结束就做。

### 14.1 单模块训练

```text
请基于当前【模块名】扮演面试官。
连续追问我 8 个问题。
要求：
- 一个问题一个问题问。
- 如果我回答泛泛而谈，请指出。
- 如果我答错，请给正确答案和项目中的对应代码位置。
- 最后帮我整理一版 2 分钟表达。
```

### 14.2 全项目训练

```text
请扮演 AI Agent 开发实习面试官。
围绕我的企业级研发与运维 Agent Runtime 项目进行 30 分钟技术面。
重点追问：
- 为什么选这个场景。
- LangGraph 怎么组织任务。
- Skill 和 Tool 如何设计。
- MCP 解决什么问题。
- 上下文怎么管理。
- 权限怎么控制。
- Agent Harness 怎么评测。
- 可观测性怎么排障。
- 前端如何体现工程化能力。
```

### 14.3 简历可信度检查

```text
下面是我的项目简历描述。
请以面试官视角判断：
1. 哪些表述太虚？
2. 哪些点可能被追问？
3. 哪些技术我必须能讲到代码级？
4. 哪些词应该删掉，避免被问穿？
```

---

## 15. 你应该怎么向 Codex 下达一次完整任务

推荐固定格式：

```text
当前目标：
只实现【slice 名称】的 P0。

参考文档：
- enterprise_agent_runtime_prd.md
- enterprise_agent_runtime_tech_learning.md
- enterprise_agent_runtime_frontend_design.md

限制：
- 不要做 P1/P2。
- 单次改动不超过 3 个核心文件。
- 写完后解释调用链。
- 给我一个我必须亲手完成的 TODO。
- 给我 5 个检查问题。

验收：
- 能运行【命令】。
- 测试覆盖【场景】。
- 我能解释【概念】。
```

示例：

```text
当前目标：
只实现 Slice 3 Skill Registry 的 P0。

参考文档：
- enterprise_agent_runtime_prd.md
- enterprise_agent_runtime_tech_learning.md

限制：
- 不接 LLM。
- 不接数据库。
- skill 从本地 YAML 加载。
- 单次改动不超过 3 个核心文件。
- issue_planning skill 留给我自己写。

验收：
- pytest 能验证 skill loader。
- Runtime 能返回 selected_skill。
- 我能解释 Skill 和 Tool 的区别。
```

---

## 16. 如何防止 Codex 把范围做大

Codex 容易把项目做成“大而全”。你要主动收缩。

常用控制句：

```text
停止扩展，只保留 P0。
```

```text
不要新增架构层，先用最简单实现。
```

```text
这个功能先写 TODO，不实现。
```

```text
请说明这个改动是否必要。如果不是 P0，就不要做。
```

```text
请把这次 patch 拆成 2-3 个小步骤。
```

```text
我现在的目标是学会，不是追求代码量。请保留一个核心函数让我自己实现。
```

---

## 17. 和现有三份文档的关系

| 文档 | 用途 | 什么时候看 |
|---|---|---|
| `enterprise_agent_runtime_prd.md` | 定义产品目标、场景、功能、架构、面试问答 | 每个 slice 开始前 |
| `enterprise_agent_runtime_tech_learning.md` | 定义技术栈、学习深度、四周路线 | 每天确定学习目标 |
| `enterprise_agent_runtime_frontend_design.md` | 定义前端页面、原型、组件、交互 | 第 4 周和前端 slice |
| `enterprise_agent_runtime_codex_learning_playbook.md` | 定义你和 Codex 怎么协作 | 每天实际执行 |

简单说：

```text
PRD 决定做什么。
Tech Learning 决定学什么。
Frontend Design 决定怎么展示。
Codex Playbook 决定怎么边做边学。
```

---

## 18. 最小可行学习闭环示例

以 `Skill Registry` 为例，一天内可以这样做：

### Step 1：让 Codex 讲

```text
先不要写代码。请解释 Skill Registry 在这个项目中的职责、输入输出、边界和最小实现。
```

### Step 2：让 Codex 写骨架

```text
请实现 Skill Registry P0。
限制：最多 3 个文件，skill 从 YAML 加载，issue_planning skill 留给我写。
```

### Step 3：你读代码

你要能写出：

```text
Skill Registry 的输入是本地 YAML，输出是经过校验的 SkillDefinition。
Runtime 不直接读取 YAML，而是通过 registry 查询 skill。
这样做的好处是 prompt、allowed_tools、risk_policy、eval_tags 可以配置化。
```

### Step 4：你亲手改

你自己写 `issue_planning.yaml`，并补一个测试：

```text
加载 issue_planning 时，allowed_tools 必须包含 ticket.create_draft。
```

### Step 5：让 Codex review

```text
我新增了 issue_planning skill 和测试。
请 review schema 是否合理，测试是否覆盖关键行为。
不要直接改代码。
```

### Step 6：写模块卡片

最终你要能回答：

```text
Q：Skill 和 Tool 有什么区别？
A：Skill 是面向任务的能力包，包含 prompt、allowed_tools、risk policy 和 eval tags；Tool 是可执行动作。Skill 决定做什么和允许用什么，Tool 负责具体执行。
```

---

## 19. 什么时候可以认为你真的学会了

不是“看懂代码”就算学会。下面这些更可靠：

| 能力 | 证明方式 |
|---|---|
| 能读 | 你能逐文件说明职责 |
| 能改 | 你能独立改一个小需求 |
| 能测 | 你能补一个针对性测试 |
| 能查 | 报错时你知道先看哪层 |
| 能讲 | 你能回答面试追问 |
| 能取舍 | 你能解释为什么不做某个功能 |

每周末做一次自测：

```text
请基于本周完成的代码和文档，对我进行一次模拟技术面。
每次只问一个问题。
如果我回答不具体，请继续追问到代码级别。
最后给我评分，并指出下周最该补的 3 个短板。
```

---

## 20. 最终简历表达应该来自过程

如果你按这套方式做，简历上可以写得更可信：

```text
企业级研发与运维 Agent Runtime
- 设计并实现面向 CI 失败排查、告警初筛和 Issue 拆解的 Agent Runtime，基于 LangGraph 编排 Router、Planner、Executor、Synthesizer 状态流。
- 设计 Skill Registry，将 prompt、allowed tools、risk policy、eval tags 配置化，支持不同任务场景复用。
- 通过 Tool Registry 和 TypeScript MCP Server 接入 repo、CI、ticket 等外部工具，并在 Python Runtime 中统一调用和记录 trace。
- 实现 RBAC + risk tier + approval gate，限制高风险工具调用并记录审计日志。
- 构建 Agent Harness，支持 eval dataset、trace replay、rule-based grader 和失败分类，用于回归评测 Agent 行为。
- 使用 React + TypeScript 构建工程控制台，展示 run trace、approval queue、eval dashboard 和 system health。
```

但前提是：每一条你都能讲到代码级。不能讲清楚的，就不要写。

---

## 21. 第一轮建议从哪里开始

下一步不要直接开写完整项目。先做 Slice 0 和 Slice 1。

第一条可以这样发给 Codex：

```text
我们开始企业级研发与运维 Agent Runtime 项目。
请先阅读这四份文档：
- enterprise_agent_runtime_prd.md
- enterprise_agent_runtime_tech_learning.md
- enterprise_agent_runtime_frontend_design.md
- enterprise_agent_runtime_codex_learning_playbook.md

当前只做 Slice 0：项目骨架与学习合同。

限制：
- 不写业务逻辑。
- 只创建目录结构、最小配置、docs 学习模板。
- 给我解释每个目录为什么存在。
- 留一个 README 中的 TODO 给我自己补。

验收：
- 后端和前端目录存在。
- docs/learning_log.md、docs/interview_notes.md、docs/module_cards/ 存在。
- 我能说清楚每个目录职责。
```

完成 Slice 0 后，再做 Slice 1：

```text
现在做 Slice 1：FastAPI Gateway + Mock Run。
限制：
- 不接 LLM。
- 不接数据库。
- 只实现 POST /api/runs 和 GET /api/runs/{run_id} 的 mock 版本。
- 单次改动最多 3 个核心文件。
- 你写基础测试，我亲手补一个字段测试。
```

---

## 22. 总结

这套方式的核心不是“少用 Codex”，而是“正确使用 Codex”：

- 让 Codex 替你处理低价值重复劳动。
- 让 Codex 帮你解释、审查、测试、追问。
- 让你自己负责设计判断、核心小改动、复盘和表达。
- 每个模块都留下学习证据。

最后面试官看到的不只是一个能跑的项目，而是一个你能解释、能调试、能扩展、能上线思考的工程作品。
