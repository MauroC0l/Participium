// server/swagger.js
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Participium API",
      version: "1.0.0",
      description: "REST API documentation for Participium",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: "connect.sid"
        }
      }
    },

  },
  // Read API documentation from @swagger comments in route files and model schemas
  apis: ["./src/routes/*.js", "./src/models/schemas.js"]
};

const swaggerSpec = swaggerJSDoc(options);
export { swaggerUi, swaggerSpec };
