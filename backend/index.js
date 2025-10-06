import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

// Import routes
import authRoutes from "./routes/auth.js";
import aiRoutes from "./routes/ai.js";
import locationsRoutes from "./routes/locations.js";
import testRoutes from "./routes/test.js";
import aiAgentRoutes from "./routes/aiAgentRoutes.js";
import testGeminiOnlyRoutes from "./routes/testGeminiOnly.js";
import photosRoutes from "./routes/photos.js";
import projectRoutes from "./routes/projects.js";
import invitationRoutes from "./routes/invitations.js";
import scenesRoutes from "./routes/scenes.js";
import tasksRoutes from "./routes/tasks.js";
import scriptRoutes from "./routes/script.js";
import sceneBreakdownRoutes from "./routes/sceneBreakdown.js";
import notificationRoutes from "./routes/notifications.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:5173", // Vite default port  
      "http://localhost:5174", // Alternative web port
      "http://localhost:8081", // Expo mobile app
      "http://192.168.34.75:8081", // Expo mobile app on network
      "exp://192.168.34.75:8081", // Expo protocol
      "exp://localhost:8081", // Expo protocol localhost
    ],
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Location Scouting API is running 🚀",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth (register, login)",
      projects: "/api/projects (create, list, manage projects)",
      invitations: "/api/invitations (project invites)",
      scenes: "/api/scenes (create, manage scenes)",
      tasks: "/api/tasks (create, manage tasks)",
      script:
        "/api/projects/:projectId/script (upload screenplay, AI analysis)",
      breakdown:
        "/api/projects/:projectId/breakdown (scene breakdown, import scenes)",
      ai: "/api/ai",
      locations: "/api/locations",
      aiAgent: "/api/ai-agent",
      photos: "/api/photos/place-photo (Proxy for Google Places photos)",
      testGeminiOnly: "/api/ai/test-gemini-only (🧪 No Google Places API)",
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/projects/:projectId/script", scriptRoutes); // Script routes
app.use("/api/projects/:projectId/breakdown", sceneBreakdownRoutes); // Breakdown routes
app.use("/api/invitations", invitationRoutes);
app.use("/api/scenes", scenesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/ai", testGeminiOnlyRoutes); // Test routes under /api/ai
app.use("/api/locations", locationsRoutes);
app.use("/api/test", testRoutes);
app.use("/api/ai-agent", aiAgentRoutes);
app.use("/api/photos", photosRoutes); // Photo proxy routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("Global error handler:", error);

  // Handle mongoose validation errors
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      error: "Validation Error",
      details: errors,
    });
  }

  // Handle mongoose duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`,
    });
  }

  // Handle JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }

  // Handle mongoose cast errors
  if (error.name === "CastError") {
    return res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
});

// Database connection and server startup
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 API endpoints available at http://localhost:${PORT}/api`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });
