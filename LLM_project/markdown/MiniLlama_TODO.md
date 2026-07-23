# MiniLlama 全链路执行 TODO

> 面向会 Python、但深度学习基础较弱的学习者。项目事实状态以代码、测试、实验日志和
> artifact 为准；勾选任务前必须先满足该任务的验收条件。

## 使用说明

- `[x]`：已有可复核证据；`[ ]`：尚未完成；`进行中`：已有部分产物但门禁未通过。
- `CPU`：本地即可完成；`RTX4090`：需要 Linux + NVIDIA RTX 4090 24GB。
- 先完成 CPU 正确性和小规模 pilot，再租用 GPU。
- 不填写尚未实测的 PPL、显存、吞吐、训练时间或提升比例。
- 任务 ID 与 [交互式学习路线](./minillama_learning_roadmap.html) 完全一致。

## M01 仓库、环境与质量门禁

**阶段目标：** 得到可安装、可检查、可复现的工程入口。先在 CPU 完成正确性开发，
再用 Linux RTX 4090 完成 CUDA/BF16 环境门禁。

**前置知识：** Python 包、虚拟环境、依赖锁、Git commit、CI、CUDA、cuDNN、
Compute Capability、BF16、SDPA、随机种子与可复现性。

- [x] **M01-T01：建立 src-layout 工程骨架** `done` `CPU` `1h`
  - 前置任务：无。
  - 前置知识：Python package、module、`pyproject.toml`、editable install。
  - 产物：`src/minillama/`、`pyproject.toml`、README 和基础命名空间。
  - 工作：建立 model/data/training/alignment/inference/evaluation/reporting 边界；暴露包版本。
  - 验收：`import minillama` 成功，版本为 `0.1.0`。
  - 证据：`tests/test_package.py` 与本地基线提交 `17eec6e`。

- [ ] **M01-T02：完成跨平台依赖锁定** `in_progress` `CPU` `1–2h`
  - 前置任务：M01-T01。
  - 前置知识：dependency resolver、wheel、平台 marker、CPU/CUDA wheel。
  - 产物：`pyproject.toml` 与 `uv.lock`。
  - 工作：Linux 固定 PyTorch 2.9.1+cu128；Windows 固定 PyTorch 2.8 CPU；同步其余依赖。
  - 验收：全新环境执行 `uv sync --all-groups` 无人工改包；Windows 不安装 CUDA wheel。
  - 证据：完整同步日志和 `uv pip list`；当前机器仍需完成 PyTorch 2.8 wheel 下载。

- [x] **M01-T03：实现环境探测 CLI** `done` `CPU` `2h`
  - 前置任务：M01-T01。
  - 前置知识：CLI、JSON、CUDA runtime、设备属性、BF16 capability。
  - 产物：`src/minillama/environment.py`、`src/minillama/cli.py`、`scripts/check_environment.py`。
  - 工作：采集 Python、平台、PyTorch、CUDA、cuDNN、SDPA backend、GPU 和可用显存。
  - 验收：`minillama env --output <path>` 生成 schema_version=1 的 UTF-8 JSON。
  - 证据：`tests/test_environment.py`、`tests/test_cli.py`。

- [x] **M01-T04：配置静态质量门禁** `done` `CPU` `1h`
  - 前置任务：M01-T01。
  - 前置知识：lint、formatter、静态类型、strict mode。
  - 产物：Ruff、Mypy、Pytest 配置。
  - 工作：启用 Ruff 规则；Mypy 对项目严格检查、跳过第三方 Torch 内部类型树。
  - 验收：`ruff check`、`ruff format --check`、`mypy src` 均返回 0。
  - 证据：本地检查输出。

- [x] **M01-T05：建立 CPU smoke tests** `done` `CPU` `1h`
  - 前置任务：M01-T03、M01-T04。
  - 前置知识：unit test、fixture、临时目录、返回码。
  - 产物：`tests/test_package.py`、`tests/test_environment.py`、`tests/test_cli.py`。
  - 工作：覆盖包导入、环境 schema、JSON 写入和 CLI 命令。
  - 验收：当前基础测试 `4 passed`。
  - 证据：Pytest 输出。

- [x] **M01-T06：定义 CPU CI 工作流** `done` `CPU` `1h`
  - 前置任务：M01-T04、M01-T05。
  - 前置知识：CI job、runner、dependency cache、exit code。
  - 产物：`.github/workflows/ci.yml`。
  - 工作：在 Linux CPU runner 安装固定依赖；依次运行格式、lint、类型和测试。
  - 验收：工作流定义不包含 GPU 假设，CUDA 测试可用 marker 排除。
  - 证据：工作流文件；首次远端 CI 运行不属于本地完成证据。

- [ ] **M01-T07：统一随机种子与运行元数据接口** `pending` `CPU` `2h`
  - 前置任务：M01-T03。
  - 前置知识：Python/NumPy/PyTorch RNG、deterministic algorithm、Git state。
  - 产物：`src/minillama/training/reproducibility.py` 及测试。
  - 工作：统一设置 seed；采集 RNG state、环境 hash、配置 hash 和源码状态。
  - 验收：相同 seed 的 CPU 随机张量与 sampler 顺序一致；不同 seed 至少一项不同。
  - 证据：确定性测试和 run metadata JSON。

- [ ] **M01-T08：通过 RTX 4090 环境门禁** `blocked` `RTX4090` `0.5h`
  - 前置任务：M01-T02、M01-T03。
  - 前置知识：NVIDIA driver、CUDA runtime、Compute Capability、BF16、SDPA。
  - 产物：`artifacts/env/rtx4090.json`。
  - 工作：租用 Linux RTX 4090；同步依赖；运行环境探测和最小 BF16 matmul。
  - 验收：GPU 名称正确、`cuda_available=true`、`bf16_supported=true`，BF16 结果有限。
  - 证据：环境 JSON 和命令日志；阻塞原因是尚未租用服务器。

**阶段门禁：** CPU 门禁已部分完成；M01-T02 和 M01-T08 完成后才允许正式 GPU 实验。

## M02 从零实现核心模型模块

**阶段目标：** 不套用第三方 Llama 模型类，从张量运算开始实现约 124.7M 参数的
Decoder-only Causal LM，并用单元测试证明 shape、dtype、梯度、因果性和参数量正确。

**前置知识：** Tensor、shape、broadcast、autograd、embedding、logits、自回归分解、
RMSNorm、RoPE、Attention、MHA/GQA、SwiGLU、residual、pre-norm。

- [ ] **M02-T01：定义并验证模型配置** `pending` `CPU` `2h`
  - 前置任务：M01-T05。
  - 前置知识：dataclass、维度约束、head_dim、vocabulary。
  - 产物：`src/minillama/config.py`、三档 model YAML、配置测试。
  - 工作：定义 smoke-500k、56M、125M；验证正数、`dim % n_heads` 和 `n_heads % n_kv_heads`。
  - 验收：合法配置可序列化；非法 head、序列长度和 vocab 明确抛错。
  - 证据：`tests/model/test_config.py`。

- [ ] **M02-T02：实现 RMSNorm** `pending` `CPU` `2–3h`
  - 前置任务：M02-T01。
  - 前置知识：均方根、`rsqrt`、广播、浮点累加精度。
  - 产物：`src/minillama/model/norm.py` 与测试。
  - 工作：先用 float64 公式建参考；float32 计算均方和倒平方根；转回输入 dtype。
  - 验收：float32 对齐 `atol=1e-6, rtol=1e-5`，输入梯度有限。
  - 证据：shape、dtype、数值、梯度和零输入测试。

