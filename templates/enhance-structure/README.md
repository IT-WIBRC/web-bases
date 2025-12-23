# Component-Based Architecture with CSS Scoping

## 📋 Overview

A vanilla JavaScript solution for creating modular, reusable web components with automatic CSS scope isolation. This system allows you to build web applications using custom HTML components without any build tools or frameworks.

## 🎯 Features

- **Component-based architecture** - Create reusable HTML components
- **Automatic CSS scoping** - Component styles are automatically isolated
- **No build step required** - Works with vanilla HTML/CSS/JS
- **Shadow DOM support** - Optional true CSS encapsulation
- **Development tools** - Hot reload, error handling, dev panel
- **Caching** - Components are cached for performance
- **Error resilience** - Graceful degradation when components fail
- **Accessibility-first** - Built-in semantic HTML and ARIA support
- **CSS Variable Safe** - Preserves CSS custom properties and fallbacks

## 📁 Project Structure

```
project/
├── index.html                    # Main HTML file
├── app.js                        # Main application setup
├── components/                   # All components go here
│   ├── core/                     # Core system files
│   │   ├── CSSParser.js         # CSS parsing and scoping logic (FIXED: CSS variable safe)
│   │   ├── loader.js   # Main component loading system
│   │   ├── devTools.js # Development tools
│   │   ├── AccessibilityRules.js # Rules for accessibility
│   │   └── SemanticHelper.js    # OPTIONAL: Advanced accessibility features
│   ├── header.html              # Header component
│   ├── footer.html              # Footer component
│   ├── alert.html               # Alert component
│   └── ...                       # Other components
└── README.md                    # This documentation
```

## 🚀 Quick Start

### 1. Basic Setup

Include the core files in your HTML:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My App</title>
    <style>
      :root {
        --color-primary: #3b82f6;
        --focus-color: #3b82f6;
      }
    </style>
  </head>
  <body>
    <!-- Components will auto-load here -->
    <!-- Use semantic elements for better accessibility -->
    <header data-component="header" role="banner"></header>

    <main data-component="main" role="main">
      <h1>My App</h1>
      <div
        data-component="alert"
        data-type="info"
        data-message="Welcome!"
        role="alert"
      ></div>
    </main>

    <footer data-component="footer" role="contentinfo"></footer>

    <!-- Load the system (order matters!) -->
    <script src="app.js" type="module"></script>
  </body>
</html>
```

### 2. Create a Component

Create `components/header.html`:

```html
<nav class="site-nav" aria-label="Main navigation">
  <div class="logo">
    <a href="/" aria-label="Home">
      <span class="visually-hidden">Home</span>
      <span aria-hidden="true">🏠</span>
    </a>
  </div>
  <ul class="nav-menu" role="menubar">
    <li role="none">
      <a href="/" role="menuitem" aria-current="page">Home</a>
    </li>
    <li role="none"><a href="/about" role="menuitem">About</a></li>
  </ul>
</nav>

<style>
  /* Styles are automatically scoped to this component */
  /* CSS variables work correctly with fallbacks */
  :host {
    display: block;
    background-color: var(--color-primary, #3b82f6);
  }

  .site-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    color: white;
  }

  .nav-menu {
    display: flex;
    gap: 1rem;
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .nav-menu a {
    color: inherit;
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
  }

  .nav-menu a:hover,
  .nav-menu a:focus {
    background: rgba(255, 255, 255, 0.2);
    outline: 2px solid var(--focus-color, #3b82f6);
  }

  .nav-menu [aria-current="page"] {
    background: rgba(255, 255, 255, 0.3);
    font-weight: bold;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Media queries work automatically */
  @media (max-width: 768px) {
    .site-nav {
      flex-direction: column;
      gap: 1rem;
    }

    .nav-menu {
      flex-wrap: wrap;
      justify-content: center;
    }
  }
</style>

<script>
  // Component-specific JavaScript
  (function () {
    console.log("Header component loaded");

    // Accessibility: Handle keyboard navigation
    const menuItems = document.querySelectorAll('.nav-menu [role="menuitem"]');
    menuItems.forEach((item, index) => {
      item.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") {
          const next = menuItems[index + 1] || menuItems[0];
          next?.focus();
        } else if (e.key === "ArrowLeft") {
          const prev = menuItems[index - 1] || menuItems[menuItems.length - 1];
          prev?.focus();
        }
      });
    });
  })();
