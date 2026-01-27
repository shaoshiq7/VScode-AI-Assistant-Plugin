import * as vscode from "vscode";
import axios from "axios";

export class SidebarProvider implements vscode.WebviewViewProvider {
  _view?: vscode.WebviewView;
  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(webviewView: vscode.WebviewView) {
    this._view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (data) => {
      const config = vscode.workspace.getConfiguration("aiAssistant");

      switch (data.type) {
        case "onSettingsChange": {
          await config.update(data.key, data.value, vscode.ConfigurationTarget.Global);
          vscode.window.showInformationMessage(`已切换模型至: ${data.value}`);
          break;
        }

        case "onInfo": {
          if (data.value) {
            vscode.window.showInformationMessage(data.value);
          }
          break;
        }

        case "onChat": {
          const currentModel = config.get<string>("currentModel") || "DeepSeek";
          let url = "";
          let apiKey = "";
          let modelName = "";

          // 1. 配置参数准备
          if (currentModel === "DeepSeek") {
            url = "https://api.deepseek.com/chat/completions";
            apiKey = config.get<string>("deepseekKey") || "";
            modelName = "deepseek-chat";
          } else if (currentModel === "Doubao") {
            url = "https://ark.cn-beijing.volces.com/api/v3/chat/completions";
            apiKey = config.get<string>("doubaoKey") || "";
            modelName = config.get<string>("doubaoEndpoint") || ""; 
          }

          if (!apiKey) {
            vscode.window.showErrorMessage(`请先配置 ${currentModel} 的 API Key`);
            return;
          }

          try {
            // 2. 通知前端流式输出开始
            webviewView.webview.postMessage({ type: "onStreamStart" });

            // 3. 使用 axios 发起流式请求
            const response = await axios({
              method: "POST",
              url: url,
              data: {
                model: modelName,
                messages: [{ role: "user", content: data.value }],
                stream: true,
              },
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              responseType: "stream", // 👈 核心：必须设置为 stream
            });

            // 4. 处理数据流
            // axios 的 response.data 在 Node.js 中是一个 Readable Stream
            response.data.on("data", (chunk: Buffer) => {
              const decoder = new TextDecoder("utf-8");
              const payload = decoder.decode(chunk);
              
              // SSE 数据通常以 'data: ' 开头，并且可能在一个 chunk 中包含多行数据
              const lines = payload.split("\n");
              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed || trimmed === "data: [DONE]") continue;

                if (trimmed.startsWith("data: ")) {
                  try {
                    const jsonStr = trimmed.replace("data: ", "");
                    const jsonData = JSON.parse(jsonStr);
                    const content = jsonData.choices[0]?.delta?.content || "";
                    
                    if (content) {
                      // 5. 实时推送片段给前端
                      webviewView.webview.postMessage({ 
                        type: "onStreamContent", 
                        value: content 
                      });
                    }
                  } catch (e) {
                    // 忽略 JSON 片段不完整的错误（SSE 常见情况）
                  }
                }
              }
            });

            response.data.on("end", () => {
              console.log("流式传输完成");
            });

          } catch (error: any) {
            let errorMsg = error.message;
            if (error.response && error.response.data) {
              // 处理流模式下的错误信息读取
              errorMsg = `请求失败 (${error.response.status})`;
            }
            vscode.window.showErrorMessage(`[${currentModel}] 错误: ${errorMsg}`);
          }
          break;
        }
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "webview-ui", "assets", "index.js")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "out", "webview-ui", "assets", "index.css")
    );

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="stylesheet" href="${styleUri}">
      </head>
      <body>
        <div id="root"></div>
        <script type="module" src="${scriptUri}"></script>
      </body>
      </html>`;
  }
}