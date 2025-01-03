# HR Styles Project Overview

## Project Purpose
A Chrome extension (Manifest V3) that allows users to customize styles on Horse Reality pages.
Features include foal image flipping, style customization, and background management, with an architecture designed to support future enhancements.

## Project Structure
- `/scripts` - Core extension scripts
  - `/features` - Individual feature implementations
    - `text-customization.js` - Text styling management
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

## Features

### General Feature Management System
- Modular architecture for managing multiple features
- General state persistence using chrome.storage.sync and chrome.storage.local
- DOM observation system for dynamic content
- Framework for registering and managing features
- Ability to define feature-specific URL patterns
- Storage listener for state changes
- Centralized style compilation and injection system
- Feature-specific URL pattern matching and exclusion support
- Real-time style updates across all active tabs

### Implemented Feature: Foal Flipping
Specific functionality:
- Flips foal images horizontally using CSS transforms
- Targets specific URLs: https?://(?:www\.|v2\.)horsereality\.com/horses/(?:stall/)?\\d+
- Works on both www and v2 subdomains
- Only executes on horse profile pages for performance

UI Implementation:
- Single toggle in popup interface
- Persistent toggle state across pages
- Clear label and description

## Technical details:
- Uses class-based transformation
- Handles multiple foal image selectors
- Style injection specific to foal flipping

### Implemented Feature: Style Customization
Color customization system:
- Uses CSS variables for efficient style updates
- Persistent storage of user preferences
- Centralized style compilation and caching
- Real-time style updates across all tabs
- High-specificity selector management
- Currently supports:
  - Navigation background color
  - Input field background color
  - Border radius customization
  - Transparent background options

Technical Implementation:
- Centralized style compilation in background service worker
- Style caching for improved performance
- Automatic style injection for new tabs
- Real-time style updates across all active tabs
- CSS variable strategy with high-specificity selectors

### Implemented Feature: Horse Background Customization
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
  - Max height of 650px for containers
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

### Implemented Feature: Text Customization
Specific functionality:
- Allows users to customize subtitle text appearance across the site
- Supports multiple text styling options:
  - Font size (8px to 64px)
  - Font weight (Normal, Medium, Semi-Bold, Bold)
  - Text color
  - Text alignment (Left, Center, Right)
  - Text transformation (Normal, Capitalize, Uppercase, Lowercase, Small Caps)
  - Text style toggles (Italic, Underline, Strikethrough)

UI Implementation:
- Size input with validation (8-64px range)
- Weight dropdown with preset options
- Color picker for text color
- Alignment dropdown
- Text transform dropdown
- Style toggle buttons for:
  - Italic formatting
  - Underline decoration
  - Strikethrough decoration

Technical details:
- Uses CSS variables for efficient style updates
- Real-time style application across tabs
- Style persistence using chrome.storage.sync
- High-specificity selectors for consistent styling
- Validation and sanitization of user inputs
- Handles multiple text decoration combinations
- Default fallback values for all properties:
  - Size: 12px
  - Weight: 400 (Normal)
  - Color: #666666
  - Style: normal
  - Align: left
  - Transform: none
  - Decoration: none

Implementation Flow:
- Initial styles loaded from storage
- Real-time style updates via storage listeners
- Centralized style compilation
- CSS variable strategy for performance
- Toggle state management for text decorations

## Scalability Features
- Modular feature architecture allowing easy addition of new features
- Centralized feature management system
- Configuration-driven feature registration
- Flexible URL pattern matching system
- Shared storage management
- Efficient style compilation and caching
- Real-time updates across all tabs
- Feature-specific enable/disable controls
- Consistent UI component structure
- Standardized message passing system

### Storage Management Strategy
- Dual storage approach:
  - chrome.storage.sync: For lightweight user preferences
    - Navigation colors and opacity
    - Input field styles
    - Foal flip settings
    - Global UI preferences
  - chrome.storage.local: For larger data and font-related settings
    - Custom fonts (Base64 encoded)
    - Font names and metadata
    - Text customization settings
    - Banner backgrounds
    - Style-specific preferences

### Font Management System
Specific functionality:
- Supports multiple font formats (.ttf, .otf, .woff, .woff2)
- Dual font system with primary and secondary fonts
- Real-time font preview and application
- Font persistence across sessions
- Automatic font injection into pages
- Font preloading and caching system

