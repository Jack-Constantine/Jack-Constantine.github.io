# 企业级研发与运维 Agent 平台技术栈与学习路线

> 目标：解释每个技术栈在项目里做什么、为什么选、要学到什么程度、怎么学、最终产出什么。本文配套 `enterprise_agent_runtime_prd.md` 使用。

## 1. 学习原则

本项目不是为了堆技术名词，而是为了让你能在面试中讲清：

- 一个 Agent 系统如何从用户请求进入。
- 如何拆解任务、选择 skill、调用 tool。
- 如何通过 MCP 接外部系统。
- 如何管理上下文、权限、审批和审计。
- 如何通过 Agent Harness 做回放、评测和回归。
- 如何部署成接近生产环境的系统。

学习顺序遵循：先跑通主链路，再补工程化，再补可观测和评测，最后补展示型集成。

## 2. 技术栈总览

| 分类 | 技术 | 项目用途 | 掌握深度 |
|---|---|---|---|
| 主语言 | Python | Runtime、API、RAG、eval、tools | 深 |
| API 服务 | FastAPI | 对外 API、Webhook、Health Check | 深 |
| 数据模型 | Pydantic | 请求、响应、tool schema、skill schema | 深 |
| Agent 编排 | LangGraph | Router、Planner、Executor、Verifier 状态图 | 深 |
| LLM API | OpenAI-compatible API / Qwen / DeepSeek | 推理、结构化输出、tool decision | 中深 |
| Tool Calling | Function calling / structured tools | 原子工具调用 | 深 |
| MCP | Python client + TypeScript server | 标准化外部工具接入 | 中深 |
| Skill 系统 | YAML/JSON registry | 可复用任务能力声明 | 深 |
| RAG | chunking + embedding + retrieval + rerank | Runbook、代码说明、事故复盘检索 | 深 |
| 向量库 | Qdrant | 文档向量检索 | 中深 |
| 本地检索 | FAISS | 本地 fallback 和学习对照 | 中 |
| 结构化存储 | PostgreSQL | runs、tools、approvals、evals、audit | 中深 |
| 缓存/状态 | Redis | session、approval state、短期记忆、锁 | 中 |
| 异步任务 | Celery / Arq | 长任务、eval suite、后台 replay | 中 |
| 可观测 | Langfuse / LangSmith | trace、prompt version、eval 结果 | 中深 |
| 系统指标 | Prometheus + Grafana | latency、error rate、tool success rate | 中 |
| 部署 | Docker Compose | 一键启动本地生产化环境 | 中深 |
| CI/CD | GitHub Actions | test、lint、eval gate、docker build | 中 |
| 自动化入口 | n8n | webhook 触发 Agent workflow | 浅中 |
| 对照平台 | Dify | 作为平台型 RAG/Workflow 对照组 | 浅 |
| 前端框架 | React + TypeScript + Vite | Web Console，展示 run、trace、approval、eval | 中 |
| 前端数据层 | TanStack Query | 请求、缓存、轮询、错误状态 | 中 |
| 前端路由 | React Router | Workbench、Trace、Approval、Eval、Registry 多页面 | 浅中 |
| 前端图表 | Recharts / ECharts | eval 趋势、失败分类、工具耗时 | 浅中 |
| 前端流程图 | React Flow | P2 展示 Agent 状态图和工具调用图 | 浅 |
| 代码质量 | pytest、ruff、mypy | 测试、格式、类型检查 | 中深 |

## 3. 核心技术栈详解

### 3.1 Python

项目里用来做什么：

- Agent Runtime 主逻辑。
- FastAPI 服务。
- RAG pipeline。
- Tool implementations。
- Agent Harness、eval、replay。

为什么选：

- 岗位清单里 Python 是最高频语言。
- LLM、RAG、Agent、eval 工具生态最完整。

学到什么程度：

- 熟练写类型标注、dataclass/Pydantic model、异常处理、日志。
- 能组织多模块项目。
- 能写 pytest。
- 能解释 async 和 sync 的边界。

怎么学：

- 先补 `typing`、`pathlib`、`logging`、`httpx`、`pytest`。
- 每写一个模块都写最小测试。
- 每个 tool 都要求输入输出可序列化。

项目产出：

- `runtime/`
- `tools/`
- `evals/`
- `api/`

### 3.2 FastAPI

项目里用来做什么：

