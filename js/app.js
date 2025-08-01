document.addEventListener("DOMContentLoaded", function () {
  console.log("Mount Builder starting up...");

  // Add click event to logo to refresh page
  const logo = document.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", function () {
      location.reload();
    });

    // Add cursor pointer to indicate it's clickable
    logo.style.cursor = "pointer";
    logo.title = "Click to refresh page";
  }
});

// gets form and all input elements
const sermonForm = document.getElementById("sermon-form");
const speakerInput = document.getElementById("speaker");
const titleInput = document.getElementById("title");
const referenceInput = document.getElementById("reference");
const dateInput = document.getElementById("date");
const seriesInput = document.getElementById("series");
const notesInput = document.getElementById("notes");
const verseDisplay = document.getElementById("verse-display");
const referenceHelp = document.getElementById("reference-help");

// button elements
const searchBtn = document.querySelector(".search-btn");
const saveBtn = document.querySelector(".save-btn");
const clearBtn = document.querySelector(".clear-btn");
const exportBtn = document.querySelector(".export-btn");

// vars to store data
let sermons = [];
let currentVerseData = null;
let currentView = "form";
let filteredSermons;

// loads ext sermons on start up
loadSermons();

// Initialize date on page load
loadSavedDate();

// Event Listeners
searchBtn.addEventListener("click", function (e) {
  e.preventDefault();
  searchForVerse();
});

saveBtn.addEventListener("click", saveSermon);
clearBtn.addEventListener("click", clearForm);
exportBtn.addEventListener("click", exportData);

const addVerseBtn = document.querySelector(".addverse-btn");
addVerseBtn.addEventListener("click", addVerseToNotes);

// Library event listeners
const libraryBtn = document.querySelector(".library-btn");
const calendarBtn = document.querySelector(".calendar-btn");
const backBtn = document.querySelector(".back-btn");
const searchSermonsInput = document.getElementById("search-sermons");
const filterSpeakerSelect = document.getElementById("filter-speaker");
const sortSermonsSelect = document.getElementById("sort-sermons");

if (libraryBtn) libraryBtn.addEventListener("click", showLibrary);
if (calendarBtn) calendarBtn.addEventListener("click", showCalendar);
if (backBtn) backBtn.addEventListener("click", showForm);
if (searchSermonsInput)
  searchSermonsInput.addEventListener("input", renderSermonList);
if (filterSpeakerSelect)
  filterSpeakerSelect.addEventListener("change", renderSermonList);
if (sortSermonsSelect)
  sortSermonsSelect.addEventListener("change", renderSermonList);

// Calendar navigation event listeners
const prevMonthBtn = document.getElementById("prev-month");
const nextMonthBtn = document.getElementById("next-month");

if (prevMonthBtn)
  prevMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
  });

if (nextMonthBtn)
  nextMonthBtn.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
  });

// allows enter key to search
referenceInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    searchForVerse();
  }
});

// Validates verse ref as user types it in
referenceInput.addEventListener("input", function () {
  validateVerseFormat();
});

// Date change event listener to save to localStorage and validate
dateInput.addEventListener("change", function () {
  if (isValidDate(dateInput.value)) {
    localStorage.setItem("sermonDate", dateInput.value);
  } else {
    alert("Please enter a valid date");
    loadSavedDate(); // Reset to saved or default date
  }
});

// CLEARs FORM
function clearForm() {
  sermonForm.reset();
  verseDisplay.innerHTML = "";
  referenceHelp.textContent = "";
  currentVerseData = null;

  // reset date to today and save to localStorage
  setDefaultDate();
}

// HELPER FUNCTION
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
}

// debugs helper for development
window.viewSermons = () => {
  console.table(sermons);
};

function showLibrary() {
  currentView = "library";
  document.querySelector(".main-container").style.display = "none";
  document.getElementById("library-section").style.display = "block";
  populateSpeakerFilter();
  renderSermonList();
}

function showForm() {
  currentView = "form";
  document.querySelector(".main-container").style.display = "block";
  document.getElementById("library-section").style.display = "none";
  document.getElementById("calendar-section").style.display = "none";
  document.getElementById("bible-section").style.display = "none";
  
  // Restore logo and original background
  const header = document.querySelector("header");
  if (header) header.style.display = "block";
  document.body.style.backgroundColor = "#fffff0";
}

function showCalendar() {
  currentView = "calendar";
  document.querySelector(".main-container").style.display = "none";
  document.getElementById("library-section").style.display = "none";
  document.getElementById("calendar-section").style.display = "block";
  renderCalendar();
}

// Service worker registration disabled - no sw.js file exists
// if ("serviceWorker" in navigator) {
//   navigator.serviceWorker
//     .register("/sw.js")
//     .then(() => console.log("SW registered"))
//     .catch(() => console.log("SW registration failed"));
// }

