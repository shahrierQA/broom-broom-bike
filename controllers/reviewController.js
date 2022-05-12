const ReviewModel = require("../models/reviewModel")
const factory = require("./handlerFactory")
const catchError = require("../utils/catchError")
const AppError = require("../utils/appError")

exports.createReview = catchError(async (req, res, next) => {
  let { review, rating, bicycle, user } = req.body

  if (!bicycle) bicycle = req.params.bicycleId
  if (!user) user = req.CurrentUser.id

  if (!review || rating === 0)
    return next(new AppError("Field should not be empty", 400))

  const findRev = await ReviewModel.findOne({
    $and: [{ user: req.CurrentUser.id }, { bicycle }],
  })
  if (findRev) return next(new AppError("You already reviewed", 400))

  const postReview = await ReviewModel.create({
    review,
    rating,
    bicycle,
    user,
  })

  return res.status(201).json({
    status: "success",
    data: {
      postReview,
    },
  })
})

exports.setIds = (req, res, next) => {
  if (!req.body.bicycle) req.body.bicycle = req.params.bicycleId
  if (!req.body.user) req.body.user = req.CurrentUser.id

  next()
}

exports.editReview = catchError(async (req, res, next) => {
  let { review, rating } = req.body
  const { id, bicycleId } = req.params

  if (!review || rating === 0)
    return next(new AppError("Field should not be empty", 400))

  await ReviewModel.calculateAverageRatings(bicycleId)
  const editedReview = await ReviewModel.findByIdAndUpdate(
    id,
    { review, rating },
    { new: true, runValidators: true }
  )

  res.status(200).json({
    status: "success",
    data: {
      editedReview,
    },
  })
})

// FOR GETTING ALL REVIEW
exports.getAllReview = factory.getAll(ReviewModel)

// FOR GETTING A REVIEW
exports.getReview = factory.getOne(ReviewModel)

// FOR DELETING REVIEW
exports.deleteReview = factory.deleteOne(ReviewModel)

// FOR UPDATING REVIEW REVIEW
exports.updateReview = factory.updateOne(ReviewModel)