- 提供 `/api/runs`、`/api/skills`、`/api/evals/run`。
- 接 n8n、CI webhook、告警 webhook。
- 暴露 health check 和 readiness check。

为什么选：

- 类型约束清晰，和 Pydantic 配合好。
- 适合服务化和工程岗位展示。

学到什么程度：

- 路由、依赖注入、异常处理、中间件、BackgroundTasks。
- OpenAPI schema。
- JWT 简单认证。

怎么学：

- 先写一个 `/api/runs` 同步接口。
- 再写一个异步长任务接口。
- 最后加 auth dependency 和错误响应。

项目产出：

- `api/main.py`
- `api/routes/runs.py`
- `api/routes/evals.py`
- `api/dependencies/auth.py`

### 3.3 Pydantic

项目里用来做什么：

- 定义 RunRequest、RunResult、ToolCall、SkillSpec、ApprovalRequest。
- 约束 LLM 结构化输出。
- 校验 skill registry 配置。

为什么选：

- 工业级项目不能让 JSON 在系统里裸奔。
- tool schema、API schema、eval schema 都要结构化。

学到什么程度：

- BaseModel、Field、Literal、Enum、model_validator。
- JSON schema 导出。

怎么学：

- 给每个 API 和 tool 写 schema。
- 给 skill yaml 加解析和校验。

项目产出：

- `schemas/skill.py`
- `schemas/tools.py`
- `schemas/runs.py`

### 3.4 LangGraph

项目里用来做什么：

- 实现 router -> planner -> executor -> verifier -> approval -> finalizer。
- 保存 state。
- 支持 human-in-the-loop。
- 支持失败恢复和 replay。

为什么选：

- 岗位里多次出现 LangGraph、workflow、状态机、多 Agent 编排。
- LangGraph 官方强调 durable execution、persistence、human-in-the-loop、memory 和生产部署。

学到什么程度：

- 能定义 StateGraph。
- 能设计节点和边。
- 能处理 conditional edges。
- 能解释 state 如何流转。

怎么学：

- 第一步写固定 4 节点图。
- 第二步加入条件路由。
- 第三步加入 approval interrupt。
- 第四步接 LangSmith/Langfuse trace。

项目产出：

- `runtime/graph.py`
- `runtime/nodes/router.py`
- `runtime/nodes/planner.py`
- `runtime/nodes/executor.py`
- `runtime/nodes/verifier.py`

### 3.5 LLM API

项目里用来做什么：

- Router 判断任务类型。
- Planner 拆解任务。
- Verifier 判断证据是否足够。
- Finalizer 生成结构化结论。

为什么选：

- 岗位要求会调用主流 LLM API。
- 使用 OpenAI-compatible API 可以兼容 OpenAI、Qwen、DeepSeek 等模型。

学到什么程度：

- 会配置 API key、base_url、model。
- 会处理超时、重试、限流。
- 会要求 JSON schema 输出。
- 会记录 token 和 cost。

怎么学：

- 先写 `llm/client.py` 包装一次请求。
- 再写结构化输出。
- 再写 retry 和 fallback。

项目产出：

- `llm/client.py`
- `llm/prompts/`
- `llm/model_registry.py`

### 3.6 Tool Calling

项目里用来做什么：

- 让 Agent 调用 Git、CI、日志、指标、RAG、工单等工具。

为什么选：

- Tool use 是所有 Agent 岗位的基础能力。
- 没有 tool calling 的 Agent 只能回答，不能进入工作流。

学到什么程度：

- 能定义工具名、描述、参数 schema、返回 schema。
- 能处理工具错误和超时。
- 能记录 tool trace。

怎么学：

- 每个 tool 先写纯函数。
- 再包成 ToolSpec。
- 最后由 Executor 根据 plan 调用。

项目产出：

- `tools/base.py`
- `tools/github_tools.py`
- `tools/ci_tools.py`
- `tools/log_tools.py`
- `tools/metrics_tools.py`

### 3.7 MCP

项目里用来做什么：

- 用 TypeScript MCP server 暴露 repo、CI、Runbook、ticket 工具。
- Python Runtime 通过 MCP client 调用。

为什么选：

- MCP 是公司把 Agent 接入已有系统的重要方向。
- 它能体现你理解“工具协议”和“系统集成”，不是只会写函数。

学到什么程度：