Technical Implementation:
- Base64 encoding for font storage
- Asynchronous font loading and application
- Font face injection using dynamic style elements
- Unique font family naming convention ("HR-primary", "HR-secondary")
- Error handling for invalid font files
- Loading state management during upload
- Font preview system with visual feedback

Storage and Caching Strategy:
- Background service worker maintains font cache using Map
- Fonts stored in chrome.storage.local for persistence
- Font styles injected before other CSS for performance
- Preload resource hints for faster font loading
- font-display: swap for better loading behavior
- Centralized font injection through background script

Implementation Flow:
- Font selection through file input
- Validation of font file type and size
- Conversion to Base64 using FileReader
- Storage in chrome.storage.local
- Cache update in background service worker
- Dynamic @font-face rule injection with preload
- Real-time application across active tabs
- Preview update with loading states

Integration with Text Customization:
- Font family selection in text styling
- Seamless switching between custom fonts
- Fallback to system fonts when custom fonts unavailable
- Consistent font application across all styled elements

### Storage and Caching Architecture
Global Storage Strategy:
- chrome.storage.sync:
  - Lightweight preferences (colors, toggles, etc)
  - UI state and settings
  - Feature enable/disable states
- chrome.storage.local:
  - Font data (Base64 encoded)
  - Background images
  - Large binary assets
  - Feature-specific data

Caching System:
- Background Service Worker:
  - Maintains style cache for quick injection
  - Caches compiled CSS
  - Stores font data in memory
  - Handles style updates across tabs
- Content Script:
  - Preloads fonts on initialization
  - Manages feature-specific caches
  - Handles dynamic content updates

Performance Optimizations:
- Font preloading using resource hints
- Prioritized style injection order
- Memory-efficient caching using Maps
- Asynchronous style compilation
- Real-time style updates without page reload
- Efficient storage listener management

Error Handling:
- Graceful fallbacks for missing fonts
- Storage quota management
- Invalid file type detection
- Failed injection recovery
- Cross-tab synchronization error handling

### Text Customization Refactoring
The text customization system was refactored to improve scalability and maintainability. Key improvements include:

#### Architecture Changes
- Introduced TextElement class for encapsulated text element handling
- Moved from individual element management to a configuration-driven approach
- Centralized storage key generation and style property management
- Unified style application across all text elements

#### Key Components
1. TextElement Class:
   - Handles individual text element configuration
   - Manages style properties and storage keys
   - Generates CSS based on applied styles
   - Provides consistent interface for all text elements

2. Configuration-Driven Setup:
   - Text elements defined in features-config.json
   - Each element specifies:
     - Selector for targeting
     - Default values for all properties
     - Supported style properties

3. Unified Storage Management:
   - Consistent storage key generation
   - Shared style property handling
   - Centralized style application
   - Real-time updates across elements

#### Implementation Details
1. Storage Key Generation:
   - Format: `${elementName}${propertyName}`
   - Example: "subtitleSize", "h1Color"
   - Consistent across all text elements

2. Style Properties:
   - Standardized property set:
     - size (8px-64px)
     - weight
     - color
     - align
     - transform
     - font
     - italic
     - underline
     - strike

3. Default Management:
   - Defaults defined in config
   - Consistent fallback values
   - Applied before user customizations

4. Event Handling:
   - Unified listener attachment
   - Consistent update triggers
   - Shared style application logic

#### Benefits
1. Scalability:
   - Easy addition of new text elements
   - Consistent handling across elements
   - Reduced code duplication

2. Maintainability:
   - Centralized configuration
   - Consistent property handling
   - Clear separation of concerns

3. Performance:
   - Efficient style generation
   - Optimized storage access
   - Reduced redundant updates

#### Code References
- Text Customization Feature:
```javascript:scripts/features/text-customization.js
startLine: 1
endLine: 68
```
<code_block_to_apply_changes_from>
```javascript:popup/popup.js
startLine: 63
endLine: 91
```
- Style Application:
```javascript:popup/popup.js
startLine: 303
endLine: 337
```

#### Migration Notes
- Existing storage keys maintained for compatibility
- No breaking changes to user settings
- Seamless transition for existing customizations
- Enhanced support for future text elements

This refactoring provides a robust foundation for future text customization features while maintaining all existing functionality and user preferences.
