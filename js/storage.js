// main save function - validates form and stores to localStorage
function saveSermon(e) {
  e.preventDefault();

  // get all values from form inputs
  const titleInput = document.getElementById("title");
  const speakerInput = document.getElementById("speaker");
  const dateInput = document.getElementById("date");
  const seriesInput = document.getElementById("series");
  const notesInput = document.getElementById("notes");
  const referenceInput = document.getElementById("reference");

  const title = titleInput ? titleInput.value.trim() : "";
  const speaker = speakerInput
    ? speakerInput.value.trim() || "Guest Speaker"
    : "Guest Speaker";
  const date = dateInput ? dateInput.value : "";
  const series = seriesInput ? seriesInput.value.trim() : "";
  const notes = notesInput ? notesInput.value.trim() : "";
  const reference = referenceInput ? referenceInput.value.trim() : "";

  // validation
  if (!title) {
    alert("Please enter a sermon title");
    if (titleInput) titleInput.focus();
    return;
  }

  if (!date) {
    alert("Please select a date for the sermon");
    if (dateInput) dateInput.focus();
    return;
  }

  // Get tags from tag UI if available
  const tags = window.getCurrentTags ? window.getCurrentTags() : [];

  // creates sermon object
  const newSermon = {
    id: Date.now(), // simple ID
    title: title,
    speaker: speaker,
    date: date,
    series: series || "General",
    notes: notes,
    verseReference: reference,
    verseData: currentVerseData, // includes full verse text if searched
    tags: tags, // sermon tags
    savedAt: new Date().toISOString(),
  };

  // adds to array
  sermons.push(newSermon);

  // saves to localStorage
  saveToStorage();

  // shows success
  alert("✓ Sermon saved successfully!");

  // analyzes the data after save
  analyzeSermons();

  // clears the  form
  clearForm();
}
// shows stats in console - wanted to track sermon patterns
function analyzeSermons() {
  if (sermons.length === 0) return;

  // calculate various usage statistics
  const totalSermons = sermons.length;
  const sermonsWithVerses = sermons.filter((s) => s.verseReference).length;
  const avgNotesLength = Math.round(
    sermons.reduce((sum, s) => sum + s.notes.length, 0) / totalSermons
  );

  // count sermons by speaker
  const speakers = {};
  sermons.forEach((sermon) => {
    speakers[sermon.speaker] = (speakers[sermon.speaker] || 0) + 1;
  });

  // find upcoming sermons for planning
  const today = new Date();
  const upcoming = sermons.filter((s) => new Date(s.date) >= today).length;

  console.log("=== Sermon Statistics ===");
  console.log(`Total Sermons: ${totalSermons}`);
  console.log(`Sermons with verses: ${sermonsWithVerses}`);
  console.log(`Average notes length: ${avgNotesLength} characters`);
  console.log(`Upcoming sermons: ${upcoming}`);
  console.log("Speakers:", speakers);
}

// CALCULATE DAYS UNTIL - for export feature
function getDaysUntil(dateStr) {
  const today = new Date();
  const sermonDate = new Date(dateStr);

  // reset times for accurate calculation
  today.setHours(0, 0, 0, 0);
  sermonDate.setHours(0, 0, 0, 0);

  const diff = sermonDate - today;
  const days = Math.round(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days === -1) return "Yesterday";
  if (days > 0) return `In ${days} days`;
  return `${Math.abs(days)} days ago`;
}

