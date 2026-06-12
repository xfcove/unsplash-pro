"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
const vscode = __importStar(require("vscode"));
function activate(context) {
    const provider = new UnsplashViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(UnsplashViewProvider.viewType, provider));
}
class UnsplashViewProvider {
    _extensionUri;
    static viewType = 'unsplash.sidebarView';
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview();
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(data => {
            switch (data.type) {
                case 'copyText':
                    vscode.env.clipboard.writeText(data.value);
                    vscode.window.showInformationMessage(data.message || 'Copied to clipboard!');
                    break;
            }
        });
    }
    _getHtmlForWebview() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src https://api.unsplash.com;">
            <title>Unsplash Pro</title>
            <style>
                body { 
                    font-family: var(--vscode-font-family); 
                    padding: 10px; 
                    background-color: var(--vscode-editor-background); 
                    color: var(--vscode-editor-foreground); 
                    display: flex;
                    flex-direction: column;
                    height: 95vh;
                    margin: 0;
                }
                /* API Key Setup UI */
                #setup-screen {
                    display: none;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100%;
                    text-align: center;
                    padding: 20px;
                }
                /* Main App UI */
                #app-screen {
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                }
                input.vsc-input { 
                    width: 100%; 
                    padding: 10px; 
                    margin-bottom: 10px; 
                    border: 1px solid var(--vscode-input-border); 
                    background: var(--vscode-input-background); 
                    color: var(--vscode-input-foreground); 
                    border-radius: 6px; 
                    outline: none; 
                    box-sizing: border-box;
                }
                input.vsc-input:focus { border-color: var(--vscode-focusBorder); }
                button.vsc-btn {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    width: 100%;
                    margin-top: 5px;
                }
                button.vsc-btn:hover { background: var(--vscode-button-hoverBackground); }
                
                #scroll-area {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding-bottom: 10px;
                    margin-top: 10px;
                }
                /* True Masonry Layout */
                .masonry { 
                    column-count: 2; 
                    column-gap: 12px; 
                }
                .masonry-item { 
                    break-inside: avoid; 
                    margin-bottom: 12px; 
                    position: relative;
                    border-radius: 6px;
                    overflow: hidden;
                    cursor: pointer;
                }
                .masonry-item img { 
                    width: 100%; 
                    display: block; 
                    transition: transform 0.3s ease;
                }
                .masonry-item:hover img {
                    transform: scale(1.03);
                }
                /* Hover Toolbar */
                .hover-overlay {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    flex-direction: column;
                    padding: 8px;
                    opacity: 0;
                    transition: opacity 0.2s ease;
                }
                .masonry-item:hover .hover-overlay { opacity: 1; }
                .action-text {
                    font-size: 10px;
                    color: #fff;
                    text-align: center;
                    margin: 2px 0;
                    padding: 4px;
                    background: rgba(255,255,255,0.2);
                    border-radius: 3px;
                }
                .action-text:hover { background: rgba(255,255,255,0.4); }
                
                /* Custom Resize Modal */
                #resize-modal {
                    display: none;
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.8);
                    z-index: 100;
                    justify-content: center;
                    align-items: center;
                    padding: 20px;
                }
                .modal-content {
                    background: var(--vscode-editor-background);
                    padding: 20px;
                    border-radius: 8px;
                    border: 1px solid var(--vscode-panel-border);
                    width: 100%;
                }
                #loading { text-align: center; margin-top: 20px; opacity: 0.7; font-size: 12px; display: none; }
            </style>
        </head>
        <body>

            <div id="setup-screen">
                <h3>Unsplash API Setup</h3>
                <p style="font-size: 12px; opacity: 0.8; margin-bottom: 20px;">Enter your free Unsplash Access Key to activate the gallery.</p>
                <input type="password" id="api-key-input" class="vsc-input" placeholder="Paste Access Key here..." />
                <button id="save-key-btn" class="vsc-btn">Save Key</button>
            </div>

            <div id="app-screen">
                <input type="text" id="search" class="vsc-input" placeholder="Search photos (e.g. workspace, code)..." autocomplete="off" />
                <p style="font-size: 10px; opacity: 0.6; margin: 0;">Hover for quick copy. Double-click to resize.</p>
                
                <div id="scroll-area">
                    <div id="loading">Loading high-res photos...</div>
                    <div class="masonry" id="imageGrid"></div>
                </div>
            </div>

            <div id="resize-modal">
                <div class="modal-content">
                    <h4 style="margin-top:0;">Resize Image CDN</h4>
                    <input type="number" id="resize-w" class="vsc-input" placeholder="Width (e.g. 1920)" />
                    <input type="number" id="resize-h" class="vsc-input" placeholder="Height (e.g. 1080)" />
                    <button id="confirm-resize-btn" class="vsc-btn" style="background: var(--vscode-button-background);">Copy Resized URL</button>
                    <button id="cancel-resize-btn" class="vsc-btn" style="background: transparent; border: 1px solid var(--vscode-button-background);">Cancel</button>
                </div>
            </div>

            <script>
                const vscode = acquireVsCodeApi();
                
                // DOM Elements
                const setupScreen = document.getElementById('setup-screen');
                const appScreen = document.getElementById('app-screen');
                const apiKeyInput = document.getElementById('api-key-input');
                const saveKeyBtn = document.getElementById('save-key-btn');
                const searchInput = document.getElementById('search');
                const imageGrid = document.getElementById('imageGrid');
                const loading = document.getElementById('loading');
                
                // Modal Elements
                const resizeModal = document.getElementById('resize-modal');
                const resizeW = document.getElementById('resize-w');
                const resizeH = document.getElementById('resize-h');
                const confirmResizeBtn = document.getElementById('confirm-resize-btn');
                const cancelResizeBtn = document.getElementById('cancel-resize-btn');

                let targetUrlToResize = '';
                let currentApiKey = localStorage.getItem('unsplashApiKey');

                // Initialize UI
                if (!currentApiKey) {
                    appScreen.style.display = 'none';
                    setupScreen.style.display = 'flex';
                } else {
                    setupScreen.style.display = 'none';
                    fetchPhotos('developer'); // Startup query
                }

                // Save API Key
                saveKeyBtn.onclick = () => {
                    const key = apiKeyInput.value.trim();
                    if (key) {
                        localStorage.setItem('unsplashApiKey', key);
                        currentApiKey = key;
                        setupScreen.style.display = 'none';
                        appScreen.style.display = 'flex';
                        fetchPhotos('developer');
                    }
                };

                // Fetch Engine
                async function fetchPhotos(query) {
                    if (!query.trim()) query = 'technology';
                    
                    imageGrid.innerHTML = '';
                    loading.style.display = 'block';
                    
                    try {
                        const res = await fetch(\`https://api.unsplash.com/search/photos?query=\${query}&per_page=30&client_id=\${currentApiKey}\`);
                        
                        if (res.status === 401) {
                            alert("Invalid API Key. Please reset it.");
                            localStorage.removeItem('unsplashApiKey');
                            location.reload();
                            return;
                        }

                        const data = await res.json();
                        loading.style.display = 'none';
                        
                        if (data.results && data.results.length > 0) {
                            data.results.forEach(photo => {
                                // Base CDN URL without size params
                                const rawUrl = photo.urls.raw; 
                                // Preview URL
                                const regularUrl = photo.urls.small; 
                                
                                const box = document.createElement('div');
                                box.className = 'masonry-item';
                                
                                const img = document.createElement('img');
                                img.src = regularUrl;
                                
                                // Setup Hover Toolbar
                                const overlay = document.createElement('div');
                                overlay.className = 'hover-overlay';
                                
                                const copyLink = document.createElement('div');
                                copyLink.className = 'action-text';
                                copyLink.innerText = 'Copy CDN URL';
                                copyLink.onclick = (e) => {
                                    e.stopPropagation();
                                    vscode.postMessage({ type: 'copyText', value: rawUrl, message: 'CDN Link copied!' });
                                };

                                const copyImgTag = document.createElement('div');
                                copyImgTag.className = 'action-text';
                                copyImgTag.innerText = 'Copy <img/> Tag';
                                copyImgTag.onclick = (e) => {
                                    e.stopPropagation();
                                    const tag = \`<img src="\${rawUrl}&w=800&fit=max" alt="\${photo.alt_description || 'Unsplash Image'}" />\`;
                                    vscode.postMessage({ type: 'copyText', value: tag, message: 'HTML Tag copied!' });
                                };
                                
                                overlay.appendChild(copyLink);
                                overlay.appendChild(copyImgTag);
                                
                                box.appendChild(img);
                                box.appendChild(overlay);

                                // Trigger Resize Modal on Double Click
                                box.ondblclick = () => {
                                    targetUrlToResize = rawUrl;
                                    resizeW.value = '';
                                    resizeH.value = '';
                                    resizeModal.style.display = 'flex';
                                };
                                
                                imageGrid.appendChild(box);
                            });
                        } else {
                            imageGrid.innerHTML = '<p style="text-align: center; opacity: 0.7;">No photos found.</p>';
                        }
                    } catch (err) {
                        loading.style.display = 'none';
                        imageGrid.innerHTML = '<p style="text-align: center; color: var(--vscode-errorForeground);">API Error.</p>';
                    }
                }

                // Search Debouncer
                let timeout = null;
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(timeout);
                    timeout = setTimeout(() => {
                        fetchPhotos(e.target.value);
                    }, 500);
                });

                // Resize Logic
                cancelResizeBtn.onclick = () => { resizeModal.style.display = 'none'; };
                
                confirmResizeBtn.onclick = () => {
                    const w = resizeW.value.trim();
                    const h = resizeH.value.trim();
                    let finalUrl = targetUrlToResize + "&fit=crop";
                    
                    if (w) finalUrl += \`&w=\${w}\`;
                    if (h) finalUrl += \`&h=\${h}\`;
                    
                    vscode.postMessage({ type: 'copyText', value: finalUrl, message: \`Copied \${w || 'auto'}x\${h || 'auto'} image URL!\` });
                    resizeModal.style.display = 'none';
                };
            </script>
        </body>
        </html>`;
    }
}
//# sourceMappingURL=extension.js.map