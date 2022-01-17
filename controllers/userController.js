const sharp = require('sharp');

const catchError = require('../utils/catchError');
// const AppError = require('../utils/appError');
const UserModel = require('../models/userModel');
const upload = require('../utils/uploadFeatures');

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchError(async (req, res, next) => {
  if (!req.file) return next();

  const extension = req.file.mimetype.split('/')[1];

  req.file.filename = `user-${req.CurrentUser.id}-${Date.now()}.${extension}`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat(`${extension}`)
    .jpeg({ quality: 80 })
    .png({ quality: 70 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
});

// for filter the fields which needs to update..
const filterObj = (body, ...fields) => {
  const newObjArr = {};
  Object.keys(body).forEach(el => {
    if (fields.includes(el)) newObjArr[el] = body[el];
  });

  return newObjArr;
};

exports.updateMe = catchError(async (req, res, next) => {
  /// filtered the fields
  const filteredBody = filterObj(req.body, 'name', 'phoneNumber');
  if (req.file) filteredBody.photo = req.file.filename;

  const updateUser = await UserModel.findByIdAndUpdate(
    req.CurrentUser.id,
    filteredBody,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});
