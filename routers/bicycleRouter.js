const {
  getAllBicycles,
  uploadBicyclePhoto,
  resizeBicyclePhoto,
  createBicycle,
  getBicycle,
  updateBicycle,
  deleteBicycle,
} = require("../controllers/bicycleController")
const bookingRouter = require("./bookingRouter")
const reviewRouter = require("./reviewRouter")

const router = require("express").Router()

router.use("/:bicycleId/review", reviewRouter)
router.use("/:bicycleId/review/edit", reviewRouter)
router.use("/:bicycleId/booking-details", bookingRouter)

router
  .route("/")
  .get(getAllBicycles)
  .post(uploadBicyclePhoto, resizeBicyclePhoto, createBicycle)

router.route("/:id").get(getBicycle).patch(updateBicycle).delete(deleteBicycle)

module.exports = router
