
# VScode-AI-Assistant-Plugin
VScode智能助手插件 目前支持deepseek和豆包

<div align="center">
  <img src="./show/webpage.png" width="600" alt="插件功能演示">
</div>

<div align="center">
  <img src="https://github.com/shaoshiq7/VScode-AI-Assistant-Plugin/raw/main/show/lv_0_20260127224148.gif" width="600" alt="插件功能演示">
</div>

1.	技术架构与实现方案
插件采用前后端分离的设计架构，确保流畅度与稳定性。
1.1 核心技术栈：
		插件宿主：TypeScript + VS Code Extention API：负责处理VS code原生功能，侧边栏注册、配置读取、安全存储，通过 axios实现与 生成式AI 后端的流式通信。
		用户界面：React + Vite + CSS Modules：利用 Webview UI Toolkit 保持与 VS Code 原生设计风格一致，通过 Vite 构建高性能的前端资源
		通信机制：postMessage API：实现了 Webview 与插件宿主之间的双向实时数据交换。
1.2 技术架构：
		User Input (React) -> postMessage -> Extension Host -> API (DeepSeek/Doubao) -> Streaming Response -> postMessage -> UI Rendering (React)
2.	功能模块详细说明
2.1智能问答界面：
交互面板: 集成于 VS Code 左侧活动栏，点击即可开启对话。响应式设计: 适配侧边栏宽度缩放，支持多轮对话上下文。
2.2 多模型支持与快速切换：
模型路由: 插件后端内置了多模型适配器，支持 DeepSeek 和 豆包 。统一配置: 用户可通过设置界面一键切换当前激活的模型，无需修改代码。
2.3 流式响应与富文本渲染：
实时流输出: 采用 stream 模式获取 API 响应，实现打字机般的实时回复体验。Markdown 支持: 集成 react-markdown 渲染器，支持加粗、列表、链接等。代码高亮: 使用 react-syntax-highlighter 对 AI 生成的代码块进行语法高亮显示。便捷功能: 为代码块添加了“一键复制”按钮，提升开发者效率。
2.4 配置管理：
安全配置: 接入 VS Code 原生 contributes.configuration 接口，用户可在 IDE 设置中安全地管理 API Key 和 Endpoint。
3.	配置和使用指南
3.1环境：
VS Code 版本: ^1.75.0
Node.js 版本: ^18.0.0


## Documentation

For a deeper dive into how this sample works, read the guides below.

- [Extension structure](./docs/extension-structure.md)
- [Extension commands](./docs/extension-commands.md)
- [Extension development cycle](./docs/extension-development-cycle.md)

## Run The Sample

```bash
# Copy sample extension locally
npx degit microsoft/vscode-webview-ui-toolkit-samples/frameworks/hello-world-react-vite hello-world

# Navigate into sample directory
cd hello-world

# Install dependencies for both the extension and webview UI source code
npm run install:all

# Build webview UI source code
npm run build:webview

# Open sample in VS Code
code .
```

Once the sample is open inside VS Code you can run the extension by doing the following:

1. Press `F5` to open a new Extension Development Host window
2. Inside the host window, open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac) and type `Hello World (React + Vite): Show`
