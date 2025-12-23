import { CSSParser } from "./cssParser.js";

export class ComponentLoader {
  // Component cache and state management
  static components = new Map(); // Cache for loaded components
  static styles = new Map(); // Track injected styles for cleanup
  static loadingStates = new Map(); // Track loading state per element
  static pendingLoads = new Map(); // Track pending load promises

  // Default configuration
  static config = {
    shadowDOM: false, // Use Shadow DOM for true isolation
    development: false, // Development mode
    cache: true, // Cache components
    basePath: "components/", // Base path for components
    autoInit: true, // Auto-initialize on DOM ready
    retryCount: 2, // Number of retry attempts
    retryDelay: 1000, // Delay between retries (ms)
    preserveAttributes: true, // Preserve original element attributes
    scopeCSS: true, // Enable CSS scoping
    minifyCSS: false, // Minify CSS (development only)
    validateCSS: true, // Validate CSS before injection
    errorHandling: "graceful", // 'graceful' or 'strict'
    logLevel: "warn", // 'error', 'warn', 'info', 'debug'
  };

  // Initialize the component loader
  static async init() {
    if (!ComponentLoader.config.autoInit) return;

    ComponentLoader.log("🚀 Initializing ComponentLoader...", "info");

    // Find all component placeholders
    const components = document.querySelectorAll("[data-component]");

    if (components.length === 0) {
      ComponentLoader.log("No components found to load", "info");
      return;
    }

    ComponentLoader.log(
      `Found ${components.length} component${
        components.length === 1 ? "" : "s"
      } to load`,
      "info"
    );

    // Load components in batches for better performance
    const loadPromises = [];
    const batchSize = 5; // Load 5 components at a time

    for (let i = 0; i < components.length; i += batchSize) {
      const batch = Array.from(components).slice(i, i + batchSize);

      const batchPromise = Promise.allSettled(
        batch.map((component) => {
          const name = component.getAttribute("data-component");

          // Skip if already loaded or loading
          if (
            component.dataset.loaded === "true" ||
            component.dataset.loading === "true"
          ) {
            return Promise.resolve();
          }

          return ComponentLoader.loadComponent(name, component);
        })
      );

      loadPromises.push(batchPromise);

      // Small delay between batches to prevent UI blocking
      if (i + batchSize < components.length) {
        await ComponentLoader.delay(50);
      }
    }

    // Wait for all batches to complete
    await Promise.allSettled(loadPromises);

    // Dispatch components loaded event
    ComponentLoader.dispatchComponentsLoaded();

    ComponentLoader.log("✅ All components loaded", "success");
  }

