// Function to convert all select elements to searchable dropdowns
function makeSelectsSearchable() {
  // Get only the specified select elements
  const targetIds = [
    "horseSelectForMarket",
    "itemSelectForMarket",
    "semenSelectForMarket",
    "secondhorse",
  ];
  const selects = targetIds
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  selects.forEach((select) => {
    // Create wrapper div
    const wrapper = document.createElement("div");
    wrapper.style.position = "relative";
    wrapper.style.display = "inline-block";
    wrapper.style.pointerEvents = "auto";
    select.parentNode.insertBefore(wrapper, select);
    wrapper.appendChild(select);

    // Create search input
    const searchInput = document.createElement("input");
    searchInput.type = "text";
    searchInput.placeholder = "Search...";
    searchInput.style.width = select.offsetWidth + "px";
    searchInput.style.display = "none";
    wrapper.insertBefore(searchInput, select);

    // Create results dropdown
    const dropdown = document.createElement("div");
    dropdown.style.position = "absolute";
    dropdown.style.top = "100%";
    dropdown.style.left = "0";
    dropdown.style.right = "0";
    dropdown.style.maxHeight = "200px";
    dropdown.style.overflowY = "auto";
    dropdown.style.backgroundColor = "white";
    dropdown.style.border = "1px solid #ccc";
    dropdown.style.borderRadius = "4px";
    dropdown.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
    dropdown.style.display = "none";
    dropdown.style.zIndex = "1000";
    wrapper.appendChild(dropdown);

    // Store original options
    const originalOptions = Array.from(select.options).map((opt) => ({
      value: opt.value,
      text: opt.text,
      element: opt,
    }));

    // Show search on select click
    select.addEventListener("mousedown", (e) => {
      e.preventDefault();
      select.style.display = "none";
      searchInput.style.display = "block";
      searchInput.focus();
      filterOptions("");
    });

    // Handle search input
    searchInput.addEventListener("input", (e) => {
      filterOptions(e.target.value.toLowerCase());
    });

    // Handle clicking outside
    document.addEventListener("click", (e) => {
      if (!wrapper.contains(e.target)) {
        hideSearch();
      }
    });

    // Filter and display options
    function filterOptions(query) {
      dropdown.innerHTML = "";
      dropdown.style.display = "block";

      const filtered = originalOptions.filter((opt) =>
        opt.text.toLowerCase().includes(query)
      );

      filtered.forEach((opt) => {
        const div = document.createElement("div");
        div.textContent = opt.text;
        div.style.padding = "8px 12px";
        div.style.cursor = "pointer";

        div.addEventListener("mouseover", () => {
          div.style.backgroundColor = "#f0f0f0";
        });

        div.addEventListener("mouseout", () => {
          div.style.backgroundColor = "";
        });

        div.addEventListener("click", () => {
          select.value = opt.value;
          // Dispatch both input and change events to ensure proper triggering
          select.dispatchEvent(new Event("input", { bubbles: true }));
          select.dispatchEvent(new Event("change", { bubbles: true }));
          // Force trigger a native change event as fallback
          const nativeEvent = document.createEvent("HTMLEvents");
          nativeEvent.initEvent("change", true, false);
          select.dispatchEvent(nativeEvent);
          hideSearch();
        });

        dropdown.appendChild(div);
      });
    }

    // Hide search and show original select
    function hideSearch() {
      searchInput.style.display = "none";
      dropdown.style.display = "none";
      select.style.display = "block";
      searchInput.value = "";
    }

    // Handle keyboard navigation
    searchInput.addEventListener("keydown", (e) => {
      const items = dropdown.children;
      const current = dropdown.querySelector(":hover");
      let next;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          if (!current) {
            next = items[0];
          } else {
            next = current.nextElementSibling || items[0];
          }
          if (next) next.dispatchEvent(new Event("mouseover"));
          break;

        case "ArrowUp":
          e.preventDefault();
          if (!current) {
            next = items[items.length - 1];
          } else {
            next = current.previousElementSibling || items[items.length - 1];
          }
          if (next) next.dispatchEvent(new Event("mouseover"));
          break;

        case "Enter":
          e.preventDefault();
          if (current) {
            current.click();
          }
          break;

        case "Escape":
          e.preventDefault();
          hideSearch();
          break;
      }
    });
  });
}

// Run the conversion
makeSelectsSearchable();
