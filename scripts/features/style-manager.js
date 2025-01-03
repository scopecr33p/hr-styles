class StyleCustomizationFeature {
  static init() {
    // Load initial styles from storage
    chrome.storage.sync.get(["navBackgroundRgba", "inputBackgroundRgba"], (result) => {
      if (result.navBackgroundRgba) {
        this.updateCustomStyle("nav", result.navBackgroundRgba);
      }
      if (result.inputBackgroundRgba) {
        this.updateCustomStyle("input", result.inputBackgroundRgba);
      }
    });

    // Listen for storage changes
    chrome.storage.sync.onChanged.addListener((changes) => {
      if (changes.navBackgroundRgba) {
        this.updateCustomStyle("nav", changes.navBackgroundRgba.newValue);
      }
      if (changes.inputBackgroundRgba) {
        this.updateCustomStyle("input", changes.inputBackgroundRgba.newValue);
      }
    });

    return {
      apply: () => this.updateStyles(),
    };
  }

  static updateCustomStyle(type, value) {
    const css = `:root { --hr-${type}-background: ${value} !important; }`;
    chrome.runtime.sendMessage({
      type: "updateStyles",
      key: type,
      css: css
    });
  }
}