- [ ] **M02-T03：构造 RoPE 频率缓存** `pending` `CPU` `2h`
  - 前置任务：M02-T01。
  - 前置知识：正弦/余弦、频率、position、buffer、复数极坐标。
  - 产物：`src/minillama/model/rope.py` 的频率预计算接口。
  - 工作：按 `rope_theta` 与偶数通道生成逆频率；缓存 cos/sin；支持 position offset。
  - 验收：position 0 的 cos=1、sin=0；缓存不是 Parameter；越界明确报错。
  - 证据：`tests/model/test_rope.py` 的频率测试。

- [ ] **M02-T04：把 RoPE 应用于 Q/K** `pending` `CPU` `2–3h`
  - 前置任务：M02-T03。
  - 前置知识：二维旋转矩阵、pair-wise channel、范数保持、broadcast。
  - 产物：`apply_rotary_emb`。
  - 工作：把相邻偶/奇通道视为二维向量；按位置旋转 Q/K；不旋转 V。
  - 验收：二维对子范数保持；position 0 不改变输入；shape/dtype 不变。
  - 证据：解析旋转和随机张量对齐测试。

- [ ] **M02-T05：实现手写因果 Attention 基线** `pending` `CPU` `4h`
  - 前置任务：M02-T01、M02-T04。
  - 前置知识：矩阵乘法、转置、`1/sqrt(dk)`、softmax、causal mask。
  - 产物：`src/minillama/model/attention.py` 的 eager 路径。
  - 工作：投影 Q/K/V；拆 head；计算 score、mask、softmax、加权 V 和输出投影。
  - 验收：概率行和为 1；未来位置概率为 0；输出 `[B,T,D]` 且梯度有限。
  - 证据：小矩阵手算测试和 causal test。

- [ ] **M02-T06：实现 GQA 与 MHA 统一接口** `pending` `CPU` `3h`
  - 前置任务：M02-T05。
  - 前置知识：Query Head、KV Head、分组共享、`repeat_interleave`。
  - 产物：支持 `n_kv_heads <= n_heads` 的 attention。
  - 工作：计算 group size；映射 Query→KV；保留 MHA=`n_kv_heads=n_heads`。
  - 验收：GQA 输出与显式复制 K/V 的参考公式对齐。
  - 证据：MHA、GQA、MQA 三种配置参数化测试。

- [ ] **M02-T07：实现 SDPA 加速路径** `pending` `CPU/RTX4090` `3h`
  - 前置任务：M02-T06、M01-T08。
  - 前置知识：Scaled Dot Product Attention、kernel dispatch、GQA flag、dropout。
  - 产物：eager/SDPA backend 开关。
  - 工作：用同一 Q/K/V 调用 PyTorch SDPA；训练 dropout 固定 0；保留 eager 基线。
  - 验收：CPU float32 与 eager 输出/梯度在阈值内；4090 记录实际 backend。
  - 证据：backend 对齐测试和环境报告。

- [ ] **M02-T08：实现 SwiGLU MLP** `pending` `CPU` `2h`
  - 前置任务：M02-T01。
  - 前置知识：SiLU、门控、逐元素乘法、线性投影。
  - 产物：`src/minillama/model/mlp.py`。
  - 工作：实现 `down(silu(gate(x)) * up(x))`；三层无 bias。
  - 验收：公式对齐、shape 正确、所有 Linear 的 bias 为 None。
  - 证据：`tests/model/test_mlp.py`。

- [ ] **M02-T09：实现 Pre-norm Transformer Block** `pending` `CPU` `3h`
  - 前置任务：M02-T02、M02-T07、M02-T08。
  - 前置知识：residual connection、pre-norm、计算图。
  - 产物：`src/minillama/model/transformer.py` 的 Block。
  - 工作：按 `x + attention(norm(x))`、`h + mlp(norm(h))` 组合模块。
  - 验收：输入输出 shape 相同；关闭子层权重时 residual 保留输入。
  - 证据：Block 单测和梯度测试。

- [ ] **M02-T10：组装完整 Causal LM** `pending` `CPU` `4h`
  - 前置任务：M02-T09。
  - 前置知识：token embedding、stack、final norm、LM head、weight tying。
  - 产物：`MiniLlamaForCausalLM` 和 `CausalLMOutput`。
  - 工作：嵌入 token；堆叠 block；final RMSNorm；独立、非共享 LM head；可选 labels。
  - 验收：logits `[B,T,V]`；非法 token/长度报错；未来 token 不影响过去 logits。
  - 证据：整模 forward、causal 与 error-path 测试。

- [ ] **M02-T11：固定初始化并验证参数量** `pending` `CPU` `2h`
  - 前置任务：M02-T10。
  - 前置知识：Normal initialization、Parameter、参数计数。
  - 产物：初始化函数和三档参数统计测试。
  - 工作：Linear/Embedding `Normal(0,0.02)`；RMSNorm weight=1；统计可训练参数。
  - 验收：500,352；55,321,088；124,668,672 三个数精确匹配。
  - 证据：`tests/model/test_parameter_count.py`。

- [ ] **M02-T12：完成小样本过拟合门禁** `pending` `CPU/RTX4090` `3h`
  - 前置任务：M02-T10、M06-T01。
  - 前置知识：overfitting、cross entropy、optimizer、train/eval mode。
  - 产物：32 样本固定数据与 overfit 集成测试。
  - 工作：重复固定短序列；训练 smoke 模型；记录 loss；生成一个记忆样本。
  - 验收：loss 单调趋势明显并最终 `<0.05`；生成与训练模式切换正确。
  - 证据：集成测试日志和 loss 序列。

**阶段门禁：** M02 的 shape、数值、梯度、因果性、参数量和过拟合测试全部通过。

## M03 参考实现数值对齐与 KV Cache

**阶段目标：** 证明手写实现和可信参考在同权重下数值一致，并证明逐 token 缓存解码
与全量前向得到同一结果。

**前置知识：** state dict、权重映射、绝对/相对误差、浮点容差、Prefill、Decode、
KV Cache、view 与预分配。

- [ ] **M03-T01：构造同形状 Hugging Face 参考模型** `pending` `CPU` `2h`
  - 前置任务：M02-T11。
  - 前置知识：LlamaConfig、reference implementation、随机种子。
  - 产物：测试专用参考模型 factory。
  - 工作：把 smoke 配置映射为 HF LlamaConfig；关闭 dropout/cache；固定 dtype 和 seed。
  - 验收：两边层数、head、hidden、vocab 和参数 shape 对应。
  - 证据：配置映射测试。

- [ ] **M03-T02：实现双向权重名称映射** `pending` `CPU` `3h`
  - 前置任务：M03-T01。
  - 前置知识：state_dict、transpose、Q/K/V projection、strict load。
  - 产物：`src/minillama/model/reference.py`。
  - 工作：显式映射 embedding、norm、attention、MLP、final norm 和 LM head。
  - 验收：没有遗漏或多余 key；shape 不符时指出层号与权重名。
  - 证据：权重 round-trip 测试。

- [ ] **M03-T03：完成逐模块 float32 对齐** `pending` `CPU` `4h`
  - 前置任务：M03-T02。
  - 前置知识：max/mean absolute difference、rtol/atol、hook。
  - 产物：RMSNorm、RoPE、Attention、MLP、Block 对齐测试。
  - 工作：从最小模块逐层比较；保存第一处超阈值位置和数值。
  - 验收：每个模块误差在预设 float32 阈值内。
  - 证据：`tests/model/test_reference_alignment.py`。

