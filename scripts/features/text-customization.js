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
        changes.h1Size ||
        changes.h1Weight ||
        changes.h1Color ||
        changes.h1Align ||
        changes.h1Transform ||
        changes.h1Font ||
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
      "h1Size",
      "h1Weight",
      "h1Color",
      "h1Align",
      "h1Transform",
      "h1Font",
      "h1Italic",
      "h1Underline",
      "h1Strike",
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
      
      h1 {
        ${
          result.h1Size
            ? `font-size: ${Math.max(
                8,
                Math.min(parseInt(result.h1Size), 64)
              )}px !important;`
            : ""
        }
        ${
          result.h1Weight && result.h1Weight !== ""
            ? `font-weight: ${result.h1Weight} !important;`
            : ""
        }
        ${result.h1Color ? `color: ${result.h1Color} !important;` : ""}
        ${result.h1Align ? `text-align: ${result.h1Align} !important;` : ""}
        ${
          result.h1Transform
            ? `text-transform: ${result.h1Transform} !important;`
            : ""
        }
        ${
          typeof result.h1Italic === "boolean"
            ? `font-style: ${result.h1Italic ? "italic" : "normal"} !important;`
            : ""
        }
        ${
          typeof result.h1Underline === "boolean" ||
          typeof result.h1Strike === "boolean"
            ? `text-decoration: ${
                [
                  result.h1Underline ? "underline" : "",
                  result.h1Strike ? "line-through" : "",
                ]
                  .filter((d) => d)
                  .join(" ") || "none"
              } !important;`
            : ""
        }
        font-family: ${
          result.h1Font === "primary" && result.primaryFont
            ? '"HR-primary"'
            : result.h1Font === "secondary" && result.secondaryFont
            ? '"HR-secondary"'
            : "inherit"
        } !important;
      }
    `;

    chrome.runtime.sendMessage({
      type: "updateStyles",
      key: "headings",
      css: css,
    });
  }
}
