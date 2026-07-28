# MiniLlama：轻量级大语言模型预训练与对齐系统

MiniLlama 是一个用于学习、复现和展示完整 LLM 训练链路的原生 PyTorch 项目。项目实现约 168M 参数的 Llama 3 风格 Decoder-only 模型，覆盖双语预训练、Assistant-only SFT、DPO、规则奖励 GRPO、KV Cache 推理、数值对齐、性能消融和自动报告。

项目是普通文件夹，不初始化任何版本控制仓库，不包含 `.git`、`.gitignore`、远程流水线或版本控制运行时依赖。实验可追溯性由配置文件、环境快照、数据 SHA256 和 `code_manifest.json` 完成。

> 本项目不会把简历中的 PPL、显存、吞吐和正确率数字写成既成结果。只有实际运行生成的 `metrics.jsonl`、`results.json`、CSV 和图表才能作为实验结论。

## 1. 主要能力

- 从零实现 RMSNorm、RoPE、GQA/MHA、SwiGLU、Causal Attention 和预分配 KV Cache。
- 提供手写 eager attention 与 PyTorch SDPA 两条路径。
- 支持 FP32、FP16、BF16、梯度累积、梯度检查点、梯度裁剪和断点恢复。
- 训练循环不依赖 Trainer、TRL 或 Accelerate。
- 支持本地 JSONL、JSON、Parquet、`uint16` mmap shards 和 Sequence Packing。
- SFT 只监督 assistant 内容和对应 EOT。
- DPO 使用冻结 SFT reference；GRPO 使用严格格式与数值答案规则奖励。
- 每个实验独立运行，终端显示百分比、ETA 和关键指标。
- TensorBoard 实时显示曲线，实验结束自动输出 PNG、CSV 和 Markdown 报告。

## 2. 主模型配置

| 配置 | 数值 |
|---|---:|
| vocabulary | 32,000 |
| hidden size | 768 |
| layers | 16 |
| Query heads | 12 |
| KV heads | 3 |
| head dimension | 64 |
| SwiGLU intermediate | 2,560 |
| context length | 2,048 |
| RoPE theta | 500,000 |
| 精确参数量 | 167,142,144 |

12 个 Query heads 对应 3 个 KV heads，因此 GQA 的纯 KV 张量相对同维度 MHA 理论减少 75%。这不等同于整张 GPU 的峰值显存减少 75%，两项数据会分别报告。

正式预训练共 22,888 个优化步，每步 64 个长度 2,048 的序列：

```text
22,888 × 64 × 2,048 = 2,999,975,936 个有效训练 token
```

## 3. 目录和文件说明

### 根目录

| 文件 | 用途 |
|---|---|
| `README.md` | 从安装、下载数据到八个实验的完整操作手册 |
| `requirements.txt` | 唯一依赖清单，包含运行、绘图和测试依赖 |
| `DATA_CARD.md` | 数据来源、切分、清洗、许可与风险说明 |
| `MODEL_CARD.md` | 模型用途、结构、限制、评测和发布检查项 |
| `pytest.ini` | 测试目录、CUDA/reference 标记与警告过滤 |

### `configs/`

- `models/minillama_168m.yaml`：168M 主模型的纯结构配置。
- `models/tiny_smoke.yaml`：无需外部数据的 CPU 端到端训练配置。
- `data/pretrain_bilingual.yaml`：中英 70/30 预训练数据与 token 预算。
- `data/sft.yaml`：SFT 数据协议、路径和 mask 约定。
- `data/dpo.yaml`：偏好数据协议和 DPO beta。
- `data/grpo.yaml`：GRPO prompt/answer 协议、group size 和输出格式。

### `minillama/model/`

- `config.py`：结构配置、形状约束、168M 与 tiny 工厂方法。
- `norm.py`：float32 归一化统计的 RMSNorm。
- `rope.py`：与标准 Llama 参考实现一致的 Rotary Embedding。
- `cache.py`：按层预分配、连续追加的 KV Cache。
- `layers.py`：GQA/MHA、eager/SDPA attention、SwiGLU 和 Transformer Block。
- `model.py`：完整 Causal LM、loss、梯度检查点和模型输出类型。
- `__init__.py`：对外导出模型公共接口。

### `minillama/data/`

- `cleaning.py`：Unicode 清洗、过滤原因、精确去重和稳定切分。
- `tokenizer.py`：32K Byte-level BPE 训练与 tokenizer adapter。
- `packing.py`：流式 Sequence Packing、manifest 和 mmap Dataset。
- `chat.py`：统一训练/推理聊天模板及 Assistant-only mask。
- `posttrain.py`：SFT、DPO、GRPO 三类本地 JSONL Dataset。
- `sources.py`：JSONL/JSON/Parquet 读取和按 token 比例双语混合。
- `__init__.py`：导出数据公共接口。

