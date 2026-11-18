# D

D 是一款本地优先的移动端 AI 角色扮演应用，首要平台为 iOS。完成模型下载后可使用设备端推理。当前为开发原型。

### 体验角色

从角色页的本地列表选择莉娅，进入雾港渡船的故事。首次使用需要下载或导入与设备内存匹配的 GGUF 模型。在角色页选择添加可以从空白设定开始，自定义人设、开场白和生成设置。

角色编辑页支持导入以下 JSON 文件。导入结果先进入编辑表单，保存后随角色保存在设备上。清空对应字段并保存可移除预设或世界书。

| 类型 | 当前支持 |
| --- | --- |
| 角色卡 | 平面 JSON 或 V2/V3 的 data 对象。读取名字、描述、性格、场景、系统提示、示例对话、开场白及内嵌世界书。 |
| 文本预设 | 含 prompt 或 system_prompt 字段的对象。每轮对话将文本追加到角色提示。 |
| 世界书 | entries 数组或对象。支持 content、key/keys、constant、enabled/disable。按当前用户消息做大小写无关的关键词匹配。 |

PNG 卡片、复杂预设顺序、世界书递归触发和长期记忆尚待开发。

### 本地开发

沿用 PocketPal 的 React Native 工具链。在项目根目录运行 `nvm use`、`corepack yarn install --frozen-lockfile`。iOS 需要 Apple silicon Mac，在 ios 目录执行 `pod install` 后回到项目根目录启动 `yarn start` 和 `yarn ios`。Android 使用 `yarn android`。平台依赖见 [上游开发说明](README.pocketpal.md)。

### 源码来源

- [PocketPal AI](https://github.com/a-ghorbani/pocketpal-ai/tree/53f7d5d697a46abe8b87eb4f5d4351082e3a26d9) 为本地推理、会话和角色编辑提供原生基础。根目录保留 MIT 许可。
- [DeepSeek chat-demo](https://github.com/deepseek-ai/chat-demo/tree/5d5dd754ebc1948e977ddb880a9eb5aa25f37b4c) 提供聊天交互参考。移动端已移植用户气泡的圆角与留白，以及回复复制后显示一秒对勾的反馈。对应文件为 UserMessage.module.css 和 CopyButton.tsx，保留 DeepSeek 的 MIT 许可。推理由 PocketPal 在设备端执行。两份源码均未附带模型权重。
