const mongoose = require("mongoose")

const bookingDetailsSchema = new mongoose.Schema(
  {
    bicycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bicycle",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookedForHours: {
      type: Number,
      required: [true, "Please provide a Booking time!"],
    },
    quantity: {
      type: Number,
      required: [true, "Please provide a booking quantity"],
    },
    pickUpLocation: {
      type: String,
      required: [true, "Please provide a pickup location"],
    },
  },
  {
    timestamps: true,
  }
)

bookingDetailsSchema.pre(/^find/, function (next) {
  this.populate({
    path: "bicycle",
    select: "name imageCover slug price",
  })

  next()
})

bookingDetailsSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "email",
  })

  next()
})

const bookingDetailsModel = mongoose.model(
  "BookingDetails",
  bookingDetailsSchema
)
module.exports = bookingDetailsModel
