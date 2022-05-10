const catchError = require("../utils/catchError")
const AppError = require("../utils/appError")
const APIFeatures = require("../utils/apiFeatures")

exports.creatOne = Model =>
  catchError(async (req, res) => {
    const createDoc = await Model.create(req.body)

    res.status(201).json({
      status: "success",
      data: {
        data: createDoc,
      },
    })
  })

exports.getAll = Model =>
  catchError(async (req, res, next) => {
    // Allowing nested routes for reviews on bicycle
    let filtering = {}

    if (req.params.bicycleId) {
      filtering = { bike: req.params.bicycleId }
    }

    if (req.params.userId) {
      filtering = { user: req.params.userId }
    }
    // execute the query
    const features = new APIFeatures(Model.find(filtering), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate()

    // const getDocs = await features.queryData.explain();
    const getDocs = await features.queryData

    res.status(200).json({
      status: "success",
      requestAt: req.requestTime,
      result: getDocs.length,
      data: {
        bikes: getDocs,
      },
    })
  })

exports.getOne = (Model, populateOptns) =>
  catchError(async (req, res, next) => {
    let query = Model.findById(req.params.id)

    if (populateOptns) query = query.populate(populateOptns)

    const oneDoc = await query

    if (!oneDoc) {
      return next(new AppError(`NO DOCUMENT FOUND WITH THAT ID!`, 404))
    }

    res.status(200).json({
      status: "success",
      data: {
        data: oneDoc,
      },
    })
  })

exports.updateOne = Model =>
  catchError(async (req, res, next) => {
    const updateDoc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })

    if (!updateDoc) {
      return next(new AppError(`NO DOCUMENT FOUND WITH THAT ID!`, 404))
    }

    res.status(200).json({
      status: "success",
      data: {
        data: updateDoc,
      },
    })
  })

exports.deleteOne = Model =>
  catchError(async (req, res, next) => {
    await Model.findByIdAndRemove(req.params.id)

    res.status(204).json({
      status: "success",
      data: null,
    })
  })
