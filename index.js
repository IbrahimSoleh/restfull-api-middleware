const express = require("express");
const bodyParser = require("body-parser");
const movies = require("./routes");
const { authenticationUser } = require("./middleware/auth");
const swaggerUi = require("swagger-ui-express");
const movieJson = require("./movie.json");
const morgan = require("morgan");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(movieJson));

app.use(morgan('tiny'));
app.use(authenticationUser);
app.use("/", movies);

app.listen(5000);
