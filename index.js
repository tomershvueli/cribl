const express = require("express");
const app = express();

const swaggerUi = require("swagger-ui-express");
const options = require("./swagger.json");

const logRouter = require("./logRouter");

const PORT = process.env.PORT || 3000;

// Interactive Swagger docs
app.use("/docs", swaggerUi.serve, swaggerUi.setup(options));

// Log router
app.use("/log", logRouter);

app.listen(PORT, () => console.log(`Server runnning on port ${PORT}`));
