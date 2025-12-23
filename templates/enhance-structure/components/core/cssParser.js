export class CSSParser {
  /**
   * Parse CSS and scope all selectors with a given scope
   * @param {string} css - The CSS to parse
   * @param {string} scopeSelector - The selector to scope with (e.g., [data-component-id="x"])
   * @returns {string} Scoped CSS
   */
  static scopeCSS(css, scopeSelector) {
    try {
      // Try using browser's CSS parser first (most accurate)
      if (typeof CSSStyleSheet !== "undefined") {
        return CSSParser.scopeWithCSSOM(css, scopeSelector);
      }
    } catch (e) {
      console.warn("CSSOM parsing failed, falling back to manual parser:", e);
    }

    // Fallback to manual parser
    return CSSParser.scopeWithManualParser(css, scopeSelector);
  }

  /**
   * Use browser's built-in CSS parser (most accurate)
   */
  static scopeWithCSSOM(css, scopeSelector) {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(css);

    let result = "";

    for (const rule of sheet.cssRules) {
      result += CSSParser.processRule(rule, scopeSelector) + "\n";
    }

    return result;
  }

  /**
   * Process individual CSS rules
   */
  static processRule(rule, scopeSelector) {
    // Handle different rule types

    // Media queries
    if (rule instanceof CSSMediaRule) {
      return CSSParser.processMediaRule(rule, scopeSelector);
    }

    // Supports queries
    if (rule instanceof CSSSupportsRule) {
      return CSSParser.processSupportsRule(rule, scopeSelector);
    }

    // Keyframes - don't scope
    if (rule instanceof CSSKeyframesRule) {
      return rule.cssText;
    }

    // Font face - don't scope
    if (rule instanceof CSSFontFaceRule) {
      return rule.cssText;
    }

    // Import - don't scope
    if (rule instanceof CSSImportRule) {
      return rule.cssText;
    }

    // Style rules
    if (rule instanceof CSSStyleRule) {
      return CSSParser.processStyleRule(rule, scopeSelector);
    }

    // Container queries
    if (rule instanceof CSSContainerRule) {
      return CSSParser.processContainerRule(rule, scopeSelector);
    }

    // Layer rules
    if (rule instanceof CSSLayerBlockRule) {
      return CSSParser.processLayerRule(rule, scopeSelector);
    }

    // Unknown rule type, return as-is
    return rule.cssText;
  }

  /**
   * Process media queries (scopes rules inside)
   */
  static processMediaRule(rule, scopeSelector) {
    let innerRules = "";

    for (const innerRule of rule.cssRules) {
      innerRules += CSSParser.processRule(innerRule, scopeSelector) + "\n";
    }

    return `@media ${rule.conditionText} {\n${innerRules}}`;
  }

  /**
   * Process @supports rules
   */
  static processSupportsRule(rule, scopeSelector) {
    let innerRules = "";

    for (const innerRule of rule.cssRules) {
      innerRules += CSSParser.processRule(innerRule, scopeSelector) + "\n";
    }

    return `@supports ${rule.conditionText} {\n${innerRules}}`;
  }

  /**
   * Process container queries
   */
  static processContainerRule(rule, scopeSelector) {
    let innerRules = "";

    for (const innerRule of rule.cssRules) {
      innerRules += CSSParser.processRule(innerRule, scopeSelector) + "\n";
    }

    return `@container ${rule.conditionText} {\n${innerRules}}`;
  }

  /**
   * Process layer rules
   */
  static processLayerRule(rule, scopeSelector) {
    let innerRules = "";

    for (const innerRule of rule.cssRules) {
      innerRules += CSSParser.processRule(innerRule, scopeSelector) + "\n";
    }

    return `@layer ${rule.name} {\n${innerRules}}`;
  }

  /**
   * Process regular style rules
   */
  static processStyleRule(rule, scopeSelector) {
    const selectors = rule.selectorText;
    const scopedSelectors = CSSParser.scopeSelectors(selectors, scopeSelector);

    // Get styles
    let styles = "";
    for (let i = 0; i < rule.style.length; i++) {
      const property = rule.style[i];
      const value = rule.style.getPropertyValue(property);
      const priority = rule.style.getPropertyPriority(property);
      styles += `  ${property}: ${value}${priority ? " !" + priority : ""};\n`;
    }

    return `${scopedSelectors} {\n${styles}}`;
  }

  /**
   * Manual CSS parser for browsers without CSSOM support
   * FIXED: Now properly handles CSS variables and fallback values
   */
  static scopeWithManualParser(css, scopeSelector) {
    // Parse CSS into rules
    const rules = CSSParser.parseRules(css);
    let result = "";

    for (const rule of rules) {
      result += CSSParser.scopeRule(rule, scopeSelector) + "\n";
    }

    return result;
  }

  /**
   * Parse CSS into individual rules (FIXED VERSION)
   */
  static parseRules(css) {
    const rules = [];
    let currentRule = "";
    let depth = 0;
    let inString = false;
    let stringChar = "";
    let inComment = false;
    let inVarFunction = false; // Track if we're inside var()
    let parenDepth = 0; // Track parentheses depth for functions

    for (let i = 0; i < css.length; i++) {
      const char = css[i];
      const nextChar = css[i + 1] || "";

      // Handle strings
      if (!inComment && (char === '"' || char === "'")) {
        if (!inString) {
          inString = true;
          stringChar = char;
        } else if (stringChar === char && css[i - 1] !== "\\") {
          inString = false;
        }
      }

      // Handle block comments
      if (!inString && char === "/" && nextChar === "*") {
        inComment = true;
        i++;
        continue;
      }

      if (inComment && char === "*" && nextChar === "/") {
        inComment = false;
        i++;
        continue;
      }

      if (inComment) {
        continue;
      }

      // Handle single-line comments
      if (!inString && char === "/" && nextChar === "/") {
        // Skip to end of line
        while (i < css.length && css[i] !== "\n") {
          i++;
        }
        continue;
      }

      // Track var() functions to avoid scoping inside them
      if (!inString) {
        if (char === "v" && css.substr(i, 4) === "var(") {
          inVarFunction = true;
        }

        if (inVarFunction) {
          if (char === "(") {
            parenDepth++;
          } else if (char === ")") {
            parenDepth--;
            if (parenDepth === 0) {
              inVarFunction = false;
            }
          }
        }
      }

      currentRule += char;

      // Track braces for rule boundaries (but not inside var() functions)
      if (char === "{" && !inString && !inVarFunction) {
        depth++;
      } else if (char === "}" && !inString && !inVarFunction) {
        depth--;
        if (depth === 0) {
          rules.push(currentRule.trim());
          currentRule = "";
        }
      }
    }

    // Add any remaining content
    if (currentRule.trim()) {
      rules.push(currentRule.trim());
    }

    return rules;
  }

  /**
   * Scope a single CSS rule (FIXED: Now preserves CSS variables)
   */
  static scopeRule(rule, scopeSelector) {
    // Find the first opening brace
    const firstBrace = rule.indexOf("{");

    if (firstBrace === -1) {
      return rule; // Not a valid rule
    }

    const beforeBrace = rule.substring(0, firstBrace).trim();
    const afterBrace = rule.substring(firstBrace);

    // Check if it's an @rule
    if (beforeBrace.startsWith("@")) {
      return CSSParser.scopeAtRule(
        rule,
        beforeBrace,
        afterBrace,
        scopeSelector
      );
    }

    // Regular style rule - scope selectors but preserve content
    const scopedSelectors = CSSParser.scopeSelectors(
      beforeBrace,
      scopeSelector
    );

    // Return with original content (don't modify property values)
    return scopedSelectors + afterBrace;
  }

  /**
   * Handle @rules (media, keyframes, etc.)
   */
  static scopeAtRule(rule, beforeBrace, afterBrace, scopeSelector) {
    // Don't scope these @rules
    const nonScopedAtRules = [
      "@keyframes",
      "@-webkit-keyframes",
      "@-moz-keyframes",
      "@font-face",
      "@import",
      "@charset",
      "@namespace",
    ];

    for (const nonScoped of nonScopedAtRules) {
      if (beforeBrace.startsWith(nonScoped)) {
        return rule; // Return as-is
      }
    }

    // For media queries and supports, we need to scope the inner rules
    if (
      beforeBrace.startsWith("@media") ||
      beforeBrace.startsWith("@supports") ||
      beforeBrace.startsWith("@container") ||
      beforeBrace.startsWith("@layer")
    ) {
      // Extract inner rules and scope them
      const innerStart = afterBrace.indexOf("{") + 1;
      const innerEnd = afterBrace.lastIndexOf("}");

      if (innerStart >= innerEnd) {
        return rule; // Invalid rule
      }

      const innerCSS = afterBrace.substring(innerStart, innerEnd);

      // Parse and scope inner rules
      const scopedInner = CSSParser.scopeWithManualParser(
        innerCSS,
        scopeSelector
      );

      return `${beforeBrace} {${scopedInner}}`;
    }

    // For unknown @rules, return as-is
    return rule;
  }

  /**
   * Scope a list of selectors (FIXED: More accurate selector scoping)
   */
  static scopeSelectors(selectors, scopeSelector) {
    return selectors
      .split(",")
      .map((selector) => {
        const trimmed = selector.trim();

        // Don't scope @rules
        if (trimmed.startsWith("@")) {
          return trimmed;
        }

        // Special cases that shouldn't be scoped
        if (trimmed === "html" || trimmed === ":root" || trimmed === "body") {
          return trimmed;
        }

        // Handle :host selector
        if (trimmed.startsWith(":host")) {
          return CSSParser.handleHostSelector(trimmed, scopeSelector);
        }

        // Handle pseudo-elements and pseudo-classes that shouldn't be prefixed
        const pseudoMatch = trimmed.match(
          /^([a-zA-Z-]*)(::?[a-zA-Z-]+(\([^)]*\))?)$/
        );
        if (pseudoMatch) {
          const [, base, pseudo] = pseudoMatch;
          if (base === "host" || base === "") {
            return scopeSelector + pseudo;
          }
          return `${scopeSelector} ${base}${pseudo}`;
        }

        // Don't scope CSS custom property definitions
        if (trimmed.match(/^--[a-zA-Z-]+$/)) {
          return trimmed;
        }

        // Scope regular selectors
        return `${scopeSelector} ${trimmed}`;
      })
      .join(", ");
  }

  /**
   * Handle :host selectors
   */
  static handleHostSelector(selector, scopeSelector) {
    // :host -> scopeSelector
    if (selector === ":host") {
      return scopeSelector;
    }

    // :host(.class) -> scopeSelector.class
    const hostWithClass = selector.match(/^:host\(([^)]+)\)$/);
    if (hostWithClass) {
      return scopeSelector + hostWithClass[1];
    }

    // :host(.class):hover -> scopeSelector.class:hover
    const hostWithClassAndPseudo = selector.match(
      /^:host\(([^)]+)\)(::?[a-zA-Z-]+(\([^)]*\))?)$/
    );
    if (hostWithClassAndPseudo) {
      const [, className, pseudo] = hostWithClassAndPseudo;
      return scopeSelector + className + pseudo;
    }

    // :host:hover -> scopeSelector:hover
    const hostWithPseudo = selector.match(/^:host(::?[a-zA-Z-]+(\([^)]*\))?)$/);
    if (hostWithPseudo) {
      const [, pseudo] = hostWithPseudo;
      return scopeSelector + pseudo;
    }

    // Default fallback
    return selector.replace(":host", scopeSelector);
  }

  /**
   * NEW: Safe scoping method that won't break CSS variables
   */
  static scopeCSSSafe(css, scopeSelector) {
    // Use a simpler, safer approach for scoping
    // This method wraps the entire component content in a scoped div
    // and only prefixes selectors that aren't inside var() functions

    const lines = css.split("\n");
    let result = "";
    let inRule = false;
    let currentSelectors = "";

    for (let line of lines) {
      const trimmed = line.trim();

      // Skip empty lines
      if (!trimmed) {
        result += line + "\n";
        continue;
      }

      // Check if line starts a new rule
      if (trimmed.includes("{") && !trimmed.includes("}")) {
        // Start of a rule
        inRule = true;
        currentSelectors = trimmed.substring(0, trimmed.indexOf("{")).trim();

        // Scope the selectors
        const scopedSelectors = CSSParser.scopeSelectorsSafe(
          currentSelectors,
          scopeSelector
        );

        result +=
          scopedSelectors +
          " {" +
          trimmed.substring(trimmed.indexOf("{") + 1) +
          "\n";
      } else if (trimmed.includes("}") && !trimmed.includes("{")) {
        // End of a rule
        inRule = false;
        result += line + "\n";
      } else if (inRule) {
        // Inside a rule - preserve content as-is (especially var() functions)
        result += line + "\n";
      } else {
        // Outside any rule (could be @rules, comments, etc.)
        // Don't modify @rules
        if (
          trimmed.startsWith("@media") ||
          trimmed.startsWith("@supports") ||
          trimmed.startsWith("@keyframes") ||
          trimmed.startsWith("@font-face")
        ) {
          result += line + "\n";
        } else {
          result += line + "\n";
        }
      }
    }

    return result;
  }

  /**
   * NEW: Safer selector scoping that preserves CSS variables
   */
  static scopeSelectorsSafe(selectors, scopeSelector) {
    return selectors
      .split(",")
      .map((selector) => {
        const trimmed = selector.trim();

        // Don't touch CSS variables
        if (trimmed.startsWith("--")) {
          return trimmed;
        }

        // Don't scope @rules
        if (trimmed.startsWith("@")) {
          return trimmed;
        }

        // Don't scope html, :root, body
        if (trimmed === "html" || trimmed === ":root" || trimmed === "body") {
          return trimmed;
        }

        // Handle :host
        if (trimmed.startsWith(":host")) {
          return trimmed.replace(":host", scopeSelector);
        }

        // Scope everything else
        return `${scopeSelector} ${trimmed}`;
      })
      .join(", ");
  }

  /**
   * Extract CSS from HTML string
   */
  static extractFromHTML(html) {
    const styleRegex = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;
    let css = "";
    let match;

    while ((match = styleRegex.exec(html)) !== null) {
      css += match[1].trim() + "\n";
    }

    return css.trim();
  }

  /**
   * Remove CSS from HTML string
   */
  static removeFromHTML(html) {
    return html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "");
  }

  /**
   * Validate CSS (basic validation)
   */
  static validate(css) {
    try {
      // Try to parse with CSSOM if available
      if (typeof CSSStyleSheet !== "undefined") {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        return true;
      }

      // Basic bracket matching validation
      let braces = 0;
      let inString = false;
      let stringChar = "";

      for (let i = 0; i < css.length; i++) {
        const char = css[i];

        // Handle strings
        if (char === '"' || char === "'") {
          if (!inString) {
            inString = true;
            stringChar = char;
          } else if (stringChar === char && css[i - 1] !== "\\") {
            inString = false;
          }
        }

        if (!inString) {
          if (char === "{") braces++;
          if (char === "}") braces--;

          // More closing braces than opening
          if (braces < 0) {
            throw new Error("Unmatched closing brace");
          }
        }
      }

      if (braces !== 0) {
        throw new Error("Unmatched braces");
      }

      return true;
    } catch (error) {
      console.error("CSS validation failed:", error);
      return false;
    }
  }

  /**
   * NEW: Fix already broken CSS (repair scoping issues)
   */
  static fixBrokenCSS(css) {
    // Fix: var(--color-primary,[data-component-id="..."] #3b82f6)
    // Should be: var(--color-primary, #3b82f6)

    // Pattern: var(--name,[selector] value)
    const brokenVarPattern = /var\((--[a-zA-Z-]+),\s*(\[[^\]]+\]\s*[^),]+)\)/g;

    // Replace with: var(--name, value)
    return css.replace(brokenVarPattern, (match, varName, brokenValue) => {
      // Extract just the value part (after the selector)
      const valueMatch = brokenValue.match(/\]\s*(.+)$/);
      const cleanValue = valueMatch ? valueMatch[1] : brokenValue;

      return `var(${varName}, ${cleanValue})`;
    });
  }

  /**
   * NEW: Check if CSS needs fixing
   */
  static needsFix(css) {
    const brokenPattern = /var\(--[a-zA-Z-]+,\s*\[[^\]]+\]\s*[^),]+\)/;
    return brokenPattern.test(css);
  }
}
