const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema(
  {
    bicycle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bicycle",
      required: true,
    },
    bookingExpiresIn: Date,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Must provide price for booking"],
    },
    paid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "bicycle",
    select: "name imageCover",
  })
  next()
})

bookingSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name email",
  })
  next()
})

const BookingModel = mongoose.model("Booking", bookingSchema)
module.exports = BookingModel