- 知道 MCP server、client、tools、resources 的基本概念。
- 能写一个 server 暴露 3 到 5 个 tools。
- 能从 Python 调 MCP tool。

怎么学：

- 先读 MCP intro。
- 用 TypeScript 写最小 server。
- 把本地 fixture 当成 GitHub/CI 数据源。
- 用 Python client 在 Runtime 中调用。

项目产出：

- `mcp/ts-server/src/index.ts`
- `mcp/python_client.py`

### 3.8 Skill Registry

项目里用来做什么：

- 把 `triage_ci_failure`、`analyze_incident_alert`、`issue_to_plan` 等能力注册成 skill。

为什么选：

- 招聘里常见 `Skill / capability module / workflow`。
- Skill 能把 prompt、tools、权限、eval 绑定成一个可复用单元。

学到什么程度：

- 能设计 SkillSpec。
- 能加载 YAML。
- 能校验 allowed_tools 和 output_schema。
- 能做版本管理。

怎么学：

- 先写 4 个 yaml。
- 再写 loader。
- 再接入 Runtime router。

项目产出：

- `skills/triage_ci_failure.yaml`
- `skills/analyze_incident_alert.yaml`
- `skills/issue_to_plan.yaml`
- `skills/retrieve_engineering_context.yaml`
- `runtime/skill_registry.py`

### 3.9 RAG

项目里用来做什么：

- 检索 Runbook、事故复盘、代码说明、架构文档。
- 为 final answer 提供 citation。

为什么选：

- 岗位清单中 RAG、embedding、向量检索、重排序高频出现。
- 工业 Agent 必须基于证据回答。

学到什么程度：

- 文档加载、切分、embedding、hybrid search、rerank、citation。
- 知道 chunk size、overlap、metadata 的影响。
- 能解释 RAG 失败怎么排查。

怎么学：

- 先做 Markdown 文档入库。
- 再做 Qdrant 检索。
- 再加 BM25 或关键词 fallback。
- 最后加 rerank 和 citation 检查。

项目产出：

- `retrieval/ingest.py`
- `retrieval/chunking.py`
- `retrieval/vector_store.py`
- `retrieval/search.py`

### 3.10 Qdrant

项目里用来做什么：

- 存储文档 chunk embedding。
- 支持 metadata filter。

为什么选：

- Docker 部署简单。
- 对作品集项目足够工业化。

学到什么程度：

- collection 创建。
- upsert vectors。
- search + filter。
- metadata 管理。

怎么学：

- 用 docker-compose 拉起。
- 写入 30 到 100 个 Runbook chunks。
- 做 top-k 查询。

项目产出：

- `deploy/docker-compose.yml`
- `retrieval/qdrant_store.py`

### 3.11 PostgreSQL

项目里用来做什么：

- 存 runs、tool_calls、approvals、audit_logs、eval_cases。

为什么选：

- 结构化数据必须可查询、可审计。
- 比把 JSON 全塞文件更像生产系统。

学到什么程度：

- 表设计。
- SQLAlchemy ORM 或 SQLModel。
- Alembic migration。
- 基础索引。

怎么学：

- 先设计 6 张核心表。
- 用 Alembic 创建 migration。
- 每次 run 写入数据库。

项目产出：

- `db/models.py`
- `db/session.py`
- `db/migrations/`

### 3.12 Redis

项目里用来做什么：

- 保存短期 session。
- 保存 approval pending state。
- 做简单缓存和分布式锁。

为什么选：

- Agent workflow 不是一次性函数，需要短期状态。
- 审批和长任务需要快速状态存取。

学到什么程度：

- get/set、expire、hash。
- 简单 lock。
- 缓存失效策略。

怎么学：

- 保存 run 当前状态。
- 保存 approval token。
- 给 RAG query 加短期缓存。

项目产出：

- `memory/redis_store.py`

### 3.13 Agent Harness

项目里用来做什么：

- 固定任务集。
- mock 外部工具。
- trace replay。
- 自动评分。
- 回归测试。

为什么选：

- 很多岗位开始强调 Agent Harness、eval、可回放、可测试。
- 这是区分 Demo 和工业系统的核心。

学到什么程度：

- 能设计 eval case schema。
- 能 replay 同一个 case。
- 能比较不同版本输出。
- 能写 grader。

怎么学：

- 先做 20 条 CI 失败样本。
- 写 rule-based grader。
- 再加 LLM-as-judge。
- 最后接 GitHub Actions 做 eval gate。

