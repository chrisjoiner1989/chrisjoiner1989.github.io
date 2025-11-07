# Mount Builder - Sermon Preparation & Delivery Tool

A faith-based productivity application designed specifically for pastors to prepare and deliver sermons with confidence.

## Features Overview

### 1. Sermon Outline Builder
Create comprehensive sermon outlines with dynamic sections that help organize your message structure.

**Key Features:**
- Title and date tracking
- Dynamic sermon sections with:
  - Custom headings (Introduction, Main Point 1, Conclusion, etc.)
  - Scripture references for each section
  - Detailed notes area for each point
- Add/remove sections as needed
- Automatic saving to localStorage
- Clean, distraction-free interface

### 2. Preaching Mode (Delivery Companion)
A distraction-free presentation view optimized for sermon delivery.

**Key Features:**
- Large, high-contrast text perfect for tablets and projection
- Section-by-section navigation
- Built-in sermon timer (count-up with start/pause/reset)
- Keyboard shortcuts for hands-free control
- Dark/light mode toggle
- Progress indicator showing current section
- Smooth transitions between sections

## How It Works

### Data Flow Architecture

```
┌─────────────────┐
│  Sermon Builder │
│   (index.html)  │
└────────┬────────┘
         │
         │ User creates sermon with sections
         │
         ▼
┌─────────────────┐
│  localStorage   │
│                 │
│ - currentSermon │ ← Active sermon being edited
│ - sermonsList   │ ← History of all sermons
│ - preferences   │ ← Dark mode, etc.
└────────┬────────┘
         │
         │ Data loaded on page load
         │
         ▼
┌─────────────────┐
│ Preaching Mode  │
│(preaching-mode) │
└─────────────────┘
```

### Data Structure

**Sermon Object:**
```javascript
{
  title: "Sermon Title",
  date: "2025-11-07",
  speaker: "Pastor Name",
  series: "Series Name",
  reference: "Main Scripture Reference",
  notes: "General sermon notes",
  sections: [
    {
      id: "section-1234567890",
      heading: "Introduction",
      scripture: "Matthew 5:1-12",
      notes: "Talk about the context of the Sermon on the Mount..."
    },
    // More sections...
  ],
  lastModified: "2025-11-07T10:30:00.000Z"
}
```

## File Structure

```
Mount_Builder/
├── index.html              # Main sermon builder page
├── preaching-mode.html     # Delivery interface
├── css/
│   └── style.css          # All styles including builder & preaching mode
├── js/
│   ├── sermonBuilder.js   # Sermon outline management
│   ├── preachingMode.js   # Delivery interface logic
│   ├── app.js            # Existing app functionality
│   └── [other files]     # Your existing JS files
└── assets/
    └── [images]
```

## Usage Guide

### Creating a Sermon Outline

1. **Enter Basic Information:**
   - Fill in sermon title (required)
   - Add date, speaker, series, and main scripture reference
   - Write general sermon notes in the main notes field

2. **Build Your Outline:**
   - Click "Add Section" to create a new section
   - Each section includes:
     - Heading (e.g., "Introduction", "Point 1", "Conclusion")
     - Optional scripture reference specific to that section
     - Notes area for detailed points, illustrations, or reminders
   - Add as many sections as needed for your sermon structure

3. **Organize Sections:**
   - Sections are numbered automatically
   - Delete unwanted sections using the trash icon
   - Sections auto-save as you type (with 1-second delay)

4. **Save Your Work:**
   - Click "Save Sermon" to manually save
   - Sermon is automatically saved to localStorage
   - Also saved to the sermons list (accessible from library)

### Starting Preaching Mode

1. Click "Start Preaching Mode" button
2. Your sermon loads automatically
3. Navigate using:
   - **On-screen buttons:** "Previous" and "Next"
   - **Keyboard arrows:** ← (previous) → (next)
   - **Space bar:** Start/pause timer
   - **Escape:** Exit preaching mode

### Using the Timer

