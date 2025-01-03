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
  };

  // Run initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeFeatures);
  } else {
    initializeFeatures();
  }

  // Add message listener for font updates
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updateFont") {
      try {
        FontManagerFeature.injectFontFace(message.fontType, message.fontData);
        // Reapply text styles after font injection
        TextCustomizationFeature.loadAndApplyStyles();
        sendResponse({ success: true });
      } catch (error) {
        console.error("Font update error:", error);
        sendResponse({ success: false, error: error.message });
      }
    }
    return true;
  });

  // Add message listener for text styles
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "updateTextStyles") {
      TextCustomizationFeature.loadAndApplyStyles();
      sendResponse({ success: true });
    }
    return true;
  });
})();
