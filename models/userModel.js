const mongoose = require("mongoose")
const crypto = require("crypto")
const validator = require("validator")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please tell us your name"],
  },
  email: {
    type: String,
    required: [true, "Please provide a email"],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please provide a valid email"],
  },
  phoneNumber: {
    type: String,
    required: [true, "Please provide your Phone Number"],
    validate: {
      validator: function (value) {
        return /\d{11}/.test(value)
      },
      message: props => `${props.value} is not a valid phone number!`,
    },
  },

  photo: {
    type: String,
    default: "default.jpg",
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
})

userSchema.virtual("bookings", {
  ref: "Booking",
  foreignField: "user",
  localField: "_id",
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()

  this.password = await bcrypt.hash(this.password, 12)

  this.passwordConfirm = undefined
  next()
})

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.inNew) return next()

  this.passwordChangedAt = Date.now() - 1000

  next()
})

userSchema.pre(/^find/, function (next) {
  this.find({ active: { $ne: false } })
  next()
})

userSchema.methods.correctPassword = async function (
  givenPassword,
  userPassword
) {
  return await bcrypt.compare(givenPassword, userPassword)
}

userSchema.methods.changedPasswordAfter = function (timeStampsJWT) {
  if (this.passwordChangedAt) {
    const changetime = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return changetime > timeStampsJWT
  }

  return false
}

// create password reset token
userSchema.methods.createPasswordResetToken = function () {
  const createResetToken = crypto.randomBytes(32).toString("hex")

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(createResetToken)
    .digest("hex")

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000

  return createResetToken
}

const UserModel = mongoose.model("User", userSchema)
module.exports = UserModel