// Calendar State Management
let currentDate = new Date();
let selectDate = null;
let scheduledSermons = [];

// Calendar rendering
function renderCalendar() {
  const grid = document.getElementById("calendar-grid");
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  // Update month header
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  document.getElementById(
    "current-month"
  ).textContent = `${monthNames[month]} ${year}`;

  // Clear existing calendar
  grid.innerHTML = "";

  // Add day headers
  const dayHeaders = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  dayHeaders.forEach((day) => {
    const dayHeader = document.createElement("div");
    dayHeader.className = "calendar-day-header";
    dayHeader.textContent = day;
    grid.appendChild(dayHeader);
  });

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    const emptyDay = document.createElement("div");
    emptyDay.className = "calendar-day empty";
    grid.appendChild(emptyDay);
  }

  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayElement = document.createElement("div");
    dayElement.className = "calendar-day";
    dayElement.innerHTML = `<div class="day-number">${day}</div>`;

    // Check if there are sermons on this day
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;
    const sermonsOnDay = sermons.filter((sermon) => sermon.date === dateStr);

    // Make calendar days accept drops
    dayElement.addEventListener("dragover", handleDragOver);
    dayElement.addEventListener("drop", handleDrop);
    dayElement.setAttribute("data-date", dateStr);

    if (sermonsOnDay.length > 0) {
      dayElement.classList.add("has-sermon");
      sermonsOnDay.forEach((sermon) => {
        const sermonDiv = document.createElement("div");
        sermonDiv.className = "sermon-marker";
        sermonDiv.textContent =
          sermon.title.substring(0, 20) +
          (sermon.title.length > 20 ? "..." : "");
        sermonDiv.title = `${sermon.title} - ${sermon.speaker}`;

        // Make sermon cards draggable
        sermonDiv.draggable = true;
        sermonDiv.setAttribute("data-sermon-id", sermon.id);
        sermonDiv.addEventListener("dragstart", handleDragStart);

        dayElement.appendChild(sermonDiv);
      });
    }

    grid.appendChild(dayElement);
  }
}

// Drag and drop variables
let draggedSermonId = null;

// Drag event handlers
function handleDragStart(e) {
  draggedSermonId = e.target.getAttribute("data-sermon-id");
  e.target.style.opacity = "0.5";
}

function handleDragOver(e) {
  e.preventDefault(); // Allow drop
  e.currentTarget.style.backgroundColor = "#f0f0f0"; // Visual feedback
}

function handleDrop(e) {
  e.preventDefault();
  e.currentTarget.style.backgroundColor = ""; // Reset background

  const newDate = e.currentTarget.getAttribute("data-date");
  if (draggedSermonId && newDate) {
    // Confirm move if significant date change
    const sermon = sermons.find((s) => s.id == draggedSermonId);
    const oldDate = new Date(sermon.date);
    const targetDate = new Date(newDate);
    const daysDiff = Math.abs((targetDate - oldDate) / (1000 * 60 * 60 * 24));

    if (daysDiff > 7) {
      if (confirm(`Move "${sermon.title}" to ${formatDate(newDate)}?`)) {
        moveSermon(draggedSermonId, newDate);
      }
    } else {
      moveSermon(draggedSermonId, newDate);
    }
  }
}

// Series timeline visualization
function renderSeriesTimeline() {}

const bibleBtn = document.querySelector(".bible-btn");
const bibleBackBtn = document.querySelector(".bible-back-btn");

if (bibleBtn) bibleBtn.addEventListener("click", showBible);
if (bibleBackBtn) bibleBackBtn.addEventListener("click", showForm);

function showBible() {
  currentView = "bible";
  document.querySelector(".main-container").style.display = "none";
  document.getElementById("library-section").style.display = "none";
  document.getElementById("calendar-section").style.display = "none";
  document.getElementById("bible-section").style.display = "block";
  
  // Hide logo and change background
  const header = document.querySelector("header");
  if (header) header.style.display = "none";
  document.body.style.backgroundColor = "#ffffff";
  
  initializeBibleReader();
}

const bibleBookSelect = document.getElementById("bible-book");
if (bibleBookSelect) {
  bibleBookSelect.addEventListener("change", updateChapterSelect);
}

const loadChapterBtn = document.getElementById("load-chapter");
if (loadChapterBtn) {
  loadChapterBtn.addEventListener("click", loadBibleChapter);
}

const prevChapterBtn = document.getElementById("prev-chapter");
const nextChapterBtn = document.getElementById("next-chapter");

if (prevChapterBtn) {
  prevChapterBtn.addEventListener("click", previousChapter);
}

if (nextChapterBtn) {
  nextChapterBtn.addEventListener("click", nextChapter);
}
