const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const BookingModel = require("../models/bookingModel")
const factory = require("./handlerFactory")
const catchError = require("../utils/catchError")
const BookingDetailsModel = require("../models/detailsModel")
const BicycleModel = require("../models/bicycleModel")
const AppError = require("../utils/appError")
const Email = require("../utils/email")
const UserModel = require("../models/userModel")

exports.createBookings = factory.creatOne(BookingModel)
exports.getAllBookings = factory.getAll(BookingModel)
exports.getBookings = factory.getOne(BookingModel)
exports.updateBookings = factory.updateOne(BookingModel)
exports.deleteBookings = factory.deleteOne(BookingModel)

exports.bookingDetails = catchError(async (req, res, next) => {
  let { pickUpLocation, bicycle, user, bookedForHours, quantity } = req.body

  if (!bicycle) bicycle = req.params.bicycleId
  if (!user) user = req.CurrentUser.id

  const bookedPromise = BookingDetailsModel.findOne({ bicycle })
  const bookedUserPromise = BookingDetailsModel.findOne({
    user: req.CurrentUser.id,
  })

  const [booked, bookedUser] = await Promise.all([
    bookedPromise,
    bookedUserPromise,
  ])

  if (booked) return next(new AppError("This bicycle is already booked", 400))

  if (bookedUser)
    return next(new AppError("You already choose a bicycle!", 400))

  const bookingDetails = await BookingDetailsModel.create({
    pickUpLocation,
    bicycle,
    user,
    bookedForHours,
    quantity,
  })

  return res.status(201).json({
    status: "success",
    data: {
      bookingDetails,
    },
  })
})

exports.resetBookingDetails = catchError(async (req, res, next) => {
  const { bicycleId } = req.params

  await BookingDetailsModel.findOneAndDelete({
    bicycle: bicycleId,
  })

  res.status(204).json({
    status: "success",
    data: null,
  })
})

// exports.bookingStopRideBike = catchError(async (req, res, next) => {});

exports.getCheckoutSession = catchError(async (req, res, next) => {
  const { bicycleId } = req.params

  const bookingBicyclePromise = BicycleModel.findById(bicycleId)
  const bookingDetailsPromise = BookingDetailsModel.findOne({
    bicycle: bicycleId,
  })

  const [bookingBicycle, bookingDetails] = await Promise.all([
    bookingBicyclePromise,
    bookingDetailsPromise,
  ])

  const totalPrice =
    bookingBicycle.price *
    bookingDetails.quantity *
    bookingDetails.bookedForHours

  if (!bookingDetails)
    return next(new AppError("Please provide your booking details!", 400))

  const bookingCheckoutSession = await stripe.checkout.sessions.create({
    // information about session
    payment_method_types: ["card"],
    success_url: `${req.protocol}://${req.get("host")}/me?alert=booking`,
    cancel_url: `${req.protocol}://${req.get("host")}/bicycle/${
      bookingBicycle.slug
    }`,

    customer_email: req.CurrentUser.email,
    client_reference_id: bicycleId,

    line_items: [
      {
        // information about product
        name: `${bookingBicycle.name}`,
        description: `${bookingBicycle.summary}`,
        images: [
          `${req.protocol}://${req.get("host")}/img/bicycles/${
            bookingBicycle.imageCover
          }`,
        ],
        amount: totalPrice * 100,
        currency: "USD",
        quantity: bookingDetails.quantity,
      },
    ],
  })

  res.status(200).json({
    status: "success",
    bookingCheckoutSession,
  })
})

/*
exports.createBookingCheckout = catchError(async (req, res, next) => {
  const { bicycle, user, price } = req.query;

  if (!bicycle && !user && !price) return next();

  // const newBooking = await  BookingModel.create({ bicycle, user, price });

  const newBooking = new BookingModel({
    bicycle,
    user,
    price,
  });

  // newBooking.bookingExpiresIn = Date.now() +

  await newBooking.save();

  const currentBooking = await BookingModel.findOne({ bicycle });

  // const url = `${req.protocol}://${req.get('host')}/me`;

  await new Email(currentBooking.user, currentBooking).newBicycleBooked();

  res.redirect(req.originalUrl.split("?")[0]);
});
*/

const createBookingCheckout = async session => {
  const bicycle = session.client_reference_id
  const user = await UserModel.findOne({ email: session.customer_email })
  const price = session.amount_total / 100

  await BookingModel.create({
    bicycle,
    user: user.id,
    price,
  })
}

/**
 * Stripe webhook checkout
 */
exports.webhookCheckout = (req, res, next) => {
  /**
   * Take a signature from headers called 'stripe-signature'
   */
  const signature = req.headers["stripe-signature"]

  /**
   * Create a stripe event
   */
  let event
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    return res.status(400).send(`Error occured on Webhook: ${err.message}`)
  }

  if (event.type === "checkout.session.completed")
    createBookingCheckout(event.data.object)

  res.status(200).json({
    received: true,
  })
}