项目产出：

- `harness/datasets/`
- `harness/runner.py`
- `harness/graders.py`
- `harness/replay.py`
- `harness/reports/`

### 3.14 Langfuse / LangSmith

项目里用来做什么：

- 记录 trace。
- 查看模型调用、工具调用、RAG 引用、latency、cost。
- 管理 prompt version。
- 辅助 eval。

为什么选：

- 岗位要求中 LangSmith、LangFuse、可观测、调试链路高频出现。

学到什么程度：

- 能接入 trace。
- 能按 run_id 查看完整链路。
- 能比较失败 case。

怎么学：

- 先接入最小 trace。
- 再记录 tool span。
- 再记录 retrieval span。
- 最后把 eval 结果关联到 trace。

项目产出：

- `observability/tracing.py`
- `observability/langfuse.py`

### 3.15 Prometheus + Grafana

项目里用来做什么：

- 展示系统指标：请求数、错误率、P95 延迟、工具失败率。

为什么选：

- 可观测不仅是 LLM trace，还包括服务运行指标。

学到什么程度：

- 暴露 `/metrics`。
- 配置 Prometheus scrape。
- Grafana 导入简单 dashboard。

怎么学：

- FastAPI 加 prometheus middleware。
- docker-compose 加 Prometheus 和 Grafana。

项目产出：

- `observability/metrics.py`
- `deploy/prometheus.yml`
- `deploy/grafana-dashboard.json`

### 3.16 Docker Compose

项目里用来做什么：

- 一键启动 API、Postgres、Redis、Qdrant、MCP server、Prometheus、Grafana。

为什么选：

- 面试官会看你能不能把系统跑起来，而不是只给源码。

学到什么程度：

- Dockerfile。
- docker-compose services。
- env 文件。
- volume。
- healthcheck。

怎么学：

- 先容器化 API。
- 再加数据库。
- 再加 Qdrant 和 Redis。
- 最后加 observability。

项目产出：

- `Dockerfile`
- `docker-compose.yml`
- `.env.example`

### 3.17 GitHub Actions

项目里用来做什么：

- 自动跑 lint、tests、eval smoke suite。
- 构建 Docker image。
- eval 低于阈值时 fail。

为什么选：

- 对齐 CI/CD 岗位要求。
- 展示“Agent 改动需要回归”的工程意识。

学到什么程度：

- workflow yaml。
- matrix 基础。
- secrets。
- artifact 上传。

怎么学：

- 第一步跑 pytest。
- 第二步跑 ruff。
- 第三步跑 harness smoke eval。

项目产出：

- `.github/workflows/ci.yml`

### 3.18 n8n

项目里用来做什么：

- 模拟外部 workflow：CI 失败或告警 webhook 触发 Agent。

为什么选：

- 岗位中出现 n8n / workflow 平台。
- 它能展示你理解 Agent 如何进入企业流程。

学到什么程度：

- Webhook node。
- HTTP request node。
- 简单条件分支。

怎么学：

- 一个 webhook 收到 mock alert。
- 调 FastAPI `/api/runs`。
- 把结果发送到 mock Slack/邮件。

项目产出：

- `integrations/n8n/incident-workflow.json`

### 3.19 Dify

项目里用来做什么：

- 作为对照组，而不是主实现。
- 展示“平台搭建”和“自建 Runtime”的差异。

为什么选：

- 多个岗位提到 Dify。
- 你之前也有 FastGPT 经验，可以自然过渡。

学到什么程度：

- 能搭一个简单知识库 workflow。
- 能解释为什么工业 runtime 仍需要自建：权限、eval、trace、审批、MCP、复杂状态。

怎么学：

- 用同一批 Runbook 做 Dify knowledge base。
- 对比自建 RAG 的 trace 和 eval。

项目产出：

- `docs/dify_comparison.md`

### 3.20 React + TypeScript + Vite

项目里用来做什么：

- 构建 Web Console。
- 提交 Agent 任务。
- 展示 run trace、tool calls、RAG citations、approval queue、eval report。

为什么选：

- 控制台类应用需要多页面、表格、详情页、图表和实时状态，React 生态成熟。
- TypeScript 能和后端 Pydantic schema 对齐，减少接口字段误用。
- Vite 启动快，适合 1 个月项目。

学到什么程度：

