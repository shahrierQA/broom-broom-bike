const crypto = require("crypto");

const catchError = require("../utils/catchError");
const UserModel = require("../models/userModel");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");
const BicycleModel = require("../models/bicycleModel");
const ReviewModel = require("../models/reviewModel");
const bookingDetailsModel = require("../models/detailsModel");
const BookingModel = require("../models/bookingModel");
// const moment = require('moment');

exports.getHomePage = catchError(async (req, res, next) => {
  const dataBicycles = await BicycleModel.find();
  const bookings = await BookingModel.find();
  const bookingDetails = await bookingDetailsModel.find();

  const bookedIds = bookings.map((el) => el.bicycle.id);
  const detailsIds = bookingDetails.map((el) => el.bicycle.id);

  res.status(200).render("pages/index", {
    title: "Broom Broom Bike",
    dataBicycles: dataBicycles.slice(0, 6),
    bookedIds,
    detailsIds,
  });
});

exports.getBicyclesPage = catchError(async (req, res, next) => {
  const features = new APIFeatures(BicycleModel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const bicycles = await features.queryData;

  res.status(200).render("pages/bicycles", {
    title: "All Bikes",
    allBicycles: bicycles,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("pages/login", {
    title: "Log in to your account",
  });
};

exports.getSignupForm = (req, res) => {
  res.status(200).render("pages/signup", {
    title: "Create a new account",
  });
};

exports.getForgotForm = (req, res) => {
  res.status(200).render("pages/forgot", {
    title: "Forgot Password",
  });
};

exports.getResetForm = catchError(async (req, res, next) => {
  const viewResetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const resetUser = await UserModel.findOne({
    passwordResetToken: viewResetToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  const tokenReset = req.params.token;

  if (!resetUser) return next(new AppError("Token is invalid or expired", 400));
  res.status(200).render("pages/reset", {
    title: "Change your password",
    tokenReset,
  });
});

exports.getMyAccount = catchError(async (req, res, next) => {
  const findUser = await UserModel.findOne({
    _id: req.CurrentUser.id,
  }).populate({
    path: "bookings",
    fields: "bicycle user price",
  });

  const aluu = findUser.bookings.map((el) => el.bicycle.name.split(","));

  res.status(200).render("pages/profile", {
    title: "My Account",
    bookings: findUser.bookings,
  });
});

exports.getBicyclePage = (req, res) => {
  res.status(200).render("pages/bicycle-single", {
    title: "Bicycle",
  });
};

exports.getBicycleBySlug = catchError(async (req, res, next) => {
  const { slug } = req.params;

  const bicycle = await BicycleModel.findOne({ slug }).populate({
    path: "reviews",
    fields: "review rating user",
  });

  if (!bicycle)
    return next(new AppError("This bicycle is not available right now!", 400));

  const findRevsPromise = ReviewModel.find({ bicycle: bicycle.id });
  const findBikePromise = bookingDetailsModel.findOne({ bicycle: bicycle.id });
  const bookingsPromise =
    req.CurrentUser && BookingModel.find({ user: req.CurrentUser.id });

  const [findRevs, findBike, bookings] = await Promise.all([
    findRevsPromise,
    findBikePromise,
    bookingsPromise,
  ]);

  const reviewedUserIds = findRevs.map((el) => el.user.id);
  const bookedBikeIds = req.CurrentUser && bookings.map((el) => el.bicycle.id);

  res.status(200).render("pages/bicycle-single", {
    title: bicycle.slug,
    bicycle,
    reviewedUserIds,
    findBike,
    bookedBikeIds,
  });
});

exports.getBicycleBookingDetails = catchError(async (req, res, next) => {
  const detailsBooking = await bookingDetailsModel.findOne({
    bicycle: req.params.bicycleId,
  });

  const bookings = await BookingModel.findOne({
    bicycle: req.params.bicycleId,
  });

  if (detailsBooking && bookings) {
    return res.redirect("/bikes");
  }

  res.status(200).render("pages/bookingDetails", {
    title: "Booking Details - " + detailsBooking.bicycle.name,
    detailsBooking,
  });
});
