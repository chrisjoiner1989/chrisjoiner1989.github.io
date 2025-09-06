// main app initialization - waits for DOM to load before setting up events
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Mount Builder starting up...");

  // Hide the native splash as soon as the app is ready
  try {
    if (window && window.Capacitor && window.Capacitor.isNativePlatform) {
      const { SplashScreen } = await import("@capacitor/splash-screen");
      await SplashScreen.hide();
    }
  } catch (err) {
    console.debug("SplashScreen.hide not available:", err);
  }

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

  // Toast container
  if (!document.getElementById("toast-container")) {
    const container = document.createElement("div");
    container.id = "toast-container";
    container.setAttribute("aria-live", "polite");
    container.setAttribute("aria-atomic", "true");
    container.style.position = "fixed";
    container.style.left = "50%";
    container.style.bottom = "calc(16px + env(safe-area-inset-bottom))";
    container.style.transform = "translateX(-50%)";
    container.style.zIndex = "2000";
    container.style.display = "grid";
    container.style.gap = "8px";
    document.body.appendChild(container);
  }
});

// Native back button handling (Android)
(async () => {
  try {
    if (window && window.Capacitor && window.Capacitor.getPlatform) {
      const platform = window.Capacitor.getPlatform();
      if (platform === "android") {
        const { App } = await import("@capacitor/app");
        App.addListener("backButton", ({ canGoBack }) => {
          // Try to navigate back if browser history allows, otherwise exit
          if (canGoBack && window.history.length > 1) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      }
    }
  } catch (err) {
    console.debug("Capacitor App backButton not available:", err);
  }
})();

// get all the form elements - some might not exist on every page
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

// global vars for app state - probably should refactor this later
let sermons = [];
let currentVerseData = null;
let currentView = "form";
let filteredSermons;

// loads ext sermons on start up
loadSermons();

// Initialize date on page load
loadSavedDate();

// Check if we're editing a sermon
const editingSermon = localStorage.getItem("editingSermon");
if (editingSermon && titleInput) {
  try {
    const sermon = JSON.parse(editingSermon);
    titleInput.value = sermon.title;
    speakerInput.value = sermon.speaker;
    dateInput.value = sermon.date;
    seriesInput.value = sermon.series;
    notesInput.value = sermon.notes;
    referenceInput.value = sermon.verseReference || "";

    localStorage.removeItem("editingSermon");
    alert("Sermon loaded for editing. Click Save when done.");
  } catch (e) {
    console.error("Error loading editing sermon:", e);
    localStorage.removeItem("editingSermon");
  }
}

// Event Listeners
if (searchBtn) {
  searchBtn.addEventListener("click", function (e) {
    e.preventDefault();
    searchForVerse();
  });
}

if (saveBtn) saveBtn.addEventListener("click", saveSermon);
if (clearBtn) clearBtn.addEventListener("click", clearForm);
if (exportBtn) exportBtn.addEventListener("click", exportData);

const addVerseBtn = document.querySelector(".addverse-btn");
if (addVerseBtn) addVerseBtn.addEventListener("click", addVerseToNotes);

// Library event listeners
const searchSermonsInput = document.getElementById("search-sermons");
const filterSpeakerSelect = document.getElementById("filter-speaker");
const sortSermonsSelect = document.getElementById("sort-sermons");

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
if (referenceInput) {
  referenceInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchForVerse();
    }
  });
}

// Validates verse ref as user types it in
if (referenceInput) {
  referenceInput.addEventListener("input", function () {
    validateVerseFormat();
  });
}

// Date change event listener to save to localStorage and validate
if (dateInput) {
  dateInput.addEventListener("change", function () {
    if (isValidDate(dateInput.value)) {
      localStorage.setItem("sermonDate", dateInput.value);
    } else {
      alert("Please enter a valid date");
      loadSavedDate(); // Reset to saved or default date
    }
  });
}

// clears form and resets everything to defaults
function clearForm() {
  // Skip if we're not on the form page
  if (!sermonForm) return;

  sermonForm.reset();
  if (verseDisplay) verseDisplay.innerHTML = "";
  if (referenceHelp) referenceHelp.textContent = "";
  currentVerseData = null;

  const addVerseBtn = document.querySelector(".addverse-btn");
  if (addVerseBtn) addVerseBtn.style.display = "none";

  // reset date to today and save to localStorage
  setDefaultDate();
}

// formats dates nicely - used all over the app
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

// Simple toast utility
window.showToast = function (message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.padding = "10px 14px";
  toast.style.borderRadius = "10px";
  toast.style.color = type === "error" ? "#721c24" : type === "success" ? "#155724" : "#0c5460";
  toast.style.background = type === "error" ? "#f8d7da" : type === "success" ? "#d4edda" : "#d1ecf1";
  toast.style.border = type === "error" ? "1px solid #f5c6cb" : type === "success" ? "1px solid #c3e6cb" : "1px solid #bee5eb";
  toast.style.boxShadow = "0 2px 10px rgba(0,0,0,0.12)";
  toast.style.fontSize = "0.95rem";
  toast.style.maxWidth = "90vw";
  toast.style.justifySelf = "center";
  toast.style.pointerEvents = "auto";
  toast.style.cursor = "pointer";
  toast.addEventListener("click", () => container.removeChild(toast));
  container.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode === container) container.removeChild(toast);
  }, 3500);
};

// View switching functions removed - now using separate HTML pages

// Register service worker for offline support
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/sw.js")
    .then(() => console.log("Service Worker registered"))
    .catch((err) => console.log("Service Worker registration failed", err));
}

// Calendar State Management
let currentDate = new Date();
let selectDate = null;
let scheduledSermons = [];

// builds the calendar grid - most complex function in the app
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

const bibleBackBtn = document.querySelector(".bible-back-btn");
const biblePrevBtn = document.querySelector(".bible-prev-btn");
const bibleNextBtn = document.querySelector(".bible-next-btn");

if (bibleBackBtn)
  bibleBackBtn.addEventListener(
    "click",
    () => (window.location.href = "index.html")
  );
if (biblePrevBtn) biblePrevBtn.addEventListener("click", previousChapter);
if (bibleNextBtn) bibleNextBtn.addEventListener("click", nextChapter);

// Bible view function removed

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

if (prevChapterBtn) prevChapterBtn.addEventListener("click", previousChapter);
if (nextChapterBtn) nextChapterBtn.addEventListener("click", nextChapter);

// Auto-hide header on scroll for mobile Bible reader
let lastScrollTop = 0;
let scrollTimeout;

function handleBibleScroll() {
  const bibleContent = document.getElementById("bible-content");
  const bibleHeader = document.querySelector(".bible-header");

  if (!bibleContent || !bibleHeader) return;

  const scrollTop = bibleContent.scrollTop;
  const scrollDirection = scrollTop > lastScrollTop ? "down" : "up";

  // Clear existing timeout
  clearTimeout(scrollTimeout);

  // Only hide/show if we've scrolled a meaningful amount
  if (Math.abs(scrollTop - lastScrollTop) > 5) {
    if (scrollDirection === "down" && scrollTop > 100) {
      // Scrolling down and past initial area - hide header
      bibleHeader.classList.add("hidden");
    } else if (scrollDirection === "up") {
      // Scrolling up - show header
      bibleHeader.classList.remove("hidden");
    }
  }

  // Show header after user stops scrolling for a bit
  scrollTimeout = setTimeout(() => {
    bibleHeader.classList.remove("hidden");
  }, 3000);

  lastScrollTop = scrollTop;
}
