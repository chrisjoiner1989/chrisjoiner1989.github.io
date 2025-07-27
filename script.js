document.addEventListener("DOMContentLoaded", function () {
  console.log("Mount Builder starting up...");
});

// gets form and all input elemements
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
