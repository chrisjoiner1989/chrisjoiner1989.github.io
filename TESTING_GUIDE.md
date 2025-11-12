# Bible Reader Testing Guide

## Quick Test Steps

### 1. Open the Bible Reader
1. Navigate to `bible.html` in your browser
2. You should see:
   - YouVersion-style top navigation bar
   - Clean welcome screen with inspirational verse
   - "Select Book" button in the top left

### 2. Test Book/Chapter Selection
1. Click the "Select Book" button in the top nav
2. A modal should appear with:
   - Translation dropdown (default: World English Bible)
   - Two side-by-side lists: Books and Chapters
3. Select a book (e.g., "John")
4. Select a chapter (e.g., "3")
5. Modal should close automatically
6. Scripture should load with beautiful formatting

### 3. Verify Verse Display
Check that verses display with:
- Large, readable serif font
- Verse numbers in superscript
- Proper spacing between verses
- Clean, distraction-free layout

### 4. Test Verse Interactions
1. Click on any verse
2. Verse should highlight in blue
3. Action toolbar should appear at the bottom with 4 buttons:
   - Copy
   - Highlight
   - Share
   - Note

### 5. Test Copy Feature
1. Select a verse
2. Click "Copy" button
3. Check your clipboard - should contain: "Reference:Number - Text"
4. A notification should appear saying "Verse copied to clipboard!"

### 6. Test Highlight Feature
1. Select a verse
2. Click "Highlight" button
3. Verse should get a yellow/cream background
4. Refresh the page and load the same chapter
5. Highlighted verse should still be highlighted (localStorage)

### 7. Test Share Feature
1. Select a verse
2. Click "Share" button
3. On mobile: Native share sheet should appear
4. On desktop: Verse should be copied to clipboard

### 8. Test Settings
1. Click the settings icon (gear) in top right
2. Modal should open with:
   - Font size controls (Small, Medium, Large, XLarge)
   - Theme controls (Light, Sepia, Dark)
3. Test changing font size - text should resize
4. Test changing theme - colors should change smoothly

### 9. Test Theme Switching
1. Open settings
2. Click "Dark" theme
3. UI should transition to dark mode:
   - Background: #121212
   - Text: #EAEAEA
   - Accent: #0D6EFD
4. Try "Sepia" theme for warm reading experience

### 10. Test Chapter Navigation
1. Load a chapter
2. Chapter navigation footer should appear
3. Click "Next" button
4. Should load the next chapter
5. Click "Previous" button
6. Should load the previous chapter

### 11. Test Responsive Design
1. Resize browser window to mobile size (375px)
2. Check that:
   - Top nav remains functional
   - Modals are mobile-friendly
   - Action toolbar fits on screen
   - Text is readable

## Common Issues & Solutions

### Issue: Verses not displaying
**Possible causes:**
1. API might be slow or down
2. Translation not supported

**Solution:**
1. Open browser console (F12)
2. Look for error messages
3. Check console logs for API response
4. Try a different translation (WEB or KJV work best)

### Issue: Highlight not persisting
**Possible causes:**
1. localStorage disabled
2. Private browsing mode

**Solution:**
1. Check if cookies/localStorage is enabled
2. Exit private browsing mode

### Issue: Modal not closing
**Possible causes:**
1. JavaScript error
2. Click event not firing

**Solution:**
1. Check console for errors
2. Click the X button to close
3. Click outside the modal to close

### Issue: Styles not loading
**Possible causes:**
1. CSS file not found
2. Cache issue

**Solution:**
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Check that `css/bible-reader.css` exists
3. Clear browser cache

## Browser Console Checks

Open the browser console (F12) and look for:

### Expected Log Messages
```
Bible page loading...
Bible reader initialized
Initializing YouVersion-style Bible Reader UI...
Bible Reader UI initialized
```

### When Loading a Chapter
```
updateChapterDisplayYouVersion received: {reference: "John 3", text: "1. ...", translation: "WEB"}
Parsed verses: 36
```

### Debug Commands
You can run these in the console:

```javascript
// Check if functions are loaded
typeof updateChapterDisplayYouVersion // should be "function"
typeof loadBibleChapter // should be "function"

// Check current state
window.currentBook // should show current book
window.currentChapter // should show current chapter

// Check highlighted verses
localStorage.getItem('bible-highlighted-verses')

// Check theme
document.documentElement.getAttribute('data-theme')

// Check font size
document.documentElement.getAttribute('data-font-size')
```

## Performance Checks

### Page Load
- First Paint: < 500ms
- Interactive: < 1s

### Chapter Load
- API Request: 1-3s
- Render: < 100ms

### Interactions
- Verse selection: Instant
- Modal open/close: 300ms animation
- Theme change: Smooth transition

## Accessibility Checks

### Keyboard Navigation
1. Tab through all interactive elements
2. Should see focus indicators
3. Press Enter to activate buttons

### Screen Reader
1. Enable screen reader
2. Navigate through the page
3. Check that:
   - ARIA labels are read
   - Modals announce properly
   - Verses are readable

## Mobile-Specific Tests

### iOS Safari
1. Test on iPhone
2. Check safe area support (notch)
3. Test swipe gestures
4. Check Web Share API

### Android Chrome
1. Test on Android device
2. Check touch interactions
3. Test back button behavior
4. Check clipboard API

## API Testing

### Test Different Translations
1. WEB (World English Bible) - Default, reliable
2. KJV (King James Version) - Classic
3. NKJV (New King James) - May be slower
4. ESV (English Standard) - May require different API
5. NLT (New Living Translation) - May be slower

### Test Different Books
1. Short book: Jude (1 chapter)
2. Medium book: Philippians (4 chapters)
3. Long book: Psalms (150 chapters)

### Test Edge Cases
1. Very long chapter: Psalm 119
2. Very short chapter: Psalm 117
3. First chapter: Genesis 1
4. Last chapter: Revelation 22

## What Success Looks Like

✅ Clean, modern interface
✅ Fast, smooth interactions
✅ Readable typography
✅ Working verse selection and actions
✅ Persistent highlights
✅ Theme switching works
✅ Font size adjustment works
✅ Chapter navigation works
✅ Modals open and close smoothly
✅ Mobile responsive
✅ No console errors

## Reporting Issues

If you find bugs, note:
1. What you were doing
2. What you expected to happen
3. What actually happened
4. Browser and device info
5. Console error messages
6. Screenshots if helpful
