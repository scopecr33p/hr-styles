class TextCustomizationFeature {
  static init() {
    // Load initial styles from storage
    chrome.storage.sync.get(
      [
        "subtitleSize",
        "subtitleWeight",
        "subtitleColor",
        "subtitleAlign",
        "subtitleTransform",
        "textItalic",
        "textUnderline",
        "textStrike",
      ],
      (result) => {
        const validSize = Math.max(6, parseInt(result.subtitleSize) || 12);

        // Construct style and decoration strings based on toggle states
        const style = result.textItalic ? "italic" : "normal";
        const decorations =
          [
            result.textUnderline ? "underline" : "",
            result.textStrike ? "line-through" : "",
          ]
            .filter((d) => d)
            .join(" ") || "none";

        this.updateCustomStyle("subtitle", {
          size: `${validSize}px`,
          weight: result.subtitleWeight || 400,
          color: result.subtitleColor || "#666666",
          style: style,
          align: result.subtitleAlign || "left",
          transform: result.subtitleTransform || "none",
          decoration: decorations,
        });
      }
    );

    // Listen for storage changes
    chrome.storage.sync.onChanged.addListener((changes) => {
      if (
        changes.subtitleSize ||
        changes.subtitleWeight ||
        changes.subtitleColor ||
        changes.subtitleAlign ||
        changes.subtitleTransform ||
        changes.textItalic ||
        changes.textUnderline ||
        changes.textStrike
      ) {
        chrome.storage.sync.get(
          [
            "subtitleSize",
            "subtitleWeight",
            "subtitleColor",
            "subtitleAlign",
            "subtitleTransform",
            "textItalic",
            "textUnderline",
            "textStrike",
          ],
          (result) => {
            const validSize = Math.max(6, parseInt(result.subtitleSize) || 12);

            // Construct style and decoration strings based on toggle states
            const style = result.textItalic ? "italic" : "normal";
            const decorations =
              [
                result.textUnderline ? "underline" : "",
                result.textStrike ? "line-through" : "",
              ]
                .filter((d) => d)
                .join(" ") || "none";

            this.updateCustomStyle("subtitle", {
              size: `${validSize}px`,
              weight: result.subtitleWeight || 400,
              color: result.subtitleColor || "#666666",
              style: style,
              align: result.subtitleAlign || "left",
              transform: result.subtitleTransform || "none",
              decoration: decorations,
            });
          }
        );
      }
    });

    return {
      apply: () => this.updateStyles(),
    };
  }

  static updateCustomStyle(type, values) {
    const css = `
      .subtitle {
        font-size: var(--hr-subtitle-size) !important;
        font-weight: var(--hr-subtitle-weight) !important;
        color: var(--hr-subtitle-color) !important;
        font-style: var(--hr-subtitle-style) !important;
        text-align: var(--hr-subtitle-align) !important;
        text-transform: var(--hr-subtitle-transform) !important;
        text-decoration: var(--hr-subtitle-decoration) !important;
        font-variant-caps: var(--hr-subtitle-transform) !important;
      }
      :root {
        --hr-subtitle-size: ${values.size} !important;
        --hr-subtitle-weight: ${values.weight} !important;
        --hr-subtitle-color: ${values.color} !important;
        --hr-subtitle-style: ${values.style} !important;
        --hr-subtitle-align: ${values.align} !important;
        --hr-subtitle-transform: ${values.transform} !important;
        --hr-subtitle-decoration: ${values.decoration} !important;
      }
    `;

    chrome.runtime.sendMessage({
      type: "updateStyles",
      key: "subtitle",
      css: css,
    });
  }
}
