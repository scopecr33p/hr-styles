(() => {
  // Initialize feature manager first
  const featureManager = new FeatureManager();

  // Function to initialize features based on URL
  const initializeFeatures = async () => {
    await featureManager.initialize();

    // Initialize style customization
    if (typeof StyleCustomizationFeature !== "undefined") {
      StyleCustomizationFeature.init();
    }

    // Initialize text customization
    if (typeof TextCustomizationFeature !== "undefined") {
      TextCustomizationFeature.init();
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
  };

  // Run initialization
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeFeatures);
  } else {
    initializeFeatures();
  }
})();
