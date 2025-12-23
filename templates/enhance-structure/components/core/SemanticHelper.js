export class SemanticHelper {
  // Basic semantic element mapping
  static componentMap = {
    header: {
      element: "header",
      defaultRole: "banner",
    },
    footer: {
      element: "footer",
      defaultRole: "contentinfo",
    },
    main: {
      element: "main",
      defaultRole: "main",
    },
    nav: {
      element: "nav",
      defaultRole: "navigation",
    },
    article: {
      element: "article",
      defaultRole: "article",
    },
    section: {
      element: "section",
    },
    aside: {
      element: "aside",
      defaultRole: "complementary",
    },
    form: {
      element: "form",
    },
    dialog: {
      element: "dialog",
      defaultRole: "dialog",
    },
  };

  /**
   * Enhance an element with semantic attributes
   */
  static enhanceElement(element, componentName) {
    const config = SemanticHelper.componentMap[componentName];
    if (!config) return element;

    // Check if we should change the element type
    const currentTag = element.tagName.toLowerCase();
    const shouldChangeElement =
      config.element !== currentTag &&
      config.element !== "div" &&
      config.element !== "span";

    if (shouldChangeElement) {
      try {
        // Create new semantic element
        const newElement = document.createElement(config.element);

        // Copy all attributes
        Array.from(element.attributes).forEach((attr) => {
          newElement.setAttribute(attr.name, attr.value);
        });

        // Copy content
        newElement.innerHTML = element.innerHTML;

        // Replace in DOM
        if (element.parentNode) {
          element.parentNode.replaceChild(newElement, element);
          element = newElement;
        }
      } catch (error) {
        console.warn(`Could not convert element to ${config.element}:`, error);
      }
    }

    // Add default role if missing
    if (config.defaultRole && !element.hasAttribute("role")) {
      element.setAttribute("role", config.defaultRole);
    }

    // Add aria-label for common components if missing
    SemanticHelper.addMissingAriaLabels(element, componentName);

    return element;
  }

  /**
   * Add missing ARIA labels
   */
  static addMissingAriaLabels(element, componentName) {
    if (
      element.hasAttribute("aria-label") ||
      element.hasAttribute("aria-labelledby")
    ) {
      return;
    }

    let ariaLabel = "";

    switch (componentName) {
      case "header":
        ariaLabel = "Site header";
        break;
      case "footer":
        ariaLabel = "Site footer";
        break;
      case "nav":
        const navHeading = element.querySelector("h1, h2, h3, h4, h5, h6");
        if (navHeading && navHeading.textContent.trim()) {
          element.setAttribute(
            "aria-labelledby",
            navHeading.id || SemanticHelper.generateId(navHeading)
          );
        } else {
          ariaLabel = "Navigation";
        }
        break;
      case "main":
        const mainHeading = element.querySelector("h1");
        if (mainHeading && mainHeading.id) {
          element.setAttribute("aria-labelledby", mainHeading.id);
        }
        break;
      case "search":
        ariaLabel = "Search";
        break;
    }

    if (ariaLabel && !element.hasAttribute("aria-label")) {
      element.setAttribute("aria-label", ariaLabel);
    }
  }

  /**
   * Generate an ID for an element if it doesn't have one
   */
  static generateId(element) {
    if (element.id) return element.id;

    const text = element.textContent
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 30);

    const id = text || "element";
    let uniqueId = id;
    let counter = 1;

    while (document.getElementById(uniqueId)) {
      uniqueId = `${id}-${counter}`;
      counter++;
    }

    element.id = uniqueId;
    return uniqueId;
  }

  /**
   * Validate component for accessibility
   */
  static validateComponent(element, componentName) {
    const issues = [];

    // Check images for alt text
    const images = element.querySelectorAll("img:not([alt])");
    images.forEach((img) => {
      // Check if image is decorative
      const parent = img.parentElement;
      const isDecorative =
        parent &&
        (parent.tagName === "BUTTON" ||
          (parent.tagName === "A" && parent.textContent.trim()) ||
          img.getAttribute("role") === "presentation" ||
          img.getAttribute("aria-hidden") === "true");

      if (!isDecorative) {
        issues.push("Image missing alt attribute");
      }
    });

    // Check form controls
    const formControls = element.querySelectorAll(
      'input:not([type="hidden"]), select, textarea'
    );
    formControls.forEach((control) => {
      if (!control.id && !control.closest("label")) {
        issues.push("Form control not associated with a label");
      }
    });

    // Check interactive elements
    const interactive = element.querySelectorAll(
      "a[href]:not([aria-label]), button:not([aria-label])"
    );
    interactive.forEach((el) => {
      if (!el.textContent.trim() && !el.querySelector("img[alt]")) {
        issues.push("Interactive element missing accessible text");
      }
    });

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

// Auto-initialize helper functions
if (typeof window !== "undefined") {
  window.SemanticHelper = SemanticHelper;
}
