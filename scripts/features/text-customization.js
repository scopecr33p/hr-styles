class TextCustomizationFeature {
  static init() {
    // Load initial styles from storage and apply them
    this.loadAndApplyStyles();

    // Listen for storage changes
    chrome.storage.local.onChanged.addListener((changes) => {
      if (
        changes.subtitleSize ||
        changes.subtitleWeight ||
        changes.subtitleColor ||
        changes.subtitleAlign ||
        changes.subtitleTransform ||
        changes.textItalic ||
        changes.textUnderline ||
        changes.textStrike ||
        changes.subtitleFont ||
        changes.primaryFont ||
        changes.secondaryFont
      ) {
        this.loadAndApplyStyles();
      }
    });

    return {
      apply: () => this.loadAndApplyStyles(),
    };
  }

  static async loadAndApplyStyles() {
    const result = await chrome.storage.local.get([
      "subtitleSize",
      "subtitleWeight",
      "subtitleColor",
      "subtitleAlign",
      "subtitleTransform",
      "textItalic",
      "textUnderline",
      "textStrike",
      "subtitleFont",
      "primaryFont",
      "secondaryFont",
    ]);

    // Only apply styles if they're explicitly set and not default
    const css = `
      .subtitle {
        ${
          result.subtitleSize
            ? `font-size: ${Math.max(
                8,
                Math.min(parseInt(result.subtitleSize), 64)
              )}px !important;`
            : ""
        }
        ${
          result.subtitleWeight && result.subtitleWeight !== ""
            ? `font-weight: ${result.subtitleWeight} !important;`
            : ""
        }
        ${
          result.subtitleColor
            ? `color: ${result.subtitleColor} !important;`
            : ""
        }
        ${
          typeof result.textItalic === "boolean"
            ? `font-style: ${
                result.textItalic ? "italic" : "normal"
              } !important;`
            : ""
        }
        ${
          result.subtitleAlign
            ? `text-align: ${result.subtitleAlign} !important;`
            : ""
        }
        ${
          result.subtitleTransform
            ? `text-transform: ${result.subtitleTransform} !important;`
            : ""
        }
        ${
          typeof result.textUnderline === "boolean" ||
          typeof result.textStrike === "boolean"
            ? `text-decoration: ${
                [
                  result.textUnderline ? "underline" : "",
                  result.textStrike ? "line-through" : "",
                ]
                  .filter((d) => d)
                  .join(" ") || "none"
              } !important;`
            : ""
        }
        font-family: ${
          result.subtitleFont === "primary" && result.primaryFont
            ? '"HR-primary"'
            : result.subtitleFont === "secondary" && result.secondaryFont
            ? '"HR-secondary"'
            : "inherit"
        } !important;
      }
    `;

    chrome.runtime.sendMessage({
      type: "updateStyles",
      key: "subtitle",
      css: css,
    });
  }
}
