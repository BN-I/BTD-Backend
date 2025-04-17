const express = require("express");
const dotenv = require("dotenv");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const useragent = require("express-useragent");

app.use(useragent.express());
dotenv.config();
app.use(
  cors({
    // Allow requests from all origins (or specify allowed origins)
    origin: "*",
    methods: ["POST", "GET", "PUT", "PATCH", "DELETE", "OPTIONS"],
    // Allow the following headers to be sent in the request
    allowedHeaders: ["Content-Type", "Authorization", "x-auth-token"],
    // Allow the following headers to be exposed to the client
    exposedHeaders: ["x-auth-token"],
  })
);

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json({ limit: "50mb" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(require("./routes/login"));
app.use(require("./routes/signup"));
app.use(require("./routes/forgotPassword"));
app.use(require("./routes/socialLogin"));
app.use(require("./routes/products"));
app.use(require("./routes/events"));
app.use(require("./routes/paymentMethod"));
app.use(require("./routes/stripe"));
app.use(require("./routes/orders"));
app.use(require("./routes/user"));
app.use(require("./routes/notifications"));
app.use(require("./routes/notificationSettings"));
app.use(require("./routes/payments"));
app.use(require("./routes/vendor"));
app.use(require("./routes/store"));

// Create an event
export default app;
