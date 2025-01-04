class InventoryManagerFeature {
  static init() {
    if (window.location.href.includes("horsereality.com/inventory")) {
      // Initial setup
      if (window.innerWidth > 768) {
        setTimeout(() => this.setupInventoryLayout(), 100);
      }

      // Add resize listener
      window.addEventListener("resize", this.handleResize.bind(this));
    }
    return {
      apply: () => this.handleResize(),
    };
  }

  static handleResize() {
    const wrapper = document.getElementById("inventory-store-wrapper");

    if (window.innerWidth <= 768) {
      // Remove wrapper if it exists
      if (wrapper) {
        // Move elements back to their original location
        const container = document.querySelector(".container_12.center");
        const breadcrumbs = container.querySelector(".breadcrumbs");
        const storeLeft = wrapper.querySelector("#store_left");
        const storeRight = wrapper.querySelector("#store_right");

        if (breadcrumbs && storeLeft && storeRight) {
          breadcrumbs.parentNode.insertBefore(storeLeft, wrapper);
          breadcrumbs.parentNode.insertBefore(storeRight, wrapper);
          wrapper.remove();
        }
      }
    } else {
      // Add wrapper if it doesn't exist
      if (!wrapper) {
        this.setupInventoryLayout();
      }
    }
  }

  static setupInventoryLayout() {
    // Only proceed if window is wide enough
    if (window.innerWidth <= 768) return;

    // Get the container div
    const container = document.querySelector(".container_12.center");
    if (!container) return;

    // Get the elements we need to work with
    const breadcrumbs = container.querySelector(".breadcrumbs");
    const storeLeft = document.getElementById("store_left");
    const storeRight = document.getElementById("store_right");

    if (breadcrumbs && storeLeft && storeRight) {
      // Check if wrapper doesn't already exist
      if (!document.getElementById("inventory-store-wrapper")) {
        console.log("Creating inventory store wrapper");

        // Create wrapper
        const wrapper = document.createElement("div");
        wrapper.id = "inventory-store-wrapper";
        wrapper.style.display = "inline-flex";

        // Insert wrapper after breadcrumbs
        breadcrumbs.insertAdjacentElement("afterend", wrapper);

        // Move store elements into wrapper
        wrapper.appendChild(storeLeft);
        wrapper.appendChild(storeRight);

        console.log("Inventory layout setup complete");
      }
    }
  }
}
