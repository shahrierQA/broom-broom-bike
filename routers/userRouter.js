const authController = require("../controllers/authController")
const userController = require("../controllers/userController")

const router = require("express").Router()

router.post("/forgot-password", authController.forgotPassword)
router.patch("/reset-password/:token", authController.resetPassword)

router.post("/signup", authController.signUp)
router.post("/login", authController.login)
router.get("/logout", authController.logout)

router.use(authController.protect)

router.patch(
  "/update-me",
  userController.uploadUserPhoto,
  userController.resizeUserPhoto,
  userController.updateMe
)

router.patch("/update-password", authController.updatePassword)

module.exports = router