</script>
```

### 3. Configuration

Modify `app.js` for your needs:

```javascript
// app.js - Main application configuration
class App {
  static config = {
    development: window.location.hostname === "localhost",
    shadowDOM: false, // Set to true for true CSS isolation
    basePath: "components/",

    // Accessibility features (enabled by default)
    accessibility: true,
    semanticHTML: true,
    autoAriaLabels: true,
    focusManagement: true,
  };

  static async init() {
    // Configure the loader
    ComponentLoader.updateConfig({
      development: App.config.development,
      shadowDOM: App.config.shadowDOM,
      basePath: App.config.basePath,
      retryCount: 2,
      retryDelay: 1000,
    });

    // Initialize dev tools in development
    if (App.config.development) {
      ComponentDevTools.init();
    }

    // Load all components
    await ComponentLoader.init();

    // Apply accessibility enhancements
    if (App.config.accessibility) {
      await App.enhanceAccessibility();
    }

    console.log("✅ App initialized");
  }

  // Basic accessibility enhancements
  static async enhanceAccessibility() {
    const components = document.querySelectorAll("[data-component]");

    components.forEach((element) => {
      const name = element.getAttribute("data-component");
      App.basicSemanticEnhancement(element, name);
    });
  }

  static basicSemanticEnhancement(element, componentName) {
    // Basic role assignments
    const roles = {
      header: "banner",
      footer: "contentinfo",
      main: "main",
      nav: "navigation",
      article: "article",
      aside: "complementary",
      dialog: "dialog",
      alert: "alert",
      status: "status",
    };

    if (roles[componentName] && !element.hasAttribute("role")) {
      element.setAttribute("role", roles[componentName]);
    }

    // Basic ARIA labels
    const labels = {
      header: "Site header",
      footer: "Site footer",
      nav: "Navigation",
      search: "Search",
    };

    if (labels[componentName] && !element.hasAttribute("aria-label")) {
      element.setAttribute("aria-label", labels[componentName]);
    }
  }
}

