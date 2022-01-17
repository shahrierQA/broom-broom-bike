const path = require("path");
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const userRouter = require("./routers/userRouter");
const viewRouter = require("./routers/viewRouter");
const bicycleRouter = require("./routers/bicycleRouter");
const reviewRouter = require("./routers/reviewRouter");
const helpers = require("./utils/helpers");
const bookingRouter = require("./routers/bookingRouter");

const app = express();

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

// This is for development logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

const limitRequest = (maximumReq) =>
  rateLimit({
    max: maximumReq,
    windowMs: 1 * 60 * 60 * 1000,
    handler: (req, res) => {
      const message =
        "Too many request with that IP! Please try again in an hour";

      res.status(429).json({
        message,
      });
    },
  });

// this function does - maximum request in one hour from the same IP
const requestLimitApi = limitRequest(100);
const requestLimitAll = limitRequest(200);
const requestLimitApiForAccount = limitRequest(50);

app.use("/api", requestLimitApi);
app.use("/api/v1/users/login", requestLimitApiForAccount);
app.use("/api/v1/users/signup", requestLimitApiForAccount);
app.use("/", requestLimitAll);

app.use(express.json());

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.h = helpers;
  next();
});

// mounting routes
app.use("/", viewRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/bicycle", bicycleRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/booking", bookingRouter);

if (process.env.NODE_ENV === "production") {
  app.all("*", (req, res, next) => {
    next(new AppError(`Page Not Found`, 404));
  });
}

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} to this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
