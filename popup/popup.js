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

  // Load saved states
  chrome.storage.sync.get(
    [
      "flipFoals",
      "navBackground",
      "inputBackground",
      "navOpacity",
      "inputOpacity",
      "subtitleSize",
      "subtitleWeight",
      "subtitleColor",
      "subtitleAlign",
      "subtitleTransform",
      "textItalic",
      "textUnderline",
      "textStrike",
    ],
    function (result) {
      flipFoalsToggle.checked = result.flipFoals || false;

      if (result.navBackground) {
        navColorPicker.value = result.navBackground;
      }
      if (result.inputBackground) {
        inputColorPicker.value = result.inputBackground;
      }
      if (result.navOpacity !== undefined) {
        navOpacity.value = result.navOpacity;
      }
      if (result.inputOpacity !== undefined) {
        inputOpacity.value = result.inputOpacity;
      }
      if (result.subtitleSize) subtitleSize.value = result.subtitleSize;
      if (result.subtitleWeight) subtitleWeight.value = result.subtitleWeight;
      if (result.subtitleColor) subtitleColor.value = result.subtitleColor;
      if (result.subtitleAlign) subtitleAlign.value = result.subtitleAlign;
      if (result.subtitleTransform)
        subtitleTransform.value = result.subtitleTransform;

      // Set initial toggle states
      if (result.textItalic) italicToggle.classList.add("active");
      if (result.textUnderline) underlineToggle.classList.add("active");
      if (result.textStrike) strikeToggle.classList.add("active");
    }
  );

  // Load saved banner image if exists
  chrome.storage.local.get(["bannerBackground"], function (result) {
    if (result.bannerBackground) {
      bannerPreview.src = result.bannerBackground;
      bannerPreviewContainer.style.display = "block";
    }
  });

  // Handle foal flip toggle
  flipFoalsToggle.addEventListener("change", function () {
    const isChecked = flipFoalsToggle.checked;
    chrome.storage.sync.set({ flipFoals: isChecked });

    // Send message to active tab
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        chrome.tabs
          .sendMessage(tabs[0].id, {
            type: "executeScript",
            value: isChecked,
          })
          .catch((error) => {
            console.error("Failed to send message:", error);
          });
      }
    });
  });

  // Validate and clamp opacity value between 0 and 100
  function validateOpacity(value) {
    return Math.min(Math.max(parseInt(value) || 0, 0), 100);
  }

  // Handle color and opacity changes for navigation
  function updateNavBackground() {
    const validOpacity = validateOpacity(navOpacity.value);
    navOpacity.value = validOpacity;

    const rgba = hexToRgba(navColorPicker.value, validOpacity);
    chrome.storage.sync.set({
      navBackground: navColorPicker.value,
      navOpacity: validOpacity,
      navBackgroundRgba: rgba,
    });
  }

  // Handle color and opacity changes for input
  function updateInputBackground() {
    const validOpacity = validateOpacity(inputOpacity.value);
    inputOpacity.value = validOpacity;

    const rgba = hexToRgba(inputColorPicker.value, validOpacity);
    chrome.storage.sync.set({
      inputBackground: inputColorPicker.value,
      inputOpacity: validOpacity,
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

    chrome.storage.sync.set({
      subtitleSize: validSize,
      subtitleWeight: subtitleWeight.value,
      subtitleColor: subtitleColor.value,
      subtitleAlign: subtitleAlign.value,
      subtitleTransform: subtitleTransform.value,
    });
  }

  subtitleSize.addEventListener("change", updateSubtitleStyles);
  subtitleSize.addEventListener("blur", function () {
    const validSize = Math.min(Math.max(parseInt(this.value) || 12, 8), 64);
    if (validSize !== parseInt(this.value)) {
      this.value = validSize;
    }
    updateSubtitleStyles();
  });
  subtitleWeight.addEventListener("change", updateSubtitleStyles);
  subtitleColor.addEventListener("change", updateSubtitleStyles);
  subtitleAlign.addEventListener("change", updateSubtitleStyles);
  subtitleTransform.addEventListener("change", updateSubtitleStyles);

  function updateTextStyles() {
    const styles = {
      textItalic: italicToggle.classList.contains("active"),
      textUnderline: underlineToggle.classList.contains("active"),
      textStrike: strikeToggle.classList.contains("active"),
    };

    chrome.storage.sync.set(styles);
  }

  // Add toggle handlers
  [italicToggle, underlineToggle, strikeToggle].forEach((button) => {
    button.addEventListener("click", function () {
      this.classList.toggle("active");
      updateTextStyles();
    });
  });
});
