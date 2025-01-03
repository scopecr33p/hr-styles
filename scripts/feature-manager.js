class FeatureManager {
  constructor() {
    this.features = new Map();
    this.config = null;
    this.configPromise = this.loadConfig();
  }

  async loadConfig() {
    if (!this.config) {
      const response = await fetch(
        chrome.runtime.getURL("scripts/features-config.json")
      );
      this.config = await response.json();
    }
    return this.config;
  }

  matchesPattern(url, pattern) {
    if (!pattern) return true;
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return regex.test(url);
  }

  async shouldApplyFeature(featureName) {
    const config = await this.configPromise;
    const featureConfig = config.features.find((f) => f.name === featureName);

    if (!featureConfig) return false;

    const currentUrl = window.location.href;
    const matchesUrl = this.matchesPattern(
      currentUrl,
      featureConfig.urlPattern
    );
    const isExcluded =
      featureConfig.excludePattern &&
      this.matchesPattern(currentUrl, featureConfig.excludePattern);

    return matchesUrl && !isExcluded;
  }

  registerFeature(name, feature) {
    this.features.set(name, feature);

    // Check if we should apply and get stored state
    this.shouldApplyFeature(name).then((shouldApply) => {
      if (shouldApply) {
        const storageKey = name === "foalFlip" ? "flipFoals" : name;
        chrome.storage.sync.get([storageKey], (result) => {
          const enabled =
            result[storageKey] !== undefined
              ? result[storageKey]
              : this.config.features.find((f) => f.name === name)?.enabled;

          if (enabled !== undefined) {
            feature.apply(enabled);
          }
        });
      }
    });
  }

  async initialize() {
    try {
      await this.configPromise;

      // Set up message listeners
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if (request.type === "executeScript") {
          const feature = this.features.get("foalFlip");
          if (feature?.apply) {
            feature.apply(request.value);
            sendResponse({ success: true });
          }
        } else if (request.action === "updateStyles") {
          const feature = this.features.get("styleCustomization");
          if (feature?.apply) {
            feature.apply(true);
            sendResponse({ success: true });
          }
        }
        return true;
      });
    } catch (error) {
      console.error("Failed to initialize features:", error);
    }
  }
}

// Attach to window object for global access
window.FeatureManager = FeatureManager;