- [ ] **M03-T04：完成整模 logits 对齐** `pending` `CPU` `3h`
  - 前置任务：M03-T03。
  - 前置知识：误差传播、logits、deterministic input。
  - 产物：整模对齐报告。
  - 工作：复制同权重；用固定 token；比较所有位置 logits。
  - 验收：`max_abs_diff<=1e-4`、`mean_abs_diff<=1e-6`。
  - 证据：测试输出中记录两个误差指标。

- [ ] **M03-T05：实现预分配 KVCache 容器** `pending` `CPU` `4h`
  - 前置任务：M02-T06。
  - 前置知识：K/V shape、预分配、slice view、显存复杂度。
  - 产物：`src/minillama/model/cache.py`。
  - 工作：每层分配 `[B,Hkv,Tmax,Dh]`；连续 append；返回有效 prefix view。
  - 验收：不按 token `torch.cat`；支持一次追加 1 或多个 token。
  - 证据：写入、读取、dtype、device 和 storage 测试。

- [ ] **M03-T06：接入 Prefill 与增量 Decode** `pending` `CPU` `4h`
  - 前置任务：M03-T05、M02-T10。
  - 前置知识：position offset、causal mask、prefill、decode。
  - 产物：模型 `use_cache` 路径。
  - 工作：prefill 写入完整 prompt；decode 只输入新 token；RoPE 使用绝对 position。
  - 验收：float32 每个位置 cached/full `max_abs_diff<=1e-4`。
  - 证据：不同 prompt 长度和 chunk size 的参数化测试。

- [ ] **M03-T07：覆盖 Cache 失败路径** `pending` `CPU` `2h`
  - 前置任务：M03-T05。
  - 前置知识：defensive validation、batch/device/dtype invariant。
  - 产物：明确的 Cache 异常消息。
  - 工作：检查 overflow、start_pos 间隙/重叠、batch/head/dtype/device 不匹配。
  - 验收：每个非法输入在写入前失败，不留下部分修改。
  - 证据：表驱动 error-path 测试。

- [ ] **M03-T08：完成 BF16 缓存一致性门禁** `blocked` `RTX4090` `2h`
  - 前置任务：M01-T08、M03-T06。
  - 前置知识：BF16 舍入、容差、greedy argmax。
  - 产物：BF16 对齐报告。
  - 工作：在 4090 比较 cached/full logits 和 greedy token；记录最大/平均误差。
  - 验收：`max_abs_diff<=2e-2` 且生成 token 序列完全一致。
  - 证据：CUDA 测试报告；阻塞原因是需要 RTX 4090。

**阶段门禁：** float32 参考对齐、cached/full 和所有 cache error-path 通过；租卡后补 BF16。

## M04 数据清洗、切分与 Tokenizer

**阶段目标：** 从固定 revision 的中英文语料得到无文档泄漏、可复现、可审计的
32K Byte-level BPE tokenizer 和数据清洗报告。

**前置知识：** Unicode、UTF-8、NFC、控制字符、hash、去重、文档级切分、
streaming dataset、BPE、special token、压缩率。

- [ ] **M04-T01：登记数据来源、许可与 revision** `pending` `CPU` `2h`
  - 前置任务：M01-T02。
  - 前置知识：dataset card、license、revision、streaming。
  - 产物：`DATA_CARD.md` 初稿和 source manifest。
  - 工作：登记 FineWeb-Edu 英文与 FineWeb2 简中来源、配置、revision、许可和字段。
  - 验收：每个来源均有不可变 revision；下载失败不自动换数据集。
  - 证据：manifest、数据卡链接和首次样本 schema。

- [ ] **M04-T02：实现 Unicode 与空白规范化** `pending` `CPU` `3h`
  - 前置任务：M04-T01。
  - 前置知识：UTF-8 decode、NFC/NFKC、换行、控制字符。
  - 产物：`src/minillama/data/cleaning.py`。
  - 工作：严格 UTF-8；NFC；过滤危险控制符；统一 CRLF/空白；保留中文全角语义。
  - 验收：相同语义文本输出稳定；emoji 和组合字符不被损坏。
  - 证据：Unicode 表驱动测试。

- [ ] **M04-T03：实现文档质量过滤** `pending` `CPU` `3h`
  - 前置任务：M04-T02。
  - 前置知识：长度分布、重复行比例、字符类别、reason code。
  - 产物：可配置过滤器与统计计数。
  - 工作：处理过短/过长、重复行、异常字符比例、空文档；日志不写原文。
  - 验收：每条丢弃记录只有一个稳定 reason code；计数之和守恒。
  - 证据：边界用例测试和过滤摘要。

- [ ] **M04-T04：实现 SHA256 精确去重** `pending` `CPU` `3h`
  - 前置任务：M04-T02。
  - 前置知识：cryptographic hash、canonical text、collision assumption。
  - 产物：文档 hash 与去重索引。
  - 工作：对 normalized_text 的 UTF-8 bytes 求 SHA256；跨来源去重；保留首条来源。
  - 验收：规范化后相同文本只保留一次；重跑 hash 完全一致。
  - 证据：中英文、换行和组合字符去重测试。

- [ ] **M04-T05：完成稳定文档级切分** `pending` `CPU` `2h`
  - 前置任务：M04-T04。
  - 前置知识：hash bucket、train/validation leakage、determinism。
  - 产物：`src/minillama/data/split.py`。
  - 工作：根据文档 hash 分桶约 99.5/0.5；切分发生在 tokenizer 训练和 packing 之前。
  - 验收：同一 hash 永远进入同一 split；train/validation hash 交集为空。
  - 证据：稳定性和无泄漏测试。

- [ ] **M04-T06：抽取 2GB 双语 tokenizer 样本** `pending` `CPU` `3h`
  - 前置任务：M04-T05。
  - 前置知识：stratified sampling、语言比例、bytes 与 tokens 的区别。
  - 产物：只来自 train split 的 tokenizer sample manifest。
  - 工作：按英文/中文分层抽样；记录 bytes、文档数、hash；禁止读取 validation。
  - 验收：样本约 2GB，语言策略可重放，所有 hash 属于 train。
  - 证据：样本 manifest 和比例统计。

- [ ] **M04-T07：训练 32K Byte-level BPE** `pending` `CPU` `4–8h`
  - 前置任务：M04-T06。
  - 前置知识：byte alphabet、pair frequency、merge、vocabulary、special token。
  - 产物：`tokenizer.json`、special token 映射和 SHA256。
  - 工作：vocab=32,000；注册 6 个特殊 token；保存训练配置与输入 hash。
  - 验收：实际 vocab 与 ID 唯一；特殊 token 不被拆分。
  - 证据：tokenizer 文件 hash 和训练日志。

- [ ] **M04-T08：验证 Tokenizer 可逆性与边界** `pending` `CPU` `3h`
  - 前置任务：M04-T07。
  - 前置知识：round trip、unknown token、allowed special、normalization。
  - 产物：`tests/data/test_tokenizer.py`。
  - 工作：覆盖中英、emoji、空白、代码、数字、组合字符和特殊 token。
  - 验收：普通 Unicode encode→decode 可逆；unknown rate=0；普通文本不注入 special。
  - 证据：参数化 round-trip 和 special-token 测试。

- [ ] **M04-T09：生成 Tokenizer 质量报告** `pending` `CPU` `2h`
  - 前置任务：M04-T08。
  - 前置知识：chars/token、bytes/token、分布、percentile。
  - 产物：tokenizer quality JSON/Markdown。
  - 工作：分别统计中英文压缩率、token 长度分布、special round-trip 和 unknown rate。
  - 验收：报告含样本 hash、tokenizer hash 和可重算原始计数。
  - 证据：报告生成命令与原始 JSON。

