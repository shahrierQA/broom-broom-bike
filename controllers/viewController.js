const crypto = require("crypto")

const catchError = require("../utils/catchError")
const UserModel = require("../models/userModel")
const AppError = require("../utils/appError")
const APIFeatures = require("../utils/apiFeatures")
const BicycleModel = require("../models/bicycleModel")
const ReviewModel = require("../models/reviewModel")
const bookingDetailsModel = require("../models/detailsModel")
const BookingModel = require("../models/bookingModel")

exports.alerts = (req, res, next) => {
  const { alert } = req.query
  if (alert === "booking") {
    res.locals.alert =
      "Your booking was successfull. Please check your email for a confirmation. If your booking doesn't show up here immediately, please come back later."
  }

  next()
}

exports.bookingExpires = catchError(async (req, res, next) => {
  // if (req.query.alert) res.redirect("/")

  /**
   * Find all booking bicycles which are expire
   */
  const booking = await BookingModel.find({
    bookingExpiresIn: { $lt: Date.now() },
  })
  /**
   * If all booking bicycles are running, then return to the next middleware
   */
  if (booking.length === 0) return next()

  /**
   * Extract all bicycle from booking documents
   */
  const bikes = booking.map(el => el.bicycle)

  /**
   * And then delete all information about booking from database after they expired.
   */
  await BookingModel.deleteMany({ bookingExpiresIn: { $lt: Date.now() } })
  await bookingDetailsModel.deleteMany({ bicycle: { $in: bikes } })

  next()
})

exports.getBikeIds = catchError(async (req, res, next) => {
  const bookPromise = BookingModel.find()
  const detailsPromise = bookingDetailsModel.find()

  const [book, details] = await Promise.all([bookPromise, detailsPromise])

  const bookedIds = book.map(el => el.bicycle.id)
  const detailsIds = details.map(el => el.bicycle.id)
  const bookUserIds = book.map(el => el.user.id)
  // const detailsUserIds = detailsIds.map((el) => el.user.id);

  res.locals.bookedIds = bookedIds
  res.locals.detailsIds = detailsIds
  res.locals.bookUserIds = bookUserIds
  // res.locals.detailsUserIds = detailsUserIds;

  next()
})

exports.getHomePage = catchError(async (req, res, next) => {
  const dataBicycles = await BicycleModel.find()

  res.status(200).render("pages/index", {
    title: "Broom Broom Bike",
    dataBicycles: dataBicycles.slice(0, 6),
  })
})

exports.getBicyclesPage = catchError(async (req, res, next) => {
  const features = new APIFeatures(BicycleModel.find(), req.query)
    .filter()
    .sort()
    .limitFields()
    .paginate()

  const bicycles = await features.queryData

  res.status(200).render("pages/bicycles", {
    title: "All Bikes",
    allBicycles: bicycles,
  })
})

exports.getLoginForm = (req, res) => {
  res.status(200).render("pages/login", {
    title: "Log in to your account",
  })
}

exports.getSignupForm = (req, res) => {
  res.status(200).render("pages/signup", {
    title: "Create a new account",
  })
}

exports.getForgotForm = (req, res) => {
  res.status(200).render("pages/forgot", {
    title: "Forgot Password",
  })
}

exports.getResetForm = catchError(async (req, res, next) => {
  const viewResetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

  const resetUser = await UserModel.findOne({
    passwordResetToken: viewResetToken,
    passwordResetExpires: { $gt: Date.now() },
  })

  const tokenReset = req.params.token

  if (!resetUser) return next(new AppError("Token is invalid or expired", 400))
  res.status(200).render("pages/reset", {
    title: "Change your password",
    tokenReset,
  })
})

exports.getMyAccount = catchError(async (req, res, next) => {
  const findUser = await UserModel.findOne({
    _id: req.CurrentUser.id,
  }).populate({
    path: "bookings",
    fields: "bicycle user price",
  })

  res.status(200).render("pages/profile", {
    title: "My Account",
    bookings: findUser.bookings,
  })
})

exports.getBicyclePage = (req, res) => {
  res.status(200).render("pages/bicycle-single", {
    title: "Bicycle",
  })
}

exports.getBicycleBySlug = catchError(async (req, res, next) => {
  const { slug } = req.params

  const bicycle = await BicycleModel.findOne({ slug }).populate({
    path: "reviews",
    fields: "review rating user",
  })

  if (!bicycle)
    return next(new AppError("This bicycle is not available right now!", 400))

  const findRevs = await ReviewModel.find({ bicycle: bicycle.id })
  const reviewedUserIds = findRevs.map(el => el.user.id)

  let rev
  if (req.CurrentUser) {
    rev = await ReviewModel.findOne({
      $and: [{ user: req.CurrentUser.id }, { bicycle: bicycle.id }],
    })
  }

  res.status(200).render("pages/bicycle-single", {
    title: bicycle.slug,
    bicycle,
    reviewedUserIds,
    rev,
  })
})

exports.getBicycleBookingDetails = catchError(async (req, res, next) => {
  const detailsBooking = await bookingDetailsModel.findOne({
    bicycle: req.params.bicycleId,
    user: req.CurrentUser.id,
  })

  const bookings = await BookingModel.findOne({
    bicycle: req.params.bicycleId,
    user: req.CurrentUser.id,
  })

  res.status(200).render("pages/bookingDetails", {
    // title: "Booking Details - " + detailsBooking.bicycle.name,
    detailsBooking,
  })
})
