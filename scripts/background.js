// Cache for compiled styles
let styleCache = {
  base: null,
  custom: {},
  features: {},
};

// Cache for fonts
let fontCache = new Map();

// Compile all styles from config
async function compileStyles() {
  const response = await fetch(
    chrome.runtime.getURL("scripts/features-config.json")
  );
  const config = await response.json();

  // Compile base styles
  let baseCSS = "";
  const styleFeature = config.features.find(
    (f) => f.name === "styleCustomization"
  );

  // Root variables
  baseCSS += ":root {";
  Object.entries(styleFeature.variables).forEach(([key, value]) => {
    baseCSS += `${key}:${value};`;
  });
  baseCSS += "}";

  // Selector styles
  Object.entries(styleFeature.styles).forEach(([group, selectors]) => {
    baseCSS += `${selectors.join(",")} {`;
    const properties = Object.keys(styleFeature.variables)
      .filter((key) => key.includes(group))
      .map((varName) => {
        const prop = varName
          .replace(`--hr-${group}-`, "")
          .replace(/([A-Z])/g, "-$1")
          .toLowerCase();
        return `${prop}:var(${varName}) !important;`;
      });
    baseCSS += properties.join("");
    baseCSS += "}";
  });

  styleCache.base = baseCSS;
  return styleCache;
}

// Inject styles into tab
async function injectStyles(tabId) {
  try {
    // Ensure fonts are cached
    await cacheFonts();

    // Inject font styles first
    if (fontCache.size > 0) {
      const fontStyles = Array.from(fontCache.entries())
        .map(
          ([name, data]) => `
          @font-face {
            font-family: "HR-${name}";
            src: url(${data}) format("woff2");
            font-display: swap;
          }
        `
        )
        .join("\n");

      await chrome.scripting.insertCSS({
        target: { tabId },
        css: fontStyles,
      });
    }

    // Ensure base styles are compiled
    if (!styleCache.base) {
      await compileStyles();
    }

    // Inject base styles
    await chrome.scripting.insertCSS({
      target: { tabId },
      css: styleCache.base,
    });

    // Inject any cached custom styles
    Object.values(styleCache.custom).forEach(async (css) => {
      await chrome.scripting.insertCSS({
        target: { tabId },
        css,
      });
    });
  } catch (error) {
    console.error("Style injection failed:", error);
  }
}

// Update custom styles
function updateCustomStyle(key, css) {
  styleCache.custom[key] = css;
  // Update all HR tabs
  chrome.tabs.query({ url: "*://*.horsereality.com/*" }, (tabs) => {
    tabs.forEach((tab) => injectStyles(tab.id));
  });
}

// Listen for style update messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "updateStyles") {
    updateCustomStyle(message.key, message.css);
    sendResponse({ success: true });
  }
  return true;
});

// Initial style injection for new tabs
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "loading" &&
    tab.url?.match(/^https?:\/\/.*?horsereality\.com/)
  ) {
    injectStyles(tabId);
  }
});

async function cacheFonts() {
  const fonts = await chrome.storage.local.get([
    "primaryFont",
    "secondaryFont",
  ]);

  if (fonts.primaryFont) {
    fontCache.set("primary", fonts.primaryFont);
  }
  if (fonts.secondaryFont) {
    fontCache.set("secondary", fonts.secondaryFont);
  }
}