**阶段门禁：** 数据 revision、清洗统计、split 无泄漏、tokenizer hash 和 round-trip 齐全。

## M05 分词缓存与 Sequence Packing

**阶段目标：** 把清洗文档转成高效、可校验、可恢复位置的固定长度 mmap shards，
先生成 100M-token pilot，再生成 25 亿 token 主数据。

**前置知识：** EOS、Sequence Packing、fixed-length record、`uint16`、shard、manifest、
memory mapping、sampler cursor、packing efficiency。

- [ ] **M05-T01：实现文档分词与 EOT 边界** `pending` `CPU` `3h`
  - 前置任务：M04-T08。
  - 前置知识：token ID、end-of-text、document boundary、stream。
  - 产物：文档→token stream 转换器。
  - 工作：每个文档末尾只插入一个 EOT；记录语言、split 和 source hash。
  - 验收：空文档不会产生重复 EOT；decode 抽查可恢复边界。
  - 证据：边界和 token 范围测试。

- [ ] **M05-T02：按最终 token 控制 70/30 语言比例** `pending` `CPU` `3h`
  - 前置任务：M05-T01。
  - 前置知识：token-level mixture、reservoir/budget、文档原子性。
  - 产物：双语 token budget 调度器。
  - 工作：分别累计中英文 token；按目标预算选择文档；多余尾部不进主 manifest。
  - 验收：最终 packed token 比例满足声明；报告原始与使用 token。
  - 证据：小型不等长文档比例测试。

- [ ] **M05-T03：实现 2,049-token Record Packing** `pending` `CPU` `4h`
  - 前置任务：M05-T02。
  - 前置知识：next-token shift、packing、padding、record boundary。
  - 产物：`src/minillama/data/packing.py`。
  - 工作：连续 token stream 切为 2,049；训练时 input 前 2,048、label 后 2,048。
  - 验收：无 pad；相邻 record 不丢不重；尾部丢弃量可计数。
  - 证据：用递增 token 序列做守恒测试。

- [ ] **M05-T04：写入 uint16 Shard 与 Manifest** `pending` `CPU` `4h`
  - 前置任务：M05-T03。
  - 前置知识：endianness、binary format、SHA256、atomic rename。
  - 产物：1–2GB shards、索引与 manifest。
  - 工作：验证 ID<65,536；临时文件写完后原子重命名；计算每个 shard hash。
  - 验收：随机抽 1,000 record 长度和范围合法；文件 hash 匹配。
  - 证据：shard validator 输出。

- [ ] **M05-T05：实现 Mmap Dataset** `pending` `CPU` `3h`
  - 前置任务：M05-T04。
  - 前置知识：memory mapping、zero-copy view、record offset、worker process。
  - 产物：`src/minillama/data/dataset.py`。
  - 工作：按全局 record index 定位 shard/offset；返回 long tensor input/label。
  - 验收：跨 shard 边界读取正确；多 worker 不共享可变 cursor。
  - 证据：随机读取与直接二进制参考对比。

- [ ] **M05-T06：实现可恢复的确定性 Sampler** `pending` `CPU` `4h`
  - 前置任务：M05-T05、M01-T07。
  - 前置知识：permutation、seed、epoch、shard cursor、state dict。
  - 产物：sampler state 和恢复接口。
  - 工作：保存 seed、epoch、shard、record offset；恢复后不跳样本、不重复。
  - 验收：保存/恢复后的 100 个 batch token ID 与连续迭代完全一致。
  - 证据：resume 集成测试。

- [ ] **M05-T07：生成 Pilot 与主数据质量报告** `pending` `CPU` `2–4h`
  - 前置任务：M05-T04、M05-T06。
  - 前置知识：packing efficiency、token budget、manifest lineage。
  - 产物：100M pilot 与 2,500,067,328 train tokens manifest；10M validation manifest。
  - 工作：汇总来源、revision、hash、record、使用/丢弃 token 和语言比例。
  - 验收：token 数、record 数和文件字节数相互可推导；efficiency 接近 100%。
  - 证据：manifest validator 和抽样 decode 报告。

**阶段门禁：** shard hash、token 数、语言比例、随机抽查和 sampler 恢复全部通过。

## M06 训练引擎、BF16、梯度累积与断点续训

**阶段目标：** 用自研训练循环稳定训练，支持混合精度、梯度累积、显存优化、
原子 checkpoint、逐元素一致的恢复和可追溯日志。

**前置知识：** Cross Entropy、NLL、PPL、AdamW、weight decay、warmup、cosine、
autograd、gradient accumulation、clip、autocast、activation checkpoint、RNG state。

- [ ] **M06-T01：实现带 Ignore Index 的交叉熵** `pending` `CPU` `2h`
  - 前置任务：M02-T10。
  - 前置知识：logits、log-softmax、negative log-likelihood、`-100` mask。
  - 产物：`src/minillama/training/losses.py`。
  - 工作：flatten 有效 token；忽略 `-100`；返回 loss 和有效 token 数。
  - 验收：与手算两类 logits 对齐；全 mask 输入明确报错而非 NaN。
  - 证据：loss 单元测试。

- [ ] **M06-T02：建立 AdamW 参数分组** `pending` `CPU` `3h`
  - 前置任务：M02-T11。
  - 前置知识：momentum、second moment、decoupled weight decay、parameter group。
  - 产物：`src/minillama/training/optim.py`。
  - 工作：矩阵权重 decay=0.1；norm、embedding 和 bias 不衰减；禁止漏参/重复参数。
  - 验收：所有可训练参数恰好出现一次；分组名称可审计。
  - 证据：参数 ID 集合测试。

- [ ] **M06-T03：实现 Warmup + Cosine 调度器** `pending` `CPU` `2h`
  - 前置任务：M06-T02。
  - 前置知识：learning rate、linear warmup、cosine decay、global step。
  - 产物：`src/minillama/training/schedule.py`。
  - 工作：0→6e-4 warmup 382 step；之后 cosine 到 6e-5；边界不越界。
  - 验收：step 0、381、382、末步和超末步值符合解析公式。
  - 证据：关键点数值测试和曲线数据。

- [ ] **M06-T04：实现正确的梯度累积** `pending` `CPU/RTX4090` `3h`
  - 前置任务：M06-T01、M06-T02。
  - 前置知识：micro-batch、global batch、loss scaling、optimizer step。
  - 产物：trainer accumulation loop。
  - 工作：loss 除以 16；每 16 次才 clip/step/zero_grad/scheduler；累计有效 token。
  - 验收：16 个 micro-batch 更新与等价大 batch 在 CPU float32 阈值内一致。
  - 证据：权重更新对比测试。

- [ ] **M06-T05：接入 BF16 Autocast** `blocked` `RTX4090` `2h`
  - 前置任务：M01-T08、M06-T04。
  - 前置知识：BF16 exponent/mantissa、autocast、master weights、GradScaler。
  - 产物：precision context 与 dtype 日志。
  - 工作：4090 使用 BF16 autocast；不使用 FP16 GradScaler；敏感归一化保持 float32 累加。
  - 验收：前向、反向、optimizer state 全部有限；日志记录实际 dtype。
  - 证据：20-step CUDA smoke；阻塞原因是尚未租卡。

