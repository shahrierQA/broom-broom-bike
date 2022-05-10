const mongoose = require("mongoose")
const BicycleModel = require("./bicycleModel")

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, "Review cannot be empty"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
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
  },
  { timestamps: true },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

reviewSchema.index({ bicycle: 1, user: 1 }, { unique: true })

// query middleware -- populating reviews with bicycle and user data
reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "user",
    select: "name photo",
  })

  next()
})

reviewSchema.statics.calcAverageRatings = async function (bicycleId) {
  const stats = await this.aggregate([
    {
      $match: { bicycle: bicycleId },
    },
    {
      $group: {
        _id: "$bicycle",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ])

  if (stats.length > 0) {
    await BicycleModel.findByIdAndUpdate(bicycleId, {
      ratingsAverage: stats[0].avgRating,
    })
  } else {
    await BicycleModel.findByIdAndUpdate(bicycleId, {
      ratingsAverage: 4.5,
    })
  }
}

reviewSchema.post("save", function () {
  this.constructor.calcAverageRatings(this.bicycle)
})

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.currentReview = await this.findOne()
  next()
})

reviewSchema.post(/^findOneAnd/, async function () {
  await this.currentReview.constructor.calcAverageRatings(
    this.currentReview.bicycle
  )
})

const ReviewModel = mongoose.model("Review", reviewSchema)
module.exports = ReviewModel
