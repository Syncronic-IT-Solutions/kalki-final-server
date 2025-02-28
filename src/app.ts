import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import dbInit from './db/init'; // Import your DB initialization function

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Initialize database
dbInit(); // Initialize database and sync models

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