- [ ] **M06-T06：实现 Block 级梯度检查点** `pending` `CPU/RTX4090` `3h`
  - 前置任务：M02-T09、M06-T04。
  - 前置知识：activation memory、recompute、non-reentrant checkpoint。
  - 产物：可配置 gradient checkpointing。
  - 工作：以 block 为边界重算；训练开启、推理关闭；不缓存 KV。
  - 验收：同 seed 首步 loss/梯度与关闭时一致；4090 单独测显存和速度。
  - 证据：正确性测试和 M11 性能结果。

- [ ] **M06-T07：实现 JSONL 与 TensorBoard 指标** `pending` `CPU` `3h`
  - 前置任务：M06-T04。
  - 前置知识：structured logging、step、tokens/s、grad norm、wall clock。
  - 产物：`src/minillama/reporting/metrics.py`。
  - 工作：每步写 loss/LR/grad norm/tokens/s；eval 写 loss/PPL；定期写峰值显存。
  - 验收：JSONL 每行可独立解析；step 单调；字段含 run_id 和时间。
  - 证据：短训练 metrics schema 测试。

- [ ] **M06-T08：实现原子 Checkpoint** `pending` `CPU` `4h`
  - 前置任务：M06-T03、M06-T04、M05-T06、M01-T07。
  - 前置知识：state dict、RNG、atomic rename、fsync、latest pointer。
  - 产物：`src/minillama/training/checkpoint.py`。
  - 工作：保存 model/optimizer/scheduler/step/tokens/RNG/sampler/config/hash；临时目录完成后原子发布。
  - 验收：不完整 checkpoint 不被 latest 指向；损坏文件校验失败。
  - 证据：中断写入与 checksum 测试。

- [ ] **M06-T09：完成逐元素一致的断点续训** `pending` `CPU` `4h`
  - 前置任务：M06-T08。
  - 前置知识：deterministic resume、optimizer state、next batch、RNG stream。
  - 产物：N+M 与 N→resume→M 对照测试。
  - 工作：固定 CPU 和数据；比较 model、optimizer、scheduler、下一 batch 和 RNG。
  - 验收：所有要求张量逐元素一致，global step 与 consumed tokens 相同。
  - 证据：`tests/training/test_resume.py`。

- [ ] **M06-T10：处理 NaN、OOM 与保留策略** `pending` `CPU/RTX4090` `3h`
  - 前置任务：M06-T07、M06-T08。
  - 前置知识：finite check、OOM recovery、diagnostic artifact、retention。
  - 产物：失败 reason code、诊断包和 checkpoint 保留器。
  - 工作：non-finite 立即停；记录最后 batch 元数据；区分 OOM/抢占/人为停止；保留最近2+best+milestone。
  - 验收：故障注入不会继续污染 optimizer；删除目标只限 run checkpoint 目录。
  - 证据：故障注入测试与 retention dry-run。

**阶段门禁：** 大 batch 等价、调度器边界、checkpoint 原子性和断点续训一致性通过。

## M07 Pilot 与正式预训练

**阶段目标：** 先用 smoke 和 56M pilot 证明系统与成本，再在单张 RTX 4090 上完成
125M 模型的 25 亿 token 预训练，保留恢复演练和最佳验证 checkpoint。

**前置知识：** token budget、optimizer step、epoch、pilot、tokens/s、step time、
median/P95、OOM、validation、PPL、过拟合、最佳 checkpoint。

- [ ] **M07-T01：完成 smoke-500k Correctness Run** `pending` `CPU` `2–4h`
  - 前置任务：M02-T12、M05-T06、M06-T09。
  - 前置知识：smoke test、fixed corpus、learning curve、generation。
  - 产物：500-step smoke run。
  - 工作：固定小语料和 seed；训练、eval、保存、恢复、生成各走一遍。
  - 验收：loss 明显下降；checkpoint 可恢复；生成无异常；run 元数据齐全。
  - 证据：`artifacts/runs/smoke-*/` 的 config、metrics、eval 和日志。

- [ ] **M07-T02：执行 RTX 4090 租卡前检查** `blocked` `RTX4090` `0.5h`
  - 前置任务：M01-T08、M05-T07、M06-T09、M07-T01。
  - 前置知识：租卡镜像、磁盘、driver、数据传输、成本上限。
  - 产物：preflight checklist。
  - 工作：核对 150GB 磁盘、依赖、数据 hash、断点恢复、上传/下载和预算。
  - 验收：所有门禁有证据路径；缺任何一项时禁止正式租卡训练。
  - 证据：签字式 preflight Markdown；阻塞原因是前置任务未完成。

- [ ] **M07-T03：准备 56M × 100M-token Pilot** `pending` `CPU` `2h`
  - 前置任务：M05-T07、M06-T10。
  - 前置知识：pilot dataset、global token batch、step count。
  - 产物：`configs/train/pilot_56m.yaml` 与 resolved config。
  - 工作：核对 763 steps、seq 2048、global 131,072 tokens、eval/checkpoint 周期。
  - 验收：配置计算出的 consumed tokens 与 pilot manifest 一致。
  - 证据：配置解析测试和 dry-run 摘要。

- [ ] **M07-T04：运行 56M Pilot 并测量吞吐** `blocked` `RTX4090` `4–8h`
  - 前置任务：M07-T02、M07-T03。
  - 前置知识：warmup exclusion、median tokens/s、P95 step time、peak memory。
  - 产物：完整 763-step run 和性能摘要。
  - 工作：前 50 step 不计吞吐；之后记录 median/P95/显存；完成一次恢复。
  - 验收：训练无持续发散；所有 token 计数与 manifest 一致。
  - 证据：pilot metrics、checkpoint、environment 和 summary。

- [ ] **M07-T05：生成主训练时间与费用预测** `blocked` `CPU` `1h`
  - 前置任务：M07-T04。
  - 前置知识：throughput extrapolation、wall clock、租卡单价、误差区间。
  - 产物：125M 主训练预测报告。
  - 工作：基于 pilot 与 125M 前 200 step 吞吐估算 19,074 step；给出上下界。
  - 验收：公式、原始吞吐、单价和假设全部可见；不用拍脑袋小时数。
  - 证据：预测 JSON/Markdown。

- [ ] **M07-T06：完成 125M 主训练 Preflight** `blocked` `RTX4090` `1h`
  - 前置任务：M07-T05。
  - 前置知识：resolved config、data/tokenizer hash、run ID、budget。
  - 产物：`pretrain-125m-2.5b-seed42-*` run 目录。
  - 工作：锁定 seed42、19,074 step、4 micro-batch、accumulation16、eval250、ckpt500。
  - 验收：dry-run 20 step；PPL 可算；显存留有余量；恢复成功。
  - 证据：preflight log 和 resolved config。

- [ ] **M07-T07：运行 125M × 25 亿 token 正式预训练** `blocked` `RTX4090` `预计值由 M07-T05 给出`
  - 前置任务：M07-T06。
  - 前置知识：long-running job、checkpoint、preemption、monitoring。
  - 产物：19,074-step 主训练 run。
  - 工作：训练 2,500,067,328 packed tokens；每 250 step eval；step500 后真实停止并恢复。
  - 验收：consumed tokens 精确；loss 无持续发散；恢复点有标注；日志连续。
  - 证据：metrics、stdout、checkpoints、environment、git_state 和 data manifest。

- [ ] **M07-T08：选择最佳 Base Checkpoint 并生成对比** `blocked` `CPU/RTX4090` `2h`
  - 前置任务：M07-T07。
  - 前置知识：validation selection、PPL、holdout、generation snapshot。
  - 产物：best checkpoint、best hash、20 prompts 的 step0/pilot/final 对比。
  - 工作：按最低 validation PPL 选择，不默认最后一步；记录选择逻辑。
  - 验收：PPL 可从原始 loss 重算；checkpoint hash 与报告一致。
  - 证据：eval JSON、best pointer 和固定 prompt 输出。

