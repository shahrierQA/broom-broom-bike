const multer = require("multer");
const AppError = require("./appError");

// by this way the file save in the memory as a buffer
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  let type = file.mimetype;

  switch (type) {
    case "image/jpeg": {
      return cb(null, true);
    }
    case "image/jpg": {
      return cb(null, true);
    }
    case "image/png": {
      return cb(null, true);
    }

    default: {
      return cb(
        new AppError("Invalid file. Upload only (jpg, png) file format", 400),
        false
      );
    }
  }
};

module.exports = multer({ storage: multerStorage, fileFilter: multerFilter });
