# HR Styles Project Overview

## Project Purpose
A Chrome extension (Manifest V3) that allows users to customize styles on Horse Reality pages.
Features include foal image flipping, style customization, and background management, with an architecture designed to support future enhancements.

## Project Structure
- `/scripts` - Core extension scripts
  - `/features` - Individual feature implementations
  - `feature-manager.js` - Central feature management system
  - `background.js` - Service worker for style management
  - `content.js` - Content script initialization
- `/popup` - Extension UI components
  - `popup.html` - Main extension interface
  - `popup.css` - UI styling
  - `popup.js` - Popup interaction logic
- `/test` - Testing utilities

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