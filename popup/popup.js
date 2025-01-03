document.addEventListener("DOMContentLoaded", function () {
  const flipFoalsToggle = document.getElementById("flipFoals");
  const navColorPicker = document.getElementById("navBackground");
  const inputColorPicker = document.getElementById("inputBackground");
  const navOpacity = document.getElementById("navOpacity");
  const inputOpacity = document.getElementById("inputOpacity");
  const bannerInput = document.getElementById("bannerBackground");
  const bannerPreview = document.getElementById("bannerPreview");
  const bannerPreviewContainer = document.getElementById(
    "bannerPreviewContainer"
  );
  const resetBannerButton = document.getElementById("resetBannerBackground");
  const overrideToggle = document.getElementById("overrideAllBackgrounds");
  const subtitleSize = document.getElementById("subtitleSize");
  const subtitleWeight = document.getElementById("subtitleWeight");
  const subtitleColor = document.getElementById("subtitleColor");
  const subtitleStyle = document.getElementById("subtitleStyle");
  const subtitleAlign = document.getElementById("subtitleAlign");
  const subtitleTransform = document.getElementById("subtitleTransform");
  const subtitleDecoration = document.getElementById("subtitleDecoration");
  const italicToggle = document.getElementById("italicToggle");
  const underlineToggle = document.getElementById("underlineToggle");
  const strikeToggle = document.getElementById("strikeToggle");
  const primaryFontSelect = document.getElementById("primaryFont");
  const secondaryFontSelect = document.getElementById("secondaryFont");
  const subtitleFont = document.getElementById("subtitleFont");
  const primaryFileInput = document.getElementById("primaryFontFile");
  const secondaryFileInput = document.getElementById("secondaryFontFile");
  const primaryPreview = document.getElementById("primaryFontPreview");
  const secondaryPreview = document.getElementById("secondaryFontPreview");
  const h1Size = document.getElementById("h1Size");
  const h1Weight = document.getElementById("h1Weight");
  const h1Color = document.getElementById("h1Color");
  const h1Align = document.getElementById("h1Align");
  const h1Transform = document.getElementById("h1Transform");
  const h1Font = document.getElementById("h1Font");
  const h1ItalicToggle = document.getElementById("h1ItalicToggle");
  const h1UnderlineToggle = document.getElementById("h1UnderlineToggle");
  const h1StrikeToggle = document.getElementById("h1StrikeToggle");

  // Load saved override state
  chrome.storage.local.get(["overrideAllBackgrounds"], function (result) {
    overrideToggle.checked = result.overrideAllBackgrounds || false;
  });

  // Handle override toggle
  overrideToggle.addEventListener("change", function () {
    const isChecked = overrideToggle.checked;
    chrome.storage.local.set({ overrideAllBackgrounds: isChecked });
  });

  // Maximum file size (5MB)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  // Convert hex color and opacity to rgba
  function hexToRgba(hex, opacity) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;
  }

  // Replace the individual element value settings with a function that uses the config defaults
  function setElementDefaults(elementId, defaults) {
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

  // Load saved states
  Promise.all([
    // Load sync storage settings
    new Promise((resolve) =>
      chrome.storage.sync.get(
        [
          "flipFoals",
          "navBackground",
          "inputBackground",
          "navOpacity",
          "inputOpacity",
          "navBackgroundRgba",
          "inputBackgroundRgba",
        ],
        resolve
      )
    ),
    // Load config for defaults
    fetch(chrome.runtime.getURL("scripts/features-config.json")).then((r) =>
      r.json()
    ),
    // Load local storage settings
    new Promise((resolve) =>
      chrome.storage.local.get(
        [
          "subtitleSize",
          "subtitleWeight",
          "subtitleColor",
          "subtitleAlign",
          "subtitleTransform",
          "textItalic",
          "textUnderline",
          "textStrike",
          "subtitleFont",
          "h1Size",
          "h1Weight",
          "h1Color",
          "h1Align",
          "h1Transform",
          "h1Font",
          "h1Italic",
          "h1Underline",
          "h1Strike",
        ],
        resolve
      )
    ),
  ]).then(([syncResult, config, localResult]) => {
    // Set initial values for nav and input backgrounds
    if (syncResult.navBackground) {
      navColorPicker.value = syncResult.navBackground;
    }
    if (syncResult.inputBackground) {
      inputColorPicker.value = syncResult.inputBackground;
    }
    if (syncResult.navOpacity) {
      navOpacity.value = syncResult.navOpacity;
    }
    if (syncResult.inputOpacity) {
      inputOpacity.value = syncResult.inputOpacity;
    }
    if (syncResult.flipFoals) {
      flipFoalsToggle.checked = syncResult.flipFoals;
    }

    // Get defaults from config
    const { subtitle: subtitleDefaults, h1: h1Defaults } = config.features.find(
      (f) => f.name === "textCustomization"
    ).textElements;

    // Set defaults for subtitle elements
    const subtitleElements = [
      "subtitleSize",
      "subtitleWeight",
      "subtitleColor",
      "subtitleAlign",
      "subtitleTransform",
      "subtitleFont",
      "italicToggle",
      "underlineToggle",
      "strikeToggle",
    ];
    subtitleElements.forEach((id) =>
      setElementDefaults(id, subtitleDefaults.defaults)
    );

    // Set defaults for h1 elements
    const h1Elements = [
      "h1Size",
      "h1Weight",
      "h1Color",
      "h1Align",
      "h1Transform",
      "h1Font",
      "h1ItalicToggle",
      "h1UnderlineToggle",
      "h1StrikeToggle",
    ];
    h1Elements.forEach((id) => setElementDefaults(id, h1Defaults.defaults));

    // Apply any saved values that override defaults
    Object.entries(localResult).forEach(([key, value]) => {
      const element =
        document.getElementById(key) ||
        document.getElementById(key.replace("text", ""));
      if (element) {
        if (element.classList.contains("style-toggle")) {
          if (value) element.classList.add("active");
        } else {
          element.value = value;
        }
      }
    });
  });

  // Load saved banner image if exists
  chrome.storage.local.get(["bannerBackground"], function (result) {
    if (result.bannerBackground) {
      bannerPreview.src = result.bannerBackground;
      bannerPreviewContainer.style.display = "block";
    }
  });

  // Handle foal flip toggle
  flipFoalsToggle.addEventListener("change", function () {
    chrome.storage.sync.set({ flipFoals: this.checked });
  });

  // Validate and clamp opacity value between 0 and 100
  function validateOpacity(value) {
    return Math.min(Math.max(parseInt(value) || 0, 0), 100);
  }

  // Handle color and opacity changes for navigation
  function updateNavBackground() {
    const rgba = hexToRgba(navColorPicker.value, navOpacity.value);
    chrome.storage.sync.set({
      navBackground: navColorPicker.value,
      navOpacity: navOpacity.value,
      navBackgroundRgba: rgba,
    });
  }

  // Handle color and opacity changes for input
  function updateInputBackground() {
    const rgba = hexToRgba(inputColorPicker.value, inputOpacity.value);
    chrome.storage.sync.set({
      inputBackground: inputColorPicker.value,
      inputOpacity: inputOpacity.value,
      inputBackgroundRgba: rgba,
    });
  }

  // Handle file selection for banner background
  bannerInput.addEventListener("change", function (e) {
    const file = e.target.files[0];

    if (!file) return;

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      alert("File is too large. Please choose an image under 5MB.");
      return;
    }

    // Check if file is an image
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = function (event) {
      const base64String = event.target.result;

      // Show preview
      bannerPreview.src = base64String;
      bannerPreviewContainer.style.display = "block";

      // Save to storage
      chrome.storage.local.set({
        bannerBackground: base64String,
      });
    };

    reader.onerror = function () {
      alert("Error reading file.");
    };

    reader.readAsDataURL(file);
  });

  // Handle reset button for banner
  resetBannerButton.addEventListener("click", function () {
    chrome.storage.local.remove(["bannerBackground"], function () {
      bannerPreview.src = "";
      bannerPreviewContainer.style.display = "none";
      bannerInput.value = "";
    });
  });

  navColorPicker.addEventListener("change", updateNavBackground);
  navOpacity.addEventListener("change", updateNavBackground);
  navOpacity.addEventListener("input", updateNavBackground);

  inputColorPicker.addEventListener("change", updateInputBackground);
  inputOpacity.addEventListener("change", updateInputBackground);
  inputOpacity.addEventListener("input", updateInputBackground);

  // Handle subtitle style changes
  function updateSubtitleStyles() {
    const validSize = Math.min(
      Math.max(parseInt(subtitleSize.value) || 12, 8),
      64
    );
    subtitleSize.value = validSize;

    chrome.storage.local.set({
      subtitleSize: validSize,
      subtitleWeight: subtitleWeight.value,
      subtitleColor: subtitleColor.value,
      subtitleAlign: subtitleAlign.value,
      subtitleTransform: subtitleTransform.value,
      subtitleFont: subtitleFont.value,
    });
  }

  // Update event listeners
  subtitleSize.addEventListener("input", updateSubtitleStyles);
  subtitleColor.addEventListener("input", updateSubtitleStyles);
  subtitleWeight.addEventListener("change", updateSubtitleStyles);
  subtitleAlign.addEventListener("change", updateSubtitleStyles);
  subtitleTransform.addEventListener("change", updateSubtitleStyles);
  subtitleFont.addEventListener("change", updateSubtitleStyles);

  function updateTextStyles() {
    const styles = {
      textItalic: italicToggle.classList.contains("active"),
      textUnderline: underlineToggle.classList.contains("active"),
      textStrike: strikeToggle.classList.contains("active"),
    };

    chrome.storage.local.set(styles);
  }

  // Add toggle handlers
  [italicToggle, underlineToggle, strikeToggle].forEach((button) => {
    button.addEventListener("click", function () {
      this.classList.toggle("active");
      updateTextStyles();
    });
  });

  function updateFontDropdown() {
    // Get current selected values before clearing
    const currentSubtitleFont = subtitleFont.value;
    const currentH1Font = h1Font.value;

    // Clear existing options except the default one
    while (subtitleFont.options.length > 1) subtitleFont.options.remove(1);
    while (h1Font.options.length > 1) h1Font.options.remove(1);

    // Add primary font option if available
    if (primaryPreview.classList.contains("loaded")) {
      subtitleFont.add(new Option("Primary Font", "primary"));
      h1Font.add(new Option("Primary Font", "primary"));
    }

    // Add secondary font option if available
    if (secondaryPreview.classList.contains("loaded")) {
      subtitleFont.add(new Option("Secondary Font", "secondary"));
      h1Font.add(new Option("Secondary Font", "secondary"));
    }

    // Restore selected values
    if (currentSubtitleFont) subtitleFont.value = currentSubtitleFont;
    if (currentH1Font) h1Font.value = currentH1Font;
  }

  // Load existing font names and settings
  Promise.all([
    new Promise((resolve) =>
      chrome.storage.local.get(
        [
          "primaryFontName",
          "secondaryFontName",
          "primaryFont",
          "secondaryFont",
        ],
        resolve
      )
    ),
    new Promise((resolve) =>
      chrome.storage.local.get(["subtitleFont", "h1Font"], resolve)
    ),
  ]).then(([localResult, syncResult]) => {
    if (localResult.primaryFontName && localResult.primaryFont) {
      primaryPreview.textContent = localResult.primaryFontName;
      primaryPreview.classList.add("loaded");
    }
    if (localResult.secondaryFontName && localResult.secondaryFont) {
      secondaryPreview.textContent = localResult.secondaryFontName;
      secondaryPreview.classList.add("loaded");
    }

    // Update dropdowns first
    updateFontDropdown();

    // Then set the values
    if (syncResult.subtitleFont) {
      subtitleFont.value = syncResult.subtitleFont;
    }
    if (syncResult.h1Font) {
      h1Font.value = syncResult.h1Font;
    }
  });

  async function handleFontUpload(file, type, preview) {
    try {
      if (!file) return;

      // Check file type
      if (
        !file.type.match(
          /font\/(ttf|otf|woff|woff2)|application\/x-font-(ttf|otf|woff|woff2)/
        )
      ) {
        throw new Error("Invalid font file type");
      }

      preview.textContent = "Uploading...";
      preview.classList.add("font-loading");

      // Use FontManagerFeature to handle the upload
      const fontData = await FontManagerFeature.handleFontUpload(file, type);

      // Send message to content script to update fonts
      await new Promise((resolve) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(
              tabs[0].id,
              {
                type: "updateFont",
                fontType: type,
                fontData: fontData,
              },
              resolve
            );
          } else {
            resolve();
          }
        });
      });

      // Update preview
      preview.textContent = file.name;
      preview.classList.remove("font-loading");
      preview.classList.add("loaded");
    } catch (error) {
      console.error("Font upload failed:", error);
      preview.textContent = "Upload failed";
      preview.classList.remove("font-loading", "loaded");
    }
  }

  primaryFileInput.addEventListener("change", (e) => {
    handleFontUpload(e.target.files[0], "primary", primaryPreview).then(() => {
      updateFontDropdown();
    });
  });

  secondaryFileInput.addEventListener("change", (e) => {
    handleFontUpload(e.target.files[0], "secondary", secondaryPreview).then(
      () => {
        updateFontDropdown();
      }
    );
  });

  subtitleFont.addEventListener("change", function () {
    chrome.storage.local.set({ subtitleFont: this.value }, () => {
      TextCustomizationFeature.loadAndApplyStyles();
    });
  });

  // Add modal HTML to the document
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content">
      <h3>Reset All Settings?</h3>
      <p>This will reset all customizations to their default values. This action cannot be undone.</p>
      <div class="modal-buttons">
        <button class="confirm">Reset All</button>
        <button class="cancel">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Reset button handler
  const resetAllButton = document.getElementById("resetAllSettings");
  resetAllButton.addEventListener("click", () => {
    modal.style.display = "flex";
  });

  // Modal button handlers
  const confirmButton = modal.querySelector(".confirm");
  const cancelButton = modal.querySelector(".cancel");

  cancelButton.addEventListener("click", () => {
    modal.style.display = "none";
  });

  confirmButton.addEventListener("click", async () => {
    // Reset all storage
    await Promise.all([
      chrome.storage.sync.clear(),
      chrome.storage.local.clear(),
    ]);

    // Reset all input values to website defaults
    flipFoalsToggle.checked = false;
    navColorPicker.value = "#eaf0f2";
    inputColorPicker.value = "#c5d8de";
    navOpacity.value = "100";
    inputOpacity.value = "100";
    overrideToggle.checked = false;

    // Reset text customization to website defaults
    subtitleSize.value = "14";
    subtitleWeight.value = ""; // Set to empty string for default
    subtitleColor.value = "#333333";
    subtitleAlign.value = "";
    subtitleTransform.value = "";
    subtitleFont.value = "";

    // Reset text style toggles
    italicToggle.classList.remove("active");
    underlineToggle.classList.remove("active");
    strikeToggle.classList.remove("active");

    // Reset banner
    bannerPreview.src = "";
    bannerPreviewContainer.style.display = "none";
    bannerInput.value = "";

    // Update all styles
    updateNavBackground();
    updateInputBackground();
    updateSubtitleStyles();
    updateTextStyles();

    // Close modal
    modal.style.display = "none";

    // Reload all tabs to apply changes
    chrome.tabs.query({ url: "*://*.horsereality.com/*" }, (tabs) => {
      tabs.forEach((tab) => {
        chrome.tabs.reload(tab.id);
      });
    });
  });

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  function updateH1Styles() {
    const validSize = Math.min(Math.max(parseInt(h1Size.value) || 24, 8), 64);
    h1Size.value = validSize;

    chrome.storage.local.set(
      {
        h1Size: validSize,
        h1Weight: h1Weight.value,
        h1Color: h1Color.value,
        h1Align: h1Align.value,
        h1Transform: h1Transform.value,
        h1Font: h1Font.value,
      },
      () => {
        // Send message to update styles immediately
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: "updateTextStyles",
            });
          }
        });
      }
    );
  }

  // Add event listeners
  h1Size.addEventListener("input", updateH1Styles);
  h1Color.addEventListener("input", updateH1Styles);
  h1Weight.addEventListener("change", updateH1Styles);
  h1Align.addEventListener("change", updateH1Styles);
  h1Transform.addEventListener("change", updateH1Styles);
  h1Font.addEventListener("change", updateH1Styles);

  function updateH1TextStyles() {
    const styles = {
      h1Italic: h1ItalicToggle.classList.contains("active"),
      h1Underline: h1UnderlineToggle.classList.contains("active"),
      h1Strike: h1StrikeToggle.classList.contains("active"),
    };

    chrome.storage.local.set(styles, () => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: "updateTextStyles",
          });
        }
      });
    });
  }

  // Add toggle handlers for h1
  [h1ItalicToggle, h1UnderlineToggle, h1StrikeToggle].forEach((button) => {
    button.addEventListener("click", function () {
      this.classList.toggle("active");
      updateH1TextStyles();
    });
  });

  // Helper function to create UI elements
  function createTextCustomizationUI(elementName, container) {
    const element = TextCustomizationFeature.elements.get(elementName);
    if (!element) return;

    // Create fields based on the element's properties
    element.getStyleProperties().forEach((prop) => {
      const field = createCustomizationField(elementName, prop);
      container.appendChild(field);
    });
  }

  // Add event listeners dynamically
  function addTextElementListeners(elementName) {
    const element = TextCustomizationFeature.elements.get(elementName);
    if (!element) return;

    element.getStyleProperties().forEach((prop) => {
      const elementId = `${elementName}${prop
        .charAt(0)
        .toUpperCase()}${prop.slice(1)}`;
      const input = document.getElementById(elementId);
      if (!input) return;

      if (prop === "italic" || prop === "underline" || prop === "strike") {
        input.addEventListener("click", function () {
          this.classList.toggle("active");
          updateElementStyles(elementName);
        });
      } else {
        input.addEventListener(prop === "color" ? "input" : "change", () => {
          updateElementStyles(elementName);
        });
      }
    });
  }
});