### `minillama/training/`

- `schedule.py`：可恢复的 warmup + cosine 学习率。
- `checkpoint.py`：原子 checkpoint 和完整随机状态恢复。
- `metrics.py`：可重建图表的 JSONL 日志。
- `trainer.py`：单卡精度控制、梯度累积、裁剪、进度条和 TensorBoard。
- `__init__.py`：导出训练公共接口。

### `minillama/alignment/`

- `dpo.py`：逐 token/序列 log-prob 与 DPO loss。
- `rewards.py`：严格 GRPO 格式解析和数值答案奖励。
- `grpo.py`：组内优势标准化、clipped objective 和 KL。
- `__init__.py`：导出后训练数学接口。

### `minillama/inference/`

- `generation.py`：greedy、temperature、top-k、top-p、缓存/非缓存生成。
- `__init__.py`：导出生成配置、结果和生成函数。

### `minillama/evaluation/`

- `reference.py`：Hugging Face Llama 构造及逐项权重映射。
- `perplexity.py`：按有效 token 加权的 loss/PPL。
- `benchmark.py`：理论 KV 字节数、同步计时和分位数统计。
- `__init__.py`：导出评测接口。

### `minillama/reporting/`

- `reports.py`：训练曲线、摘要 CSV 和简历指标审计。
- `visuals.py`：通用 CSV、Markdown 表格和柱状图。
- `__init__.py`：导出报告接口。

### `minillama/utils/`

- `config.py`：读取 YAML 并构造严格 ModelConfig。
- `environment.py`：Python、PyTorch、CUDA、GPU 和 BF16 环境快照。
- `provenance.py`：对源码和配置生成 SHA256 清单。
- `run_context.py`：创建统一运行目录及基础产物。
- `__init__.py`：导出通用接口。

### `experiments/`

每个目录都有独立 `config.yaml` 与 `run.py`；`__init__.py` 使其可通过 `python -m` 运行。`common.py` 只保存共享路径、配置和 checkpoint 加载逻辑。

| 目录 | 运行目的 |
|---|---|
| `exp01_numerical_validation` | Hugging Face 整模对齐及 cached/full 一致性 |
| `exp02_data_pipeline` | 清洗、切分、BPE、双语混合和 Packing |
| `exp03_pretraining` | tiny smoke 与 168M 正式预训练 |
| `exp04_training_efficiency` | eager、SDPA、compile、累积和检查点消融 |
| `exp05_inference_benchmark` | GQA/MHA 与 Cache on/off 性能 |
| `exp06_sft` | Assistant-only 指令微调与 mask 图 |
| `exp07_dpo` | 冻结 reference 的偏好对齐 |
| `exp08_grpo` | 在线 rollout、规则奖励和 GRPO 更新 |

### `tools/`

- `check_environment.py`：环境自检并保存 JSON。
- `download_dataset.py`：下载一个预训练文本切片并记录不可变 revision ID 和文件 SHA256。
- `prepare_posttrain_data.py`：把 UltraChat、Infinity-Instruct 和 UltraFeedback 转成统一 JSONL。
- `prepare_gsm8k_partitions.py`：一次生成互不重叠的 4,000 SFT、2,500 GRPO train、973 validation 和官方 test。
- `split_jsonl.py`：合并、精确去重并稳定切分本地 JSONL。
- `build_all_reports.py`：扫描已有产物、重建报告和简历指标审计表。
- `__init__.py`：工具包标识。

### `tests/`

- `model/`：参数量、RMSNorm、RoPE、因果性、缓存、SDPA 与参考对齐。
- `data/`：清洗、去重、切分、Packing、SFT mask 和偏好样本。
- `training/`：调度、随机状态、checkpoint、日志、数据游标和训练器。
- `alignment/`：DPO、GRPO、奖励解析和恶意格式输入。
- `evaluation/`：KV 理论计算。
- `reporting/`：运行目录、PNG/CSV/Markdown 重建和未验证标记。

### `outputs/`

实验运行时自动创建。这里是普通数据目录，不依赖任何忽略规则。大型 checkpoint、日志和图表可能占用较多磁盘，请自行备份或清理。

## 4. 环境准备

推荐正式环境：Linux、Python 3.11、单张 32GB 以上 NVIDIA GPU。24GB GPU 可以调低 micro batch 并增加梯度累积，但原始显存基线可能无法运行。

创建虚拟环境：

```bash
python -m venv .venv
```

Windows 激活：

```powershell
.venv\Scripts\Activate.ps1
```

Linux 激活：

```bash
source .venv/bin/activate
```

根据 GPU 和驱动，在 PyTorch 官方安装页面选择对应 CUDA wheel。安装 PyTorch 后再安装其余依赖：

