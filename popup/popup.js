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
  const topNavColorPicker = document.getElementById("topNavBackground");
  const topNavOpacity = document.getElementById("topNavOpacity");
  const topNavIconsGrayscale = document.getElementById("topNavIconsGrayscale");

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

  // Load saved text style states
  chrome.storage.local.get(
    [
      "subtitleItalic",
      "subtitleUnderline",
      "subtitleStrike",
      "h1Italic",
      "h1Underline",
      "h1Strike",
    ],
    function (result) {
      // Set subtitle toggle states
      if (result.subtitleItalic) italicToggle.classList.add("active");
      if (result.subtitleUnderline) underlineToggle.classList.add("active");
      if (result.subtitleStrike) strikeToggle.classList.add("active");

      // Set h1 toggle states
      if (result.h1Italic) h1ItalicToggle.classList.add("active");
      if (result.h1Underline) h1UnderlineToggle.classList.add("active");
      if (result.h1Strike) h1StrikeToggle.classList.add("active");
    }
  );

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
          "topNavBackground",
          "topNavOpacity",
          "topNavBackgroundRgba",
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
      ResetManager.setElementDefaults(id, subtitleDefaults.defaults)
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
    h1Elements.forEach((id) =>
      ResetManager.setElementDefaults(id, h1Defaults.defaults)
    );

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

    // Add top nav initialization here
    if (syncResult.topNavBackground) {
      topNavColorPicker.value = syncResult.topNavBackground;
    }
    if (syncResult.topNavOpacity) {
      topNavOpacity.value = syncResult.topNavOpacity;
    }
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

  // Update event listeners for subtitle
  [
    [subtitleSize, "change"],
    [subtitleColor, "input"],
    [subtitleWeight, "change"],
    [subtitleAlign, "change"],
    [subtitleTransform, "change"],
    [subtitleFont, "change"],
  ].forEach(([element, event]) => {
    element.addEventListener(event, () => updateTextElementStyles("subtitle"));
  });

  // Update event listeners for h1
  [
    [h1Size, "change"],
    [h1Color, "input"],
    [h1Weight, "change"],
    [h1Align, "change"],
    [h1Transform, "change"],
    [h1Font, "change"],
  ].forEach(([element, event]) => {
    element.addEventListener(event, () => updateTextElementStyles("h1"));
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

  // Create reset manager instance using global class
  const resetManager = new ResetManager({
    bannerPreview,
    bannerPreviewContainer,
    bannerInput,
    navColorPicker,
    navOpacity,
    inputColorPicker,
    inputOpacity,
    topNavColorPicker,
    topNavOpacity,
    topNavIconsGrayscale,
    subtitleSize,
    subtitleWeight,
    subtitleColor,
    subtitleAlign,
    subtitleTransform,
    subtitleFont,
    h1Size,
    h1Weight,
    h1Color,
    h1Align,
    h1Transform,
    h1Font,
    italicToggle,
    underlineToggle,
    strikeToggle,
    h1ItalicToggle,
    h1UnderlineToggle,
    h1StrikeToggle,
    updateNavBackground,
    updateInputBackground,
    updateTopNavBackground,
    updateTextElementStyles,
  });

  // Handle reset button click
  confirmButton.addEventListener("click", function () {
    resetManager.resetAll();
    modal.style.display = "none";
  });

  // Close modal when clicking outside
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  });

  function updateTextElementStyles(elementType) {
    const elements = {
      subtitle: {
        size: subtitleSize,
        weight: subtitleWeight,
        color: subtitleColor,
        align: subtitleAlign,
        transform: subtitleTransform,
        font: subtitleFont,
        italic: italicToggle,
        underline: underlineToggle,
        strike: strikeToggle,
      },
      h1: {
        size: h1Size,
        weight: h1Weight,
        color: h1Color,
        align: h1Align,
        transform: h1Transform,
        font: h1Font,
        italic: h1ItalicToggle,
        underline: h1UnderlineToggle,
        strike: h1StrikeToggle,
      },
    };

    const element = elements[elementType];

    // Validate size if it's the active element
    if (document.activeElement === element.size) {
      const defaultSize = TEXT_SIZE_CONFIG.defaults[elementType];
      const validSize = validateTextSize(element.size.value, defaultSize);
      element.size.value = validSize;
    }

    // Build storage object
    const styles = {
      [`${elementType}Size`]: element.size.value,
      [`${elementType}Weight`]: element.weight.value,
      [`${elementType}Color`]: element.color.value,
      [`${elementType}Align`]: element.align.value,
      [`${elementType}Transform`]: element.transform.value,
      [`${elementType}Font`]: element.font.value,
      [`${elementType}Italic`]: element.italic.classList.contains("active"),
      [`${elementType}Underline`]:
        element.underline.classList.contains("active"),
      [`${elementType}Strike`]: element.strike.classList.contains("active"),
    };

    // Save to storage and update styles
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

  // Update text style toggle handlers to use the helper
  function addTextStyleToggleHandlers(elementType, toggles) {
    toggles.forEach((button) => {
      button.addEventListener("click", function () {
        this.classList.toggle("active");

        const elements = {
          subtitle: {
            italic: italicToggle,
            underline: underlineToggle,
            strike: strikeToggle,
          },
          h1: {
            italic: h1ItalicToggle,
            underline: h1UnderlineToggle,
            strike: h1StrikeToggle,
          },
        };

        const element = elements[elementType];

        // Save to storage and update styles
        chrome.storage.local.set(
          {
            [`${elementType}Italic`]:
              element.italic.classList.contains("active"),
            [`${elementType}Underline`]:
              element.underline.classList.contains("active"),
            [`${elementType}Strike`]:
              element.strike.classList.contains("active"),
          },
          () => {
            // After storage is updated, trigger style update
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
              if (tabs[0]) {
                chrome.tabs.sendMessage(tabs[0].id, {
                  type: "updateTextStyles",
                });
              }
            });
          }
        );
      });
    });
  }

  // Update toggle handlers
  addTextStyleToggleHandlers("subtitle", [
    italicToggle,
    underlineToggle,
    strikeToggle,
  ]);

  addTextStyleToggleHandlers("h1", [
    h1ItalicToggle,
    h1UnderlineToggle,
    h1StrikeToggle,
  ]);

  function validateTextSize(value, defaultValue) {
    const size = parseInt(value) || defaultValue;
    return Math.min(Math.max(size, TEXT_SIZE_CONFIG.min), TEXT_SIZE_CONFIG.max);
  }

  // Add blur event listeners for size inputs
  subtitleSize.addEventListener("blur", function () {
    const validSize = validateTextSize(
      this.value,
      TEXT_SIZE_CONFIG.defaults.subtitle
    );
    this.value = validSize;
    updateTextElementStyles("subtitle");
  });

  h1Size.addEventListener("blur", function () {
    const validSize = validateTextSize(
      this.value,
      TEXT_SIZE_CONFIG.defaults.h1
    );
    this.value = validSize;
    updateTextElementStyles("h1");
  });

  // Load saved state
  chrome.storage.sync.get(["topNavIconsGrayscale"], function (result) {
    topNavIconsGrayscale.checked = result.topNavIconsGrayscale || false;
  });

  // Handle toggle
  topNavIconsGrayscale.addEventListener("change", function () {
    // First update storage
    chrome.storage.sync.set(
      {
        topNavIconsGrayscale: this.checked,
      },
      () => {
        // Storage callback - no need to send message directly
        // The content script listens for storage changes
      }
    );
  });

  function updateTopNavIcons() {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        // Send message and handle potential error
        chrome.tabs
          .sendMessage(tabs[0].id, {
            type: "updateTopNavIcons",
            grayscale: topNavIconsGrayscale.checked,
          })
          .catch((error) => {
            console.log(
              "Could not update top nav icons - tab may not be ready"
            );
          });
      }
    });
  }

  // Add this function near the other background update functions
  function updateTopNavBackground() {
    const rgba = hexToRgba(topNavColorPicker.value, topNavOpacity.value);
    chrome.storage.sync.set({
      topNavBackground: topNavColorPicker.value,
      topNavOpacity: topNavOpacity.value,
      topNavBackgroundRgba: rgba,
    });
  }

  // Add event listeners for top nav background updates
  topNavColorPicker.addEventListener("change", updateTopNavBackground);
  topNavOpacity.addEventListener("change", updateTopNavBackground);
  topNavOpacity.addEventListener("input", updateTopNavBackground);

  // Tab navigation
  const navButtons = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".settings-section");

  // Load last active tab
  chrome.storage.local.get(["activeTab"], function (result) {
    const activeTab = result.activeTab || "appearance"; // Default to appearance if no saved state

    // Update UI to show saved tab
    navButtons.forEach((btn) => {
      if (btn.dataset.section === activeTab) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    sections.forEach((section) => {
      if (section.id === activeTab) {
        section.classList.add("active");
      } else {
        section.classList.remove("active");
      }
    });
  });

  // Update click handlers to save state
  navButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetSection = button.dataset.section;

      // Update active states
      navButtons.forEach((btn) => btn.classList.remove("active"));
      sections.forEach((section) => section.classList.remove("active"));

      button.classList.add("active");
      document.getElementById(targetSection).classList.add("active");

      // Save active tab state
      chrome.storage.local.set({ activeTab: targetSection });
    });
  });

  // Wrap settings-group content and handle state
  document.querySelectorAll(".settings-group").forEach((group) => {
    // Skip if already processed
    if (group.querySelector(".settings-group-content")) return;

    const heading = group.querySelector("h2");
    const groupId = heading.textContent
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");
    const content = document.createElement("div");
    content.className = "settings-group-content";

    // Move all elements after the heading into the content div
    while (group.children[1]) {
      content.appendChild(group.children[1]);
    }

    group.appendChild(content);

    // Load saved state immediately when popup opens
    chrome.storage.local.get("accordionStates", function (result) {
      const states = result.accordionStates || {};
      if (states[groupId] === true) {
        group.classList.add("collapsed");
      }

      // Add animation class after a brief delay to prevent initial animation
      setTimeout(() => {
        group.classList.add("animate");
      }, 100);
    });

    // Add click handler with state saving
    heading.addEventListener("click", () => {
      group.classList.toggle("collapsed");

      // Save state
      chrome.storage.local.get("accordionStates", function (result) {
        const states = result.accordionStates || {};
        states[groupId] = group.classList.contains("collapsed");
        chrome.storage.local.set({ accordionStates: states });
      });
    });
  });
});
