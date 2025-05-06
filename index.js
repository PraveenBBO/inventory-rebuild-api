require("dotenv").config();
require('module-alias/register');

const express = require("express");
const session = require("express-session");
const flash = require("connect-flash");
const cors = require("cors");
const ApiError = require("./utils/ApiError");
const ErrorHandler = require("./utils/ErrorHandler");

const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));
app.use(flash());

const corsOptions = require("./config/corsOptions");
app.use(cors(corsOptions));

// Routes
app.use("/", require("./routes/index"));


app.all("*", (req, res, next) => {
    next(new ApiError("Route not defined", 404));
});
app.use(ErrorHandler);

// Start Server
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || "localhost";
app.listen(PORT, () => {
    console.log(`Server is running: ${HOST}:${PORT}`);
});
