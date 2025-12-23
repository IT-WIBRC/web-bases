import { ComponentLoader } from "./components/core/loader.js";
import { ComponentDevTools } from "./components/core/devTools.js";
import "./components/core/AccessibilityRules.js";
import { SemanticHelper } from "./components/core/SemanticHelper.js";

class App {
  static config = {
    // Development mode detection
    development:
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "" ||
      new URLSearchParams(window.location.search).has("dev"),

    // Component configuration
    shadowDOM: false, // Use Shadow DOM for true isolation
    basePath: "components/", // Where components are stored
    cacheComponents: true, // Cache components for performance
    autoInitialize: true, // Auto-initialize on page load

    // Accessibility features
    accessibility: true, // Enable accessibility enhancements
    semanticHTML: true, // Use semantic HTML elements
    autoAriaLabels: true, // Auto-add ARIA labels where missing
    focusManagement: true, // Manage focus for interactive components
    validateAccessibility: true, // Validate accessibility in dev mode

    // Error handling
    retryCount: 2, // Retry failed component loads
    retryDelay: 1000, // Delay between retries (ms)

    // Development features
    hotReload: false, // Enable hot reload (development only)
    showDevTools: true, // Show development tools
    logLevel: "info", // 'error', 'warn', 'info', 'debug'
  };

  static components = new Map(); // Track loaded components
  static eventListeners = new Map(); // Track event listeners for cleanup

  static async init() {
    try {
      App.log("🚀 Initializing application...", "info");

      // Validate configuration
      App.validateConfig();

      // Configure ComponentLoader
      ComponentLoader.updateConfig({
        development: App.config.development,
        shadowDOM: App.config.shadowDOM,
        basePath: App.config.basePath,
        cache: App.config.cacheComponents,
        retryCount: App.config.retryCount,
        retryDelay: App.config.retryDelay,
      });

      // Initialize development tools
      if (App.config.development && App.config.showDevTools) {
        ComponentDevTools.init();

        // Enable hot reload if configured
        if (App.config.hotReload) {
          ComponentDevTools.config.hotReload = true;
          ComponentDevTools.startHotReload();
        }
      }

      // Load all components
      await ComponentLoader.init();

      // Apply accessibility enhancements
      if (App.config.accessibility) {
        await App.enhanceAccessibility();

        // Validate accessibility in development mode
        if (App.config.development && App.config.validateAccessibility) {
          App.validateAccessibility();
        }
      }

      // Setup global event listeners
      App.setupEventListeners();

      // Dispatch app ready event
      App.dispatchAppReady();

      App.log("✅ Application initialized successfully", "success");
    } catch (error) {
      App.log(
        `❌ Application initialization failed: ${error.message}`,
        "error"
      );
      console.error("Initialization error details:", error);

      // Show user-friendly error
      App.showFatalError(error);
    }
  }

  static validateConfig() {
    const warnings = [];

    // Check for required dependencies
    if (!window.ComponentLoader) {
      throw new Error(
        "ComponentLoader not loaded. Make sure to load components/core/ComponentLoader.js before app.js"
      );
    }

    if (App.config.accessibility && !window.SemanticHelper) {
      warnings.push(
        "SemanticHelper not loaded. Accessibility features may be limited."
      );
    }

    // Validate base path
    if (!App.config.basePath.endsWith("/")) {
      App.config.basePath += "/";
    }

    // Development mode warnings
    if (App.config.development) {
      if (App.config.shadowDOM) {
        warnings.push(
          "Shadow DOM is enabled. Some CSS may not work as expected."
        );
      }

      if (App.config.hotReload) {
        App.log("🔥 Hot reload enabled (development mode)", "info");
      }
    }

    // Log warnings
    if (warnings.length > 0) {
      warnings.forEach((warning) => App.log(`⚠️ ${warning}`, "warn"));
    }
  }

