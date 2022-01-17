const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = require('express').Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .post(authController.restrictTo('user'), reviewController.createReview)
  .get(reviewController.getAllReview);

router
  .route('/:id')
  .patch(authController.restrictTo('user'), reviewController.editReview);

module.exports = router;
