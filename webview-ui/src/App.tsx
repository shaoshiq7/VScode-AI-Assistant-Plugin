/*
import { vscode } from "./utilities/vscode";
import { 
  VSCodeButton, 
  VSCodeTextField, 
  VSCodeDropdown, 
  VSCodeOption 
} from "@vscode/webview-ui-toolkit/react";
import React, { useState, useEffect } from "react";
import "./App.css";

// 引入渲染库（适配 v8 版本）
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; 

function App() {
  const [messages, setMessages] = useState<{ role: string; content: string; model?: string }[]>([]);
  const [input, setInput] = useState("");
  const [currentModel, setCurrentModel] = useState("DeepSeek");

  // 1. 监听来自插件后端 (SidebarProvider) 的消息
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "onReply") {
        setMessages((prev) => [...prev, { role: "assistant", content: message.value, model: currentModel }]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [currentModel]);

  // 2. 处理模型切换
  function handleModelChange(e: any) {
    const selectedModel = e.target.value;
    setCurrentModel(selectedModel);
    // 通知后端：用户切换了模型
    vscode.postMessage({ 
      type: "onSettingsChange", 
      key: "currentModel", 
      value: selectedModel 
    });
  }

  // 3. 处理发送消息
  function handleSend() {
    if (!input.trim()) return;
    // 先把用户自己的消息加到 UI 列表
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    // 发送给后端
    vscode.postMessage({ type: "onChat", value: input });
    // 清空输入框
    setInput("");
  }

  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "var(--vscode-sideBar-background)" }}>
      
      

      
      <section style={{ 
        padding: "10px", 
        borderBottom: "1px solid var(--vscode-panel-border)", 
        display: "flex", 
        alignItems: "center", 
        gap: "8px" 
      }}>
        <label style={{ fontSize: "11px", whiteSpace: "nowrap" }}>模型:</label>
        <VSCodeDropdown value={currentModel} onChange={handleModelChange} style={{ flex: 1 }}>
          <VSCodeOption value="DeepSeek">DeepSeek</VSCodeOption>
          <VSCodeOption value="Doubao">豆包 (Doubao)</VSCodeOption>
        </VSCodeDropdown>
      </section>

      
      <section style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            marginBottom: "12px", 
            padding: "8px",
            borderRadius: "4px",
            backgroundColor: msg.role === "user" ? "var(--vscode-toolbar-hoverBackground)" : "transparent",
            borderLeft: msg.role === "assistant" ? "2px solid var(--vscode-button-background)" : "none"
          }}>
            <strong style={{ fontSize: "10px", display: "block", marginBottom: "4px", opacity: 0.7 }}>
              {msg.role === "user" ? "👤 YOU" : `🤖 ${msg.model || "AI"}`}
            </strong>

            <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
              
              <ReactMarkdown
                children={msg.content}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    return !inline && match ? (
                      <SyntaxHighlighter
                        children={String(children).replace(/\n$/, '')}
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        {...props}
                      />
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              />
            </div>
          </div>
        ))}
      </section>
      
      
      <section style={{ padding: "10px", display: "flex", gap: "5px", borderTop: "1px solid var(--vscode-panel-border)" }}>
        <VSCodeTextField 
          value={input} 
          onInput={(e: any) => setInput(e.target.value)}
          placeholder={`提问...`}
          style={{ flex: 1 }}
          onKeyDown={(e: any) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <VSCodeButton onClick={handleSend}>发送</VSCodeButton>
      </section>
    </main>
  );
}

export default App;
*/
import { vscode } from "./utilities/vscode";
import { 
  VSCodeButton, 
  VSCodeTextField, 
  VSCodeDropdown, 
  VSCodeOption 
} from "@vscode/webview-ui-toolkit/react";
import React, { useState, useEffect } from "react";
import "./App.css";

// 引入渲染库（适配 v8 版本）
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'; 