  static async enhanceAccessibility() {
    App.log("🔍 Enhancing accessibility...", "info");

    const components = document.querySelectorAll("[data-component]");
    let enhancements = 0;

    // Process each component
    for (const element of components) {
      const componentName = element.getAttribute("data-component");

      // Apply semantic HTML enhancements
      if (App.config.semanticHTML && window.SemanticHelper) {
        try {
          SemanticHelper.enhanceElement(element, componentName);
          enhancements++;
        } catch (error) {
          App.log(
            `Failed to enhance ${componentName}: ${error.message}`,
            "warn"
          );
        }
      }

      // Add ARIA labels if missing
      if (App.config.autoAriaLabels) {
        App.addMissingAriaLabels(element, componentName);
      }

      // Add keyboard navigation
      if (App.config.focusManagement) {
        App.addKeyboardNavigation(element, componentName);
      }

      // Component-specific enhancements
      App.enhanceComponent(element, componentName);
    }

    App.log(`✅ Applied ${enhancements} accessibility enhancements`, "success");

    // Add global accessibility features
    App.addGlobalAccessibility();
  }

  static enhanceComponent(element, componentName) {
    switch (componentName) {
      case "form":
        App.enhanceForm(element);
        break;

      case "modal":
      case "dialog":
        App.enhanceModal(element);
        break;

      case "navigation":
      case "menu":
      case "nav":
        App.enhanceNavigation(element);
        break;

      case "carousel":
      case "slider":
        App.enhanceCarousel(element);
        break;

      case "accordion":
        App.enhanceAccordion(element);
        break;

      case "tabpanel":
      case "tabs":
        App.enhanceTabs(element);
        break;
    }
  }

  static enhanceForm(element) {
    // Auto-link labels to inputs
    const labels = element.querySelectorAll("label:not([for])");
    labels.forEach((label) => {
      const input = label.querySelector("input, select, textarea");
      if (input && !input.id) {
        const id = `input-${Math.random().toString(36).substr(2, 9)}`;
        input.id = id;
        label.htmlFor = id;
      }
    });

    // Add required attribute indicators
    const requiredInputs = element.querySelectorAll(
      '[aria-required="true"]:not([required])'
    );
    requiredInputs.forEach((input) => {
      input.setAttribute("required", "");
    });

    // Add error message containers
    const inputs = element.querySelectorAll("input, select, textarea");
    inputs.forEach((input) => {
      if (!input.hasAttribute("aria-describedby")) {
        const errorId = `error-${
          input.id || Math.random().toString(36).substr(2, 9)
        }`;
        const errorDiv = document.createElement("div");
        errorDiv.id = errorId;
        errorDiv.className = "error-message";
        errorDiv.setAttribute("aria-live", "polite");
        errorDiv.setAttribute("role", "alert");
        errorDiv.style.display = "none";

        input.parentNode.appendChild(errorDiv);
        input.setAttribute("aria-describedby", errorId);
      }
    });
  }

  static enhanceModal(element) {
    // Ensure modal has proper attributes
    if (!element.hasAttribute("role")) {
      element.setAttribute("role", "dialog");
    }

    if (!element.hasAttribute("aria-modal")) {
      element.setAttribute("aria-modal", "true");
    }

    // Add close button if missing
    const closeButtons = element.querySelectorAll(
      '[data-close-modal], [aria-label*="close"], [aria-label*="Close"]'
    );
    if (closeButtons.length === 0) {
      const closeButton = document.createElement("button");
      closeButton.className = "modal-close";
      closeButton.setAttribute("aria-label", "Close dialog");
      closeButton.innerHTML = "&times;";
      closeButton.addEventListener("click", () => {
        element.style.display = "none";
        element.setAttribute("aria-hidden", "true");
      });

      element.prepend(closeButton);
    }

    // Add focus trap
    App.addFocusTrap(element);
  }

