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
  const styleFeature = config.features.find(
    (f) => f.name === "styleCustomization"
  );

  let baseCSS = "";

  // Add variables
  baseCSS += ":root {";
  Object.entries(styleFeature.variables).forEach(([key, value]) => {
    baseCSS += `${key}:${value};`;
  });
  baseCSS += "}";

  // Add selectors
  Object.entries(styleFeature.styles).forEach(([type, selectors]) => {
    if (Array.isArray(selectors)) {
      baseCSS += `${selectors.join(
        ","
      )} { background: var(--hr-${type}-background) !important; }`;
    }
  });

  styleCache.base = baseCSS;
  return styleCache;
}

// Inject styles into tab
async function injectStyles(tabId) {
  try {
    // Check if this is a v2 page
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const isV2 = tab.url?.includes("v2.horsereality.com");

    // Inject version-specific styles
    if (isV2) {
      await injectV2Styles(tabId);
    } else {
      await injectNonV2Styles(tabId, tab.url);
    }

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
  if (changeInfo.status === "loading" && tab.url) {
    console.log("URL being checked:", tab.url);

    if (tab.url.includes("v2.horsereality.com")) {
      console.log("V2 page detected, injecting styles");
      injectV2Styles(tabId);
    } else if (tab.url.match(/^https?:\/\/(www\.)?horsereality\.com/)) {
      console.log("Non-V2 page detected, injecting styles");
      injectNonV2Styles(tabId);
    }

    if (tab.url.match(/^https?:\/\/(www\.|v2\.)?horsereality\.com/)) {
      injectStyles(tabId);
    }
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

// Add after compileStyles function
async function injectV2Styles(tabId) {
  const v2CSS = `
    body#horses.background div.container,
    #horses > div.container {
      display: flex !important;
      background: transparent !important;
      pointer-events: auto !important;
    }
  `;

  try {
    await chrome.scripting.insertCSS({
      target: { tabId },
      css: v2CSS,
    });
  } catch (error) {
    console.error("V2 style injection failed:", error);
  }
}

async function injectNonV2Styles(tabId) {
  const nonV2CSS = `
    body div.container {
      display: flex !important;
      background: transparent !important;
      pointer-events: auto !important;
    }
  `;

  try {
    await chrome.scripting.insertCSS({
      target: { tabId },
      css: nonV2CSS,
    });
  } catch (error) {
    console.error("Non-V2 style injection failed:", error);
  }
}
