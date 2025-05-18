import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db";
import router from "./routes";
import path from "path";

dotenv.config();
connectDB();

const app = express();

// CORS middleware
const corsOptions = {
  origin: "https://nirbhoya.org", // Allow frontend running on port 3001
  methods: ["GET", "POST", "PUT", "DELETE"], // Allow GET and POST methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allow specific headers (including Authorization)
  credentials: true, // Allow credentials (cookies, authorization headers)
};

app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
const uploadsDir = path.join(process.cwd(), 'uploads', 'ProductImage');
app.use('/uploads', express.static(uploadsDir));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// API routes
app.use("/api", router);
app.get('/', (req, res) => {
  res.send('✅ Server is beep! Backend is live.');
});
// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
