# HR Styles Project Overview

## Project Purpose
A Chrome extension (Manifest V3) that allows users with no code experience to customize styles on Horse Reality pages.
Features include foal image flipping, css style customization, and background image overrides, with an architecture designed to support future enhancements.

## Project Structure
- manifest.json - Extension manifest
- handover.md - This file, containing the project overview and useful information
- **/popup** - Extension UI components
  - popup.html - Main extension interface
  - popup.css - UI styling
  - popup.js - Popup interaction logic
- **/scripts** - Core extension scripts
  - background.js - Service worker for background tasks
  - content.js - Content script initialization
  - features-config.json - Feature configuration
  - **/features** - Feature modules
    - background-manager.js - Horse background customization
    - foal-flip.js - Foal image transformation
    - font-manager.js - Font handling and injection
    - style-manager.js - Global style customization
    - text-customization.js - Text styling system
    - text-element.js - Text element utilities

## Core Architecture

### UI Organization
The popup interface uses a tabbed navigation system with four main sections:
- Appearance - Color and style settings
- Typography - Font and text customization
- Images - Background and foal image settings
- Settings - Reset and settings options

Each section contains collapsible setting groups (accordions) that:
- Open/close on header click
- Remember their state between sessions
- Use CSS transitions for smooth animations
- Load in collapsed state without animation if previously closed

#### Implementation Strategy:
- CSS-driven animations using max-height and padding
- State persistence using chrome.storage.local
- Unique IDs based on heading text
- Separate animation class to prevent initial transition

#### Storage Pattern:
{
  accordionStates: {
    "navigation": false,
    "interface": true,
    "custom-fonts": false
    // etc...
  }
}

#### Technical Implementation:
- Uses CSS for all animations and transitions
- JavaScript only handles state management and toggle
- Prevents initial animation flash when loading closed accordions
- Maintains consistent styling with existing UI elements
- Resets accordion states when all settings are reset

### Style Customization
Core styling system handling global UI elements.

#### Implementation Strategy:
- CSS variable-based styling
- Real-time style updates
- Storage sync for preferences

#### Currently Supports:
- Navigation background color/opacity
- Input field background color/opacity
- Top navigation background color/opacity
- Top navigation icons grayscale toggle
  - Applies grayscale filter to icons in both v2 and non-v2 navigation bars
  - Uses CSS filters for consistent cross-browser support
  - Real-time toggle without page reload
  - Persists settings across sessions

#### Technical Implementation:
- Direct CSS filter application
- No background variable interference
- Webkit prefix for broader compatibility
- Selective targeting of icon24 class and header menu icons

### Text Customization
Configuration-driven text styling system.

#### Implementation Strategy:
- TextElement class for encapsulated handling
- Configuration-based element definition
- Unified storage and style management
- Shared helper functions for consistent behavior

#### Features:
- Multiple text element support (h1, subtitles)
- Comprehensive styling options:
  - Font size (8-64px)
  - Font weight
  - Color
  - Alignment
  - Text transformation
  - Font family
  - Style toggles (italic, underline, strikethrough)

#### Storage Pattern:

<----CODE START---->
{
  [${elementType}Size]: element.size.value,
  [${elementType}Weight]: element.weight.value,
  [${elementType}Color]: element.color.value,
  [${elementType}Align]: element.align.value,
  [${elementType}Transform]: element.transform.value,
  [${elementType}Font]: element.font.value,
  [${elementType}Italic]: element.italic.classList.contains("active"),
  [${elementType}Underline]: element.underline.classList.contains("active"),
  [${elementType}Strike]: element.strike.classList.contains("active")
}
<----CODE END---->

## Font Management

The font management system is split into two parts:

### Popup Context (popup.js)
Handles:
- Font file uploads
- Saving fonts to Chrome storage
- UI updates in the extension popup
- Sending messages to content scripts (when possible)

### Content Script Context (font-manager.js)
The FontManagerFeature class handles:
- Injecting fonts into web pages
- Listening for storage changes
- Creating font-face declarations
- Applying fonts to webpages

### How it works
1. User uploads font in popup
2. Popup converts font to base64 and saves to Chrome storage
3. FontManagerFeature detects storage change
4. FontManagerFeature injects font into webpage

### Font Storage
Fonts are stored in Chrome's local storage as:
- primaryFont: base64 font data
- primaryFontName: original filename
- secondaryFont: base64 font data
- secondaryFontName: original filename

### Supported Font Types
- TTF
- OTF
- WOFF
- WOFF2

### Horse Background Customization

#### Specific functionality:
- Allows users to upload custom background images for horse profile pages
- Supports selective background replacement with toggle option
- Handles both existing and non-existing background scenarios
- Maintains consistent image dimensions and styling

#### UI Implementation:
- File upload button for selecting custom background
- Preview functionality in popup
- Reset button to restore original background
- Toggle for controlling background override behavior:
  - When ON: Replaces all horse backgrounds
  - When OFF: Only replaces backgrounds on horses without existing custom backgrounds

#### Technical details:
- Uses chrome.storage.local for image storage (Base64)
- Implements selective background replacement logic
- Maintains consistent styling:
  - Max height of 600px for containers
  - object-fit: cover for proper image scaling
  - Consistent positioning and dimensions
- Image handling:
  - Validates file type and size
  - Converts to Base64 for storage
  - Marks extension-created images with data attributes
