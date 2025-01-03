class BackgroundManagerFeature {
  static init() {
    return {
      apply: (enabled) => {
        if (enabled) {
          BackgroundManagerFeature.setupStorageListener();
          BackgroundManagerFeature.applyBackgrounds();
        }
      },
      settings: {
        enabled: true,
      },
    };
  }

  static setupStorageListener() {
    chrome.storage.local.get(
      ["bannerBackground", "overrideAllBackgrounds"],
      function (result) {
        if (result.bannerBackground) {
          BackgroundManagerFeature.updateBannerBackground(
            result.bannerBackground,
            result.overrideAllBackgrounds
          );
        }
      }
    );

    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === "local") {
        if (changes.bannerBackground || changes.overrideAllBackgrounds) {
          chrome.storage.local.get(
            ["bannerBackground", "overrideAllBackgrounds"],
            function (result) {
              if (result.bannerBackground) {
                BackgroundManagerFeature.updateBannerBackground(
                  result.bannerBackground,
                  result.overrideAllBackgrounds
                );
              }
            }
          );
        }
      }
    });
  }

  static hasCustomBackground() {
    const bannerContainer = document.querySelector(
      '.horse_banner[class*="horse_banner"] > div[style*="position: relative"][style*="width: 960px"]'
    );

    if (bannerContainer) {
      const bannerImg = bannerContainer.querySelector("img");
      // Check if there's an existing image that's not one we created
      return bannerImg && !bannerImg.dataset.hrStyles;
    }
    return false;
  }

  static applyImageStyles(imgElement, containerElement) {
    // Apply styles to the image
    imgElement.alt = "Background";
    imgElement.style.cssText =
      "pointer-events: auto; width: 100%; height: 100%; object-fit: cover;";
    imgElement.dataset.hrStyles = "true";

    // Apply styles to the container
    containerElement.style.cssText =
      "position: relative; top: -50px; width: 960px; height: 650px; overflow: hidden; pointer-events: auto;";
  }

  static updateBannerBackground(base64Image, overrideAll = false) {
    // If we have a custom background and override is off, don't update
    if (!overrideAll && BackgroundManagerFeature.hasCustomBackground()) {
      return;
    }

    const bannerContainer = document.querySelector(
      '.horse_banner[class*="horse_banner"] > div[style*="position: relative"][style*="width: 960px"]'
    );

    if (bannerContainer) {
      // If container exists, update or create img
      let bannerImg = bannerContainer.querySelector("img");
      if (!bannerImg) {
        bannerImg = document.createElement("img");
        BackgroundManagerFeature.applyImageStyles(bannerImg, bannerContainer);
        bannerContainer.appendChild(bannerImg);
      } else {
        // Ensure styles are applied even to existing images
        BackgroundManagerFeature.applyImageStyles(bannerImg, bannerContainer);
      }
      bannerImg.src = base64Image;
    } else {
      // If container doesn't exist, create the whole structure
      const banner = document.querySelector(
        '.horse_banner[class*="horse_banner"]'
      );
      if (banner) {
        const newContainer = document.createElement("div");
        const newImg = document.createElement("img");
        newImg.src = base64Image;

        BackgroundManagerFeature.applyImageStyles(newImg, newContainer);

        newContainer.appendChild(newImg);
        banner.insertBefore(newContainer, banner.firstChild);
      }
    }
  }

  static resetBannerBackground() {
    const bannerContainer = document.querySelector(
      '.horse_banner[class*="horse_banner"] > div[style*="position: relative"][style*="width: 960px"]'
    );
    if (bannerContainer) {
      const bannerImg = bannerContainer.querySelector("img[data-hr-styles]");
      if (bannerImg) {
        if (
          bannerContainer.children.length === 1 &&
          bannerContainer.children[0] === bannerImg
        ) {
          bannerContainer.remove();
        } else {
          bannerImg.remove();
        }
      }
    }
  }

  static applyBackgrounds() {
    chrome.storage.local.get(
      ["bannerBackground", "overrideAllBackgrounds"],
      function (result) {
        if (result.bannerBackground) {
          BackgroundManagerFeature.updateBannerBackground(
            result.bannerBackground,
            result.overrideAllBackgrounds
          );
        }
      }
    );
  }
}