function App() {
  const [messages, setMessages] = useState<{ role: string; content: string; model?: string }[]>([]);
  const [input, setInput] = useState("");
  const [currentModel, setCurrentModel] = useState("DeepSeek");

  
  // 1. 监听来自插件后端的消息
  /*
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "onReply") {
        setMessages((prev) => [...prev, { role: "assistant", content: message.value, model: currentModel }]);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [currentModel]);
  */
  // 1. 监听来自插件后端 (SidebarProvider) 的流式消息
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const message = event.data;

      switch (message.type) {
        case "onStreamStart":
          // 【开始流】先在列表末尾添加一个空的 AI 回复框
          setMessages((prev) => [
            ...prev, 
            { role: "assistant", content: "", model: currentModel }
          ]);
          break;

        case "onStreamContent":
          // 【流进行中】收到新字符，找到最后一条消息并把字符“拼”上去
          setMessages((prev) => {
            const newMessages = [...prev];
            const lastIndex = newMessages.length - 1;
            // 确保最后一条是 AI 的消息才追加
            if (lastIndex >= 0 && newMessages[lastIndex].role === "assistant") {
              newMessages[lastIndex] = {
                ...newMessages[lastIndex],
                content: newMessages[lastIndex].content + message.value
              };
            }
            return newMessages;
          });
          break;

        case "onReply":
          // 【旧版兼容】如果你还有地方用非流式输出，可以保留这个
          setMessages((prev) => [
            ...prev, 
            { role: "assistant", content: message.value, model: currentModel }
          ]);
          break;
      }
    };

    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [currentModel]);

  // 2. 处理模型切换
  function handleModelChange(e: any) {
    const selectedModel = e.target.value;
    setCurrentModel(selectedModel);
    vscode.postMessage({ 
      type: "onSettingsChange", 
      key: "currentModel", 
      value: selectedModel 
    });
  }

  // 3. 处理发送消息
  function handleSend() {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: input }]);
    vscode.postMessage({ type: "onChat", value: input });
    setInput("");
  }

  return (
    <main style={{ display: "flex", flexDirection: "column", height: "100vh", backgroundColor: "var(--vscode-sideBar-background)" }}>
      
      {/* 顶部模型切换区域 */}
      <section style={{ 
        padding: "10px", 
        borderBottom: "1px solid var(--vscode-panel-border)", 
        display: "flex", 
        alignItems: "center", 
        gap: "8px" 
      }}>
        <label style={{ fontSize: "11px", whiteSpace: "nowrap" }}>模型:</label>
        <VSCodeDropdown value={currentModel} onChange={handleModelChange} style={{ flex: 1 }}>
          <VSCodeOption value="DeepSeek">DeepSeek</VSCodeOption>
          <VSCodeOption value="Doubao">豆包 (Doubao)</VSCodeOption>
        </VSCodeDropdown>
      </section>

      {/* 消息显示区域 */}
      <section style={{ flex: 1, overflowY: "auto", padding: "10px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ 
            marginBottom: "12px", 
            padding: "8px",
            borderRadius: "4px",
            backgroundColor: msg.role === "user" ? "var(--vscode-toolbar-hoverBackground)" : "transparent",
            borderLeft: msg.role === "assistant" ? "2px solid var(--vscode-button-background)" : "none"
          }}>
            <strong style={{ fontSize: "10px", display: "block", marginBottom: "4px", opacity: 0.7 }}>
              {msg.role === "user" ? "👤 YOU" : `🤖 ${msg.model || "AI"}`}
            </strong>

            <div style={{ fontSize: "13px", lineHeight: "1.6" }}>
              <ReactMarkdown
                children={msg.content}
                components={{
                  code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeContent = String(children).replace(/\n$/, '');

                    // 一键复制函数
                    const handleCopy = () => {
                      navigator.clipboard.writeText(codeContent);
                      // 发送消息给插件后端，显示 VS Code 原生提示气泡
                      vscode.postMessage({ 
                        type: "onInfo", 
                        value: "代码已复制到剪贴板" 
                      });
                    };

                    return !inline && match ? (
                      <div className="code-block-wrapper" style={{ position: 'relative' }}>
                        {/* 复制按钮 */}
                        <button
                          onClick={handleCopy}
                          className="copy-btn"
                          style={{
                            position: 'absolute',
                            top: '5px',
                            right: '5px',
                            zIndex: 10,
                            padding: '2px 8px',
                            fontSize: '10px',
                            cursor: 'pointer',
                            backgroundColor: 'var(--vscode-button-secondaryBackground)',
                            color: 'var(--vscode-button-secondaryForeground)',
                            border: '1px solid var(--vscode-widget-border)',
                            borderRadius: '3px'
                          }}
                        >
                          Copy
                        </button>
                        
                        <SyntaxHighlighter
                          children={codeContent}
                          style={vscDarkPlus as any}
                          language={match[1]}
                          PreTag="div"
                          {...props}
                        />
                      </div>
                    ) : (
                      <code className={className} {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              />
            </div>
          </div>
        ))}
      </section>
      
      {/* 底部输入区域 */}
      <section style={{ padding: "10px", display: "flex", gap: "5px", borderTop: "1px solid var(--vscode-panel-border)" }}>
        <VSCodeTextField 
          value={input} 
          onInput={(e: any) => setInput(e.target.value)}
          placeholder={`提问...`}
          style={{ flex: 1 }}
          onKeyDown={(e: any) => {
            if (e.key === 'Enter') handleSend();
          }}
        />
        <VSCodeButton onClick={handleSend}>发送</VSCodeButton>
      </section>
    </main>
  );
}

export default App;