- **Start:** Click play button or press Space
- **Pause:** Click pause button or press Space again
- **Reset:** Click reset button to return to 00:00:00
- Timer displays in HH:MM:SS format
- Timer continues running while navigating sections

### Dark Mode

- Toggle using the moon/sun icon in the top right
- Preference is saved for future sessions
- High contrast ensures readability in any lighting

## Technical Details

### Browser Compatibility
- Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- Uses localStorage (available in all modern browsers)

### Accessibility Features
- Semantic HTML5 elements
- ARIA labels and roles for screen readers
- Keyboard navigation support
- High contrast text for readability
- Responsive design for all screen sizes

### Styling Philosophy
- **Colors:** Soft, ministry-appropriate palette (beige, cream, burgundy accents)
- **Typography:**
  - Anton font for headings (strong, authoritative)
  - Cormorant Garamond for body text (readable, elegant)
- **Design:** Clean, peaceful, distraction-free aesthetic
- **Mobile-first:** Works seamlessly on phones, tablets, and desktop

### Storage Limits
- localStorage typically allows 5-10MB per domain
- Current implementation stores last 50 sermons
- Each sermon is typically < 10KB
- Plenty of space for extensive sermon libraries

## Keyboard Shortcuts Reference

### Preaching Mode
| Key | Action |
|-----|--------|
| `←` | Previous Section |
| `→` | Next Section |
| `Space` | Start/Pause Timer |
| `Esc` | Exit Preaching Mode |

## Development Notes

### Adding New Features

**To add a new section field:**
1. Update the HTML template in `sermonBuilder.js` → `addSection()` method
2. Update the `collectSermonData()` method to include the new field
3. Update the preaching mode display in `preachingMode.js` → `renderCurrentSection()`

**To customize the timer:**
- Edit the `PreachingMode` class in `preachingMode.js`
- Methods: `startTimer()`, `pauseTimer()`, `resetTimer()`, `updateTimerDisplay()`

**To add more keyboard shortcuts:**
- Edit `handleKeyboard()` method in `preachingMode.js`
- Add your key detection and action

### Modular Code Structure

**sermonBuilder.js:**
- `SermonBuilder` class handles all builder logic
- Methods are clearly documented with JSDoc comments
- Separate methods for add, delete, save, load operations
- Auto-save functionality with debouncing

**preachingMode.js:**
- `PreachingMode` class manages delivery interface
- Timer logic completely isolated
- Navigation methods are simple and maintainable
- Dark mode toggle with preference persistence

## Troubleshooting

**Sermon not saving:**
- Check browser's localStorage isn't disabled
- Ensure you've entered a sermon title (required)
- Look for errors in browser console (F12)

**Preaching mode shows error:**
- Make sure you saved the sermon first
- Ensure sermon has at least one section
- Clear localStorage and try again if needed

**Timer not starting:**
- Check if browser is playing/pausing on click
- Verify JavaScript is enabled
- Try refreshing the page

**Sections not appearing:**
- Verify sermonBuilder.js is loaded before app.js
- Check console for JavaScript errors
- Ensure DOM is fully loaded before initialization

## Future Enhancement Ideas

- **Export Options:** PDF, Word document, print-friendly format
- **Templates:** Pre-built sermon outline templates
- **Bible Integration:** Quick scripture lookup without leaving the builder
- **Sermon Series:** Link related sermons together
- **Notes Import:** Import from other sermon prep tools
- **Cloud Sync:** Sync sermons across devices
- **Presentation Mode:** Project directly to screen
- **Audio Recording:** Record sermon audio during delivery
- **Analytics:** Track sermon length, frequency, topics

## Credits

Built with vanilla JavaScript, HTML5, and CSS3. No frameworks, no dependencies (except for your existing PDF/PowerPoint features).

**Design Principles:**
- Calm, focused, pastor-friendly interface
- Accessibility and readability first
- Performance and simplicity
- Respectful of ministry context

---

*"Mount Builder - Building sermons that move mountains"*
