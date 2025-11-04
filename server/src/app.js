import express from "express";
import cors from "cors";
import passport from "passport";
import session from "express-session";
import { swaggerUi, swaggerSpec } from "../swagger.js";
import { configurePassport } from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import citizenRoutes from "./routes/citizenRoutes.js";
import municipalityUserRoutes from "./routes/municipalityUserRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'participium-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport configuration
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/api/sessions", authRoutes);
app.use("/api/users", citizenRoutes);

// Check endpoint to verify server is running
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handling middleware (must be last!)
app.use(errorHandler);

export default app;
