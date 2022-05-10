const sharp = require("sharp")

const bicycleModel = require("../models/bicycleModel")
const catchError = require("../utils/catchError")
const factory = require("./handlerFactory")
const upload = require("../utils/uploadFeatures")

exports.uploadBicyclePhoto = upload.single("imageCover")

exports.resizeBicyclePhoto = catchError(async (req, res, next) => {
  if (!req.file) return next()

  const extension = req.file.mimetype.split("/")[1]

  req.body.imageCover = `bicycle-${Date.now()}.${extension}`

  await sharp(req.file.buffer)
    .resize(2000, 1333)
    .toFormat(`${extension}`)
    .jpeg({ quality: 90 })
    .png({ quality: 80 })
    .toFile(`public/img/bicycles/${req.body.imageCover}`)

  next()
})

exports.topBicycles = (req, res, next) => {
  req.query.limit = "5"
  req.query.sort = "-ratingsAverage,price"

  res.locals.topFiveBicycles = true

  next()
}

exports.createBicycle = factory.creatOne(bicycleModel)
exports.getBicycle = factory.getOne(bicycleModel)
exports.getAllBicycles = factory.getAll(bicycleModel)
exports.updateBicycle = factory.updateOne(bicycleModel)
exports.deleteBicycle = factory.deleteOne(bicycleModel)
