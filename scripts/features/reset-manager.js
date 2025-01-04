// Create and export ResetManager immediately
class ResetManager {
  constructor(elements) {
    this.elements = elements;
  }

  // Add setElementDefaults as a static method
  static setElementDefaults(elementId, defaults) {
    const element = document.getElementById(elementId);
    if (!element) return;

    switch (element.type) {
      case "number":
        element.value = defaults.size || "";
        break;
      case "color":
        element.value = defaults.color || "#333333";
        break;
      case "select-one":
        element.value =
          defaults[elementId.replace(/(subtitle|h1)/i, "").toLowerCase()] || "";
        break;
      default:
        if (element.classList.contains("style-toggle")) {
          const type = elementId.toLowerCase().includes("italic")
            ? "italic"
            : elementId.toLowerCase().includes("underline")
            ? "underline"
            : "strike";
          if (defaults[type]) {
            element.classList.add("active");
          }
        }
    }
  }

  resetBanner() {
    chrome.storage.local.remove(["bannerBackground"], () => {
      this.elements.bannerPreview.src = "";
      this.elements.bannerPreviewContainer.style.display = "none";
      this.elements.bannerInput.value = "";
    });
  }

  resetNavigation() {
    this.elements.navColorPicker.value = "#eaf0f2";
    this.elements.navOpacity.value = "100";
    this.elements.hideNavIcons.checked = false;
    chrome.storage.sync.set({ hideNavIcons: false });
  }

  resetTopNav() {
    this.elements.topNavColorPicker.value = "#081b28";
    this.elements.topNavOpacity.value = "100";
    this.elements.topNavIconsGrayscale.checked = false;
  }

  resetTextStyles() {
    // We'll update these values once config is loaded
    this.elements.subtitleSize.value = "14";
    this.elements.h1Size.value = "24";

    // Reset other text styles
    this.elements.subtitleWeight.value = "";
    this.elements.subtitleColor.value = "#333333";
    this.elements.subtitleAlign.value = "";
    this.elements.subtitleTransform.value = "";
    this.elements.subtitleFont.value = "";

    this.elements.h1Weight.value = "";
    this.elements.h1Color.value = "#333333";
    this.elements.h1Align.value = "";
    this.elements.h1Transform.value = "";
    this.elements.h1Font.value = "";

    // Reset style toggles
    [
      this.elements.italicToggle,
      this.elements.underlineToggle,
      this.elements.strikeToggle,
      this.elements.h1ItalicToggle,
      this.elements.h1UnderlineToggle,
      this.elements.h1StrikeToggle,
    ].forEach((toggle) => toggle.classList.remove("active"));

    // Add link resets
    this.elements.linkSize.value = "14";
    this.elements.linkWeight.value = "";
    this.elements.linkColor.value = "#0066cc";
    this.elements.linkAlign.value = "";
    this.elements.linkTransform.value = "";
    this.elements.linkFont.value = "";

    [
      this.elements.linkItalicToggle,
      this.elements.linkUnderlineToggle,
      this.elements.linkStrikeToggle,
    ].forEach((toggle) => toggle.classList.remove("active"));

    // Set default underline for links
    this.elements.linkUnderlineToggle.classList.add("active");
  }

  resetInputs() {
    this.elements.inputColorPicker.value = "#c5d8de";
    this.elements.inputOpacity.value = "100";
    this.elements.inputBorderRadius.value = "4";
  }

  resetAll() {
    // Clear storage
    chrome.storage.sync.clear();
    chrome.storage.local.clear();

    // Reset all UI elements
    this.resetBanner();
    this.resetNavigation();
    this.resetTopNav();
    this.resetTextStyles();
    this.resetInputs();

    // Reset accordion states
    chrome.storage.local.set({ accordionStates: {} });
    document.querySelectorAll(".settings-group").forEach((group) => {
      group.classList.remove("collapsed");
    });

    // Apply the default styles
    this.elements.updateNavBackground();
    this.elements.updateInputBackground();
    this.elements.updateTopNavBackground();
    this.elements.updateTextElementStyles("subtitle");
    this.elements.updateTextElementStyles("h1");

    // Reload HR tabs with proper error handling
    chrome.tabs.query({ url: "*://*.horsereality.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        // First reload the tab
        chrome.tabs.reload(tab.id, {}, () => {
          // Add a listener for when the tab is done loading
          const listener = (tabId, changeInfo) => {
            if (tabId === tab.id && changeInfo.status === "complete") {
              // Remove the listener once we're done with it
              chrome.tabs.onUpdated.removeListener(listener);

              // Wait a short moment for content scripts to initialize
              setTimeout(() => {
                // Try to send a test message to check if content script is ready
                chrome.tabs.sendMessage(
                  tab.id,
                  { type: "ping" },
                  (response) => {
                    if (chrome.runtime.lastError) {
                      console.log(
                        "Tab not ready yet:",
                        chrome.runtime.lastError
                      );
                      return;
                    }
                    // If we get here, the content script is ready
                    this.elements.updateTextElementStyles("subtitle");
                    this.elements.updateTextElementStyles("h1");
                  }
                );
              }, 100);
            }
          };
          chrome.tabs.onUpdated.addListener(listener);
        });
      });
    });
  }
}

// Make it globally available immediately
window.ResetManager = ResetManager;

// Load config and update defaults after
fetch(chrome.runtime.getURL("scripts/features-config.json"))
  .then((response) => response.json())
  .then((config) => {
    // Store config values globally
    window.TEXT_SIZE_CONFIG = config.TEXT_SIZE_CONFIG;
  });