- URL pattern matching:
  - Only applies to horse profile pages
  - Works across both www and v2 subdomains

### Foal Flipping

#### Specific functionality:
- Flips foal images horizontally using CSS transforms
- Targets specific URLs: https?://(?:www\.|v2\.)horsereality\.com/horses/(?:stall/)?\\d+
- Works on both www and v2 subdomains
- Only executes on horse profile pages for performance

#### UI Implementation:
- Single toggle in popup interface
- Persistent toggle state across pages
- Clear label and description

### Message Handling
The extension uses a consolidated message handling system to prevent async response issues:

<----CODE START---->
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case "updateFont":
      try {
        FontManagerFeature.injectFontFace(message.fontType, message.fontData);
        TextCustomizationFeature.loadAndApplyStyles();
        sendResponse({ success: true });
      } catch (error) {
        console.error("Font update error:", error);
        sendResponse({ success: false, error: error.message });
      }
      break;
    case "updateTextStyles":
      TextCustomizationFeature.loadAndApplyStyles();
      sendResponse({ success: true });
      break;
    case "updateTopNavIcons":
      const filterValue = message.grayscale ? "grayscale(100%)" : "none";
      const icons = document.querySelectorAll(".icon24, .header-menu img");
      icons.forEach((icon) => {
        icon.style.filter = filterValue;
      });
      sendResponse({ success: true });
      break;
  }
});
<----CODE END---->

### Message Handling Best Practices
- Always return true in message listeners to keep channel open
- Use synchronous storage -> message pattern for UI updates
- Avoid async/await with message handling
- Follow established pattern:
  1. UI change triggers storage update
  2. Storage callback sends message
  3. Content script handles message and applies changes
  4. Content script returns success/failure

Example pattern:
<----CODE START---->
// UI handler
element.addEventListener("change", function() {
  chrome.storage.local.set({ key: value }, () => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: "updateType" });
      }
    });
  });
});

// Content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle message
  sendResponse({ success: true });
  return true;
});
<----CODE END---->

### Storage Architecture
Dual storage approach:
- **chrome.storage.sync:**
  - UI preferences
  - Style settings
  - Feature toggles
- **chrome.storage.local:**
  - Active tab state
  - Fonts (Base64)
  - Text styles
  - Background images

### Performance Optimizations
- Font preloading
- Style caching
- Efficient storage management
- Asynchronous operations
- Feature-specific loading
- Consolidated message handling
- Persistent UI state

### Best Practices
- Always use storage.local for large data (fonts, images)
- Implement proper error handling for file operations
- Validate all user inputs
- Use consistent message patterns
- Maintain backwards compatibility
- Document all changes
- Test across different Chrome versions

# Reset Management

## Overview
The reset functionality is centralized in a ResetManager class that handles resetting all styles and UI elements to their defaults. This ensures consistent reset behavior and makes it easier to maintain and extend reset functionality.

## Implementation Strategy
- Single ResetManager class in reset-manager.js
- Handles both UI element resets and style application
- Uses features-config.json for default values
- Maintains existing style update patterns

## Core Components

### ResetManager Class
Located in scripts/features/reset-manager.js, handles:
- Individual feature resets (banner, navigation, text styles)
- Global reset functionality
- Default value application
- Style updates after reset

### Configuration
Default values stored in features-config.json:
- Text sizes (h1, subtitle)
- Color values
- Other style defaults

### Integration Points
Reset functionality is integrated through:
1. HTML: Script loaded in popup.html
2. Manifest: Included in content_scripts
3. Popup: ResetManager instance created with required elements and update functions

## Adding New Reset Functionality
To add reset capability for a new style feature:

1. Add default values to features-config.json if needed
2. Create reset method in ResetManager class
3. Pass required elements to ResetManager constructor
4. Add style update function call in resetAll method
5. Pass update function from popup.js

Example steps for adding new background color reset:
1. Add default color to features-config.json
2. Create resetBackground method in ResetManager
3. Pass background elements to constructor
4. Add updateBackground call in resetAll
5. Pass updateBackground function from popup.js

## Technical Implementation
- ResetManager available globally through window object
- Static methods for shared functionality (setElementDefaults)
- Instance methods for specific reset operations
- Maintains existing style update patterns

## Script Loading and Architecture

### Module Pattern
The extension uses a classic script loading pattern rather than ES modules. This is intentional as Chrome extensions cannot use `type: "module"` in content scripts by default.

Scripts are loaded in a specific order via the manifest's content_scripts array. Each feature is self-contained and initialized through the feature manager system.

### Adding New Features
When adding a new feature:

1. Create your feature script in `scripts/features/`
2. Add it to manifest.json's content_scripts array *before* feature-manager.js
3. Use the global scope for sharing functionality - do not use import/export statements
4. Register your feature with the feature manager using `FeatureManager.register()`

### Script Load Order
The load order in manifest.json is critical:
1. Core utilities and managers load first
2. Individual features load next
3. Feature manager loads after all features
4. Main content script loads last

This ensures all dependencies are available when needed.

### State Management
Features should use the FeatureManager for:
- Registration
- Settings management
- Feature toggling
- Cross-feature communication

Avoid creating module-level dependencies between features. Instead, use the FeatureManager's event system for cross-feature communication.