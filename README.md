
# VScode-AI-Assistant-Plugin
VScode智能助手插件 目前支持deepseek和豆包

<div align="center">
  <img src="./show/webpage.png" width="600" alt="插件功能演示">
</div>

<div align="center">
  <img src="https://github.com/shaoshiq7/VScode-AI-Assistant-Plugin/raw/main/show/lv_0_20260127224148.gif" width="600" alt="插件功能演示">
</div>

VS Code 智能助手插件 (React + Vite)
本项目展示了如何结合 React 与 Vite 构建高性能 Webview 插件，并集成 DeepSeek 与 豆包 大模型实现流式交互。

## 技术架构与实现
插件采用前后端分离的设计模式，确保了 IDE 环境下的极致流畅度。

# 核心技术栈
插件宿主 (Backend)：TypeScript + VS Code API。负责 IDE 原生功能、侧边栏注册及配置安全管理。

用户界面 (Frontend)：React + Vite + Webview UI Toolkit。打造与 VS Code 原生设计语言高度一致的高性能 UI。

通信机制：postMessage API。实现了 Webview 视图层与插件宿主进程之间的双向实时数据交换。

# 数据流向
用户输入 (React) → postMessage → 插件宿主 (Node.js) → API (DeepSeek/豆包) → 流式响应 → postMessage → 界面渲染 (React)

## 功能特性
# 智能对话交互
活动栏集成：内嵌于 VS Code 左侧活动栏，一键唤起，不干扰核心编辑区。

响应式布局：完美适配侧边栏宽度动态缩放，支持多轮对话上下文追踪。

# 多模型支持
灵活路由：内置多模型适配器，完美兼容 DeepSeek 与 豆包 (火山引擎) 协议。

统一设置：通过 IDE 原生设置面板（settings.json）即可一键切换当前模型。

# 流式渲染与富文本
打字机体验：采用 Stream 流式解析技术，实现毫秒级响应的逐字回复。

富文本支持：集成 react-markdown，支持完整的 Markdown 语法及列表展示。

代码高亮：使用插件级语法高亮显示，并提供“一键复制”功能，优化开发流程。

## 环境要求
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
