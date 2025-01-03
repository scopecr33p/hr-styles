async function handleFontUpload(file, type, preview) {
  try {
    if (!file) return;

    preview.textContent = "Uploading...";

    // Create a FileReader to convert file to base64
    const reader = new FileReader();

    const fontData = await new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    // Store the font data
    await chrome.storage.local.set({
      [`${type}Font`]: fontData,
      [`${type}FontName`]: file.name,
    });

    // Send message to content script to update fonts
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {
          type: "updateFont",
          fontType: type,
          fontData: fontData,
        });
      }
    });

    preview.textContent = file.name;
    preview.classList.add("loaded");
  } catch (error) {
    console.error("Font upload failed:", error);
    preview.textContent = "Upload failed";
    preview.classList.remove("loaded");
  }
}
