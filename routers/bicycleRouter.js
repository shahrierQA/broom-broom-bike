const bicycleController = require("../controllers/bicycleController");
const bookingRouter = require("./bookingRouter");
const reviewRouter = require("./reviewRouter");

const router = require("express").Router();

router.use("/:bicycleId/review", reviewRouter);
router.use("/:bicycleId/review/edit", reviewRouter);
router.use("/:bicycleId/booking-details", bookingRouter);
// router.use('/:bicycleId/stop-ride-bicycle', bookingRouter);

router
  .route("/")
  .get(bicycleController.getAllBicycles)
  .post(
    bicycleController.uploadBicyclePhoto,
    bicycleController.resizeBicyclePhoto,
    bicycleController.createBicycle
  );

router
  .route("/:id")
  .get(bicycleController.getBicycle)
  .patch(bicycleController.updateBicycle)
  .delete(bicycleController.deleteBicycle);

module.exports = router;
