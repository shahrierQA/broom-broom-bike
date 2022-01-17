const { promisify } = require("util");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");
const helpers = require("../utils/helpers");
const UserModel = require("../models/userModel");
const catchError = require("../utils/catchError");
const AppError = require("../utils/appError");
const Email = require("../utils/email");
const BookingModel = require("../models/bookingModel");
const BookingDetailsModel = require("../models/detailsModel");
const moment = require("moment");

const { createSendToken } = require("../utils/signToken");

// SIGN UP USER IMPLEMENTATION
exports.signUp = catchError(async (req, res, next) => {
  const { name, email, phoneNumber, password, passwordConfirm } = req.body;

  const findUser = await UserModel.findOne({ email });

  if (findUser) {
    return next(new AppError("Email already exists!", 400));
  }

  if (password.length < 8)
    return next(
      new AppError("Password should at least 8 characters long!", 400)
    );

  if (password !== passwordConfirm)
    return next(new AppError("Password doesn't matched!", 400));

  const newUser = await UserModel.create({
    name,
    email,
    password,
    passwordConfirm,
    phoneNumber,
  });

  const url = `${req.protocol}://${req.get("host")}/me`;

  await new Email(newUser, url).sendWelcome();

  // create and send the token
  createSendToken(newUser, 201, res);
});

// LOGIN USER IMPLEMENTATION
exports.login = catchError(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new AppError("Please provide email and password", 400));

  const loginUser = await UserModel.findOne({ email }).select("+password");

  if (
    !loginUser ||
    !(await loginUser.correctPassword(password, loginUser.password))
  ) {
    return next(new AppError("Incorrect Email or Password!", 401));
  }

  createSendToken(loginUser, 200, res);
});

// PROTECT MIDDLEWARE(PROTECT ROUTE) IMPLEMENTATION
/** Here the route is protect for only the login users */
exports.protect = catchError(async (req, res, next) => {
  // getting token
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // check if the token is exist
  if (!token) {
    return next(
      new AppError(
        "You are not logged in. Please Login again to get access",
        401
      )
    );
  }

  // verfication token
  const decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

  const currentUser = await UserModel.findById(decoded.id);

  if (!currentUser)
    return next(
      new AppError("The user belonging to this token no longer exist!", 401)
    );

  // check if user changed the password after the token was issued
  const changedPassword = currentUser.changedPasswordAfter(decoded.iat);
  if (changedPassword) {
    return next(
      new AppError("Recently Changed your password! Please log in again.", 401)
    );
  }

  req.CurrentUser = currentUser;
  // using rendering website
  res.locals.currUser = currentUser;
  next();
});

// RESTRICT OUR ROUTES FOR CERTAIN ROLE IMPLEMENTATION
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.CurrentUser.role)) {
      return next(
        new AppError("You do not have permission to perform this action!", 403)
      );
    }

    next();
  };
};

// THIS IS ONLY FOR RENDERING THE PAGE
exports.isAuthenticate = async (req, res, next) => {
  // getting token
  const token = req.cookies.jwt;

  if (token) {
    try {
      // verfication token
      const decoded = await promisify(JWT.verify)(
        token,
        process.env.JWT_SECRET
      );

      const currentUser = await UserModel.findById(decoded.id);

      if (!currentUser) return next();

      const changedPassword = currentUser.changedPasswordAfter(decoded.iat);
      if (changedPassword) return next();

      req.CurrentUser = currentUser;

      // using rendering website
      res.locals.currUser = currentUser;

      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

// FORGOT PASSWORD IMPLEMENTATION
exports.forgotPassword = catchError(async (req, res, next) => {
  const { email } = req.body;
  const forgotUser = await UserModel.findOne({ email });

  if (!forgotUser)
    return next(new AppError("There is no user with that email!", 404));

  // generate the random token
  const resetToken = forgotUser.createPasswordResetToken();
  await forgotUser.save({ validateBeforeSave: false });

  try {
    const url = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;

    /// sending email
    await new Email(forgotUser, url).sendPasswordReset();
    // await new Email(forgotUser, resetUrl).sendPasswordReset();

    res.status(200).json({
      status: "success",
      message: "sent the token!",
    });
  } catch (err) {
    forgotUser.passwordResetToken = undefined;
    forgotUser.passwordResetExpires = undefined;

    await forgotUser.save({ validateBeforeSave: false });

    return next(new AppError("There is an error! please try again later!"));
  }
});

// RESET PASSWORD IMPLEMENTATION
exports.resetPassword = catchError(async (req, res, next) => {
  // get user based on the resetToken
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const resetUser = await UserModel.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  }).select("+password");

  // set the new password, if the user is exist and the token is not expired
  if (!resetUser) return next(new AppError("Token is invalid or expired", 400));

  if (req.body.password !== req.body.passwordConfirm) {
    return next(new AppError("Password does not matched", 401));
  }

  // implementation for if the given password is same to the previous one
  if (await resetUser.correctPassword(req.body.password, resetUser.password)) {
    return next(
      new AppError(
        `This is your previous password.<br/> <span class="nice-time">Your password changed at ${moment(
          resetUser.passwordChangedAt
        ).fromNow()}</span>`,
        400
      )
    );
  }
  resetUser.password = req.body.password;
  resetUser.passwordConfirm = req.body.passwordConfirm;
  resetUser.passwordResetToken = undefined;
  resetUser.passwordResetExpires = undefined;
  await resetUser.save();

  const loginUrl = `${req.protocol}://${req.get("host")}/login`;

  await new Email(resetUser, loginUrl).sendPasswordResetSuccessful();

  createSendToken("", 200, res);
});

// FOR UPDATE PASSWORD IMPLEMENTATION
exports.updatePassword = catchError(async (req, res, next) => {
  const { passwordCurrent, password, passwordConfirm } = req.body;

  // get the user from colleection
  const updateUser = await UserModel.findById(req.CurrentUser.id).select(
    "+password"
  );

  if (
    !(await updateUser.correctPassword(passwordCurrent, updateUser.password))
  ) {
    return next(new AppError("Your current password is not correct!", 401));
  }

  if (password !== passwordConfirm)
    return next(new AppError("Password doesn't matched", 401));

  if (await updateUser.correctPassword(password, updateUser.password)) {
    return next(
      new AppError("New password must be different from the older one!", 400)
    );
  }
  //  update the password, if the current password is correct
  updateUser.password = password;
  updateUser.passwordConfirm = passwordConfirm;
  await updateUser.save();

  createSendToken(updateUser, 200, res);
});

// FOR LOGOUT IMPLEMENTATION
exports.logout = (req, res) => {
  res.cookie("jwt", "forgotTOken", {
    expires: new Date(Date.now() + 2 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
  });
};

// exports.isBooked = catchError(async (req, res, next) => {
//   const allBookings = await BookingModel.find();
//   const bikeUser = allBookings.map(
//     el => el.bicycle.id === req.params.id || el.user.id === req.CurrentUser.id
//   );
//   if (!bikeUser.includes(true)) {
//     return next(
//       new AppError('Cannot give a review without booking the bicycle!', 403)
//     );
//   }

//   // req.booked = true;

//   next();
// });

// exports.isBooked = catchError(async (req, res, next) => {
//   const findBikePromise = BookingDetailsModel.findOne({ bicycle: bicycle.id });
//   const bookingsPromise =
//     req.CurrentUser && BookingModel.find({ user: req.CurrentUser.id });

// })
