// scripts/features/font-manager.js
class FontManagerFeature {
  static async init() {
    this.setupStorageListener();
    await this.applyFonts();
    return {
      apply: () => this.applyFonts(),
    };
  }

  static setupStorageListener() {
    chrome.storage.onChanged.addListener((changes) => {
      if (changes.primaryFont || changes.secondaryFont) {
        this.applyFonts();
      }
    });
  }

  static async applyFonts() {
    const fonts = await chrome.storage.local.get([
      "primaryFont",
      "secondaryFont",
    ]);

    if (fonts.primaryFont) {
      this.injectFontFace("primary", fonts.primaryFont);
    }
    if (fonts.secondaryFont) {
      this.injectFontFace("secondary", fonts.secondaryFont);
    }
  }

  static injectFontFace(name, fontData) {
    const styleId = `hr-font-${name}`;
    let styleElement = document.getElementById(styleId);

    // Add preload link
    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "font";
    preloadLink.href = fontData;
    preloadLink.crossOrigin = "anonymous";
    document.head.appendChild(preloadLink);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    styleElement.textContent = `
        @font-face {
          font-family: "HR-${name}";
          src: url(${fontData}) format("woff2");
          font-display: swap;
        }
      `;
  }

  static async handleFontUpload(file, type) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (event) => {
        try {
          const fontData = event.target.result;

          // Store both the font data and name
          await chrome.storage.local.set({
            [`${type}Font`]: fontData,
            [`${type}FontName`]: file.name,
          });

          // Apply the font immediately
          this.injectFontFace(type, fontData);

          resolve(fontData);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }
}