```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
python tools/check_environment.py --output outputs/environment.json
```

正式 FP16 训练前确认 `environment.json` 中：

- `cuda_available` 为 `true`。
- GPU 名称和总显存正确。
- PyTorch CUDA 版本与驱动兼容。

## 5. 下载预训练数据

本项目不自动下载数据。以下命令由你在准备好网络、磁盘和数据使用许可后执行。

英文 FineWeb-Edu 示例：

```bash
python tools/download_dataset.py --dataset HuggingFaceFW/fineweb-edu --subset sample-10BT --split train --text-field text --output data/raw/fineweb_edu_en.jsonl --max-documents 5000000
```

简体中文 FineWeb-2 示例：

```bash
python tools/download_dataset.py --dataset HuggingFaceFW/fineweb-2 --subset zho_Hans --split train --text-field text --output data/raw/fineweb2_zh.jsonl --max-documents 3000000
```

`max-documents` 只是首次下载预算。若 Packing 在达到约 30 亿 token 前提示某种语言耗尽，需要增加对应数量后重新准备。每个输出旁边会生成 `source_lock.json`，记录解析后的 revision ID、文档数和 SHA256。

预计空间：

- 约 30 亿个 `uint16` token 约 6GB。
- 原始文本、处理副本、索引、验证集和临时文件会显著增加占用。
- 加上多个 checkpoint 和后训练产物，建议准备至少 150GB 可用空间。

## 6. 准备 Tokenizer 和 Packed 数据

确认两个原始 JSONL 已放在配置指定位置，然后运行：

```bash
python -m experiments.exp02_data_pipeline.run --config experiments/exp02_data_pipeline/config.yaml
```

该实验依次执行：

1. 文本规范化和过滤。
2. SHA256 精确去重。
3. 文档级稳定 train/validation 切分。
4. 训练 32K Byte-level BPE。
5. 按最终 token 数维持中英 70/30。
6. 写入 2049-token `uint16` records。
7. 保存 tokenizer、manifest、CSV、PNG 和报告。

所有长步骤都显示百分比和 ETA。

## 7. 准备后训练数据

### SFT 公开对话

```bash
python tools/prepare_posttrain_data.py --task ultrachat --output data/posttrain/raw_ultrachat.jsonl --max-records 40000
python tools/prepare_posttrain_data.py --task infinity --output data/posttrain/raw_infinity.jsonl --max-records 40000
```

### GSM8K 无泄漏分区

```bash
python tools/prepare_gsm8k_partitions.py --output-dir data/posttrain --seed 42
```

该命令固定产生：

- `gsm8k_sft.jsonl`：4,000 条，只用于 SFT。
- `grpo_train.jsonl`：2,500 条，只用于 GRPO rollout。
- `grpo_validation.jsonl`：973 条，只用于调参验证。
- `grpo_test.jsonl`：官方 test，只用于最终报告。

合并并切分 SFT：

```bash
python tools/split_jsonl.py --input data/posttrain/raw_ultrachat.jsonl --input data/posttrain/raw_infinity.jsonl --input data/posttrain/gsm8k_sft.jsonl --train-output data/posttrain/sft_train.jsonl --validation-output data/posttrain/sft_validation.jsonl --test-output data/posttrain/sft_test.jsonl --ratios 0.9 0.05 0.05 --seed 42
```

### DPO 偏好数据

```bash
python tools/prepare_posttrain_data.py --task ultrafeedback --output data/posttrain/raw_dpo.jsonl --max-records 20000
python tools/split_jsonl.py --input data/posttrain/raw_dpo.jsonl --train-output data/posttrain/dpo_train.jsonl --validation-output data/posttrain/dpo_validation.jsonl --test-output data/posttrain/dpo_test.jsonl --ratios 0.8 0.1 0.1 --seed 42
```

## 8. 运行测试和 tiny smoke

先验证 CPU 核心逻辑：

```bash
python -m pytest -q
python -m ruff check --no-cache .
python -m mypy minillama experiments tools
```

无需数据的端到端训练：

```bash
python -m experiments.exp03_pretraining.run --config configs/models/tiny_smoke.yaml
```

该命令运行 4 个优化步，用于检查：模型 forward、loss、反向传播、日志、TensorBoard、checkpoint、PNG 和 Markdown 报告是否能完整生成。它不是正式模型效果实验。

## 9. 八个独立实验

### 01 数值正确性

```bash
python -m experiments.exp01_numerical_validation.run
```

正式建议在 Linux 环境运行。报告包含 Hugging Face logits 对齐和 cached/full 最大误差。

### 02 数据管线

```bash
python -m experiments.exp02_data_pipeline.run
```

### 03 正式预训练

```bash
python -m experiments.exp03_pretraining.run --config experiments/exp03_pretraining/pretrain_168m.yaml
```

