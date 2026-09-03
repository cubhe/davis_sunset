# Davis 晚霞 iPhone App 与 Widget 开发计划

## 1. 项目目标

把现有 Davis 晚霞网站扩展为一款原生 iPhone App，并提供主屏幕与锁屏 Widget。用户无需打开网页，即可看到当天日期、晚霞指数、日落时间和一句话建议；需要详情时，可从 Widget 直接进入当天播报。

首版继续沿用当前数据生产流程：Claude 每天生成 `reports/YYYY-MM-DD.md` 并推送到 GitHub，GitHub Actions 再生成适合 App 使用的 JSON 数据。

## 2. 首版范围

### iPhone App

- 今日页：日期、晚霞指数、日落时间、方位角、一句话判断。
- 详情页：关键判断、气象因子、最佳时间窗和地点建议。
- 历史页：按日期浏览既有播报。
- 本地缓存：断网时仍显示最后一次成功获取的数据。
- 手动刷新和数据更新时间提示。
- 复用网站的晚霞插画、配色和视觉语言，但针对手机重新排版。

### Widget

- 小尺寸：日期、晚霞指数、日落时间。
- 中尺寸：增加一句话判断和更新时间。
- 锁屏 Widget：指数与日落时间的极简版本。
- 点击后通过 Deep Link 打开 App 的当天详情。
- 暂不在首版加入复杂交互、地图或完整因子表。

## 3. 推荐技术方案

- App：SwiftUI。
- Widget：WidgetKit + SwiftUI。
- 数据源：GitHub Pages 上的静态 JSON。
- 数据共享：App Group 共享缓存。
- 本地存储：共享 `UserDefaults` 或 App Group 容器中的 JSON 文件。
- 网络请求：`URLSession`。
- 日期与时区：固定使用 `America/Los_Angeles` 解释 Davis 当地日期。

不建议只把网站套进 WebView。这样虽然能快速得到一个 App 外壳，但 Widget 仍需原生开发，而且整体体验、缓存和页面跳转都会更难做好。

## 4. 数据发布改造

在现有 GitHub Actions 构建中增加一个转换步骤，把 Markdown 解析为：

```text
data/latest.json
data/history.json
```

建议的数据结构：

```json
{
  "date": "2026-09-02",
  "updatedAt": "2026-09-02T18:33:00-07:00",
  "score": 5,
  "verdict": "看运气，出门前先抬头看一眼西边天空",
  "sunset": "19:35",
  "azimuth": "279°",
  "judgment": "...",
  "window": "...",
  "advice": "...",
  "factors": []
}
```

App 和 Widget 不直接解析 Markdown。JSON 格式更稳定，也便于版本控制、缓存与错误检查。

## 5. Widget 更新策略

WidgetKit 不保证在指定分钟准时刷新，因此采用“时间线 + 缓存 + 打开 App 时主动刷新”的组合：

1. 上午显示上一份有效播报，并标注日期。
2. 接近 Claude 日常发布时间时，请求新的时间线。
3. 获取 `latest.json` 成功后写入 App Group 缓存。
4. 网络失败时继续显示缓存，而不是空白或报错。
5. 用户打开 App 或手动刷新后，通知 Widget 重新加载时间线。

如果以后必须在 Claude 上传后立即提醒用户，再增加远程推送。推送服务不属于首版范围。

参考资料：

- [WidgetKit](https://developer.apple.com/documentation/widgetkit)
- [Keeping a widget up to date](https://developer.apple.com/documentation/widgetkit/keeping-a-widget-up-to-date)
- [Configuring App Groups](https://developer.apple.com/documentation/xcode/configuring-app-groups)

## 6. 页面结构

```text
App
├── 今日
│   ├── 日期与指数
│   ├── 日落信息
│   ├── 关键判断
│   └── 时间与地点建议
├── 历史
│   └── 每日播报详情
└── 设置
    ├── 自动刷新说明
    ├── 数据来源
    └── 关于

Widget Extension
├── Small Widget
├── Medium Widget
└── Lock Screen Widget
```

## 7. 实施阶段

### 阶段一：数据接口

- 编写 Markdown → JSON 转换脚本。
- 在 GitHub Actions 中自动生成并部署 JSON。
- 定义 Swift 与 TypeScript 共用的数据字段规范。
- 验证缺失字段、半分指数和日期排序。

预计：半天至一天。

### 阶段二：App 原型

- 创建 SwiftUI App。
- 完成网络层、数据模型与缓存。
- 完成今日页和历史列表。
- 加入加载、断网和无当日报告状态。

预计：一至两天。

### 阶段三：Widget

- 创建 Widget Extension。
- 配置 App Group。
- 完成小、中、锁屏三种布局。
- 完成时间线、缓存回退和 Deep Link。

预计：一至两天。

### 阶段四：视觉与发布

- 调整动态字体、深色模式和 VoiceOver。
- 在真机测试刷新、断网、跨日和时区变化。
- 准备 App 图标、截图、隐私说明和 TestFlight。

预计：一至三天，不含 App Store 审核等待时间。

## 8. 测试清单

- 当天报告正常生成。
- Claude 当天没有生成报告。
- GitHub Pages 暂时无法访问。
- 报告字段缺失或格式变化。
- 指数包含小数，例如 `7.5/10`。
- Davis 跨过午夜，但用户处于其他时区。
- App 从未打开、后台被系统清理或长期离线。
- Widget 小、中、锁屏尺寸的文字不截断。
- 动态字体、深色模式和 VoiceOver 可用。

## 9. 风险与前置条件

- 原生 iOS App 必须在安装了 Xcode 的 Mac 上编译、签名和真机测试。
- 发布到 TestFlight 或 App Store 需要有效的 Apple Developer Program 会员资格。
- Widget 刷新时间由系统调度，无法保证与 Claude 上传时间完全同步。
- Claude 输出格式若经常变化，Markdown 转换脚本需要相应维护。

## 10. 推荐的首个交付版本

第一版只做：今日页、历史页、小/中 Widget、App Group 缓存和 Deep Link。先验证“每天能够可靠出现正确指数”，再决定是否增加推送通知、地图、摄影提醒或 Live Activity。

