// Express server for Mount Builder app
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(".")); // serve static files

// routes
app.get("/api/sermons", (req, res) => {
  // TODO: implement database queries
  res.json({ message: "sermons endpoint - not implemented yet" });
});

app.post("/api/sermons", (req, res) => {
  // TODO: save sermon to database
  console.log("saving sermon:", req.body);
  res.json({ message: "sermon saved (not really)" });
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// TODO: add database connection
// TODO: add proper error handling
// TODO: add authentication (maybe)