**阶段门禁：** 先完成 smoke 和 pilot；主训练只有在成本预测与恢复 preflight 通过后启动。

## M08 SFT 与 Assistant-only Loss

**阶段目标：** 从 Base checkpoint 得到双语指令模型，只对 assistant 内容学习，
并以自动测试和人工可视化共同证明 mask 正确。

**前置知识：** instruction tuning、chat template、role、teacher forcing、
assistant-only mask、ignore index、padding、truncation、early stopping。

- [ ] **M08-T01：准备并稳定切分 SFT 数据** `blocked` `CPU` `4h`
  - 前置任务：M04-T05、M07-T08。
  - 前置知识：conversation hash、train/validation/test、dataset revision。
  - 产物：40K UltraChat、40K Infinity-Instruct、4K GSM8K manifests。
  - 工作：固定 revision；规范消息角色；按 conversation hash 切分；去重 prompt。
  - 验收：三个 split 无 hash 交集；中英/数学数量与声明一致。
  - 证据：post-train data manifest。

- [ ] **M08-T02：实现统一 Chat Template** `pending` `CPU` `3h`
  - 前置任务：M04-T08。
  - 前置知识：BOS/EOT、header token、role、round trip。
  - 产物：`src/minillama/data/chat.py`。
  - 工作：格式化 system/user/assistant 多轮消息；训练和生成共用同一函数。
  - 验收：单轮、多轮、空 system、非法 role 和特殊字符均有测试。
  - 证据：chat template golden tests。

- [ ] **M08-T03：实现 Assistant-only Labels** `pending` `CPU` `4h`
  - 前置任务：M08-T02。
  - 前置知识：label shift、span、`-100`、padding mask。
  - 产物：`src/minillama/data/sft.py`。
  - 工作：只保留每轮 assistant 内容与 EOT；system/user/header/pad 全设 `-100`。
  - 验收：非 assistant token 100% 为 `-100`；每个 assistant span 参与 loss。
  - 证据：逐 token label 参数化测试。

- [ ] **M08-T04：完成 Mask 可视化人工审计** `pending` `CPU` `2h`
  - 前置任务：M08-T03。
  - 前置知识：token decode、role span、truncation boundary。
  - 产物：20 条中英样本的 token/role/label 表。
  - 工作：用颜色标出参与 loss 的 token；检查截断、padding、多轮边界。
  - 验收：人工审计 20/20 通过；异常样本带修复记录。
  - 证据：mask audit HTML/JSON。

- [ ] **M08-T05：实现 SFT 训练配置与循环** `blocked` `RTX4090` `4h`
  - 前置任务：M06-T10、M08-T01、M08-T04。
  - 前置知识：epoch、assistant loss、early stopping、validation。
  - 产物：SFT config 和 checkpoint。
  - 工作：max_len2048、3 epochs、LR2e-5、warmup3%、WD0、global65,536 tokens。
  - 验收：只按 assistant-only validation loss 选择最佳模型；全 token loss 仅作诊断。
  - 证据：resolved config、metrics、best checkpoint。

- [ ] **M08-T06：建立固定双语指令评测** `pending` `CPU/RTX4090` `3h`
  - 前置任务：M08-T02。
  - 前置知识：baseline、language consistency、template leakage、empty response。
  - 产物：200 条固定中英指令和评测器。
  - 工作：Base/SFT 使用同模板与解码参数；统计空回复、语言一致和模板泄漏。
  - 验收：结果包含原始逐样本输出，聚合指标可重算。
  - 证据：instruction eval JSON。

- [ ] **M08-T07：生成 SFT 阶段报告** `blocked` `CPU` `2h`
  - 前置任务：M08-T05、M08-T06。
  - 前置知识：paired comparison、loss curve、claim boundary。
  - 产物：SFT 报告和 checkpoint hash。
  - 工作：对比 Base/SFT assistant loss 与固定评测；描述数据和 mask 证据。
  - 验收：不把格式改善写成事实正确率提升；所有数字可回溯。
  - 证据：报告、原始 JSON 和 run ID。

**阶段门禁：** assistant-only mask 自动测试和 20 条人工审计先通过，再进行 GPU 训练。

## M09 DPO 偏好对齐

**阶段目标：** 从 SFT checkpoint 独立分叉实现 DPO，在不训练奖励模型的前提下，
提高 held-out preference accuracy 和 chosen/rejected margin。

**前置知识：** preference pair、chosen/rejected、sequence log-prob、logsigmoid、
reference policy、beta、margin、KL divergence。

- [ ] **M09-T01：准备并切分偏好数据** `blocked` `CPU` `3h`
  - 前置任务：M08-T07。
  - 前置知识：prompt hash、preference pair、train/validation/test。
  - 产物：UltraFeedback 20K pairs manifest。
  - 工作：固定选择 18K/1K/1K；按 prompt hash 切分；验证 chosen≠rejected。
  - 验收：同一 prompt 只在一个 split；response 非空且模板一致。
  - 证据：preference manifest 和校验统计。

- [ ] **M09-T02：实现 Response-only Sequence Log-prob** `pending` `CPU` `4h`
  - 前置任务：M08-T03、M06-T01。
  - 前置知识：token log-prob、gather、label shift、response mask。
  - 产物：`sequence_log_probs`。
  - 工作：只累计 assistant response；prompt/pad 不计；同时返回有效 token 数。
  - 验收：手工 logits 与逐 token `log_softmax` 求和一致。
  - 证据：chosen/rejected、变长和全 mask 测试。

- [ ] **M09-T03：实现并手算验证 DPO Loss** `pending` `CPU` `3h`
  - 前置任务：M09-T02。
  - 前置知识：logsigmoid、relative log-ratio、beta、`log(2)`。
  - 产物：`src/minillama/alignment/dpo.py`。
  - 工作：实现 `-logsigmoid(beta*((pi_c-ref_c)-(pi_r-ref_r)))`。
  - 验收：policy=reference 时 loss=`log(2)`；提高 chosen log-prob 必须降低 loss。
  - 证据：小张量解析测试和梯度符号测试。

- [ ] **M09-T04：冻结并隔离 Reference Policy** `pending` `CPU/RTX4090` `2h`
  - 前置任务：M09-T03。
  - 前置知识：eval mode、requires_grad、dropout、shared storage。
  - 产物：policy/reference 初始化器。
  - 工作：reference 来自同一 SFT checkpoint；eval、无梯度；禁止参数别名导致联动更新。
  - 验收：optimizer step 后 reference hash 不变；reference `.grad` 全为 None。
  - 证据：参数隔离测试。

- [ ] **M09-T05：实现 DPO 训练循环** `blocked` `RTX4090` `4h`
  - 前置任务：M09-T01、M09-T04、M06-T10。
  - 前置知识：pair batch、beta、gradient clip、approximate KL。
  - 产物：DPO config、metrics 和 checkpoint。
  - 工作：beta0.1、1 epoch、LR5e-6、warmup3%、global64 pairs、clip1.0。
  - 验收：记录 loss、margin、reward accuracy、KL 和 response token 数。
  - 证据：resolved config 与 DPO run。

