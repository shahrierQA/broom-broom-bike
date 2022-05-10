const {
  getLoginForm,
  getSignupForm,
  getBikeIds,
  getBicyclesPage,
  getForgotForm,
  getResetForm,
  getHomePage,
  getMyAccount,
  getBicycleBySlug,
  getBicycleBookingDetails,
  alerts,
  bookingExpires,
} = require("../controllers/viewController")
const { isAuthenticate, protect } = require("../controllers/authController")
const { topBicycles } = require("../controllers/bicycleController")

const router = require("express").Router()

router.use(bookingExpires)
router.use(alerts)

router.get("/login", getLoginForm)
router.get("/signup", getSignupForm)

router.use(isAuthenticate)
router.use(getBikeIds)

router.get("/", getHomePage)

router.get("/bikes", getBicyclesPage)

router.get("/recover", getForgotForm)
router.get("/reset-password/:token", getResetForm)

router.get("/me", getMyAccount)

router.get("/bicycle/:slug", getBicycleBySlug)

router.get("/top-five-bicycles", topBicycles, getBicyclesPage)

router.get(
  "/bicycle/:bicycleId/booking-details",
  protect,
  getBicycleBookingDetails
)

module.exports = router
