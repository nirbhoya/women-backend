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
  origin: function (origin: string | undefined, callback: (arg0: Error | null, arg1: boolean) => void) {
    if (!origin || origin === 'https://app.nirbhoya.org' || origin === 'https://nirbhoya.org') {
      callback(null, true);  // Allow the request
    } else {
      callback(new Error('Not allowed by CORS'), false);  // Reject the request
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
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
