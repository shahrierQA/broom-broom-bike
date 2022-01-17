const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");
const bicycleController = require("../controllers/bicycleController");
const bookingController = require("../controllers/bookingController");

const router = require("express").Router();

router.get("/login", viewController.getLoginForm);
router.get("/signup", viewController.getSignupForm);

router.use(authController.isAuthenticate);

router.get(
  "/",
  bookingController.createBookingCheckout,
  viewController.getHomePage
);

router.get("/bikes", viewController.getBicyclesPage);

router.get("/recover", viewController.getForgotForm);
router.get("/reset-password/:token", viewController.getResetForm);

router.get("/me", viewController.getMyAccount);

router.get("/bicycle/:slug", viewController.getBicycleBySlug);

router.get(
  "/top-five-bicycles",
  bicycleController.topBicycles,
  viewController.getBicyclesPage
);

router.get(
  "/bicycle/:bicycleId/booking-details",
  authController.protect,
  viewController.getBicycleBookingDetails
);

module.exports = router;
