const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

db.connect(err => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("Connected to MySQL database");
});


app.get("/api/test", (req, res) => {
  res.send("API is working");
});


app.post("/api/jobs", (req, res) => {
  console.log("Received job data:", req.body);

  const {
    title,
    company,
    location,
    jobType,
    minSalary,
    maxSalary,
    jobDescription,   
    deadline,
    status 
  } = req.body;

  const sql = `
    INSERT INTO jobs
      (title, company, location, jobType, minSalary, maxSalary, jobDescription, deadline, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title,
      company,
      location,
      jobType,
      minSalary || null,
      maxSalary || null,
      jobDescription || "",
      deadline || null,
      status || 'published' 
    ],
    (err, result) => {
      if (err) {
        console.error("Error inserting job:", err.sqlMessage);
        return res.status(500).json({ error: err.sqlMessage });
      }
      res.json({ message: "Job created", jobId: result.insertId });
    }
  );
});


app.get("/api/jobs", (req, res) => {
  const { status } = req.query;
  let sql = "SELECT * FROM jobs";
  const params = [];

  if (status) {
    sql += " WHERE status = ?";
    params.push(status);
  }
  sql += " ORDER BY createdAt DESC";

  db.query(sql, params, (err, rows) => {
    if (err) {
      console.error("Error fetching jobs:", err.sqlMessage);
      return res.status(500).json({ error: err.sqlMessage });
    }
    res.json(rows);
  });});
  
 
app.delete('/api/jobs/:id', (req, res) => {
  const jobId = req.params.id;
  db.query('DELETE FROM jobs WHERE id = ?', [id], (err) => {
    if (err) return res.status(500).send(err);
    res.sendStatus(200);
  });
});


app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