- [ ] **M09-T06：评测 Preference Accuracy 与 Margin** `pending` `CPU/RTX4090` `3h`
  - 前置任务：M09-T02、M08-T06。
  - 前置知识：held-out evaluation、accuracy、margin、paired baseline。
  - 产物：SFT/DPO test 对比 JSON。
  - 工作：同 1K test 比较 chosen/rejected log-prob；同时跑固定 instruction eval。
  - 验收：报告 accuracy、mean/median margin、bootstrap 区间和退化指标。
  - 证据：逐 pair 分数和逐 prompt 生成。

- [ ] **M09-T07：生成 DPO 报告并限定结论** `blocked` `CPU` `2h`
  - 前置任务：M09-T05、M09-T06。
  - 前置知识：trade-off、regression、causal claim、selection bias。
  - 产物：DPO 报告与 checkpoint hash。
  - 工作：对比 SFT；说明 beta、数据和 reference；检查空回复/重复退化。
  - 验收：只有 preference 指标真实提升才写提升；不等同于通用质量提升。
  - 证据：报告引用 run ID 和原始结果。

**阶段门禁：** 公式手算、reference 冻结和 response-only mask 通过后才启动 DPO 训练。

## M10 GRPO 规则奖励对齐

**阶段目标：** 从 SFT checkpoint 独立分叉，用可验证规则奖励训练输出协议，
分别报告格式正确率和答案正确率，防止把“会套格式”误写成“推理提升”。

**前置知识：** rollout、policy gradient、reward、group normalization、advantage、
importance ratio、clipped objective、KL penalty、exact match、reward hacking。

- [ ] **M10-T01：固定 GSM8K 切分与输出协议** `blocked` `CPU` `2h`
  - 前置任务：M08-T01。
  - 前置知识：prompt hash、held-out test、format protocol、data contamination。
  - 产物：4K SFT、2.5K GRPO、973 validation 和 1,319 test manifests。
  - 工作：seed42 按 prompt hash 排序切分；协议固定为 reasoning/answer 两组 tag。
  - 验收：四个集合无交集；官方 test 训练过程不可见。
  - 证据：split manifest 和 hash 检查。

- [ ] **M10-T02：实现安全的规则奖励解析器** `pending` `CPU` `4h`
  - 前置任务：M10-T01。
  - 前置知识：regex/parser、Decimal、Fraction、NaN/Inf、adversarial input。
  - 产物：`src/minillama/alignment/rewards.py`。
  - 工作：格式完全匹配+0.25；规范化数值正确+1；空/多 tag/解析失败总分0。
  - 验收：覆盖整数、小数、分数、负数、逗号、单位、嵌套、NaN/Inf。
  - 证据：表驱动 reward parser 测试。

- [ ] **M10-T03：实现分组 Rollout** `blocked` `RTX4090` `4h`
  - 前置任务：M03-T06、M08-T02、M10-T02。
  - 前置知识：sampling、temperature、top-p、group size、policy snapshot。
  - 产物：`src/minillama/alignment/rollout.py`。
  - 工作：每 prompt 生成8条；temperature0.8、top-p0.95、max_new256；保存 token/log-prob/reward。
  - 验收：同 seed 可重放；EOS 后不再计 log-prob；snapshot 在 rollout 内不变。
  - 证据：小模型 rollout 测试和样本 JSON。

- [ ] **M10-T04：实现组内 Advantage 标准化** `pending` `CPU` `2h`
  - 前置任务：M10-T02。
  - 前置知识：mean、standard deviation、z-score、zero variance。
  - 产物：`group_advantages`。
  - 工作：每个 prompt 的 reward 组内标准化；std=0 时全部 advantage=0。
  - 验收：非零方差时 mean≈0；零方差不出现除零或 NaN。
  - 证据：手算奖励向量测试。

- [ ] **M10-T05：实现 GRPO Clipped Objective 与 KL** `pending` `CPU` `4h`
  - 前置任务：M10-T04、M09-T02。
  - 前置知识：importance ratio、min surrogate、epsilon clip、KL estimator。
  - 产物：`src/minillama/alignment/grpo.py`。
  - 工作：区分 old/current/reference log-prob；epsilon0.2；KL beta0.02；正确处理 advantage 符号。
  - 验收：小张量逐项手算一致；正负 advantage 的 clip 方向均正确。
  - 证据：objective 和梯度测试。

- [ ] **M10-T06：实现 Rollout→Update 训练流水线** `blocked` `RTX4090` `5h`
  - 前置任务：M10-T03、M10-T05、M06-T10。
  - 前置知识：on-policy snapshot、ratio、one update per batch、gradient clip。
  - 产物：GRPO config、trainer、metrics 和 checkpoint。
  - 工作：batch8 prompts×group8；LR1e-6；每 rollout batch 更新1次；训练1 epoch。
  - 验收：记录 reward mean/std、zero-variance ratio、KL、clip fraction、length。
  - 证据：resolved config 和 GRPO run。

- [ ] **M10-T07：评测格式率与 Exact Match** `pending` `CPU/RTX4090` `3h`
  - 前置任务：M10-T02、M08-T06。
  - 前置知识：format compliance、numeric exact match、paired evaluation。
  - 产物：SFT/GRPO validation 与 final test 对比。
  - 工作：分别统计格式、答案正确、空回复、多 tag；保留逐题输出。
  - 验收：最终 test 只运行一次；聚合值可从逐题结果重算。
  - 证据：eval JSON 和 parser version。

- [ ] **M10-T08：生成 GRPO 报告并审查 Reward Hacking** `blocked` `CPU` `2h`
  - 前置任务：M10-T06、M10-T07。
  - 前置知识：reward hacking、Goodhart's law、claim boundary。
  - 产物：GRPO 报告和失败样本分类。
  - 工作：检查只学 tag、重复 reasoning、答案猜测和长度漂移；与 SFT 配对比较。
  - 验收：格式升而 EM 降时只写格式遵循提升，不写推理能力提升。
  - 证据：报告、分类表、run ID 和 checkpoint hash。

**阶段门禁：** parser、advantage、objective 手算测试通过；格式率和 EM 必须分开报告。

## M11 性能基准与消融

**阶段目标：** 在固定硬件、输入和测量协议下隔离变量，量化 GQA、KV Cache、
SDPA、BF16、compile 和 gradient checkpoint 的收益与代价。

**前置知识：** warmup、CUDA synchronize、peak memory、latency、throughput、
median、P10/P90、ablation、control variable、theoretical/empirical memory。

- [ ] **M11-T01：建立可复现 Benchmark Harness** `blocked` `RTX4090` `4h`
  - 前置任务：M01-T08、M03-T06。
  - 前置知识：warmup、CUDA event、synchronize、percentile、run metadata。
  - 产物：`scripts/benchmark.py` 和结果 schema。
  - 工作：5次 warmup、30次计时；每 case 重置 peak stats；记录环境、dtype、shape、commit/config hash。
  - 验收：相同 case 可重复；计时区间前后同步 CUDA；异常 case 有 reason code。
  - 证据：benchmark smoke CSV。

- [ ] **M11-T02：建立 MHA/GQA 对照配置** `pending` `CPU` `2h`
  - 前置任务：M02-T11。
  - 前置知识：controlled comparison、parameter count、KV head。
  - 产物：`minillama_125m` 与 `mha_134m` 配置。
  - 工作：除 `n_kv_heads=4/12` 及其必然参数变化外保持一致；固定输入和权重初始化 seed。
  - 验收：配置 diff 只包含允许字段；参数量报告明确不同。
  - 证据：config diff 测试。

