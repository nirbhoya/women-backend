"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./config/db"));
const routes_1 = __importDefault(require("./routes"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
(0, db_1.default)();
const app = (0, express_1.default)();
// CORS middleware
const corsOptions = {
    origin: "https://nirbhoya.org", // Allow frontend running on port 3001
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow GET and POST methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers (including Authorization)
    credentials: true, // Allow credentials (cookies, authorization headers)
};
app.use((0, cors_1.default)(corsOptions));
// Body parsers
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ limit: '10mb', extended: true }));
const uploadsDir = path_1.default.join(process.cwd(), 'uploads', 'ProductImage');
app.use('/uploads', express_1.default.static(uploadsDir));
app.use('/uploads', express_1.default.static(path_1.default.join(process.cwd(), 'uploads')));
// API routes
app.use("/api", routes_1.default);
app.get('/', (req, res) => {
    res.send('✅ Server is beep! Backend is live.');
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