恢复中断训练：

```bash
python -m experiments.exp03_pretraining.run --config experiments/exp03_pretraining/pretrain_168m.yaml --resume outputs/exp03_pretraining/对应运行目录/checkpoints/对应断点.pt
```

### 04 训练效率消融

```bash
python -m experiments.exp04_training_efficiency.run
```

每个 case 保持相同 global sequence batch，分别报告吞吐和峰值显存。若某个基线 OOM，会记录为 `oom`，不会用不同 global batch 冒充可比结果。

### 05 推理性能

```bash
python -m experiments.exp05_inference_benchmark.run
```

报告 GQA/MHA 理论 KV 字节数、实际峰值显存和 Cache on/off 吞吐。只有 greedy token 序列一致时，Cache 对比才有效。

### 06 SFT

先把预训练最佳 checkpoint 放到 `data/checkpoints/pretrain_best.pt`，然后运行：

```bash
python -m experiments.exp06_sft.run
```

### 07 DPO

先把 SFT 最佳 checkpoint 放到 `data/checkpoints/sft_best.pt`，然后运行：

```bash
python -m experiments.exp07_dpo.run
```

### 08 GRPO

```bash
python -m experiments.exp08_grpo.run
```

GRPO 与 DPO 都从同一个 SFT checkpoint 独立分支，不能把 DPO 权重作为 GRPO 初始权重。

## 10. 查看实时进度

终端进度条显示：

- 当前步骤和总步骤。
- 完成百分比。
- ETA。
- loss、学习率和 tokens/s。
- GRPO reward、格式正确率和 KL。

启动 TensorBoard：

```bash
tensorboard --logdir outputs
```

浏览器打开 TensorBoard 输出的本地地址即可查看实时曲线。

## 11. 运行产物

每次实验创建独立目录：

```text
outputs/<experiment>/<run-id>/
├── resolved_config.yaml
├── environment.json
├── code_manifest.json
├── data_manifest.json
├── metrics.jsonl
├── tensorboard/
├── checkpoints/
├── results.json
├── tables/
├── figures/
├── report.md
└── stdout.log
```

- `resolved_config.yaml`：本次实际配置。
- `environment.json`：软硬件快照。
- `code_manifest.json`：第一方源码与配置 SHA256。
- `data_manifest.json`：数据版本和哈希。
- `metrics.jsonl`：所有图表的事实来源。
- `results.json`：本次实验摘要。
- `tables/`：可继续分析的 CSV。
- `figures/`：自动生成的 PNG。
- `report.md`：带表格和图片引用的可读报告。

重建已有报告并生成简历指标审计：

```bash
python tools/build_all_reports.py --outputs outputs
```

结果位于 `outputs/summary/`。缺失的指标显示“未验证”，不会填入目标数字。

## 12. 如何解释简历指标

| 简历描述 | 必须读取的真实产物 |
|---|---|
| PPL 10.35 → 3.50 | exp03 的 `metrics.jsonl` 与 `report.md` |
| 训练 40 小时 | environment、首尾时间及完整日志 |
| 29.2GB → 19.8GB | exp04 相同 global batch 的显存表 |
| 吞吐提升 36.8% | exp04 基线/优化 case 的中位 tokens/s |
| GQA KV 降低 75% | exp05 理论 KV 表；峰值显存另报 |
| 58 → 190 tokens/s | exp05 Cache on/off 且 token 序列一致的结果 |
| 68% → 91% | exp08 固定评测集上的 format accuracy |

硬件、数据 revision 或依赖变化都可能改变绝对数字。没有对应 run ID 和原始日志的数字不能写入最终报告。

## 13. 常见问题

### CUDA OOM

- 先减小 `micro_batch`。
- 按比例增加 `gradient_accumulation_steps`，保持 global batch 不变。
- 启用 `gradient_checkpointing`。
- 检查是否意外同时保留多个模型或旧 CUDA tensor。

### Loss 为 NaN/Inf

- 检查 FP16 GradScaler 是否启用。
- 降低 peak LR。
- 检查数据 token 是否越界。
- 检查 batch 是否全部为 `-100` labels。
- 使用最后一个正常 checkpoint 恢复，不要继续使用异常优化器状态。

### 数据提前耗尽

增加对应语言的 `max-documents` 后重新下载和 Packing。双语配比按 token 控制，不按文档数控制。

### 参考对齐导入异常

参考实验只需要 PyTorch 和 Transformers 文本模型。若本机安装了不兼容的视觉扩展，建议在干净的 Linux 训练环境运行 exp01；模型核心和缓存测试不依赖视觉包。

### checkpoint 不能恢复

确认模型配置、词表、数据路径和 checkpoint 来自同一实验分支。恢复时会同时加载优化器、调度器、GradScaler、随机状态和数据游标。
