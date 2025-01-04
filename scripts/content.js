(() => {
  // Initialize feature manager first
  const featureManager = new FeatureManager();

  // Function to initialize features based on URL
  const initializeFeatures = async () => {
    // Preload fonts immediately
    if (typeof FontManagerFeature !== "undefined") {
      const fonts = await chrome.storage.local.get([
        "primaryFont",
        "secondaryFont",
      ]);
      if (fonts.primaryFont) {
        FontManagerFeature.injectFontFace("primary", fonts.primaryFont);
      }
      if (fonts.secondaryFont) {
        FontManagerFeature.injectFontFace("secondary", fonts.secondaryFont);
      }
    }

    // Initialize font manager first
    if (typeof FontManagerFeature !== "undefined") {
      const fontFeature = await FontManagerFeature.init();
      await fontFeature.apply();
    }

    // Then initialize text customization
    if (typeof TextCustomizationFeature !== "undefined") {
      const textFeature = await TextCustomizationFeature.init();
      await textFeature.apply();
    }

    // Initialize style customization
    if (typeof StyleCustomizationFeature !== "undefined") {
      StyleCustomizationFeature.init();
    }

    // Initialize features only if they should be applied
    if (typeof FoalFlipFeature !== "undefined") {
      const shouldApplyFoal = await featureManager.shouldApplyFeature(
        "foalFlip"
      );
      if (shouldApplyFoal) {
        FoalFlipFeature.init();
      }
    }

    if (typeof BackgroundManagerFeature !== "undefined") {
      const shouldApplyBackground = await featureManager.shouldApplyFeature(
        "backgroundManager"
      );
      if (shouldApplyBackground) {
        const backgroundFeature = BackgroundManagerFeature.init();
        backgroundFeature.apply(true);
      }
    }

    await featureManager.initialize();

    // Set up storage listener for top nav icons
    chrome.storage.sync.onChanged.addListener((changes) => {
      if (changes.topNavIconsGrayscale) {
        const filterValue = changes.topNavIconsGrayscale.newValue
          ? "grayscale(100%)"
          : "none";
        const icons = document.querySelectorAll(".icon24, .header-menu img");
        icons.forEach((icon) => {
          icon.style.filter = filterValue;
        });
      }
    });
  };

  // Run initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeFeatures);
  } else {
    initializeFeatures();
  }

  // Add message listener for font updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.type) {
      case "updateFont":
        try {
          FontManagerFeature.injectFontFace(message.fontType, message.fontData);
          TextCustomizationFeature.loadAndApplyStyles();
          sendResponse({ success: true });
        } catch (error) {
          console.error("Font update error:", error);
          sendResponse({ success: false, error: error.message });
        }
        break;

      case "updateTextStyles":
        TextCustomizationFeature.loadAndApplyStyles();
        sendResponse({ success: true });
        break;
    }
    return true;
  });

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updateTopNavIcons") {
      try {
        const filterValue = message.grayscale ? "grayscale(100%)" : "none";
        const icons = document.querySelectorAll(".icon24, .header-menu img");
        icons.forEach((icon) => {
          icon.style.filter = filterValue;
        });
        sendResponse({ success: true });
      } catch (error) {
        console.error("Error updating top nav icons:", error);
        sendResponse({ success: false, error: error.message });
      }
      return true;
    }
  });

  // Apply saved icon styles on page load
  chrome.storage.sync.get(["topNavIconsGrayscale"], function (result) {
    if (result.topNavIconsGrayscale) {
      const icons = document.querySelectorAll(".icon24, .header-menu img");
      icons.forEach((icon) => {
        icon.style.filter = "grayscale(100%)";
      });
    }
  });
})();
