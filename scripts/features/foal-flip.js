class FoalFlipFeature {
  static init() {
    // Create and inject styles immediately if document.head exists
    if (document.head) {
      this.injectStyles();
    } else {
      // Otherwise wait for DOM to be ready
      document.addEventListener("DOMContentLoaded", () => {
        this.injectStyles();
      });
    }

    // Set up storage listeners
    chrome.storage.sync.get(["flipFoals"], (result) => {
      if (result.flipFoals) {
        this.applyFlip(true);
      }
    });

    chrome.storage.sync.onChanged.addListener((changes) => {
      if (changes.flipFoals) {
        this.applyFlip(changes.flipFoals.newValue);
      }
    });

    // Set up mutation observer
    const observer = new MutationObserver(() => {
      chrome.storage.sync.get(["flipFoals"], (result) => {
        if (result.flipFoals) {
          this.applyFlip(true);
        }
      });
    });

    if (document.body) {
      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        observer.observe(document.body, {
          childList: true,
          subtree: true,
        });
      });
    }

    return {
      apply: (enabled) => this.applyFlip(enabled),
    };
  }

  static injectStyles() {
    if (!document.getElementById("foal-flip-styles")) {
      const style = document.createElement("style");
      style.id = "foal-flip-styles";
      style.textContent = `
        .flip-horizontal {
          transform: scaleX(-1) !important;
          -webkit-transform: scaleX(-1) !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  static applyFlip(enabled) {
    const selectors = ["img.foal", 'img[class*="foal"]', 'img[src*="foal"]'];
    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((img) => {
        if (enabled) {
          img.classList.add("flip-horizontal");
        } else {
          img.classList.remove("flip-horizontal");
        }
      });
    });
  }
}

if (
  window.location.href.match(
    /https?:\/\/(?:www\.|v2\.)horsereality\.com\/horses\/(?:stall\/)?\d+/
  )
) {
  FoalFlipFeature.init();
}