// Start the app
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => App.init());
} else {
  App.init();
}
```

## 🆕 What's New in the Version

### **FIXED: CSS Variable Support**

The system now correctly handles CSS custom properties:

```css
/* BEFORE (Broken): */
background: var(--color-primary, [data-component-id="..."] #3b82f6);

/* AFTER (Fixed): */
background: var(--color-primary, #3b82f6);
```

### **Enhanced Accessibility**

- Semantic HTML elements preserved (`<header>`, `<footer>`, `<nav>`, etc.)
- Automatic ARIA role assignment
- Keyboard navigation support
- Focus management
- Screen reader friendly

### **Optional SemanticHelper**

The `SemanticHelper.js` file is now **optional**. The system includes basic accessibility features by default. Only create `SemanticHelper.js` if you need advanced semantic HTML conversion.

## 🛠 Core System Architecture

### 1. **CSSParser.js** - CSS Processing Engine

**Role**: Handles all CSS parsing, scoping, and validation

**Key Methods:**

- `scopeCSS(css, scopeSelector)` - Scopes CSS to a specific selector **(FIXED: CSS variable safe)**
- `scopeCSSSafe(css, scopeSelector)` - Safer method that preserves CSS variables
- `fixBrokenCSS(css)` - Repairs incorrectly scoped CSS
- `extractFromHTML(html)` - Extracts CSS from HTML
- `validate(css)` - Validates CSS syntax

**How it works:**

1. Uses browser's built-in CSS parser (CSSOM) when available
2. **NEW**: Tracks `var()` functions to avoid scoping inside them
3. Falls back to manual parsing for compatibility
4. Intelligently scopes selectors while preserving `@rules`
5. Handles `:host` selectors for component styling

### 2. **ComponentLoader.js** - Component Management System ()

**Role**: Loads, caches, and renders components

**Key Methods:**

- `loadComponent(name, element)` - Loads a single component
- `renderComponent(element, html, css, name)` - Renders a component
- `reload(name)` - Reloads a specific component
- `reloadAll()` - Reloads all components

**How it works:**

1. Scans for `[data-component]` elements
2. Fetches component HTML files
3. Extracts and scopes CSS using `CSSParser` **(FIXED: CSS variable safe)**
4. Preserves semantic HTML elements when possible
5. Renders components with isolated styles
6. Caches components for performance

### 3. **ComponentDevTools.js** - Development Utilities

**Role**: Provides development tools and hot reload

**Key Methods:**

- `init()` - Initializes dev tools
- `addDevPanel()` - Adds development panel
- `startHotReload()` - Enables file watching
- `showToast(message, type)` - Shows notification toast

**Features:**

- Visual component list with status
- Reload buttons for individual components
- Hot reload on file changes
- Keyboard shortcuts (Ctrl+Shift+D)
- Error notifications

### 4. **SemanticHelper.js** - OPTIONAL Accessibility Helper

**Role**: Advanced semantic HTML and accessibility features

**Key Methods:**

- `enhanceElement(element, componentName)` - Converts elements to semantic types
- `validateComponent(element, componentName)` - Validates accessibility
- `addMissingAriaLabels(element, componentName)` - Adds missing ARIA labels

**Note**: This file is **optional**. Basic accessibility features are included in `app.js`.

## 🔧 Advanced Usage

### Dynamic Component Creation

```javascript
// Create components dynamically
document.addEventListener("app:ready", async () => {
  // Create a component programmatically
  await App.createComponent("alert", "#container", {
    type: "success",
    message: "Created dynamically!",
    role: "alert",
  });
});
```

### Component with Attributes and Accessibility

```html
<!-- Pass data to components with accessibility -->
<div
  data-component="alert"
  data-type="warning"
  data-message="This is a warning"
  data-dismissible="true"
  role="alert"
  aria-live="assertive"
></div>
```

### Using Semantic Elements in Components

```html
<!-- components/article.html -->
<article class="blog-post">
  <header>
    <h1 id="article-title">Article Title</h1>
    <time datetime="2024-01-15">January 15, 2024</time>
  </header>
  <div class="content">
    <p>Article content here...</p>
  </div>
</article>

<style>
  :host {
    display: block;
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .blog-post {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 2rem;
  }
</style>
```

## ⚙️ Configuration Options

### ComponentLoader Configuration

```javascript
ComponentLoader.updateConfig({
  shadowDOM: false, // Use Shadow DOM for isolation
  development: true, // Enable dev features
  cache: true, // Cache components
  basePath: "components/", // Component directory
  autoInit: true, // Auto-initialize on load
  retryCount: 2, // Retry failed loads
  retryDelay: 1000, // Delay between retries
  preserveAttributes: true, // Preserve original element attributes
  scopeCSS: true, // Enable CSS scoping
  validateCSS: true, // Validate CSS before injection
});
```

### App Configuration (Accessibility)

```javascript
// app.js
static config = {
    // ... other configs

    // Accessibility features
    accessibility: true,           // Enable accessibility enhancements
    semanticHTML: true,            // Use semantic HTML elements
    autoAriaLabels: true,          // Auto-add ARIA labels where missing
    focusManagement: true,         // Manage focus for interactive components
    validateAccessibility: true    // Validate accessibility in dev mode
};
```

## 🎨 CSS Scoping Examples (FIXED)

### Basic Scoping with CSS Variables

```css
/* In component file */
.component {
  color: var(--text-color, #333);
  background: var(--bg-color, #fff);
  border: 1px solid var(--border-color, #ddd);
}

/* Becomes (CSS variables preserved!) */
[data-component-id="component-123"] .component {
  color: var(--text-color, #333);
  background: var(--bg-color, #fff);
  border: 1px solid var(--border-color, #ddd);
}
```

### Using :host Selector

```css
/* Targets the component root */
:host {
  display: block;
  --local-var: red;
}

/* Becomes */
[data-component-id="header-123"] {
  display: block;
  --local-var: red;
}
```

### Complex CSS with Fallbacks

```css
/* Complex CSS with multiple var() functions */
.element {
  background: linear-gradient(
    to bottom,
    var(--gradient-start, #f0f0f0),
    var(--gradient-end, #ffffff)
  );
  box-shadow: 0 2px 4px var(--shadow-color, rgba(0, 0, 0, 0.1));
}

/* All var() functions are preserved correctly */
```

## 🔄 Component Lifecycle

1. **Detection** - System scans for `[data-component]` elements
2. **Semantic Analysis** - Preserves/upgrades semantic elements if enabled
3. **Loading** - Component HTML is fetched from server
4. **Parsing** - CSS is extracted and **safely** scoped
5. **Rendering** - Component is rendered with isolated styles
6. **Accessibility Enhancement** - ARIA attributes added if missing
7. **Caching** - Component is cached for future use
8. **Cleanup** - Styles are removed when component is removed

## 🚨 Error Handling

The system gracefully handles errors:

- **Missing components**: Shows user-friendly error with retry button
- **Network failures**: Automatic retries with exponential backoff
- **Invalid CSS**: Falls back to unscoped CSS with warning
- **CSS Variable Errors**: Automatically detects and fixes broken CSS
- **JavaScript errors**: Isolated to component, doesn't break app
- **Accessibility Issues**: Warnings in development console

## 🏆 Accessibility Features

### Built-in Accessibility

1. **Semantic HTML Preservation**: `<div data-component="header">` becomes `<header>`
2. **ARIA Role Assignment**: Automatic role attributes based on component type
3. **Focus Management**: Keyboard navigation and focus traps
4. **Screen Reader Support**: Proper labeling and announcements
5. **High Contrast Ready**: CSS variables for theme support

### Creating Accessible Components

```html
<!-- Accessible button component -->
<button
  type="button"
  class="btn"
  aria-label="Close dialog"
  aria-expanded="false"
  aria-controls="dialog-content"
>
  <span class="btn-text">Close</span>
  <span class="btn-icon" aria-hidden="true">×</span>
</button>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--btn-bg, #3b82f6);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .btn:focus {
    outline: 2px solid var(--focus-color, #3b82f6);
    outline-offset: 2px;
  }
</style>
```

## 📱 Browser Support

- **Modern browsers**: Full support (Chrome, Firefox, Safari, Edge)
- **CSS Custom Properties**: Full support (IE 11 with limitations)
- **CSSOM support**: Required for accurate CSS parsing (IE 11+)
- **Fallbacks**: Manual parser for older browsers
- **Shadow DOM**: Optional, requires modern browser
- **Accessibility Features**: Works in all modern browsers and screen readers

## 🔍 Debugging

### Console Commands

```javascript
// Check component status
App.getComponentStatus("header");

// Reload a component
ComponentLoader.reload("header");

// Clear cache
ComponentLoader.clearCache();

// Get all components status
App.getAllComponentsStatus();

// Check CSS scoping issues
console.log("CSS needs fix?", CSSParser.needsFix(myCSS));
```

### Development Panel

Press `Ctrl+Shift+D` or click the ⚙️ button to open the dev panel.

## 📝 Best Practices

1. **Semantic HTML**: Use proper elements (`<header>`, `<nav>`, etc.)
2. **CSS Variables**: Use CSS custom properties for theming
3. **Accessibility First**: Add ARIA attributes and keyboard support
4. **Component Structure**: Keep components small and focused
5. **CSS Organization**: Use BEM or similar naming convention
6. **JavaScript Isolation**: Wrap component JS in IIFE
7. **Error Boundaries**: Components should handle their own errors
8. **Performance**: Use caching and lazy loading for large apps

## 🎯 Use Cases

- **Accessible Web Apps**: Build fully accessible applications
- **Design Systems**: Reusable, accessible UI component library
- **Micro-frontends**: Isolated components in large applications
- **Prototyping**: Rapid component-based development
- **Legacy Applications**: Modernize parts of old codebases
- **Static Sites**: Add interactivity without frameworks

## 🔄 Comparison with Frameworks ()

| Feature         | This System                   | React/Vue    | Web Components  |
| --------------- | ----------------------------- | ------------ | --------------- |
| Bundle Size     | ~15KB                         | 100KB+       | Native          |
| Learning Curve  | Low                           | Medium       | Medium          |
| CSS Scoping     | Automatic (CSS variable safe) | CSS-in-JS    | Shadow DOM      |
| Accessibility   | Built-in                      | Manual       | Manual          |
| Build Step      | Not required                  | Required     | Not required    |
| Browser Support | IE11+ (with polyfills)        | IE11+        | Modern browsers |
| Performance     | Excellent                     | Good         | Excellent       |
| CSS Variables   | Full support                  | Full support | Full support    |

## 🚧 Limitations

1. **No Server-Side Rendering**: Components render client-side
2. **CSS Specificity**: Scoped selectors increase specificity
3. **JavaScript Sharing**: No built-in state management
4. **SEO**: Consider server-rendered critical content
5. **IE11**: CSS variables work but some features limited

## 🔮 Future Enhancements

Potential extensions for this system:

1. **Server-Side Rendering**: Pre-render components on server
2. **State Management**: Shared state between components
3. **Build Optimization**: Minify and bundle components
4. **TypeScript Support**: Type definitions for components
5. **Testing Utilities**: Component testing framework
6. **Theme System**: Advanced CSS variable management

## 🤝 Contributing

This is a modular system that can be extended:

1. **Add new CSS features** in `CSSParser.js`
2. **Extend component lifecycle** in `ComponentLoader.js`
3. **Add dev tools** in `ComponentDevTools.js`
4. **Enhance accessibility** in `SemanticHelper.js`
5. **Create plugins** for additional functionality

## 📄 License

MIT - Free to use and modify for any purpose.

## 🆘 Troubleshooting

### Common Issues:

**Components not loading:**

- Check file paths in `basePath` config
- Verify component files exist
- Check browser console for errors

**CSS not scoping correctly:**

- Ensure `CSSParser.js` is loaded before `ComponentLoader.js`
- Check for syntax errors in component CSS
- The system now automatically fixes broken CSS variables

**CSS Variables broken:**

- This issue is now **FIXED** in the CSSParser
- If you see `var(--name,[selector] value)`, update to latest version
- System includes automatic repair for broken CSS

**Accessibility warnings:**

- Use semantic HTML elements (`<header>`, `<footer>`, etc.)
- Add ARIA attributes where needed
- `SemanticHelper.js` is optional - basic features included

**Dev tools not showing:**

- Run on localhost or add `?dev=true` to URL
- Check for JavaScript errors in console
- Ensure `ComponentDevTools.js` is loaded

**Performance issues:**

- Enable caching in configuration
- Reduce component size and complexity
- Consider lazy loading for non-critical components

## 🎉 Getting Help

If you encounter issues:

1. **Check the console** for specific error messages
2. **Enable dev mode** with `?dev=true` in URL
3. **Use ComponentDevTools** for debugging
4. **Verify CSS syntax** - the system validates CSS
5. **Test accessibility** with browser dev tools

---

**Built with ❤️ for developers who want accessible, component-based architecture without framework complexity.**

_Now with fixed CSS variable support and built-in accessibility features!_
