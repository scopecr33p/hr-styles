# HR Styles Project Overview

## Project Purpose
A Chrome extension (Manifest V3) that allows users with no code experience to customize styles on Horse Reality pages.

Features include foal image flipping, css style customization, and background image overrides, with an architecture designed to support future enhancements.

## Project Structure
- `/scripts` - Core extension scripts
  - `/features` - Individual feature implementations
    - `text-customization.js` - Text styling management
    - `text-element.js` - Text element class and utilities
    - `font-manager.js` - Font handling and injection
    - `style-manager.js` - Global style customization
    - `foal-flip.js` - Foal image transformation
    - `background-manager.js` - Horse background management
  - `feature-manager.js` - Central feature management system
  - `background.js` - Service worker for style management
  - `content.js` - Content script initialization and message handling
  - `features-config.json` - Feature configuration and settings
- `/popup` - Extension UI components
  - `popup.html` - Main extension interface
  - `popup.css` - UI styling
  - `popup.js` - Popup interaction logic
  - `font-handler.js` - Font upload and preview handling

## Core Architecture
- Feature-based modular system
- Ordered initialization flow:
  ```javascript:scripts/content.js
  startLine: 6
  endLine: 46
  ```
- Configuration-driven feature management
- Centralized style compilation
- Dual storage strategy (sync/local)
- Real-time updates across tabs

## Implemented Features

### Style Customization
Core styling system handling global UI elements.

Implementation Strategy:
- CSS variable-based styling
- Real-time style updates
- Storage sync for preferences
  ```javascript:scripts/features/style-manager.js
  startLine: 1
  endLine: 36
  ```

Currently Supports:
- Navigation background color/opacity
- Input field background color/opacity
- Top navigation background color/opacity
- Top navigation icons grayscale toggle
  - Applies grayscale filter to icons in both v2 and non-v2 navigation bars
  - Uses CSS filters for consistent cross-browser support
  - Real-time toggle without page reload
  - Persists settings across sessions

Technical Implementation:
- Direct CSS filter application
- No background variable interference
- Webkit prefix for broader compatibility
- Selective targeting of icon24 class and header menu icons

### Text Customization
Configuration-driven text styling system.

Implementation Strategy:
- TextElement class for encapsulated handling
- Configuration-based element definition
- Unified storage and style management
  ```javascript:scripts/features/text-customization.js
  startLine: 1
  endLine: 68
  ```

Features:
- Multiple text element support (h1, subtitles)
- Comprehensive styling options:
  - Font size (8-64px)
  - Font weight
  - Color
  - Alignment
  - Text transformation
  - Font family
  - Style toggles

### Font Management
Custom font handling system.

Implementation Strategy:
- Asynchronous font loading
- Base64 storage
- Dynamic injection
- Preview system

Technical Flow:
- Font upload and validation
- Storage in chrome.storage.local
- Dynamic @font-face injection
- Real-time application
- Integration with text customization

### Horse Background Customization
Specific functionality:
- Allows users to upload custom background images for horse profile pages
- Supports selective background replacement with toggle option
- Handles both existing and non-existing background scenarios
- Maintains consistent image dimensions and styling

UI Implementation:
- File upload button for selecting custom background
- Preview functionality in popup
- Reset button to restore original background
- Toggle for controlling background override behavior:
  - When ON: Replaces all horse backgrounds
  - When OFF: Only replaces backgrounds on horses without existing custom backgrounds

Technical details:
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

Implementation Flow:
- Initial styles injected on feature load
- Storage listener setup for real-time updates
- Background persistence across page loads
- Intelligent background replacement based on toggle state

### Foal Flipping
Specific functionality:
- Flips foal images horizontally using CSS transforms
- Targets specific URLs: https?://(?:www\.|v2\.)horsereality\.com/horses/(?:stall/)?\\d+
- Works on both www and v2 subdomains
- Only executes on horse profile pages for performance

UI Implementation:
- Single toggle in popup interface
- Persistent toggle state across pages
- Clear label and description

## Storage Architecture
Dual storage approach:
- chrome.storage.sync:
  - UI preferences
  - Style settings
  - Feature toggles
- chrome.storage.local:
  - Fonts (Base64)
  - Text styles
  - Background images

## Performance Optimizations
- Font preloading
- Style caching
- Efficient storage management
- Asynchronous operations
- Feature-specific loading
