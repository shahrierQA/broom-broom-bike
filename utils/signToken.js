const JWT = require("jsonwebtoken")

// CREATE TOKEN (JWT SIGN) IMPLEMENTATION
const signToken = id => {
  return JWT.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  })
}

exports.createSendToken = (user, statusCode, req, res) => {
  const token = signToken(user._id)

  res.cookie("jwt", token, {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  })

  // remove the password from the output
  user.password = undefined
  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  })
}