  // Load a single component
  static async loadComponent(name, element, retry = 0) {
    // Generate a unique ID for this load attempt
    const loadId = `${name}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    ComponentLoader.log(`Loading component: "${name}"`, "info");

    // Mark as loading
    element.dataset.loading = "true";
    element.dataset.loadId = loadId;

    // Store loading state
    ComponentLoader.loadingStates.set(loadId, {
      name,
      element,
      startTime: Date.now(),
      retryCount: retry,
    });

    try {
      // Check cache first
      let componentData;
      if (
        ComponentLoader.config.cache &&
        ComponentLoader.components.has(name)
      ) {
        ComponentLoader.log(`Using cached version of "${name}"`, "debug");
        componentData = ComponentLoader.components.get(name);
      } else {
        // Fetch from server
        componentData = await ComponentLoader.fetchComponentWithRetry(
          name,
          retry
        );

        // Cache if enabled
        if (ComponentLoader.config.cache) {
          ComponentLoader.components.set(name, componentData);
        }
      }

      // Render the component
      await ComponentLoader.renderComponent(
        element,
        componentData.html,
        componentData.css,
        name
      );

      // Mark as successfully loaded
      element.dataset.loaded = "true";
      element.dataset.loading = "false";
      delete element.dataset.error;
      delete element.dataset.loadId;

      // Update loading state
      ComponentLoader.loadingStates.delete(loadId);

      ComponentLoader.log(
        `✅ Component "${name}" loaded successfully`,
        "success"
      );

      // Dispatch component loaded event
      element.dispatchEvent(
        new CustomEvent("component:loaded", {
          detail: {
            name,
            element,
            loadTime:
              Date.now() -
                ComponentLoader.loadingStates.get(loadId)?.startTime || 0,
            fromCache:
              ComponentLoader.config.cache &&
              ComponentLoader.components.has(name),
          },
        })
      );
    } catch (error) {
      // Mark as error
      element.dataset.loading = "false";
      element.dataset.loaded = "false";
      element.dataset.error = "true";
      element.dataset.errorMessage = error.message;

      // Update loading state
      const loadingState = ComponentLoader.loadingStates.get(loadId);
      if (loadingState) {
        loadingState.error = error;
        loadingState.endTime = Date.now();
      }

      // Handle error based on configuration
      if (ComponentLoader.config.errorHandling === "graceful") {
        // Render error UI (only once)
        if (!element.dataset.errorRendered) {
          ComponentLoader.renderError(element, name, error);
          element.dataset.errorRendered = "true";
        }

        ComponentLoader.log(
          `⚠️ Component "${name}" failed to load: ${error.message}`,
          "warn"
        );
      } else {
        // Strict mode - rethrow the error
        throw error;
      }

      // Cleanup
      delete element.dataset.loadId;
    }
  }

  // Fetch component with retry logic
  static async fetchComponentWithRetry(name, retryCount = 0) {
    let lastError;

    for (let i = 0; i <= ComponentLoader.config.retryCount; i++) {
      try {
        return await ComponentLoader.fetchComponent(name);
      } catch (error) {
        lastError = error;

        if (i < ComponentLoader.config.retryCount) {
          const delay = ComponentLoader.config.retryDelay * (i + 1);
          ComponentLoader.log(
            `↻ Retrying "${name}" (${i + 1}/${
              ComponentLoader.config.retryCount
            }) in ${delay}ms...`,
            "debug"
          );
          await ComponentLoader.delay(delay);
        }
      }
    }

    throw lastError;
  }

  // Fetch component from server
  static async fetchComponent(name) {
    const basePath = ComponentLoader.config.basePath;
    const htmlPath = `${basePath}${name}.html`;

    ComponentLoader.log(`Fetching component: ${htmlPath}`, "debug");

    // Fetch HTML
    const htmlResponse = await fetch(htmlPath);
    if (!htmlResponse.ok) {
      throw new Error(
        `HTTP ${htmlResponse.status}: ${htmlResponse.statusText}`
      );
    }

    let html = await htmlResponse.text();
    let css = "";

    // Extract CSS from HTML using CSSParser if available
    if (window.CSSParser) {
      css = CSSParser.extractFromHTML(html);

      // Remove style tags from HTML
      if (css) {
        html = CSSParser.removeFromHTML(html);
      }

      // Minify CSS if enabled
      if (
        ComponentLoader.config.minifyCSS &&
        ComponentLoader.config.development
      ) {
        css = CSSParser.minify(css);
      }
    } else {
      // Fallback: simple style tag extraction
      const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
      const styleMatches = html.matchAll(styleRegex);

      for (const match of styleMatches) {
        css += match[1].trim() + "\n";
      }

      // Remove style tags
      html = html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
    }

    // Clean up HTML
    html = html.trim();
    css = css.trim();

    ComponentLoader.log(
      `Fetched "${name}": ${html.length} chars HTML, ${css.length} chars CSS`,
      "debug"
    );

    return { html, css };
  }

  // Render a component
  static async renderComponent(element, html, css, componentName) {
    // Generate unique scope ID
    const scopeId = ComponentLoader.generateScopeId(componentName);

    // Store component metadata
    element.dataset.componentId = scopeId;
    element.dataset.componentName = componentName;
    element.dataset.loadedAt = new Date().toISOString();

    // Preserve original attributes if configured
    let preservedAttributes = {};
    if (ComponentLoader.config.preserveAttributes) {
      preservedAttributes = ComponentLoader.preserveElementAttributes(element);
    }

    // Clear any previous error display
    if (element.dataset.errorRendered) {
      element.innerHTML = "";
      delete element.dataset.errorRendered;
    }

    // Choose rendering method
    if (ComponentLoader.config.shadowDOM && "attachShadow" in element) {
      await ComponentLoader.renderWithShadowDOM(
        element,
        html,
        css,
        scopeId,
        preservedAttributes
      );
    } else {
      await ComponentLoader.renderWithScopedStyles(
        element,
        html,
        css,
        scopeId,
        preservedAttributes
      );
    }

    // Execute any script tags in the component
    ComponentLoader.executeComponentScripts(element);
  }

  // Render using Shadow DOM (true isolation)
  static async renderWithShadowDOM(
    element,
    html,
    css,
    scopeId,
    preservedAttributes = {}
  ) {
    ComponentLoader.log(
      `Rendering "${element.dataset.componentName}" with Shadow DOM`,
      "debug"
    );

    // Create or reuse shadow root
    let shadow;
    if (element.shadowRoot) {
      shadow = element.shadowRoot;
      shadow.innerHTML = ""; // Clear existing content
    } else {
      shadow = element.attachShadow({ mode: "open" });
    }

    // Apply preserved attributes to host element
    Object.entries(preservedAttributes).forEach(([attr, value]) => {
      if (attr !== "class" && attr !== "style") {
        element.setAttribute(attr, value);
      }
    });

    // Add styles to shadow DOM
    if (css) {
      const style = document.createElement("style");
      style.textContent = css;
      shadow.appendChild(style);
    }

    // Parse and add HTML content
    const template = document.createElement("template");
    template.innerHTML = html.trim();

    // Clone and append template content
    const content = template.content.cloneNode(true);
    shadow.appendChild(content);

    // Apply preserved classes and styles
    if (preservedAttributes.class) {
      element.className = preservedAttributes.class;
    }

    if (preservedAttributes.style) {
      element.style.cssText = preservedAttributes.style;
    }

    ComponentLoader.log(
      `Shadow DOM rendering complete for "${element.dataset.componentName}"`,
      "debug"
    );
  }

  // Render with scoped styles (compatibility mode)
  static async renderWithScopedStyles(
    element,
    html,
    css,
    scopeId,
    preservedAttributes = {}
  ) {
    ComponentLoader.log(
      `Rendering "${element.dataset.componentName}" with scoped styles`,
      "debug"
    );

    // Cleanup old styles for this scope
    ComponentLoader.cleanupStyles(scopeId);

    // Preserve semantic element type
    const isSemanticElement = !["div", "span"].includes(
      element.tagName.toLowerCase()
    );

    if (isSemanticElement && ComponentLoader.config.preserveAttributes) {
      // Keep semantic element, wrap content inside
      ComponentLoader.renderWithSemanticWrapper(
        element,
        html,
        css,
        scopeId,
        preservedAttributes
      );
    } else {
      // Use simple wrapper
      ComponentLoader.renderWithSimpleWrapper(
        element,
        html,
        css,
        scopeId,
        preservedAttributes
      );
    }

    ComponentLoader.log(
      `Scoped styles rendering complete for "${element.dataset.componentName}"`,
      "debug"
    );
  }

  // Render preserving semantic element
  static renderWithSemanticWrapper(
    element,
    html,
    css,
    scopeId,
    preservedAttributes
  ) {
    // Create wrapper for scoped content
    const wrapper = document.createElement("div");
    wrapper.dataset.componentId = scopeId;
    wrapper.dataset.componentWrapper = "true";

    // Add scoped styles if CSS is present
    if (css && ComponentLoader.config.scopeCSS) {
      ComponentLoader.injectScopedStyles(css, scopeId);
    } else if (css) {
      // Inject unscoped CSS
      ComponentLoader.injectStyles(css, scopeId);
    }

    // Set wrapper content
    wrapper.innerHTML = html;

    // Clear element and add wrapper
    element.innerHTML = "";
    element.appendChild(wrapper);

    // Restore preserved attributes to the semantic element
    Object.entries(preservedAttributes).forEach(([attr, value]) => {
      if (attr === "class") {
        element.className = value;
      } else if (attr === "style") {
        element.style.cssText = value;
      } else {
        element.setAttribute(attr, value);
      }
    });
  }

  // Render with simple wrapper (for div/span elements)
  static renderWithSimpleWrapper(
    element,
    html,
    css,
    scopeId,
    preservedAttributes
  ) {
    // Add scoped styles if CSS is present
    if (css && ComponentLoader.config.scopeCSS) {
      ComponentLoader.injectScopedStyles(css, scopeId);
    } else if (css) {
      // Inject unscoped CSS
      ComponentLoader.injectStyles(css, scopeId);
    }

    // Create wrapper with scope ID
    const wrapperHTML = `<div data-component-id="${scopeId}">${html}</div>`;
    element.innerHTML = wrapperHTML;

    // Apply preserved classes and styles to the wrapper
    const wrapper = element.querySelector(`[data-component-id="${scopeId}"]`);
    if (wrapper) {
      if (preservedAttributes.class) {
        wrapper.className = preservedAttributes.class;
      }

      if (preservedAttributes.style) {
        wrapper.style.cssText = preservedAttributes.style;
      }
    }
  }

  // Inject scoped CSS styles
  static injectScopedStyles(css, scopeId) {
    if (!css.trim()) return null;

    // Check if CSS needs fixing
    if (window.CSSParser && CSSParser.needsFix(css)) {
      console.warn(
        `⚠️ Found broken CSS in component ${scopeId}, attempting to fix...`
      );
      css = CSSParser.fixBrokenCSS(css);
    }

    // Validate CSS if enabled
    if (ComponentLoader.config.validateCSS && window.CSSParser) {
      if (!CSSParser.validate(css)) {
        ComponentLoader.log(
          `Invalid CSS in component with scope ${scopeId}`,
          "warn"
        );

        if (ComponentLoader.config.errorHandling === "strict") {
          throw new Error("Invalid CSS syntax");
        }
      }
    }

    // Scope the CSS using the SAFE method
    let scopedCSS;
    if (window.CSSParser) {
      const scopeSelector = `[data-component-id="${scopeId}"]`;

      // Use the safe scoping method that preserves CSS variables
      scopedCSS = CSSParser.scopeCSSSafe(css, scopeSelector);

      // Double-check for any remaining issues
      if (CSSParser.needsFix(scopedCSS)) {
        scopedCSS = CSSParser.fixBrokenCSS(scopedCSS);
      }
    } else {
      // Fallback: simple scoping
      scopedCSS = ComponentLoader.simpleScopeCSS(css, scopeId);
    }

    // Inject the scoped styles
    return ComponentLoader.injectStyles(scopedCSS, scopeId);
  }

  // Simple CSS scoping (fallback)
  static simpleScopeCSS(css, scopeId) {
    const scopeSelector = `[data-component-id="${scopeId}"]`;

    // Use line-by-line processing to avoid breaking var() functions
    const lines = css.split("\n");
    let result = "";
    let inVarFunction = false;
    let parenDepth = 0;

    for (let line of lines) {
      let processedLine = line;

      // Check if we're starting a new rule (not inside var())
      if (!inVarFunction && line.includes("{") && !line.includes("}")) {
        const parts = line.split("{");
        if (parts.length === 2) {
          const selectors = parts[0].trim();
          const content = parts[1];

          // Only scope if not a CSS variable definition
          if (!selectors.startsWith("--")) {
            // Simple selector scoping
            const scopedSelectors = selectors
              .split(",")
              .map((s) => s.trim())
              .map((s) => {
                if (s.startsWith(":host")) {
                  return s.replace(":host", scopeSelector);
                }
                if (s === "html" || s === ":root" || s.startsWith("@")) {
                  return s;
                }
                return `${scopeSelector} ${s}`;
              })
              .join(", ");

            processedLine = `${scopedSelectors} {${content}`;
          }
        }
      }

      result += processedLine + "\n";

      // Track var() functions across lines (though they should be single-line)
      // This is a simplified check
      if (line.includes("var(") && line.includes(")")) {
        // Single-line var() function, nothing to track
      }
    }

    return result;
  }

  // Inject styles into document head
  static injectStyles(css, scopeId) {
    if (!css.trim()) return null;

    const style = document.createElement("style");
    style.dataset.componentScope = scopeId;
    style.dataset.componentStyle = "true";
    style.textContent = css;

    // Add to document head
    document.head.appendChild(style);

    // Store for cleanup
    if (!ComponentLoader.styles.has(scopeId)) {
      ComponentLoader.styles.set(scopeId, []);
    }
    ComponentLoader.styles.get(scopeId).push(style);

    return style;
  }

  // Preserve element attributes before rendering
  static preserveElementAttributes(element) {
    const attributes = {};
    const preserveList = [
      "id",
      "class",
      "style",
      "role",
      "aria-*",
      "data-*",
      "tabindex",
      "title",
      "lang",
      "dir",
      "accesskey",
    ];

    // Preserve all attributes by default
    Array.from(element.attributes).forEach((attr) => {
      attributes[attr.name] = attr.value;
    });

    return attributes;
  }

  // Execute script tags within a component
  static executeComponentScripts(element) {
    const scripts = element.querySelectorAll("script");

    scripts.forEach((script) => {
      try {
        // Create new script element
        const newScript = document.createElement("script");

        // Copy attributes
        Array.from(script.attributes).forEach((attr) => {
          newScript.setAttribute(attr.name, attr.value);
        });

        // Set content
        newScript.textContent = script.textContent;

        // Replace old script with new one (executes it)
        script.parentNode.replaceChild(newScript, script);
      } catch (error) {
        ComponentLoader.log(
          `Error executing component script: ${error.message}`,
          "error"
        );
      }
    });
  }

  // Render error state
  static renderError(element, componentName, error) {
    const errorHTML = `
            <div class="component-error" style="
                padding: 1rem;
                margin: 1rem 0;
                border: 2px dashed #dc2626;
                border-radius: 0.5rem;
                background: linear-gradient(to bottom right, #fef2f2, #fee2e2);
                color: #7f1d1d;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
                max-width: 100%;
                overflow: auto;
            ">
                <div style="display: flex; align-items: flex-start; gap: 0.75rem; margin-bottom: 0.75rem;">
                    <div style="
                        flex-shrink: 0;
                        width: 24px;
                        height: 24px;
                        background: #dc2626;
                        color: white;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 14px;
                    ">
                        ⚠️
                    </div>
                    <div style="flex: 1;">
                        <strong style="display: block; font-size: 1.125rem; margin-bottom: 0.25rem;">
                            Component "${componentName}" failed to load
                        </strong>
                        <div style="font-size: 0.875rem; color: #991b1b;">
                            ${error.message}
                        </div>
                    </div>
                </div>

                <div style="
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                    margin-top: 0.75rem;
                    padding-top: 0.75rem;
                    border-top: 1px solid rgba(220, 38, 38, 0.2);
                ">
                    <button onclick="ComponentLoader.retryComponent(this)" style="
                        padding: 0.5rem 1rem;
                        background: #dc2626;
                        color: white;
                        border: none;
                        border-radius: 0.375rem;
                        font-size: 0.875rem;
                        cursor: pointer;
                        transition: background 0.2s;
                        font-family: inherit;
                    " onmouseover="this.style.background='#b91c1c'"
                     onmouseout="this.style.background='#dc2626'">
                        Retry
                    </button>

                    <button onclick="ComponentLoader.showErrorDetails(this)" style="
                        padding: 0.5rem 1rem;
                        background: #6b7280;
                        color: white;
                        border: none;
                        border-radius: 0.375rem;
                        font-size: 0.875rem;
                        cursor: pointer;
                        transition: background 0.2s;
                        font-family: inherit;
                    " onmouseover="this.style.background='#4b5563'"
                     onmouseout="this.style.background='#6b7280'">
                        Details
                    </button>

                    <button onclick="this.closest('.component-error').style.display='none'" style="
                        padding: 0.5rem 1rem;
                        background: transparent;
                        color: #6b7280;
                        border: 1px solid #d1d5db;
                        border-radius: 0.375rem;
                        font-size: 0.875rem;
                        cursor: pointer;
                        transition: all 0.2s;
                        font-family: inherit;
                    " onmouseover="this.style.background='#f3f4f6'"
                     onmouseout="this.style.background='transparent'">
                        Dismiss
                    </button>
                </div>

                <div class="error-details" style="
                    display: none;
                    margin-top: 1rem;
                    padding: 0.75rem;
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 0.375rem;
                    font-family: 'SF Mono', Monaco, 'Cascadia Mono', monospace;
                    font-size: 0.75rem;
                    color: #374151;
                    max-height: 200px;
                    overflow: auto;
                ">
                    <pre style="margin: 0; white-space: pre-wrap;">${
                      error.stack || "No stack trace available"
                    }</pre>
                </div>
            </div>
        `;

    element.innerHTML = errorHTML;
    element.dataset.errorComponent = componentName;
  }

  // Retry loading a component
  static retryComponent(button) {
    const errorDiv = button.closest("[data-component]");
    const name =
      errorDiv.dataset.errorComponent ||
      errorDiv.getAttribute("data-component");

    // Clear error state
    delete errorDiv.dataset.error;
    delete errorDiv.dataset.errorRendered;
    delete errorDiv.dataset.errorMessage;

    // Clear content
    errorDiv.innerHTML = "";

    // Retry loading
    ComponentLoader.loadComponent(name, errorDiv);
  }

  // Show error details
  static showErrorDetails(button) {
    const detailsDiv = button
      .closest(".component-error")
      .querySelector(".error-details");
    detailsDiv.style.display =
      detailsDiv.style.display === "none" ? "block" : "none";

    button.textContent =
      detailsDiv.style.display === "none" ? "Details" : "Hide Details";
  }

  // Generate unique scope ID
  static generateScopeId(componentName) {
    return `${componentName}-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  // Cleanup styles for a scope
  static cleanupStyles(scopeId) {
    const styles = ComponentLoader.styles.get(scopeId);
    if (styles) {
      styles.forEach((style) => {
        if (style.parentNode) {
          style.parentNode.removeChild(style);
        }
      });
      ComponentLoader.styles.delete(scopeId);
    }
  }

  // Utility: delay function
  static delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Dispatch components loaded event
  static dispatchComponentsLoaded() {
    const event = new CustomEvent("components:loaded", {
      detail: {
        timestamp: Date.now(),
        componentCount: ComponentLoader.components.size,
        config: ComponentLoader.config,
      },
    });

    document.dispatchEvent(event);
  }

  // Public API: Reload a specific component
  static async reload(name) {
    ComponentLoader.log(`Reloading component: "${name}"`, "info");

    // Clear from cache
    ComponentLoader.components.delete(name);

    // Find all instances
    const instances = document.querySelectorAll(`[data-component="${name}"]`);

    if (instances.length === 0) {
      ComponentLoader.log(`No instances found for component "${name}"`, "warn");
      return 0;
    }

    ComponentLoader.log(
      `Found ${instances.length} instance${
        instances.length === 1 ? "" : "s"
      } of "${name}"`,
      "info"
    );

    // Reload each instance
    const promises = [];

    for (const element of instances) {
      // Clear loading/error states
      delete element.dataset.loaded;
      delete element.dataset.loading;
      delete element.dataset.error;
      delete element.dataset.errorRendered;
      delete element.dataset.errorMessage;

      // Cleanup old styles
      if (element.dataset.componentId) {
        ComponentLoader.cleanupStyles(element.dataset.componentId);
      }

      promises.push(ComponentLoader.loadComponent(name, element));
    }

    await Promise.allSettled(promises);

    ComponentLoader.log(
      `✅ Component "${name}" reloaded across ${instances.length} instance${
        instances.length === 1 ? "" : "s"
      }`,
      "success"
    );

    return instances.length;
  }

  // Public API: Reload all components
  static async reloadAll() {
    ComponentLoader.log("Reloading all components...", "info");

    // Get all unique component names
    const components = new Set();
    document.querySelectorAll("[data-component]").forEach((el) => {
      components.add(el.getAttribute("data-component"));
    });

    ComponentLoader.log(
      `Found ${components.size} unique component${
        components.size === 1 ? "" : "s"
      } to reload`,
      "info"
    );

    // Reload each component
    const results = await Promise.allSettled(
      Array.from(components).map((name) => ComponentLoader.reload(name))
    );

    // Log results
    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    ComponentLoader.log(
      `✅ Reload complete: ${successful} successful, ${failed} failed`,
      failed > 0 ? "warn" : "success"
    );

    return results;
  }

  // Public API: Get component loading status
  static getStatus() {
    const components = new Set();
    const status = {
      total: 0,
      loaded: 0,
      loading: 0,
      error: 0,
      cached: ComponentLoader.components.size,
      details: [],
    };

    document.querySelectorAll("[data-component]").forEach((el) => {
      const name = el.getAttribute("data-component");
      if (!components.has(name)) {
        components.add(name);
        status.total++;

        if (el.dataset.loaded === "true") status.loaded++;
        if (el.dataset.loading === "true") status.loading++;
        if (el.dataset.error === "true") status.error++;

        status.details.push({
          name,
          element: el,
          loaded: el.dataset.loaded === "true",
          loading: el.dataset.loading === "true",
          error: el.dataset.error === "true",
          id: el.dataset.componentId,
        });
      }
    });

    return status;
  }

  // Public API: Update configuration
  static updateConfig(newConfig) {
    ComponentLoader.config = { ...ComponentLoader.config, ...newConfig };
    ComponentLoader.log("Configuration updated", "info");
  }

  // Public API: Clear component cache
  static clearCache() {
    const cacheSize = ComponentLoader.components.size;
    ComponentLoader.components.clear();
    ComponentLoader.log(
      `Cleared cache (${cacheSize} component${cacheSize === 1 ? "" : "s"})`,
      "info"
    );
    return cacheSize;
  }

  // Public API: Cleanup all resources
  static cleanup() {
    // Clear cache
    ComponentLoader.clearCache();

    // Remove all injected styles
    ComponentLoader.styles.forEach((styles, scopeId) => {
      ComponentLoader.cleanupStyles(scopeId);
    });

    // Clear loading states
    ComponentLoader.loadingStates.clear();
    ComponentLoader.pendingLoads.clear();

    ComponentLoader.log("ComponentLoader cleaned up", "info");
  }

  // Logging utility
  static log(message, type = "info") {
    const colors = {
      error: "#ef4444",
      warn: "#f59e0b",
      info: "#3b82f6",
      success: "#10b981",
      debug: "#6b7280",
    };

    const icons = {
      error: "❌",
      warn: "⚠️",
      info: "ℹ️",
      success: "✅",
      debug: "🐛",
    };

    const logLevels = ["error", "warn", "info", "debug"];
    const currentLevel = logLevels.indexOf(ComponentLoader.config.logLevel);
    const messageLevel = logLevels.indexOf(type);

    if (messageLevel <= currentLevel) {
      const style = `color: ${colors[type] || "#000"}; font-weight: bold;`;
      console.log(`%c${icons[type] || ""} [ComponentLoader] ${message}`, style);
    }
  }
}

// Auto-initialize if configured
if (ComponentLoader.config.autoInit) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => ComponentLoader.init(), 0);
    });
  } else {
    setTimeout(() => ComponentLoader.init(), 0);
  }
}

// Make available globally
window.ComponentLoader = ComponentLoader;

// Export for module systems (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = ComponentLoader;
}
