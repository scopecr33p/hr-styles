class TextElement {
  constructor(name, config) {
    this.name = name;
    this.selector = config.selector;
    this.defaults = config.defaults;
  }

  getStyleProperties() {
    return [
      "size",
      "weight",
      "color",
      "align",
      "transform",
      "font",
      "italic",
      "underline",
      "strike",
    ];
  }

  generateStorageKey(property) {
    return `${this.name}${property.charAt(0).toUpperCase()}${property.slice(
      1
    )}`;
  }

  generateCSS(styles) {
    let css = "";

    if (styles.size) {
      css += `font-size: ${styles.size}px !important;`;
    }
    if (styles.weight) {
      css += `font-weight: ${styles.weight} !important;`;
    }
    if (styles.color) {
      css += `color: ${styles.color} !important;`;
    }
    if (styles.align) {
      css += `text-align: ${styles.align} !important;`;
    }
    if (styles.transform) {
      css += `text-transform: ${styles.transform} !important;`;
    }
    if (styles.font) {
      css += `font-family: "HR-${styles.font}" !important;`;
    }

    // Handle style toggles with explicit normal states
    css += `font-style: ${styles.italic ? "italic" : "normal"} !important;`;

    // Handle text decoration combinations
    let textDecoration = [];
    if (styles.underline) textDecoration.push("underline");
    if (styles.strike) textDecoration.push("line-through");

    // Always set text-decoration to ensure styles are removed when toggled off
    css += `text-decoration: ${
      textDecoration.length ? textDecoration.join(" ") : "none"
    } !important;`;

    return css;
  }

  getDefaults() {
    return this.defaults;
  }
}

// Make available globally
window.TextElement = TextElement;