- 会写页面路由、表单、表格、详情页。
- 会处理 loading、error、empty、success 状态。
- 会用类型定义约束 API 响应。
- 会把复杂 trace 展示成可展开时间线。

怎么学：

- 先搭 Vite + React + TypeScript。
- 写 API client。
- 做 Run Workbench 页面。
- 做 Trace Detail 页面。
- 做 Approval Queue 和 Eval Dashboard。

项目产出：

- `web/src/pages/RunWorkbench.tsx`
- `web/src/pages/RunTraceDetail.tsx`
- `web/src/pages/ApprovalQueue.tsx`
- `web/src/pages/EvalDashboard.tsx`
- `web/src/api/client.ts`

### 3.21 TanStack Query

项目里用来做什么：

- 管理 `/api/runs`、`/api/approvals`、`/api/evals` 等服务端状态。
- 对运行中的 run 进行轮询或配合 SSE 更新。
- 统一处理 loading、error、retry、cache invalidation。

为什么选：

- 控制台的大部分状态来自后端，不适合全部塞进前端全局 store。
- 它能让前端代码更接近真实工程实践。

学到什么程度：

- `useQuery`、`useMutation`。
- query invalidation。
- polling interval。
- mutation 后刷新相关列表。

怎么学：

- Approval 审批成功后刷新 approval queue 和 run trace。
- Eval 启动后轮询 eval result。

项目产出：

- `web/src/queries/runs.ts`
- `web/src/queries/approvals.ts`
- `web/src/queries/evals.ts`

### 3.22 React Router

项目里用来做什么：

- 控制台页面路由。
- 支持从 run list 跳转 trace detail。
- 支持从 eval failure 跳转对应 run trace。

为什么选：

- 多页面控制台需要清晰 URL，方便录 Demo 和面试讲解。

学到什么程度：

- route config。
- URL params。
- navigation。

怎么学：

- 设计 5 个路由：`/runs/new`、`/runs/:id`、`/approvals`、`/evals`、`/registry`。

项目产出：

- `web/src/router.tsx`

### 3.23 Recharts / ECharts

项目里用来做什么：

- 展示 eval 通过率趋势。
- 展示失败分类。
- 展示工具耗时分布。
- 展示 skill 调用量。

为什么选：

- Agent Harness 的价值需要图表化，否则只是一堆 JSON。

学到什么程度：

- line chart、bar chart、pie chart 或 stacked bar。
- tooltip。
- responsive container。

怎么学：

- Eval Dashboard 做 3 个图：score trend、failure taxonomy、tool latency。

项目产出：

- `web/src/components/EvalCharts.tsx`

### 3.24 React Flow

项目里用来做什么：

- P2 展示 LangGraph runtime 状态图。
- 展示某次 run 的 tool call graph。

为什么选：

- 它能让 Agent orchestration 的结构更直观。
- 不作为 P0 必需，避免前端范围过大。

学到什么程度：

- nodes、edges、layout。
- 点击节点查看 step detail。

怎么学：

- 先把固定 runtime graph 画出来。
- 再把 run trace 转成 tool call graph。

项目产出：

- `web/src/components/RuntimeGraph.tsx`

## 4. 四周学习与实现路线

### 第 1 周：主链路跑通

目标：

- FastAPI + LangGraph + Skill Registry + 基础 Tools。

任务：

- Day 1：创建项目结构，写 FastAPI `/api/runs`。
- Day 2：写 LLM client 和 Pydantic schema。
- Day 3：实现 Skill Registry，写 4 个 skill yaml。
- Day 4：实现 LangGraph router、planner、executor、finalizer。
- Day 5：实现 GitHub/CI/log 本地 mock tools。
- Day 6：完成 CI 失败排查 workflow。
- Day 7：写 README 第一版和架构图。

验收：

- 能输入一段 CI 失败日志，输出失败原因、证据和修复计划。

### 第 2 周：RAG、MCP、权限

目标：

- 让 Agent 具备企业上下文和系统连接能力。

任务：

- Day 8：准备 Runbook、事故复盘、代码说明文档。
- Day 9：实现 chunking、embedding、Qdrant 入库。
- Day 10：实现 RAG search tool 和 citation。
- Day 11：写 TypeScript MCP server。
- Day 12：Python Runtime 调 MCP tool。
- Day 13：实现 RBAC、risk tier、approval gate。
- Day 14：完成告警初筛 workflow。

验收：

