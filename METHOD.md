---
name: davis-sunset-index
description: 每天傍晚推送 Davis 当晚的晚霞指数（0–10 分）、峰值时间窗和观测点建议
---

生成今晚 Davis, CA 的「晚霞指数」播报，用中文输出，简洁（正文控制在 150–250 字 + 一个小表格）。

坐标：Davis, CA = 38.5449N, -121.7405W。用 `Bash` + `curl` 调 open-meteo 免费 API（无需 key）。注意：本机 `python`/`python3` 是 Microsoft Store 存根，会静默退出，**解析 JSON 一律用 `py`**。

## 步骤

**1. 取当天日落时间和主数据**
```
https://api.open-meteo.com/v1/forecast?latitude=38.5449&longitude=-121.7405&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,relative_humidity_2m,visibility,wind_speed_10m&daily=sunset&timezone=America%2FLos_Angeles&forecast_days=1
```
记下 `daily.sunset`。关注日落前 1 小时到日落后 1 小时的逐小时数据。

**2. 取高层湿度（判断卷云厚薄，最关键的一步）**
同一 endpoint，加 `hourly=relative_humidity_200hPa,relative_humidity_250hPa,relative_humidity_300hPa,relative_humidity_400hPa,relative_humidity_500hPa,relative_humidity_700hPa,precipitation`，用 `start_hour`/`end_hour` 框住日落窗口。

**3. 取气溶胶**
```
https://air-quality-api.open-meteo.com/v1/air-quality?latitude=38.5449&longitude=-121.7405&hourly=pm2_5,aerosol_optical_depth,dust,us_aqi&timezone=America%2FLos_Angeles&forecast_days=1
```

**4. 查上游（西侧）进光通道 —— 这是本方法的核心，不能省**
先算今天的日落方位角：`cos(A) = sin(δ)/cos(φ)`，φ=38.55°，δ=太阳赤纬（用当天日期估算，夏至 +23.44°、冬至 −23.44°、春秋分 0°），日落方位 = 360° − A。（夏天约 300°，冬天约 240°。）
沿该方位从 Davis 向外取 3 个点，距离 100 / 220 / 350 km（1° 纬度=111 km，1° 经度=111·cos(lat) km），一次性用逗号分隔的 latitude/longitude 批量查 `cloud_cover_low,cloud_cover_mid,cloud_cover_high`。
判读要点：
- 100 km 点（Coast Range 一带）**低云和中云必须接近 0**，否则光进不来，直接大幅扣分。
- 220 / 350 km 点若高云由 100% 掉到接近 0，说明云盖西边界在海上 → 存在「进光缝」，加分。
- 沿海的海雾/层云（低云 100%）**一般不算致命**：日落后光线经过海岸上空时已在 1–2 km 高度，高于 300–600 m 的海雾顶。但要在正文里说明。

**5. 多模式交叉验证**
对 Davis 点分别用 `models=ecmwf_ifs025`、`gfs_seamless`、`icon_seamless` 查日落窗口的三层云量。三家一致 → 高置信度；分歧大 → 在结论里明确降低置信度。

**陷阱：低云分歧往往是假分歧。** 若 GFS 报低云 80–100% 而 ECMWF/ICON 报低云≈0 且中云 70–80%，多半不是预报分歧，而是分类口径不同——GFS 的低云诊断上界到 680hPa，会把 3 km 的中云盖算进低云。**不要直接按「有低云带 → ≤3 分」一票否决**，先加查低层湿度剖面：

```
hourly=relative_humidity_1000hPa,relative_humidity_925hPa,relative_humidity_850hPa,relative_humidity_700hPa,temperature_2m,dew_point_2m
```

判读：只有 700hPa 饱和、而 1000/925hPa 只有 70–85%、地面露点差 ≥5°C → **不可能有海雾层云**，那是一层 3 km 的中云盖，按「中云画布 + 下方干」加分（参考 2026-08-28、09-03）。反过来，1000/925hPa 也接近饱和、露点差 <2°C → 是真的海雾/层云，一票否决成立。

## 评分标准（0–10）

- **西侧通道（权重最高）**：Davis 及 100 km 上游的低云+中云 ≈ 0 → 大加分；有低云带 → 一票否决式扣分（≤3 分）。
- **高云量**：30–80% 最理想（有纹理有留白）；100% 是双刃剑，看厚度；<15% → 没有画布，≤4 分。
- **卷云厚薄**：200–300hPa RH 40–70% → 薄卷云、半透明，会烧起来（加分）；>85% → 厚卷层云，可能变成灰盖板（扣分）；<30% → 基本无云。
- **空气**：AOD <0.15 且 PM2.5 <20 → 颜色纯净（加分）；AOD >0.3 或有野火烟 → 颜色发浑发褐（扣分）。
- **中云 400–500hPa**：少量中云能加层次；但配合低云就是遮挡。

## 输出格式（同时是网站的解析契约 —— 标记写错，站点上就是空卡片）

