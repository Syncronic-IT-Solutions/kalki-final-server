"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const init_1 = __importDefault(require("./db/init")); // Import your DB initialization function
const routes_1 = __importDefault(require("./routes"));
dotenv_1.default.config();

const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());

// Initialize database
(0, init_1.default)(); // Initialize database and sync models
app.use('/api/v1', routes_1.default); // Assuming your routes are organized in a 'routes' directory
app.get("/", (req, res) => {
    res.send("Backend is running!");
});

// You can set the server to listen on 0.0.0.0 to bind to all network interfaces
const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || "0.0.0.0";  // Using 0.0.0.0 to allow access via public IP

app.listen(PORT, HOST, () => {
    console.log(`Server is running at http://${HOST}:${PORT}`);
});
