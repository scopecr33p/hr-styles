// First find all elements
document.querySelectorAll("*").forEach((el) => {
  const computed = window.getComputedStyle(el);
  if (
    computed.background.includes("rgb(234, 240, 242)") ||
    computed.color.includes("rgb(234, 240, 242)") ||
    computed.borderColor.includes("rgb(234, 240, 242)")
  ) {
    el.style.setProperty("background", "#f1eaf3", "important");
    el.style.setProperty("color", "#f1eaf3", "important");
    el.style.setProperty("border-color", "#f1eaf3", "important");
  }
});

// Force refresh
document.documentElement.style.webkitTransform = "scale(1)";