网站 `lib/forecasts.ts` 用正则从 md 里抠字段。下面**加粗的标记必须逐字照写**，包括全角冒号：

1. 首行：`**Davis M/D 晚霞指数：N/10 —— 一句话结论**`
   （`M/D` 不补零，破折号用 `——`，整行必须在一对 `**` 里）
2. 第二行：`日落 **HH:MM**，方位角 **NNN°**（西偏北）`
   （时间和度数**都要加粗**，否则回退到 frontmatter）
3. 一个 markdown 小表，表头必须是 `| 因子 | 数值 | 判断 |`，行内用 ✅ ⚠️ ❌ ➖
4. `**关键判断**：` 2–3 句 —— 最好的一条是什么、最大的风险是什么
5. `**时间窗**：` 以高云为主时峰值在日落后 8–25 分钟、约 30 分钟熄灭；以中低云为主时峰值在日落前后各 10 分钟。给具体钟点。
6. `**建议**：` 城西农田路（Russell Blvd 往西出城、Road 31/32）视野最开阔；懒得跑就 West Davis Pond 或 UC Davis Arboretum 西端。满天高云时提醒回头看东边的反霞。

**低分日（<4 分）可以写得短，但这六项一个都不能省。** 表压到 4–6 行、每段一句话即可，但 `**关键判断**：`／`**时间窗**：`／`**建议**：` 三个标记必须在。历史上省掉表格的那几天（8/19、8/24、8/26、8/29、8/30）在网站上就是空卡片，别再制造新的。

**一天只写一段播报。** 同一晚若重算，把原文替换掉、不要往同一个文件里追加第二个表——解析器会把多个表拼在一起，变成一堆互相矛盾的因子行。

## 存档并推送到 GitHub（在聊天里输出播报之后再做）

仓库：`E:\OneDrive - University of California, Davis\PhD\Projects\davis_sunset`（路径有空格，命令里一律加引号）

1. 把播报**逐字**写进 `reports/YYYY-MM-DD.md`（用当天 Davis 本地日期），格式对齐已有文件：

```markdown
---
date: 2026-09-02
location: Davis, CA
sunset: "19:35"
sunset_azimuth: 279.4
score: 5
source: claude-code scheduled task `davis-sunset-index`
---

# Davis 晚霞指数 · 2026-09-02

> 由 Claude Code 定时任务 `davis-sunset-index` 自动生成。数据源：open-meteo forecast / air-quality API（ECMWF / GFS / ICON 三模式交叉验证）。

## 18:33 定时播报

<播报正文，与聊天里输出的完全一致>
```

置信度低的时候在 frontmatter 里加一行 `confidence: low`。

2. 在 `README.md` 的「播报存档」表**最上面**插一行：`| [YYYY-MM-DD](reports/YYYY-MM-DD.md) | 分数 | 日落 | 一句话 |`。

3. commit + push：

```bash
cd "E:/OneDrive - University of California, Davis/PhD/Projects/davis_sunset" && git add -A && git commit -q -m "Sunset index YYYY-MM-DD: N/10" && git push -q origin main
```

commit message 结尾加一行 `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`。

**如果 push 失败**（网络、凭据、冲突）：不要重试超过一次，也不要动 `--force`。保留本地 commit，在聊天末尾用一行说明失败原因即可——播报本身已经发出去了，推送是附加动作。若是冲突，先 `git pull --rebase` 再推一次。

4. 确认网站重新部署成功。

**不要在本地跑 `npm run build:pages`。** `pages-dist/` 和 `dist/` 都在 `.gitignore` 里，本地构建产物不会被推上去、纯属浪费几分钟。真正的构建在 GitHub Actions（`.github/workflows/deploy-pages.yml`）里跑：push 到 `main` 就触发，`npm ci` → `npm run build:pages` → 部署到 Pages。站点用 `import.meta.glob('../reports/*.md')` 自动扫目录，**新增 md 不需要改任何前端代码或清单**。

push 之后等约 90 秒，用公开 API 查最近一次运行（仓库是 public，不需要凭据）：

```bash
sleep 90 && curl -s "https://api.github.com/repos/cubhe/davis_sunset/actions/runs?branch=main&per_page=1" | py -c "import json,sys; r=json.load(sys.stdin)['workflow_runs'][0]; print(r['status'], r['conclusion'], r['html_url'])"
```

`completed success` 就成了，站点是 <https://cubhe.github.io/davis_sunset/>。若还是 `in_progress` 就再等一轮；若 `failure`，把 `html_url` 贴到聊天里说明构建失败，**不要自己去改前端代码修**——播报文件已经推上去了，下次构建会带上。

## 季节性提醒（重要）

本任务固定 18:30 触发。先检查今天的日落时间：**如果日落已经过了、或距离现在不足 40 分钟**，说明季节已经转换、这个触发时间不再合适。此时不要照常输出预报，而是明确提示用户：「今天日落 HH:MM，18:30 的播报时间已经太晚了，建议把这个每日任务改到 15:30 —— 跟我说一声就行。」然后简短给出明天傍晚的展望即可。