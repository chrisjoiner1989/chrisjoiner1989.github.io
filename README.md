# Mount Builder

A simple web app for organizing sermon prep. Made this because pastors at my church were using messy Word
docs and handwritten notes and seemed like it would be a good project to address those organization issues for Pastors and other speakers in the church.

## What it does

- Search for Bible verses using an API
- Save sermon details (speaker, title, date, notes, etc.)
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
- Uses the Bible API for verse lookup
- LocalStorage keeps your data saved
- Mobile-friendly design

## Features I'm proud of

- The verse search actually works pretty well
- Export creates professional-looking documents
- Mobile layout doesn't completely break (took forever to fix)
- Real-time validation for Bible references

## Known issues

- Only works with one Bible translation
- Export is HTML not actual PDF (good enough though)
- Verse search sometimes fails if the API is down

## Running it

1. Download the files
2. Open `index.html` in any browser
3. That's it

No fancy setup required. Just works

## Future features

1. Sermon Calendar View

Add a calendar interface where you can see all your sermons by date, drag and drop to reschedule, and get
visual overview of your sermon series timeline. Would make planning way easier.

2. Multiple Bible Translations

Let users pick different Bible versions (NIV, ESV, NASB, etc.) when searching verses. The API supports this,
just need to add a dropdown and update the search function.

3. Sermon Templates

Create pre-made templates for different sermon types (expository, topical, series kickoff) with suggested
sections and prompts. Users could start from a template instead of blank forms.

4. Past Sermons

Add a page that shows all your saved sermons in a searchable list. Filter by speaker, series, or date range.
Click any sermon to view/edit it. Basically turn it into a proper sermon library instead of just saving and
forgetting.

This would be really useful since right now you save sermons but can't easily go back and reference old ones
or reuse content from previous series.
