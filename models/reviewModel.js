const mongoose = require("mongoose")
const Bicycle = require("./bicycleModel")

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

reviewSchema.statics.calculateAverageRatings = async function (bikeId) {
  const ratingStats = await this.aggregate([
    {
      $match: { bicycle: bikeId },
    },
    {
      $group: {
        _id: "$bicycle",
        avgRatings: { $avg: "$rating" },
      },
    },
  ])

  if (ratingStats.length > 0) {
    await Bicycle.findByIdAndUpdate(bikeId, {
      ratingsAverage: ratingStats[0].avgRatings,
    })
  } else {
    await Bicycle.findByIdAndUpdate(bikeId, {
      ratingsAverage: 4.5,
    })
  }
}

reviewSchema.post("save", function () {
  this.constructor.calculateAverageRatings(this.bicycle)
})

// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   this.currentRev = await this.findOne()
//   next()
// })

// reviewSchema.post(/^findOneAnd/, async function () {
//   await this.currentRev.constructor.calculateAverageRatings(
//     this.currentRev.bicycle
//   )
// })

const ReviewModel = mongoose.model("Review", reviewSchema)
module.exports = ReviewModel
