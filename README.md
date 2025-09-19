# Mount Builder

A simple web app for organizing sermon prep. Made this because pastors at my church were using messy Word
docs and handwritten notes and seemed like it would be a good project to address those organization issues for Pastors and other speakers in the church.

## What it does

- Search for Bible verses using multiple APIs (7 different translations)
- Save sermon details (speaker, title, date, notes, etc.)
- Full Bible reader with chapter browsing and mobile-optimized reading
- Calendar view for scheduling and planning sermon series
- Library to search/filter through saved sermons
- Export everything as a clean printable document
- Stores everything in your browser so nothing gets lost

## How to use it

Just open `index.html` in your browser. No installation needed.

1. Fill out the sermon form
2. Search for Bible verses if you want
3. Click "Add Verse" to put verses in your notes
4. Hit "Save Sermon" when you're done
5. Use "Export" to get a printable file

## stack used

- Plain HTML/CSS/JavaScript (no frameworks)
- Multiple Bible APIs: bible-api.com and bolls.life for translation coverage
- LocalStorage keeps your data saved
- Mobile-first responsive design with touch optimization
- PWA manifest for app-like mobile experience

## Features I'm proud of

- The verse search actually works pretty well
- Export creates professional-looking documents
- Mobile layout doesn't completely break (took forever to fix)
- Real-time validation for Bible references
- Multiple Bible translations working (NKJV, ESV, NLT, etc.) with smart API switching
- Full Bible reader with mobile-optimized interface that auto-hides navigation
- Sermon library with search/filter functionality
- Everything saves locally so no accounts or cloud stuff needed

## Known issues

- Export is HTML not actual PDF (good enough though)
- Verse search sometimes fails if the API is down
- Mobile Bible reader header sometimes gets in the way (mostly fixed with auto-hide)

## Running it

1. Download the files
2. Open `index.html` in any browser
3. That's it

No fancy setup required. Just works

## Future features (some done, some still todo)

Add a calendar interface where you can see all your sermons by date, drag and drop to reschedule, and get
visual overview of your sermon series timeline. Would make planning way easier.~~

Actually implemented this and it works pretty well. Drag and drop between dates, monthly view, shows sermon titles on calendar days.

Let users pick different Bible versions (NIV, ESV, NASB, etc.) when searching verses. The API supports this,
just need to add a dropdown and update the search function.

Got 7 translations working: WEB, KJV, NKJV, ESV, NLT, ASV, BBE. Had to use two different APIs because free ones don't have everything but it auto-switches based on what you pick.

3. Sermon Templates

Create pre-made templates for different sermon types (expository, topical, series kickoff) with suggested
sections and prompts. Users could start from a template instead of blank forms.

Built a whole library section with search, filter by speaker, sort options, and edit/delete functions. Works better than expected.

5. A fully functional back-end with unit tests files has been started but not done

6. Offline reading mode for Bible chapters (maybe cache frequently used books)

7. Series planning tools (outline multiple sermons in a series at once)
# Updated Fri Sep 19 15:06:57 EDT 2025