  static enhanceNavigation(element) {
    // Ensure navigation has proper structure
    const lists = element.querySelectorAll("ul, ol");
    lists.forEach((list) => {
      if (!list.hasAttribute("role")) {
        list.setAttribute("role", "menubar");
      }

      const items = list.querySelectorAll("li");
      items.forEach((item) => {
        const link = item.querySelector("a");
        if (link && !link.hasAttribute("role")) {
          link.setAttribute("role", "menuitem");
        }
      });
    });

    // Add skip navigation link if missing
    const skipLink = document.querySelector(
      '.skip-navigation, [href^="#main"]'
    );
    if (!skipLink && document.getElementById("main-content")) {
      const skipNav = document.createElement("a");
      skipNav.href = "#main-content";
      skipNav.className = "skip-navigation";
      skipNav.textContent = "Skip to main content";
      skipNav.style.cssText = `
                position: absolute;
                top: -40px;
                left: 0;
                background: #000;
                color: white;
                padding: 8px;
                z-index: 10000;
                text-decoration: none;
            `;

      skipNav.addEventListener("focus", () => {
        skipNav.style.top = "0";
      });

      skipNav.addEventListener("blur", () => {
        skipNav.style.top = "-40px";
      });

      document.body.prepend(skipNav);
    }
  }

  static enhanceCarousel(element) {
    // Add ARIA attributes for carousel
    if (!element.hasAttribute("role")) {
      element.setAttribute("role", "region");
    }

    if (!element.hasAttribute("aria-label")) {
      element.setAttribute("aria-label", "Image carousel");
    }

    // Add live region for announcements
    const liveRegion = document.createElement("div");
    liveRegion.setAttribute("aria-live", "polite");
    liveRegion.setAttribute("aria-atomic", "true");
    liveRegion.className = "carousel-announcements";
    liveRegion.style.cssText = `
            position: absolute;
            width: 1px;
            height: 1px;
            padding: 0;
            margin: -1px;
            overflow: hidden;
            clip: rect(0, 0, 0, 0);
            white-space: nowrap;
            border: 0;
        `;

    element.appendChild(liveRegion);
  }

  static enhanceAccordion(element) {
    const buttons = element.querySelectorAll("[data-accordion-trigger]");
    buttons.forEach((button, index) => {
      if (button.tagName !== "BUTTON") {
        const wrapper = document.createElement("button");
        wrapper.innerHTML = button.innerHTML;
        wrapper.className = button.className;
        Array.from(button.attributes).forEach((attr) => {
          wrapper.setAttribute(attr.name, attr.value);
        });
        button.parentNode.replaceChild(wrapper, button);
      }

      const buttonEl = element.querySelectorAll("[data-accordion-trigger]")[
        index
      ];
      const contentId =
        buttonEl.getAttribute("aria-controls") || `accordion-content-${index}`;
      const content =
        document.getElementById(contentId) || buttonEl.nextElementSibling;

      if (content) {
        if (!content.id) {
          content.id = contentId;
        }

        buttonEl.setAttribute("aria-controls", content.id);
        buttonEl.setAttribute(
          "aria-expanded",
          content.hidden ? "false" : "true"
        );

        if (!content.hasAttribute("role")) {
          content.setAttribute("role", "region");
        }
      }
    });
  }

  static enhanceTabs(element) {
    const tablist = element.querySelector('[role="tablist"]');
    if (!tablist) return;

    const tabs = tablist.querySelectorAll('[role="tab"]');
    const tabpanels = element.querySelectorAll('[role="tabpanel"]');

    tabs.forEach((tab, index) => {
      if (!tab.id) {
        tab.id = `tab-${index}`;
      }

      const panel = tabpanels[index];
      if (panel && !panel.id) {
        panel.id = `tabpanel-${index}`;
      }

      if (panel) {
        tab.setAttribute("aria-controls", panel.id);
        panel.setAttribute("aria-labelledby", tab.id);
      }

      if (index === 0) {
        tab.setAttribute("aria-selected", "true");
        tab.setAttribute("tabindex", "0");
        if (panel) {
          panel.hidden = false;
        }
      } else {
        tab.setAttribute("aria-selected", "false");
        tab.setAttribute("tabindex", "-1");
        if (panel) {
          panel.hidden = true;
        }
      }
    });
  }

