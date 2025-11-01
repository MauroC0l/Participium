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
        url: "http://localhost:3001/api",
        description: "Development server",
      },
    ],
  },
  apis: ["./routes/*.js"], // path to file where @swagger annotations will be defined
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
