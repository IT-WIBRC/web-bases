export class ComponentDevTools {
  static isInitialized = false;

  static init() {
    if (ComponentDevTools.isInitialized) return;

    // Only enable on localhost or with ?dev parameter
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "";
    const hasDevParam = new URLSearchParams(window.location.search).has("dev");

    if (!isLocalhost && !hasDevParam) return;

    ComponentDevTools.isInitialized = true;
    ComponentDevTools.addStyles();
    ComponentDevTools.addDevPanel();
    ComponentDevTools.addKeyboardShortcuts();

    console.log("🔧 Component Dev Tools Enabled");
  }

  static addStyles() {
    const styles = `
            .devtools-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #1a1a1a;
                color: #fff;
                border-radius: 8px;
                padding: 16px;
                font-family: 'Segoe UI', system-ui, sans-serif;
                font-size: 14px;
                z-index: 10000;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                min-width: 300px;
                max-height: 400px;
                overflow-y: auto;
                border: 1px solid #333;
            }

            .devtools-panel h3 {
                margin: 0 0 12px 0;
                color: #60a5fa;
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .devtools-panel h3::before {
                content: "⚙️";
            }

            .component-list {
                list-style: none;
                padding: 0;
                margin: 0 0 16px 0;
                max-height: 200px;
                overflow-y: auto;
            }

            .component-item {
                padding: 8px 12px;
                background: #2a2a2a;
                border-radius: 4px;
                margin-bottom: 6px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                transition: background 0.2s;
            }

            .component-item:hover {
                background: #3a3a3a;
            }

            .component-status {
                font-size: 11px;
                padding: 2px 6px;
                border-radius: 10px;
                background: #10b981;
                color: white;
            }

            .component-status.error {
                background: #ef4444;
            }

            .component-status.loading {
                background: #f59e0b;
            }

            .devtools-actions {
                display: flex;
                gap: 8px;
                margin-top: 16px;
                padding-top: 16px;
                border-top: 1px solid #333;
            }

            .devtools-btn {
                padding: 8px 12px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 14px;
                flex: 1;
                transition: opacity 0.2s;
            }

            .devtools-btn:hover {
                opacity: 0.9;
            }

            .devtools-btn.reload {
                background: #3b82f6;
                color: white;
            }

            .devtools-btn.clear {
                background: #ef4444;
                color: white;
            }

            .devtools-toggle {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 40px;
                height: 40px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                font-size: 18px;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
            }

            .toast {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 6px;
                color: white;
                font-family: sans-serif;
                font-size: 14px;
                z-index: 10001;
                animation: toastSlideIn 0.3s ease;
                max-width: 300px;
            }

            @keyframes toastSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;

    const styleEl = document.createElement("style");
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);
  }

  static addDevPanel() {
    // Create toggle button
    const toggleBtn = document.createElement("button");
    toggleBtn.className = "devtools-toggle";
    toggleBtn.innerHTML = "⚙️";
    toggleBtn.title = "Toggle Dev Tools";

    // Create panel
    const panel = document.createElement("div");
    panel.className = "devtools-panel";
    panel.style.display = "none";
    panel.innerHTML = `
            <h3>Component Dev Tools</h3>
            <ul class="component-list" id="devtools-component-list">
                <li style="color: #999; font-style: italic; padding: 12px;">
                    Loading components...
                </li>
            </ul>
            <div class="devtools-actions">
                <button class="devtools-btn reload" id="devtools-reload-all">Reload All</button>
                <button class="devtools-btn clear" id="devtools-clear-cache">Clear Cache</button>
            </div>
        `;

    document.body.appendChild(panel);
    document.body.appendChild(toggleBtn);

    // Toggle panel visibility
    toggleBtn.addEventListener("click", () => {
      panel.style.display = panel.style.display === "none" ? "block" : "none";
      if (panel.style.display === "block") {
        ComponentDevTools.updateComponentList();
      }
    });

    // Add event listeners
    panel
      .querySelector("#devtools-reload-all")
      .addEventListener("click", async () => {
        await ComponentLoader.reloadAll();
        ComponentDevTools.showToast("All components reloaded", "success");
        ComponentDevTools.updateComponentList();
      });

    panel
      .querySelector("#devtools-clear-cache")
      .addEventListener("click", () => {
        ComponentLoader.components.clear();
        ComponentDevTools.showToast("Cache cleared", "info");
      });

    // Update component list when components load
    document.addEventListener("components:loaded", () => {
      if (panel.style.display === "block") {
        ComponentDevTools.updateComponentList();
      }
    });
  }

  static updateComponentList() {
    const list = document.getElementById("devtools-component-list");
    if (!list) return;

    const components = {};
    document.querySelectorAll("[data-component]").forEach((el) => {
      const name = el.getAttribute("data-component");
      if (!components[name]) {
        components[name] = {
          count: 0,
          status: "loaded",
          elements: [],
        };
      }
      components[name].count++;
      components[name].elements.push(el);

      // Determine status
      if (el.dataset.error === "true") {
        components[name].status = "error";
      } else if (el.dataset.loading === "true") {
        components[name].status = "loading";
      }
    });

    list.innerHTML = "";

    if (Object.keys(components).length === 0) {
      list.innerHTML =
        '<li style="color: #999; padding: 12px; font-style: italic;">No components found</li>';
      return;
    }

    Object.entries(components).forEach(([name, info]) => {
      const item = document.createElement("li");
      item.className = "component-item";
      item.innerHTML = `
                <span>${name} <small style="color: #999;">(${info.count})</small></span>
                <span class="component-status ${info.status}">${info.status}</span>
            `;

      item.addEventListener("click", async () => {
        await ComponentLoader.reload(name);
        ComponentDevTools.showToast(`"${name}" reloaded`, "success");
        ComponentDevTools.updateComponentList();
      });

      list.appendChild(item);
    });
  }

  static addKeyboardShortcuts() {
    document.addEventListener("keydown", (e) => {
      // Ctrl+Shift+D to toggle dev tools
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        const panel = document.querySelector(".devtools-panel");
        const toggle = document.querySelector(".devtools-toggle");
        if (panel && toggle) {
          panel.style.display =
            panel.style.display === "none" ? "block" : "none";
          if (panel.style.display === "block") {
            ComponentDevTools.updateComponentList();
          }
        }
      }
    });
  }

  static showToast(message, type = "info") {
    // Remove existing toasts
    document.querySelectorAll(".toast").forEach((toast) => toast.remove());

    const colors = {
      success: "#10b981",
      error: "#ef4444",
      info: "#3b82f6",
      warning: "#f59e0b",
    };

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.style.background = colors[type] || colors.info;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      toast.style.animation = "toastSlideIn 0.3s ease reverse";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
}

// Auto-initialize dev tools
document.addEventListener("DOMContentLoaded", () => {
  setTimeout(() => ComponentDevTools.init(), 100);
});
