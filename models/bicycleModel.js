const mongoose = require("mongoose")
const slugify = require("slugify")

const bicycleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "A bicycle must have a name"],
      trim: true,
      unique: true,
    },
    slug: String,

    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "Rating must be above 1.0"],
      max: [5, "Rating must be below 5.0"],
      set: val => Math.ceil(val * 10) / 10,
    },

    price: {
      type: Number,
      required: [true, "Bicycle must have a price"],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return this.price > val
        },
        message: "Discount price {VALUE} should be below then regular price",
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, "A bicycle must have a summary"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "A bicycle must have a description"],
    },
    imageCover: {
      type: String,
      required: [true, "A bicycle must have a photo"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
      select: false,
    },
    time: {
      type: Number,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

bicycleSchema.index({ name: "text", description: "text", summary: "text" })
bicycleSchema.index({ price: 1, ratingsAverage: 1 })
bicycleSchema.index({ slug: 1 })

// virtual populate --
/* In order to find the all the reviews in a specific bicycle 
we need to populate the reviews */

bicycleSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "bicycle",
  localField: "_id",
})

// pre save middleware for generating slug
bicycleSchema.pre("save", async function (next) {
  if (!this.isModified("name")) {
    next()
    return
  }
  this.slug = slugify(this.name, { lower: true })

  // make a unique slug
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, "i")

  const bikeSlug = await this.constructor.find({ slug: slugRegEx })

  if (bikeSlug.length) this.slug = `${this.slug}-${bikeSlug.length + 1}`

  next()
})

const BicycleModel = mongoose.model("Bicycle", bicycleSchema)
module.exports = BicycleModel
