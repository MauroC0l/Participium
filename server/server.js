// server/server.js
import express from "express";
import cors from "cors";

import { swaggerUi, swaggerSpec } from "./swagger.js"; 

// List of imported routes


const app = express();
app.use(cors());
app.use(express.json());

// Swagger UI route
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// List of API routes
//for example: app.use("/api/tickets", ticketRoutes);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
