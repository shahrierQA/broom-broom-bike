const ReviewModel = require('../models/reviewModel');
const factory = require('./handlerFactory');
const catchError = require('../utils/catchError');
const AppError = require('../utils/appError');

exports.createReview = catchError(async (req, res, next) => {
  let { review, rating, bicycle, user } = req.body;

  if (!bicycle) bicycle = req.params.bicycleId;
  if (!user) user = req.CurrentUser.id;

  if (!review || !rating)
    return next(new AppError('Field should not be empty', 400));

  // const findRev = await ReviewModel.findOne({ user: req.CurrentUser.id });

  // if (findRev) {
  //   return next(new AppError('Review already exist for this user'));
  // }

  const postReview = await ReviewModel.create({
    review,
    rating,
    bicycle,
    user,
  });

  return res.status(201).json({
    status: 'success',
    data: {
      postReview,
    },
  });
});

exports.setIds = (req, res, next) => {
  if (!req.body.bicycle) req.body.bicycle = req.params.bicycleId;
  if (!req.body.user) req.body.user = req.CurrentUser.id;

  next();
};

exports.editReview = catchError(async (req, res, next) => {
  let { review, rating } = req.body;

  if (!review || !rating)
    return next(new AppError('Field should not be empty', 400));

  const existReview = await ReviewModel.findOne({ user: req.CurrentUser.id });

  const editedReview = await ReviewModel.findByIdAndUpdate(
    { _id: existReview.id },
    { review, rating },
    { new: true }
  );

  return res.status(200).json({
    status: 'success',
    data: {
      editedReview,
    },
  });
});

// FOR CREATING A REVIEW
exports.createReview = factory.creatOne(ReviewModel);

// FOR GETTING ALL REVIEW
exports.getAllReview = factory.getAll(ReviewModel);

// FOR GETTING A REVIEW
exports.getReview = factory.getOne(ReviewModel);

// FOR DELETING REVIEW
exports.deleteReview = factory.deleteOne(ReviewModel);

// FOR UPDATING REVIEW REVIEW
exports.updateReview = factory.updateOne(ReviewModel);
