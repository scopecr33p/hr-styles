class StyleCustomizationFeature {
  static init() {
    // Load initial styles from storage
    chrome.storage.sync.get(
      [
        "navBackgroundRgba",
        "inputBackgroundRgba",
        "topNavBackgroundRgba",
        "navBackgroundRgba",
        "inputBackgroundRgba",
        "topNavBackgroundRgba",
        "inputBorderRadius",
        "hideNavIcons",
      ],
      (result) => {
        if (result.navBackgroundRgba) {
          this.updateCustomStyle("nav", result.navBackgroundRgba);
        }
        if (result.inputBackgroundRgba) {
          this.updateCustomStyle("input", result.inputBackgroundRgba);
        }
        if (result.inputBorderRadius) {
          this.updateCustomStyle(
            "inputBorder",
            `${result.inputBorderRadius}px`
          );
        }
        if (result.topNavBackgroundRgba) {
          this.updateCustomStyle("topNav", result.topNavBackgroundRgba);
        }
        if (result.hideNavIcons) {
          this.updateCustomStyle("navIcons", "none");
        }
      }
    );

    // Listen for storage changes
    chrome.storage.sync.onChanged.addListener((changes) => {
      if (changes.inputBorderRadius) {
        this.updateCustomStyle(
          "inputBorder",
          `${changes.inputBorderRadius.newValue}px`
        );
      }
      if (changes.navBackgroundRgba) {
        this.updateCustomStyle("nav", changes.navBackgroundRgba.newValue);
      }
      if (changes.inputBackgroundRgba) {
        this.updateCustomStyle("input", changes.inputBackgroundRgba.newValue);
      }
      if (changes.topNavBackgroundRgba) {
        this.updateCustomStyle("topNav", changes.topNavBackgroundRgba.newValue);
      }
      if (changes.topNavIconsGrayscale) {
        this.updateCustomStyle(
          "topNavIcons",
          changes.topNavIconsGrayscale.newValue ? "grayscale(100%)" : "none"
        );
      }
      if (changes.hideNavIcons) {
        this.updateCustomStyle(
          "navIcons",
          changes.hideNavIcons.newValue ? "none" : ""
        );
      }
    });

    return {
      apply: () => this.updateStyles(),
    };
  }

  static updateCustomStyle(type, value) {
    let css;
    if (type === "inputBorder") {
      css = `
        html body input:not([type="hidden"]):not([name="edit_name"]),
        html body textarea,
        html body select {
          border-radius: ${value} !important;
        }
      `;
    } else if (type === "topNavIcons") {
      css = `img.icon24, .header-menu img[class*='icon'] { 
        filter: ${value} !important;
        -webkit-filter: ${value} !important;
      }`;
    } else if (type === "navIcons") {
      css = `
        html body .side-nav .fa-solid,
        html body .side-nav .fas,
        html body .leftnav.hide-xs .fa-solid,
        html body .leftnav.hide-xs .fas,
        body#currency-exchange div.container .leftnav.hide-xs .fa-solid,
        body#currency-exchange div.container .leftnav.hide-xs .fas,
        body#forum div.container .leftnav.hide-xs .fa-solid,
        body#forum div.container .leftnav.hide-xs .fas,
        body#inventory div.container .leftnav.hide-xs .fa-solid,
        body#inventory div.container .leftnav.hide-xs .fas,
        body#foundation-breeder div.container .leftnav.hide-xs .fa-solid,
        body#foundation-breeder div.container .leftnav.hide-xs .fas,
        body#equistore div.container .leftnav.hide-xs .fa-solid,
        body#equistore div.container .leftnav.hide-xs .fas,
        body#wildlife-park div.container .leftnav.hide-xs .fa-solid,
        body#wildlife-park div.container .leftnav.hide-xs .fas,
        body#search div.container .leftnav.hide-xs .fa-solid,
        body#search div.container .leftnav.hide-xs .fas,
        body#horses.background .leftnav.hide-xs .fa-solid,
        body#horses.background .leftnav.hide-xs .fas {
          display: ${value === "none" ? "none" : "inline-block"} !important;
        }
      `;
    } else {
      css = `:root { --hr-${type}-background: ${value} !important; }`;
    }

    chrome.runtime.sendMessage({
      type: "updateStyles",
      key: type,
      css: css,
    });
  }

  static updateStyles() {
    chrome.storage.sync.get(
      [
        "navBackgroundRgba",
        "inputBackgroundRgba",
        "topNavBackgroundRgba",
        "inputBorderRadius",
      ],
      (result) => {
        if (result.navBackgroundRgba) {
          this.updateCustomStyle("nav", result.navBackgroundRgba);
        }
        if (result.inputBackgroundRgba) {
          this.updateCustomStyle("input", result.inputBackgroundRgba);
        }
        if (result.inputBorderRadius) {
          this.updateCustomStyle(
            "inputBorder",
            `${result.inputBorderRadius}px`
          );
        }
        if (result.topNavBackgroundRgba) {
          this.updateCustomStyle("topNav", result.topNavBackgroundRgba);
        }
      }
    );
  }

  static getStyleConfig() {
    return chrome.runtime
      .getURL("scripts/features-config.json")
      .then((response) => response.json())
      .then((config) =>
        config.features.find((f) => f.name === "styleCustomization")
      );
  }
}
