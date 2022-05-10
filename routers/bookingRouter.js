const bookingController = require("../controllers/bookingController")
const authController = require("../controllers/authController")

const router = require("express").Router({ mergeParams: true })
router.use(authController.protect)

router.post(
  "/",
  authController.restrictTo("user"),
  bookingController.bookingDetails
)

router.delete(
  "/reset-details",
  authController.restrictTo("user"),
  bookingController.resetBookingDetails
)

router.get("/checkout-session/:bicycleId", bookingController.getCheckoutSession)

module.exports = router
