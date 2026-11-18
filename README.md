# D

D 是一款面向 iPhone 和 iPad 的本地 AI 角色扮演应用。首次联网下载模型后，使用设备端推理可离线聊天。首发模型与商店发行地区仍待实机测试和团队确认。

### 第一次对话

1. 从欢迎页进入模型选择页，查看设备、下载体积和内存提示。可先跳过下载，导入自己已有的 GGUF 模型。
2. 在本地角色列表点莉娅卡片上的聊天按钮，下载完成后加载模型，选择开场白下的建议或输入自己的台词。聊天抽屉保留历史。
3. 点角色卡主体可编辑角色。通过添加按钮创建新角色，或在编辑页从文件导入。角色名称搜索在本地列表内完成。

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

### 上游

- [PocketPal AI](https://github.com/a-ghorbani/pocketpal-ai/tree/53f7d5d697a46abe8b87eb4f5d4351082e3a26d9) 提供 React Native 原生应用、本地模型推理、语音和会话存储。根目录保留 MIT 许可。
- [DeepSeek chat-demo](https://github.com/deepseek-ai/chat-demo/tree/5d5dd754ebc1948e977ddb880a9eb5aa25f37b4c) 提供聊天交互参考。气泡的圆角、留白和消息复制反馈分别移植自 UserMessage.module.css 和 CopyButton.tsx，保留 DeepSeek MIT 许可。
