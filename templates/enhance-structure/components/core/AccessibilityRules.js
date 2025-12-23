export class AccessibilityRules {
  static rules = {
    img: {
      requires: ["alt"],
      message: "Images must have alt text",
      severity: "error",
    },
    a: {
      requiresText: true,
      message: "Links must have accessible text",
      severity: "error",
    },
    button: {
      requiresText: true,
      requiresType: true,
      message: "Buttons must have text and type attribute",
      severity: "error",
    },
    input: {
      requiresLabel: true,
      message: "Inputs must be associated with a label",
      severity: "error",
    },
    '[role="button"]': {
      requiresKeyboard: true,
      message: "Custom buttons must be keyboard accessible",
      severity: "warning",
    },
    "[aria-expanded]": {
      requiresControls: true,
      message: "aria-expanded must have aria-controls",
      severity: "warning",
    },
  };

  static validateComponent(element) {
    const issues = [];

    Object.entries(AccessibilityRules.rules).forEach(([selector, rule]) => {
      const matches = element.querySelectorAll(selector);

      matches.forEach((match) => {
        if (rule.requires) {
          rule.requires.forEach((attr) => {
            if (!match.hasAttribute(attr)) {
              issues.push({
                element: match,
                rule,
                message: rule.message,
              });
            }
          });
        }

        if (
          rule.requiresText &&
          !match.textContent.trim() &&
          !match.hasAttribute("aria-label")
        ) {
          issues.push({
            element: match,
            rule,
            message: rule.message,
          });
        }

        if (rule.requiresLabel && match.matches("input, select, textarea")) {
          const id = match.id;
          if (!id || !document.querySelector(`label[for="${id}"]`)) {
            const parentLabel = match.closest("label");
            if (!parentLabel) {
              issues.push({
                element: match,
                rule,
                message: rule.message,
              });
            }
          }
        }
      });
    });

    return issues;
  }
}