  static addMissingAriaLabels(element, componentName) {
    // Add missing ARIA labels based on component type
    if (
      !element.hasAttribute("aria-label") &&
      !element.hasAttribute("aria-labelledby")
    ) {
      let ariaLabel = "";

      switch (componentName) {
        case "header":
          ariaLabel = "Site header";
          break;
        case "footer":
          ariaLabel = "Site footer";
          break;
        case "navigation":
        case "nav":
          ariaLabel = "Main navigation";
          break;
        case "main":
          const h1 = element.querySelector("h1");
          if (h1 && h1.id) {
            element.setAttribute("aria-labelledby", h1.id);
            return;
          }
          ariaLabel = "Main content";
          break;
        case "search":
          ariaLabel = "Search";
          break;
      }

      if (ariaLabel) {
        element.setAttribute("aria-label", ariaLabel);
      }
    }

    // Check images for alt text
    const images = element.querySelectorAll("img:not([alt])");
    images.forEach((img) => {
      const parentLink = img.closest("a");
      if (parentLink && parentLink.textContent.trim()) {
        // If image is inside a link with text, mark as decorative
        img.setAttribute("alt", "");
        img.setAttribute("aria-hidden", "true");
      } else {
        // Try to generate alt text from filename or context
        const filename = img.src.split("/").pop().split(".")[0];
        img.setAttribute("alt", filename.replace(/[-_]/g, " "));
      }
    });
  }

  static addKeyboardNavigation(element, componentName) {
    const interactiveElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    if (interactiveElements.length === 0) return;

    // Add focus styles
    if (!element.querySelector("style[data-focus-styles]")) {
      const style = document.createElement("style");
      style.setAttribute("data-focus-styles", "true");
      style.textContent = `
                [data-component-id="${element.dataset.componentId}"] :focus-visible {
                    outline: 2px solid var(--focus-color, #3b82f6);
                    outline-offset: 2px;
                }

                [data-component-id="${element.dataset.componentId}"] button:focus-visible,
                [data-component-id="${element.dataset.componentId}"] a:focus-visible {
                    border-radius: 4px;
                }
            `;
      document.head.appendChild(style);
    }

    // Component-specific keyboard navigation
    switch (componentName) {
      case "dropdown":
      case "menu":
        App.setupDropdownKeyboard(element, interactiveElements);
        break;

      case "modal":
      case "dialog":
        App.setupModalKeyboard(element, interactiveElements);
        break;

      case "carousel":
        App.setupCarouselKeyboard(element);
        break;
    }
  }

