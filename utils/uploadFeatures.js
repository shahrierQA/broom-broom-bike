const multer = require("multer")

// by this way the file save in the memory as a buffer
const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true)
  } else
    cb(
      new AppError("This is not an image file! Please upload only image.", 400),
      false
    )
}

module.exports = multer({ storage: multerStorage, fileFilter: multerFilter })
