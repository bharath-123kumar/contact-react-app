const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// DB setup
const db = new sqlite3.Database("./contacts.db");

db.run(`CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL
)`);

// POST - add contact
app.post("/contacts", (req, res) => {
  const { name, email, phone } = req.body;

  // validation
  const emailRegex = /^\S+@\S+\.\S+$/;
  const phoneRegex = /^\d{10}$/;

  if (!name || !emailRegex.test(email) || !phoneRegex.test(phone)) {
    return res.status(400).json({ error: "Invalid input" });
  }

  db.run(
    "INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)",
    [name, email, phone],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, name, email, phone });
    }
  );
});

// GET - fetch contacts with pagination
app.get("/contacts", (req, res) => {
  let { page = 1, limit = 5 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  db.all("SELECT COUNT(*) as count FROM contacts", [], (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });
    const total = countResult[0].count;

    db.all(
      "SELECT * FROM contacts LIMIT ? OFFSET ?",
      [limit, offset],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ contacts: rows, total });
      }
    );
  });
});

// DELETE - remove contact
app.delete("/contacts/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM contacts WHERE id = ?", id, function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
