// app.js (updated with all routes)
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// routes import
import authRoutes from "./routes/auth.routes.js";
import profileRoutes from "./routes/profile.routes.js";
import scheduleRoutes from "./routes/schedule.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

// Parse JSON
app.use(express.json());

// Parse Form Data
app.use(express.urlencoded({ extended: true }));

// Parse Cookies
app.use(cookieParser());

// CORS
app.use(cors({
  origin: "https://sportz-frontend-alpha.vercel.app", // Frontend URL
  credentials: true
}));

app.get("/", (req, res) => {
  res.send("Sports Training Management System API");
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/users", userRoutes);
export default app;