- [ ] **M11-T03：计算理论 KV Cache 字节数** `pending` `CPU` `2h`
  - 前置任务：M03-T05、M11-T02。
  - 前置知识：tensor bytes、dtype size、layers、K/V factor2。
  - 产物：理论 KV 计算器。
  - 工作：计算 `2*L*B*Hkv*T*Dh*bytes`；列出 GQA/MHA 和不同 batch/context。
  - 验收：主配置 BF16、B1、T2048 得到 GQA24MiB、MHA72MiB、理论降幅66.67%。
  - 证据：解析公式测试。

- [ ] **M11-T04：运行 MHA vs GQA 基准** `blocked` `RTX4090` `3h`
  - 前置任务：M11-T01、M11-T02、M11-T03。
  - 前置知识：prefill/decode、tokens/s、peak memory、batch/context matrix。
  - 产物：MHA/GQA benchmark CSV。
  - 工作：batch1/4/8、prompt128/512/2048；测 prefill、decode、峰值显存和理论 KV。
  - 验收：报告 median/P10/P90；理论 KV 与 CUDA 峰值不混用。
  - 证据：原始 30 次计时记录。

- [ ] **M11-T05：运行 KV Cache On/Off 基准** `blocked` `RTX4090` `3h`
  - 前置任务：M03-T08、M11-T01。
  - 前置知识：algorithmic complexity、full-prefix recompute、greedy equality。
  - 产物：cache on/off CSV。
  - 工作：同权重、同 prompt、greedy；生成128/512 token；先校验序列一致再计时。
  - 验收：token 序列完全一致；分别报告 decode tokens/s 和 peak memory。
  - 证据：生成 token hash 和原始计时。

- [ ] **M11-T06：运行训练优化隔离矩阵** `blocked` `RTX4090` `4–6h`
  - 前置任务：M06-T06、M11-T01。
  - 前置知识：eager、SDPA、compile、checkpoint、global batch normalization。
  - 产物：A–E 五组 200-step CSV。
  - 工作：依次测 FP32 eager、BF16 eager、BF16 SDPA、compile、checkpoint；前50步排除。
  - 验收：每次只改变一个变量；OOM 时保持 global tokens 并明确 micro-batch 变化。
  - 证据：各 case resolved config 和原始 metrics。

- [ ] **M11-T07：生成性能报告与结论边界** `blocked` `CPU` `3h`
  - 前置任务：M11-T04、M11-T05、M11-T06。
  - 前置知识：effect size、percent change、uncertainty、hardware specificity。
  - 产物：`reports/performance.md` 与图表。
  - 工作：从 CSV 自动生成；A→D 吞吐、D→E 显存、cache on/off、MHA/GQA 分开。
  - 验收：每个结论附 case、环境、区间和 run ID；不外推到其他 GPU。
  - 证据：报告生成命令和输入 CSV hash。

**阶段门禁：** 输出一致性先于性能；所有结论来自隔离变量和原始重复测量。

## M12 评测、报告与可复现交付

**阶段目标：** 把数据、训练、对齐和性能的原始产物变成可重算、可追溯的报告、
模型卡、数据卡和只引用真实数字的简历摘要。

**前置知识：** schema、run ID、manifest、hash、raw/derived metric、model card、
data card、traceability、claim boundary、reproduction。

- [ ] **M12-T01：统一 Run 与指标 Schema** `pending` `CPU` `3h`
  - 前置任务：M06-T07、M06-T08。
  - 前置知识：schema version、JSONL、provenance、derived metric。
  - 产物：run 目录规范和 metrics/eval JSON schema。
  - 工作：固定 run_id、config、environment、git_state、data manifest、metrics、eval、checkpoint 字段。
  - 验收：任一表格行可定位 run；schema 版本不兼容时明确失败。
  - 证据：schema validator 和示例 run。

- [ ] **M12-T02：生成预训练报告** `blocked` `CPU` `3h`
  - 前置任务：M07-T08、M12-T01。
  - 前置知识：loss/PPL curve、best checkpoint、wall/effective time。
  - 产物：`reports/pretraining.md` 与曲线。
  - 工作：读取原始 JSONL；写数据组成、token 数、参数量、训练时间、step0/best PPL。
  - 验收：PPL 由 loss 重算；图表点数与 eval 记录一致。
  - 证据：报告输入 hash 和生成日志。

- [ ] **M12-T03：生成对齐报告** `blocked` `CPU` `3h`
  - 前置任务：M08-T07、M09-T07、M10-T08、M12-T01。
  - 前置知识：paired baseline、preference accuracy、format rate、exact match。
  - 产物：`reports/alignment.md`。
  - 工作：并列 SFT/DPO/GRPO 数据、mask、超参、loss、margin、格式率和 EM。
  - 验收：指标来源和 split 清楚；格式与正确率不混写。
  - 证据：报告链接逐样本 eval JSON。

- [ ] **M12-T04：固化性能报告生成** `blocked` `CPU` `2h`
  - 前置任务：M11-T07、M12-T01。
  - 前置知识：CSV aggregation、percentile、error interval、reproducible plot。
  - 产物：性能报告、CSV 和 SVG/PNG。
  - 工作：固定排序、单位、配色和 case 标签；图从原始 CSV 生成。
  - 验收：删除图后可重建；表格值与 CSV 逐项匹配。
  - 证据：build report 命令和输出 hash。

- [ ] **M12-T05：完成 DATA_CARD** `pending` `CPU` `3h`
  - 前置任务：M04-T09、M05-T07、M08-T01、M09-T01、M10-T01。
  - 前置知识：data lineage、license、privacy、bias、known limitation。
  - 产物：`DATA_CARD.md`。
  - 工作：记录来源/revision/许可、过滤、去重、切分、语言比例、风险和用途边界。
  - 验收：每个训练数据都能定位 manifest；不复制可能含隐私的原文。
  - 证据：数据卡引用 manifest/hash。

- [ ] **M12-T06：完成 MODEL_CARD** `blocked` `CPU` `3h`
  - 前置任务：M07-T08、M08-T07、M09-T07、M10-T08。
  - 前置知识：intended use、limitation、evaluation、safety boundary。
  - 产物：`MODEL_CARD.md`。
  - 工作：记录架构、训练数据、checkpoint、评测、偏差、局限和不可用场景。
  - 验收：所有模型数字能反查；不把小模型描述为生产级通用助手。
  - 证据：模型卡中的 run/checkpoint hash。

- [ ] **M12-T07：生成简历摘要并执行全新环境复现** `blocked` `CPU/RTX4090` `4h`
  - 前置任务：M12-T02、M12-T03、M12-T04、M12-T05、M12-T06。
  - 前置知识：fail-closed、artifact lookup、clean-room reproduction。
  - 产物：`resume_summary.py` 输出和发布复现记录。
  - 工作：只读取已完成 run；缺指标直接失败；新目录重跑 smoke、数值、短训练、生成和报告。
  - 验收：摘要无 `XX`/空值；每个数字带 run ID；新环境按 README 成功。
  - 证据：复现日志、摘要输入/输出和 artifact hash。

**阶段门禁：** 所有简历数字能定位到 run ID、配置、原始日志和生成脚本。

## 总体完成定义

- [ ] 98 个任务均依据证据更新状态，而不是只勾选清单。
- [ ] M02/M03 的数值正确性、M05/M06 的恢复一致性和 M08 的 mask 证据全部自动化。
- [ ] 25 亿 token 主训练真实完成，PPL、时间、显存和吞吐由日志生成。
- [ ] SFT、DPO、GRPO 有独立 checkpoint、数据 split 和报告。
- [ ] 性能结论来自隔离变量基准。
- [ ] 新环境可完成 smoke run、生成和报告构建。
- [ ] 简历中的每个数字都能回溯到原始 artifact。
