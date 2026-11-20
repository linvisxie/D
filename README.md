# D

D 是一款面向 iPhone 和 iPad 的本地 AI 角色扮演应用。首次联网下载模型后，使用设备端推理可离线聊天。首发模型与商店发行地区仍待实机测试和团队确认。

### 第一次对话

1. 从欢迎页进入模型选择页，查看设备、下载体积和内存提示。可先跳过下载，导入自己已有的 GGUF 模型。
2. 在「故事书房」点「与莉娅对话」，或在「我的角色」点一位角色开始聊天。下次可从「上次聊到」回到上次的对话。
3. 首页可创建角色或导入 PNG / JSON 角色卡。导入后先检查内容再保存。点角色旁的「设定」可编辑人设、记忆、预设和世界书。

### 角色、预设与记忆

| 能力 | 当前实现 |
| --- | --- |
| 角色卡 | 读取 JSON 和带 chara / ccv3 元数据的 PNG，导入人设、示例、开场白及内嵌世界书。PNG 当前提取角色文字。编辑页可分享 Character Card V2 JSON。 |
| 预设 | 手写或导入 prompt、system_prompt，或按 prompt_order 导入已启用的系统提示段。 |
| 世界书 | 支持数组或对象形式的 entries、关键词、常驻及禁用条目。触发依据为本轮用户消息。 |
| 角色记忆 | 在角色编辑页逐条记录事实，填写触发词，或留空用于每轮对话。可修改、停用、删除。每轮最多选用约 1200 个字符，优先近期保存的新条目。角色卡导出不含私人记忆。 |
| 语音 | 复用 PocketPal 的本地语音输入与朗读入口。设备上的识别率、首音延迟及能耗需另行实测。 |

选择本地模型时，文字推理和角色记忆检索在设备上执行。手动配置远程模型时，对话会发送至所选服务。分享或导出文件会打开系统分享界面。

### 本地开发与验证

使用 .nvmrc 指定的 Node，执行 `corepack enable` 和 `yarn install --frozen-lockfile`。iOS 需要配有 Xcode 和 Metal 工具链的 Apple silicon Mac，在 ios 目录执行 `pod install`。在项目根目录分别运行 `yarn start` 和 `yarn ios`。设备签名使用团队自己的 Apple Developer Team。其余平台依赖见 [上游开发说明](README.pocketpal.md)。

`yarn typecheck` 检查 TypeScript，`yarn test` 运行测试。GitHub Actions 的 **D iOS simulator** 工作流构建包含 JS bundle 的模拟器应用，安装并启动后留存应用压缩包和首次启动截图。真机离线推理、连续会话内存、首字延迟及发热属于独立验收项。

### 首测 iPad

用有本仓库访问权限的 GitHub 账号登录后，可在 iPad 上下载 2.2 真机包。在发行页展开「资源 / Assets」也能找到同一份 IPA。[下载 D-iPad-unsigned.ipa](https://github.com/linvisxie/D/releases/download/ipad-preview-2.2/D-iPad-unsigned.ipa) · [查看 2.2 发行页](https://github.com/linvisxie/D/releases/tag/ipad-preview-2.2)

2.2 已在 iPad 模拟器上从欢迎页进入书房，下载并校验 Gemma 3 1B Q4_K_M，与莉娅对话，重启后恢复同一段历史。数据库核实该条回复来自本地模型。此次生成 350 个 token，首个 token 用时 5.4 秒，平均约 18.5 token/秒。真机表现取决于 iPad 型号、内存和温度。[验收记录](https://github.com/linvisxie/D/actions/runs/44651097559)

[故事书房截图](docs/previews/ipad-story-home-2.2.jpg) · [重启后的角色对话截图](docs/previews/ipad-role-chat-2.2.jpg)

- **Apple silicon Mac 上的 iPad 模拟器**：在 GitHub Actions 的成功构建里下载 D-iOS-simulator，解压其中的 D-simulator.zip。打开 Xcode 的 Simulator，启动 iPad，将 PocketPal.app 拖入模拟器，桌面显示名称为 D。
- **在 iPad 本机侧载**：把真机包 D-iPad-unsigned.ipa 下载到「文件」，在签名工具中导入 IPA，选择自己的 P12 证书及配套的 mobileprovision 描述文件，签名后安装。开发或 Ad Hoc 描述文件要包含这台 iPad，并允许所用的 Bundle ID（默认 com.linvisxie.d）。签名时按描述文件授予权限；大模型的可用内存取决于设备及签名权限。首次试聊可选体积最小的模型。
- **连接 Mac 的真实 iPad**：打开 ios/PocketPal.xcworkspace，选 PocketPal target，在 Signing & Capabilities 选择自己的 Team，再选择已连接并信任的 iPad，在 Xcode 运行 Release 配置。设备需启用开发者模式，签名账号需要支持所保留的 entitlements。
- **团队分发**：工作流勾选 device_archive 可生成未签名的 D-device-archive。TestFlight 安装还需要项目团队完成 Apple 分发签名，并通过 App Store Connect 上传、处理和分配测试资格。

### 上游

- [PocketPal AI](https://github.com/a-ghorbani/pocketpal-ai/tree/53f7d5d697a46abe8b87eb4f5d4351082e3a26d9) 提供 React Native 原生应用、本地模型推理、语音和会话存储。根目录保留 MIT 许可。
- [DeepSeek chat-demo](https://github.com/deepseek-ai/chat-demo/tree/5d5dd754ebc1948e977ddb880a9eb5aa25f37b4c) 提供聊天交互参考。气泡的圆角、留白和消息复制反馈分别移植自 UserMessage.module.css 和 CopyButton.tsx，保留 DeepSeek MIT 许可。