- Agent 能通过 RAG 和 MCP 查证据。
- 写操作被审批拦截。

### 第 3 周：Agent Harness、评测、可观测

目标：

- 把项目从 demo 提升为可迭代系统。

任务：

- Day 15：设计 eval case schema。
- Day 16：准备 60 条 eval cases。
- Day 17：实现 Harness runner 和 replay。
- Day 18：实现 rule-based grader。
- Day 19：接入 Langfuse 或 LangSmith trace。
- Day 20：接 Prometheus metrics。
- Day 21：跑第一次 eval report，修 3 个失败 case。

验收：

- 能一键跑 eval suite。
- 能看到 trace 和失败分类。

### 第 4 周：生产化和作品集包装

目标：

- 让项目像能被团队接手的工程项目，并用 Web Console 完成可演示闭环。

任务：

- Day 22：Dockerfile 和 docker-compose。
- Day 23：PostgreSQL/Alembic 持久化。
- Day 24：GitHub Actions 跑 tests + eval smoke。
- Day 25：n8n webhook integration。
- Day 26：React Web Console P0：Run Workbench、Trace Detail、Approval Queue。
- Day 27：Eval Dashboard、Skill/Tool Registry 只读页、README 截图。
- Day 28：PRD、技术文档、Demo 脚本、简历项目描述和面试问答。

验收：

- 一条命令启动系统。
- 一条命令跑 eval。
- GitHub README 能让面试官 5 分钟看懂价值。

## 5. 面试表达模板

### 5.1 项目一句话

我做了一个企业级研发与运维 Agent Runtime，支持 CI 失败排查、告警初筛、Issue 拆解和 Runbook 检索。系统包含 Skill Registry、MCP 工具接入、LangGraph 状态编排、权限审批、Agent Harness、评测回放和可观测链路。

### 5.2 技术栈一句话

主服务用 Python + FastAPI，前端用 React + TypeScript + Vite 做工程控制台，Agent 编排用 LangGraph，工具接入分为本地 tools 和 TypeScript MCP server，RAG 用 Qdrant，状态和审计分别用 Redis 和 PostgreSQL，Agent Harness 负责 eval、replay、grader，观测用 Langfuse/LangSmith 和 Prometheus/Grafana，部署用 Docker Compose 和 GitHub Actions。

### 5.3 项目亮点

- 把常见研发任务封装成 skill，而不是写死 prompt。
- 用 MCP 把外部系统工具标准化。
- 用 RBAC + risk tier + approval gate 控制高风险动作。
- 用 Agent Harness 做可回放、可评分、可回归的评测。
- 每次运行都有 trace、tool span、RAG citation 和 audit log。

## 6. 每项能力的掌握标准

| 能力 | 能证明你掌握的标准 |
|---|---|
| Agent Runtime | 能画出状态图并解释每个节点 |
| Skill | 能解释 skill 和 tool 的区别，并新增一个 skill |
| MCP | 能本地启动 MCP server 并由 Runtime 调用 |
| Tool Calling | 能说明工具 schema、错误处理、超时和审计 |
| RAG | 能解释 chunk、embedding、retrieval、rerank、citation |
| Context | 能说明 working/session/long-term/knowledge context 的区别 |
| Permission | 能说明 RBAC、risk tier、approval gate |
| Harness | 能跑 eval dataset 并解释失败分类 |
| Observability | 能打开 trace 说明一次运行每一步发生了什么 |
| Production | 能用 Docker Compose 启动并用 GitHub Actions 跑测试 |
| Frontend | 能通过控制台提交任务、查看 trace、审批动作、查看 eval 报告 |

## 7. 推荐学习资料

- OpenAI Agents SDK: https://developers.openai.com/api/docs/guides/agents
- OpenAI Tools: https://developers.openai.com/api/docs/guides/tools
- OpenAI Evals: https://developers.openai.com/api/docs/guides/evals
- MCP Intro: https://modelcontextprotocol.io/docs/getting-started/intro
- LangGraph Overview: https://docs.langchain.com/oss/python/langgraph/overview
- LangSmith Observability: https://docs.langchain.com/langsmith/observability
- LangSmith Evaluation: https://docs.langchain.com/langsmith/evaluation
- FastAPI Docs: https://fastapi.tiangolo.com/
- Qdrant Docs: https://qdrant.tech/documentation/
- Langfuse Docs: https://langfuse.com/docs
