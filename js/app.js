// main app initialization - waits for DOM to load before setting up events
document.addEventListener("DOMContentLoaded", function () {
  console.log("Mount Builder starting up...");

  // Check if first-time user and redirect to welcome screen
  const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
  const isOnHomePage = window.location.pathname.includes('home.html') ||
                       window.location.pathname.endsWith('/') ||
                       window.location.pathname === '';

  if (!hasSeenWelcome && isOnHomePage) {
    console.log('First-time user detected, redirecting to welcome screen...');
    window.location.href = 'welcome.html';
    return;
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

  // Menu modal functionality
  initializeMenuModal();

  // FAB Save button functionality
  initializeFAB();
});

// Initialize menu modal
function initializeMenuModal() {
  const menuBtn = document.getElementById("menu-btn");
  const menuModal = document.getElementById("menu-modal");
  const closeMenuBtn = document.getElementById("close-menu");
  let previouslyFocusedElement = null;

  if (menuBtn && menuModal) {
    // Open menu
    menuBtn.addEventListener("click", function () {
      previouslyFocusedElement = document.activeElement;
      menuModal.classList.add("active");
      menuModal.setAttribute("aria-hidden", "false");

      // Focus the close button when modal opens
      setTimeout(() => {
        closeMenuBtn?.focus();
      }, 100);

      // Enable focus trap
      enableFocusTrap(menuModal);
    });

    // Close menu function
    const closeMenu = () => {
      menuModal.classList.remove("active");
      menuModal.setAttribute("aria-hidden", "true");
      disableFocusTrap(menuModal);

      // Return focus to trigger button
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }
    };

    // Close menu
    if (closeMenuBtn) {
      closeMenuBtn.addEventListener("click", closeMenu);
    }

    // Close menu when clicking outside
    menuModal.addEventListener("click", function (e) {
      if (e.target === menuModal) {
        closeMenu();
      }
    });

    // Close menu with Escape key
    menuModal.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMenu();
      }
    });

    // Close menu after clicking any menu item
    const menuItems = menuModal.querySelectorAll(".menu-item");
    menuItems.forEach((item) => {
      item.addEventListener("click", closeMenu);
    });
  }
}

/**
 * Enable focus trap within a modal
 * @param {HTMLElement} modal - The modal element
 */
function enableFocusTrap(modal) {
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  if (focusableElements.length === 0) return;

  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  // Store the trap handler so we can remove it later
  modal._focusTrapHandler = function (e) {
    if (e.key !== "Tab") return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  };

  modal.addEventListener("keydown", modal._focusTrapHandler);
}

/**
 * Disable focus trap
 * @param {HTMLElement} modal - The modal element
 */
function disableFocusTrap(modal) {
  if (modal._focusTrapHandler) {
    modal.removeEventListener("keydown", modal._focusTrapHandler);
    delete modal._focusTrapHandler;
  }
}

// Initialize FAB (Floating Action Button)
function initializeFAB() {
  const fabSave = document.querySelector(".fab-save");
  if (fabSave) {
    fabSave.addEventListener("click", saveSermon);
  }
}

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
const powerpointBtn = document.querySelector(".powerpoint-btn");

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

// Search verse icon button
const searchVerseBtn = document.querySelector(".search-verse-btn");
if (searchVerseBtn) {
  searchVerseBtn.addEventListener("click", function (e) {
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

// View switching functions removed - now using separate HTML pages

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