  static setupDropdownKeyboard(element, items) {
    let currentIndex = 0;

    items.forEach((item, index) => {
      item.tabIndex = index === 0 ? 0 : -1;

      item.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "ArrowDown":
            e.preventDefault();
            currentIndex = (currentIndex + 1) % items.length;
            items[currentIndex].focus();
            break;

          case "ArrowUp":
            e.preventDefault();
            currentIndex = (currentIndex - 1 + items.length) % items.length;
            items[currentIndex].focus();
            break;

          case "Home":
            e.preventDefault();
            currentIndex = 0;
            items[currentIndex].focus();
            break;

          case "End":
            e.preventDefault();
            currentIndex = items.length - 1;
            items[currentIndex].focus();
            break;
        }
      });
    });
  }

  static setupModalKeyboard(element, focusableElements) {
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const keydownHandler = (e) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    element.addEventListener("keydown", keydownHandler);

    // Store for cleanup
    if (!App.eventListeners.has(element)) {
      App.eventListeners.set(element, []);
    }
    App.eventListeners.get(element).push({
      type: "keydown",
      handler: keydownHandler,
    });
  }

  static setupCarouselKeyboard(element) {
    const prevButton = element.querySelector("[data-carousel-prev]");
    const nextButton = element.querySelector("[data-carousel-next]");

    if (prevButton && nextButton) {
      const keydownHandler = (e) => {
        switch (e.key) {
          case "ArrowLeft":
            prevButton.click();
            e.preventDefault();
            break;
          case "ArrowRight":
            nextButton.click();
            e.preventDefault();
            break;
          case "Home":
            element.querySelector('[data-carousel-index="0"]')?.click();
            e.preventDefault();
            break;
          case "End":
            const lastIndex =
              element.querySelectorAll("[data-carousel-index]").length - 1;
            element
              .querySelector(`[data-carousel-index="${lastIndex}"]`)
              ?.click();
            e.preventDefault();
            break;
        }
      };

      element.addEventListener("keydown", keydownHandler);

      if (!App.eventListeners.has(element)) {
        App.eventListeners.set(element, []);
      }
      App.eventListeners.get(element).push({
        type: "keydown",
        handler: keydownHandler,
      });
    }
  }

  static addFocusTrap(element) {
    // Already implemented in setupModalKeyboard
    // This is kept for backward compatibility
  }

  static addGlobalAccessibility() {
    // Add reduced motion support
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    if (prefersReducedMotion.matches) {
      document.documentElement.classList.add("reduced-motion");

      const style = document.createElement("style");
      style.textContent = `
                .reduced-motion *,
                .reduced-motion *::before,
                .reduced-motion *::after {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            `;
      document.head.appendChild(style);
    }

    // Add high contrast support
    const prefersHighContrast = window.matchMedia("(prefers-contrast: high)");

    if (prefersHighContrast.matches) {
      document.documentElement.classList.add("high-contrast");
    }

    // Add print styles
    const printStyle = document.createElement("style");
    printStyle.setAttribute("media", "print");
    printStyle.textContent = `
            @media print {
                .no-print { display: none !important; }
                a[href]:after { content: " (" attr(href) ")"; }
                .skip-navigation { display: none !important; }
            }
        `;
    document.head.appendChild(printStyle);
  }

  static validateAccessibility() {
    App.log("🔍 Validating accessibility...", "info");

    const components = document.querySelectorAll("[data-component]");
    const issues = [];

    components.forEach((element) => {
      const componentName = element.getAttribute("data-component");
      const componentIssues = App.validateComponentAccessibility(
        element,
        componentName
      );

      if (componentIssues.length > 0) {
        issues.push({
          component: componentName,
          element: element,
          issues: componentIssues,
        });
      }
    });

    // Global accessibility checks
    const globalIssues = App.validateGlobalAccessibility();
    if (globalIssues.length > 0) {
      issues.push({
        component: "global",
        element: document.documentElement,
        issues: globalIssues,
      });
    }

    if (issues.length > 0) {
      App.logAccessibilityIssues(issues);

      if (App.config.development && window.ComponentDevTools) {
        ComponentDevTools.showToast(
          `Found ${issues.length} accessibility ${
            issues.length === 1 ? "issue" : "issues"
          }`,
          "warning"
        );
      }
    } else {
      App.log("✅ No accessibility issues found", "success");
    }
  }

  static validateComponentAccessibility(element, componentName) {
    const issues = [];

    // Check for missing ARIA labels on landmarks
    if (
      [
        "header",
        "footer",
        "main",
        "nav",
        "section",
        "article",
        "aside",
      ].includes(componentName)
    ) {
      if (
        !element.hasAttribute("aria-label") &&
        !element.hasAttribute("aria-labelledby")
      ) {
        const heading = element.querySelector("h1, h2, h3, h4, h5, h6");
        if (!heading || !heading.id) {
          issues.push(
            "Landmark should have aria-label or aria-labelledby attribute"
          );
        }
      }
    }

    // Check images
    const images = element.querySelectorAll("img");
    images.forEach((img) => {
      if (!img.hasAttribute("alt")) {
        issues.push("Image missing alt attribute");
      }
    });

    // Check links
    const links = element.querySelectorAll(
      "a[href]:not([aria-label]):not([aria-labelledby])"
    );
    links.forEach((link) => {
      if (!link.textContent.trim() && !link.querySelector("img[alt]")) {
        issues.push("Link has no accessible text");
      }
    });

    // Check form controls
    const inputs = element.querySelectorAll(
      'input:not([type="hidden"]), select, textarea'
    );
    inputs.forEach((input) => {
      if (!input.id && !input.closest("label")) {
        issues.push("Form control not associated with a label");
      }
    });

    // Check buttons
    const buttons = element.querySelectorAll(
      "button:not([aria-label]):not([aria-labelledby])"
    );
    buttons.forEach((button) => {
      if (!button.textContent.trim() && !button.querySelector("img[alt]")) {
        issues.push("Button has no accessible text");
      }
    });

    // Check heading hierarchy
    const headings = element.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (headings.length > 0) {
      const levels = Array.from(headings).map((h) => parseInt(h.tagName[1]));
      const firstLevel = levels[0];

      for (let i = 1; i < levels.length; i++) {
        if (levels[i] > firstLevel + 1) {
          issues.push(
            `Heading hierarchy skip: h${firstLevel} to h${levels[i]}`
          );
          break;
        }
      }
    }

    // Check color contrast (basic check)
    const elementsWithText = element.querySelectorAll(
      "*:not(script):not(style)"
    );
    elementsWithText.forEach((el) => {
      if (el.textContent.trim() && window.getComputedStyle(el).color) {
        // This is a simplified check - real contrast checking would need more complexity
        const color = window.getComputedStyle(el).color;
        const bgColor = window.getComputedStyle(el).backgroundColor;

        if (color === bgColor || color === "rgba(0, 0, 0, 0)") {
          issues.push("Text color may not have sufficient contrast");
        }
      }
    });

    return issues;
  }

  static validateGlobalAccessibility() {
    const issues = [];

    // Check for lang attribute
    if (!document.documentElement.hasAttribute("lang")) {
      issues.push("Missing lang attribute on html element");
    }

    // Check viewport
    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport || !viewport.content.includes("width=device-width")) {
      issues.push("Viewport meta tag may not be optimized for accessibility");
    }

    // Check title
    if (!document.title || document.title === "Untitled Document") {
      issues.push("Page should have a descriptive title");
    }

    // Check for skip link
    const skipLink = document.querySelector(
      '.skip-navigation, [href^="#main"]'
    );
    if (!skipLink) {
      issues.push("Consider adding a skip navigation link");
    }

    return issues;
  }

  static logAccessibilityIssues(issues) {
    console.group("⚠️ Accessibility Issues Found");

    issues.forEach(({ component, element, issues: componentIssues }) => {
      console.group(`Component: ${component}`);
      console.log("Element:", element);

      componentIssues.forEach((issue) => {
        console.warn(`• ${issue}`);
      });

      console.groupEnd();
    });

    console.groupEnd();
  }

  static setupEventListeners() {
    // Window resize handler
    const resizeHandler = () => {
      document.documentElement.style.setProperty(
        "--viewport-height",
        `${window.innerHeight}px`
      );
    };

    window.addEventListener("resize", resizeHandler);
    resizeHandler(); // Initial call

    // Store for cleanup
    App.eventListeners.set(window, [
      { type: "resize", handler: resizeHandler },
    ]);

    // Theme change (light/dark mode)
    const themeHandler = (e) => {
      document.documentElement.setAttribute(
        "data-theme",
        e.matches ? "dark" : "light"
      );
    };

    const darkModeMedia = window.matchMedia("(prefers-color-scheme: dark)");
    darkModeMedia.addListener(themeHandler);
    themeHandler(darkModeMedia); // Initial call

    App.eventListeners.set(darkModeMedia, [
      { type: "change", handler: themeHandler },
    ]);
  }

  static dispatchAppReady() {
    // Dispatch custom event
    const readyEvent = new CustomEvent("app:ready", {
      detail: {
        timestamp: Date.now(),
        components: App.getAllComponentsStatus(),
        config: App.config,
      },
    });

    document.dispatchEvent(readyEvent);

    // Also dispatch to window for backward compatibility
    window.dispatchEvent(
      new CustomEvent("appready", {
        detail: { initialized: true },
      })
    );
  }

  static getAllComponentsStatus() {
    const components = new Set();
    const status = [];

    document.querySelectorAll("[data-component]").forEach((el) => {
      const name = el.getAttribute("data-component");
      if (!components.has(name)) {
        components.add(name);
        status.push(App.getComponentStatus(name));
      }
    });

    return status;
  }

  static getComponentStatus(name) {
    const instances = document.querySelectorAll(`[data-component="${name}"]`);
    const instanceStatus = Array.from(instances).map((el) => ({
      element: el,
      loaded: el.dataset.loaded === "true",
      loading: el.dataset.loading === "true",
      error: el.dataset.error === "true",
      id: el.dataset.componentId,
    }));

    return {
      name,
      instances: instanceStatus.length,
      allLoaded: instanceStatus.every((s) => s.loaded),
      anyError: instanceStatus.some((s) => s.error),
      anyLoading: instanceStatus.some((s) => s.loading),
      details: instanceStatus,
    };
  }

  static async createComponent(name, targetSelector, attributes = {}) {
    const target = document.querySelector(targetSelector);
    if (!target) {
      throw new Error(`Target not found: ${targetSelector}`);
    }

    // Determine appropriate element type
    let elementType = "div";
    if (window.SemanticHelper && SemanticHelper.componentMap[name]) {
      elementType = SemanticHelper.componentMap[name].element;
    }

    // Create element
    const element = document.createElement(elementType);
    element.setAttribute("data-component", name);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        if (key === "class") {
          element.className = value;
        } else if (key === "style") {
          element.style.cssText = value;
        } else {
          element.setAttribute(key, value);
        }
      }
    });

    // Add to target
    target.appendChild(element);

    try {
      await ComponentLoader.loadComponent(name, element);

      // Apply accessibility enhancements
      if (App.config.accessibility) {
        if (window.SemanticHelper) {
          SemanticHelper.enhanceElement(element, name);
        }

        App.addMissingAriaLabels(element, name);
        App.addKeyboardNavigation(element, name);
      }

      return element;
    } catch (error) {
      console.error(`Failed to create component "${name}":`, error);
      return element; // Return element with error display
    }
  }

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
    const currentLevel = logLevels.indexOf(App.config.logLevel);
    const messageLevel = logLevels.indexOf(type);

    if (messageLevel <= currentLevel) {
      const style = `color: ${colors[type] || "#000"}; font-weight: bold;`;
      console.log(`%c${icons[type] || ""} ${message}`, style);
    }
  }

  static showFatalError(error) {
    // Create error overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            font-family: sans-serif;
            padding: 20px;
            text-align: center;
        `;

    const content = document.createElement("div");
    content.style.cssText = `
            background: #1a1a1a;
            padding: 2rem;
            border-radius: 8px;
            max-width: 500px;
            border: 2px solid #ef4444;
        `;

    content.innerHTML = `
            <h2 style="color: #ef4444; margin-top: 0;">Application Error</h2>
            <p>Sorry, there was an error initializing the application.</p>
            <div style="
                background: #2a2a2a;
                padding: 1rem;
                border-radius: 4px;
                margin: 1rem 0;
                font-family: monospace;
                font-size: 0.875rem;
                text-align: left;
                overflow: auto;
                max-height: 200px;
            ">
                ${error.message}
            </div>
            <button onclick="location.reload()" style="
                background: #3b82f6;
                color: white;
                border: none;
                padding: 0.75rem 1.5rem;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
            ">
                Reload Page
            </button>
        `;

    overlay.appendChild(content);
    document.body.appendChild(overlay);
  }

  static cleanup() {
    // Remove event listeners
    App.eventListeners.forEach((listeners, target) => {
      listeners.forEach(({ type, handler }) => {
        if (target.removeEventListener) {
          target.removeEventListener(type, handler);
        } else if (target.removeListener) {
          target.removeListener(type, handler);
        }
      });
    });

    App.eventListeners.clear();

    // Clear component cache
    ComponentLoader.components.clear();

    App.log("🧹 Application cleaned up", "info");
  }
}

// Auto-initialize if configured
if (App.config.autoInitialize) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(() => App.init(), 0);
    });
  } else {
    setTimeout(() => App.init(), 0);
  }
}

// Make available globally
window.App = App;

// Export for module systems (if needed)
if (typeof module !== "undefined" && module.exports) {
  module.exports = App;
}
