class TextCustomizationFeature {
  static elements = new Map();

  static async init() {
    await this.loadConfig();
    await this.loadAndApplyStyles();

    chrome.storage.local.onChanged.addListener((changes) => {
      const relevantChange = Object.keys(changes).some((key) =>
        Array.from(this.elements.values()).some((element) =>
          key.startsWith(element.name)
        )
      );

      if (relevantChange) {
        this.loadAndApplyStyles();
      }
    });

    return {
      apply: () => this.loadAndApplyStyles(),
    };
  }

  static async loadConfig() {
    const response = await fetch(
      chrome.runtime.getURL("scripts/features-config.json")
    );
    const config = await response.json();
    const textConfig = config.features.find(
      (f) => f.name === "textCustomization"
    );

    for (const [name, elementConfig] of Object.entries(
      textConfig.textElements
    )) {
      this.elements.set(name, new TextElement(name, elementConfig));
    }
  }

  static async loadAndApplyStyles() {
    const storageKeys = [];
    this.elements.forEach((element) => {
      element.getStyleProperties().forEach((prop) => {
        storageKeys.push(element.generateStorageKey(prop));
      });
    });

    const result = await chrome.storage.local.get(storageKeys);
    let css = "";

    this.elements.forEach((element) => {
      const styles = {};
      element.getStyleProperties().forEach((prop) => {
        const value = result[element.generateStorageKey(prop)];
        if (value !== undefined) styles[prop] = value;
      });

      css += `${element.selector} { ${element.generateCSS(styles)} }`;
    });

    chrome.runtime.sendMessage({
      type: "updateStyles",
      key: "headings",
      css: css,
    });
  }
}