// exports sermons as HTML file - easier than building a PDF generator
function exportData() {
  if (sermons.length === 0) {
    alert("No sermons to export yet!");
    return;
  }

  let exportHTML = `
  <!DOCTYPE html>
  <html>
  <head>
    <title>Mount Builder - Sermon Export</title>
    <style>
      body {
        font-family: 'Times New Roman', serif;
        line-height: 1.6;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        color: #333;
      }
      h1 { color: #722f37; text-align: center; border-bottom: 2px solid #722f37; padding-bottom: 10px; }
      .sermon { page-break-inside: avoid; margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; }
      .sermon-title { font-size: 1.3em; font-weight: bold; color: #722f37; margin-bottom: 10px; }
      .scripture { background: #f9f9f9; border-left: 4px solid #808000; padding: 10px; margin: 10px 0; }
      @media print {
        body { margin: 0; padding: 15px; }
        .sermon { page-break-after: always; border: none; }
      }
    </style>
  </head>
  <body>
    <h1>Mount Builder - Sermon Collection</h1>
    <p style="text-align: center; margin-bottom: 30px;">Generated: ${new Date().toLocaleDateString()}</p>
  `;

  // sorts by date newest first
  const sorted = [...sermons].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  sorted.forEach((sermon) => {
    exportHTML += `
    <div class="sermon">
      <div class="sermon-title">${sermon.title}</div>
      <p><strong>Speaker:</strong> ${
        sermon.speaker
      } | <strong>Date:</strong> ${formatDate(
      sermon.date
    )} | <strong>Series:</strong> ${sermon.series}</p>`;

    if (sermon.verseReference) {
      exportHTML += `
      <div class="scripture">
        <strong>${sermon.verseReference}</strong><br>`;
      if (sermon.verseData && sermon.verseData.text) {
        exportHTML += `"${sermon.verseData.text}"<br><em>- ${sermon.verseData.translation}</em>`;
      }
      exportHTML += `</div>`;
    }

    if (sermon.notes) {
      exportHTML += `
      <div style="margin-top: 15px;">
        <strong>Sermon Notes:</strong><br>
        <div style="margin-top: 10px;">${sermon.notes.replace(
          /\n/g,
          "<br>"
        )}</div>
      </div>`;
    }

    exportHTML += `</div>`;
  });

  exportHTML += `
  </body>
  </html>`;

  // downloads file
  const blob = new Blob([exportHTML], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mount-builder-sermons-${Date.now()}.html`;
  link.click();
  URL.revokeObjectURL(url);

  alert("Sermons exported!");
}

// saves data to localStorage with error handling
function saveToStorage() {
  try {
    localStorage.setItem("mountBuilderSermons", JSON.stringify(sermons));
  } catch (e) {
    console.error("Failed to save:", e);
    alert("Could not save to browser storage");
  }
}

// loads saved sermons on startup - handles corrupted data
function loadSermons() {
  try {
    const saved = localStorage.getItem("mountBuilderSermons");
    if (saved) {
      sermons = JSON.parse(saved);
      console.log(`Loaded ${sermons.length} sermons`);
      analyzeSermons(); // show stats on load
    }
  } catch (e) {
    console.error("Failed to load sermons:", e);
    sermons = [];
  }
}

function populateSpeakerFilter() {
  const speakerSelect = document.getElementById("filter-speaker");
  const speakers = [...new Set(sermons.map((s) => s.speaker))];

  speakerSelect.innerHTML = '<option value="">All Speakers</option>';
  speakers.forEach((speaker) => {
    speakerSelect.innerHTML += `<option value="${speaker}">${speaker}</option>`;
  });
}

function renderSermonList() {
  const container = document.getElementById("sermons-list");
  const searchInput = document.getElementById("search-sermons");
  const searchTerm = searchInput ? searchInput.value : "";
  const speakerFilter = document.getElementById("filter-speaker");
  const speaker = speakerFilter ? speakerFilter.value : "";
  const sortSelect = document.getElementById("sort-sermons");
  const sortBy = sortSelect ? sortSelect.value : "date-desc";

  // Use search engine if available and search term exists
  if (window.searchEngine && searchTerm.trim()) {
    // Perform smart search with fuzzy matching
    const searchResults = window.searchEngine.search(sermons, searchTerm, {
      fuzzy: true,
      minRelevance: 0
    });

    // Apply speaker filter if needed
    filteredSermons = searchResults
      .map(result => result.sermon)
      .filter(sermon => !speaker || sermon.speaker === speaker);

    // Sort by relevance if not specified otherwise
    if (sortBy === "date-desc" || sortBy === "date-asc" || sortBy === "title") {
      filteredSermons.sort((a, b) => {
        switch (sortBy) {
          case "date-desc":
            return new Date(b.date) - new Date(a.date);
          case "date-asc":
            return new Date(a.date) - new Date(b.date);
          case "title":
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
    }
    // Otherwise keep relevance order from search
  } else {
    // Basic filter when no search term
    filteredSermons = sermons.filter(sermon => !speaker || sermon.speaker === speaker);

    // Sort sermons
    filteredSermons.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date) - new Date(a.date);
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "title":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }

  if (filteredSermons.length === 0) {
    const message = searchTerm
      ? `<p>No sermons found for "${searchTerm}". Try a different search term.</p>`
      : "<p>No sermons found.</p>";
    container.innerHTML = message;
    return;
  }

  // Highlight search terms in results
  const highlight = window.searchEngine && searchTerm
    ? (text) => window.searchEngine.highlight(text, searchTerm)
    : (text) => text;

  container.innerHTML = filteredSermons
    .map(
      (sermon) => {
        // Render tags if they exist
        const tagsHTML = sermon.tags && sermon.tags.length > 0
          ? `<div class="sermon-tags">
              ${sermon.tags.map((tag, index) => {
                const color = window.tagSystem ? window.tagSystem.getTagColor(tag, index) : '#722f37';
                return `<span class="tag-chip-small" style="background-color: ${color}">${tag}</span>`;
              }).join('')}
            </div>`
          : '';

        return `
      <div class="sermon-card">
        <h3>${highlight(sermon.title)}</h3>
        <div class="sermon-meta">
          <strong>Speaker:</strong> ${highlight(sermon.speaker)}<br>
          <strong>Date:</strong> ${formatDate(sermon.date)}<br>
          <strong>Series:</strong> ${highlight(sermon.series)}
          ${
            sermon.verseReference
              ? `<br><strong>Scripture:</strong> ${highlight(sermon.verseReference)}`
              : ""
          }
        </div>
        ${tagsHTML}
        ${sermon.notes && searchTerm ? `<div class="sermon-preview">${highlight(sermon.notes.substring(0, 150))}${sermon.notes.length > 150 ? '...' : ''}</div>` : ''}
        <div class="sermon-actions">
          <button onclick="viewSermon(${
            sermon.id
          })" class="input-btn">View</button>
          <button onclick="editSermon(${
            sermon.id
          })" class="input-btn">Edit</button>
          <button onclick="deleteSermon(${
            sermon.id
          })" class="input-btn">Delete</button>
        </div>
      </div>
    `;
      }
    )
    .join("");
}

function viewSermon(id) {
  const sermon = sermons.find((s) => s.id === id);
  if (!sermon) return;

  alert(
    `Title: ${sermon.title}\nSpeaker: ${sermon.speaker}\nDate: ${formatDate(
      sermon.date
    )}\nSeries: ${sermon.series}\n\nNotes:\n${sermon.notes}`
  );
}

function editSermon(id) {
  const sermon = sermons.find((s) => s.id === id);
  if (!sermon) return;

  // Store sermon data in localStorage for editing
  localStorage.setItem("editingSermon", JSON.stringify(sermon));

  // Remove the sermon from array (will be re-added when saved)
  sermons = sermons.filter((s) => s.id !== id);
  saveToStorage();

  // Redirect to form page
  window.location.href = "index.html";
}

function deleteSermon(id) {
  if (!confirm("Are you sure you want to delete this sermon?")) return;

  sermons = sermons.filter((s) => s.id !== id);
  saveToStorage();
  renderSermonList();
  alert("Sermon deleted successfully.");
}

function moveSermon(sermonId, newDate) {
  const sermon = sermons.find((s) => s.id === sermonId);
  if (sermon) {
    sermon.date = newDate;
    saveToStorage();
    renderCalendar(); // Refresh calendar view
    alert(`Sermon "${sermon.title}" moved to ${formatDate(newDate)}`);
  }
}
