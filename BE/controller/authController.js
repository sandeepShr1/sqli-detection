require('dotenv').config();
const db = require("../db/models");
const user = db.user;
const Image = db.images;
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const catchAsyncError = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const sendEmail = require('../utils/sendEmail');

const generateToken = (payload) => {
      return jwt.sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXPIRY_IN })
}

const signup = catchAsyncError(async (req, res, next) => {
      const body = req.body;

      // if (!['1', '2'].includes(body.userType)) {
      //       throw new AppError("Invalid user type", 400)

      // }

      let avatarId = null;

      // Handle avatar upload if file is provided
      if (req.file) {
            const avatarImage = await Image.create({
                  productId: null, // User avatar, not linked to a product
                  url: req.file.path,
                  public_id: req.file.filename,
                  secure_url: req.file.secure_url || req.file.path,
                  format: req.file.format,
                  width: req.file.width,
                  height: req.file.height,
                  isPrimary: true
            });

            avatarId = avatarImage.id;
      }

      const newUser = await user.create({
            userType: body.userType || "1",
            firstName: body.firstName,
            lastName: body.lastName,
            email: body.email,
            password: body.password,
            confirmPassword: body.confirmPassword,
            avatarId: avatarId
      })

      if (!newUser) {
            return next(new AppError("Failed to create the user", 400))

      }
      const result = newUser.toJSON();
      delete result.password;
      delete result.deletedAt;

      result.token = generateToken({
            id: result.id
      })


      return res.status(201).json({
            status: "success",
            data: result
      })
})

const login = catchAsyncError(async (req, res, next) => {
      const { email, password } = req.body;
      if (!email || !password) {
            return next(new AppError('Please provide email or password.'), 400)

      }
      const result = await user.findOne({
            where: { email }, include: [{
                  model: Image,
                  as: 'avatar'
            }]
      })

      if (!result) {
            return next(new AppError("Invalid email or password"), 401)

      }
      const isPasswordMatched = await bcrypt.compare(password, result.password);


      if (!isPasswordMatched) {
            return res.status(401).json({
                  status: "fail",
                  message: "Invalid email or password"
            })
      }


      const token = generateToken({
            id: result.id,
            user: {
                  id: result.id,
                  role: result.userType,
                  firstName: result.firstName,
                  lastName: result.lastName,
                  email: result.email,
                  createdAt: result.createdAt,
                  avatar: result.avatar ? {
                        url: result.avatar.url,
                        secure_url: result.avatar.secure_url
                  } : null,

            }

      })
      return res.status(200).json({
            status: "success",
            data: token
      })

})

// Get User Detail
const getUserDetails = catchAsyncError(async (req, res, next) => {
      try {
            const userDetails = await user.findByPk(req.user.id, {
                  include: [{
                        model: Image,
                        as: 'avatar'
                  }]
            });


            res.status(200).json({
                  success: true,
                  user: {
                        id: userDetails.id,
                        role: userDetails.userType,
                        firstName: userDetails.firstName,
                        lastName: userDetails.lastName,
                        email: userDetails.email,
                        avatar: userDetails.avatar ? {
                              url: userDetails.avatar.url,
                              secure_url: userDetails.avatar.secure_url
                        } : null
                  }

            });
      } catch (error) {
            return next(new AppError(error.message, 500))
      }
});

const logout = catchAsyncError(async (req, res, next) => {
      res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true,
      });

      res.status(200).json({
            success: true,
            message: "Logged out",
      });
});

// Update user password
const updatePassword = catchAsyncError(async (req, res, next) => {
      try {
            const { oldPassword, newPassword, confirmPassword } = req.body;

            if (!oldPassword || !newPassword || !confirmPassword) {
                  return next(new AppError("Please provide all password fields", 400));
            }

            if (newPassword !== confirmPassword) {
                  return next(new AppError("New password and confirm password do not match", 400));
            }

            const user = await db.user.findByPk(req.user.id);

            if (!user) {
                  return next(new AppError("User not found", 404));
            }

            // Verify old password
            const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

            if (!isPasswordValid) {
                  return next(new AppError("Old password is incorrect", 401));
            }

            // Update password (will be hashed by beforeCreate hook)
            user.password = newPassword;
            await user.save();

            res.status(200).json({
                  success: true,
                  message: "Password updated successfully"
            });
      } catch (error) {
            return next(new AppError(error.message, 500));
      }
});

// Update user profile
const updateProfile = catchAsyncError(async (req, res, next) => {
      try {
            const { name, email } = req.body;
            const user = await db.user.findByPk(req.user.id);

            if (!user) {
                  return next(new AppError("User not found", 404));
            }

            // Update basic info
            if (name) user.name = name;
            if (email) user.email = email;

            // Handle avatar update
            if (req.file) {
                  // Delete old avatar if exists
                  if (user.avatarId) {
                        const oldImage = await db.images.findByPk(user.avatarId);
                        if (oldImage) {
                              await cloudinary.uploader.destroy(oldImage.public_id);
                              await oldImage.destroy();
                        }
                  }

                  // Create new image record
                  const newImage = await db.images.create({
                        url: req.file.path,
                        public_id: req.file.filename,
                        secure_url: req.file.path
                  });

                  user.avatarId = newImage.id;
            }

            await user.save();

            // Fetch updated user with avatar
            const updatedUser = await db.user.findByPk(user.id, {
                  include: [{
                        model: db.images,
                        as: 'avatar',
                        attributes: ['url', 'secure_url']
                  }],
                  attributes: { exclude: ['password'] }
            });

            res.status(200).json({
                  success: true,
                  user: updatedUser
            });
      } catch (error) {
            return next(new AppError(error.message, 500));
      }
});

// Get all users (Admin)
const getAllUsers = catchAsyncError(async (req, res, next) => {
      try {
            const users = await db.user.findAll({
                  include: [{
                        model: db.images,
                        as: 'avatar',
                        attributes: ['url', 'secure_url']
                  }],
                  attributes: { exclude: ['password'] }
            });

            res.status(200).json({
                  success: true,
                  users
            });
      } catch (error) {
            return next(new AppError(error.message, 500));
      }
});

// const getAllUsers = catchAsyncError(async (req, res, next) => {
//       try {
//             // User-controlled input (search/filter)
//             const role = req.query.role;

//             // ❌ INSECURE: Raw SQL + string concatenation
//             const users = await db.sequelize.query(
//                   "SELECT * FROM users WHERE role = '" + role + "'",
//                   {
//                         type: db.sequelize.QueryTypes.SELECT
//                   }
//             );

//             res.status(200).json({
//                   success: true,
//                   users
//             });
//       } catch (error) {
//             return next(new AppError(error.message, 500));
//       }
// });


// Get single user (Admin)
const getSingleUser = catchAsyncError(async (req, res, next) => {
      try {
            const user = await db.user.findByPk(req.params.id, {
                  include: [{
                        model: db.images,
                        as: 'avatar',
                        attributes: ['url', 'secure_url']
                  }],
                  attributes: { exclude: ['password'] }
            });

            if (!user) {
                  return next(new AppError("User not found", 404));
            }

            res.status(200).json({
                  success: true,
                  user
            });
      } catch (error) {
            return next(new AppError(error.message, 500));
      }
});

// Update user role (Admin)
const updateUserRole = catchAsyncError(async (req, res, next) => {
      try {
            const { role } = req.body;

            if (!role || !["0", "1", "2"].includes(role)) {
                  return next(new AppError("Invalid role. Must be 0 (admin), 1, or 2", 400));
            }

            const user = await db.user.findByPk(req.params.id);

            if (!user) {
                  return next(new AppError("User not found", 404));
            }

            user.userType = role;
            await user.save();

            res.status(200).json({
                  success: true,
                  message: "User role updated successfully"
            });
      } catch (error) {
            return next(new AppError(error.message, 500));
      }
});

// Delete user (Admin)
const deleteUser = catchAsyncError(async (req, res, next) => {
      try {
            const user = await db.user.findByPk(req.params.id);

            if (!user) {
                  return next(new AppError("User not found", 404));
            }

            // Delete avatar if exists
            if (user.avatarId) {
                  const avatar = await db.images.findByPk(user.avatarId);
                  if (avatar) {
                        await cloudinary.uploader.destroy(avatar.public_id);
                        await avatar.destroy();
                  }
            }

            await user.destroy();

            res.status(200).json({
                  success: true,
                  message: "User deleted successfully"
            });
      } catch (error) {
            return next(new AppError(error.message, 500));
      }
});

// Forgot Password
const forgotPassword = catchAsyncError(async (req, res, next) => {
      try {
            const { email } = req.body;

            if (!email) {
                  return next(new AppError("Please provide email address", 400));
            }

            const userRecord = await db.user.findOne({ where: { email } });

            if (!userRecord) {
                  return next(new AppError("User not found with this email", 404));
            }

            // Generate reset token
            const resetToken = crypto.randomBytes(32).toString("hex");

            // Hash token and set to resetPasswordToken field
            const resetPasswordToken = crypto
                  .createHash("sha256")
                  .update(resetToken)
                  .digest("hex");

            // Set expire time (15 minutes)
            const resetPasswordExpire = new Date(Date.now() + 15 * 60 * 1000);

            userRecord.resetPasswordToken = resetPasswordToken;
            userRecord.resetPasswordExpire = resetPasswordExpire;
            await userRecord.save();

            // Create reset URL
            const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/auth/password/reset/${resetToken}`;

            const message = `Your password reset token is:\n\n${resetUrl}\n\nIf you have not requested this email, please ignore it.\n\nThis token will expire in 15 minutes.`;

            try {
                  await sendEmail({
                        email: userRecord.email,
                        subject: "Password Recovery - E-commerce",
                        message,
                  });

                  res.status(200).json({
                        success: true,
                        message: `Email sent to ${userRecord.email} successfully`
                  });
            } catch (error) {
                  userRecord.resetPasswordToken = null;
                  userRecord.resetPasswordExpire = null;
                  await userRecord.save();

                  return next(new AppError("Email could not be sent", 500));
            }
      } catch (error) {
            return next(new AppError(error.message, 500));
      }
});

// Reset Password
const resetPassword = catchAsyncError(async (req, res, next) => {
      try {
            const { token } = req.params;
            const { password, confirmPassword } = req.body;

            if (!password || !confirmPassword) {
                  return next(new AppError("Please provide password and confirm password", 400));
            }

            if (password !== confirmPassword) {
                  return next(new AppError("Passwords do not match", 400));
            }

            // Hash the token from params
            const resetPasswordToken = crypto
                  .createHash("sha256")
                  .update(token)
                  .digest("hex");

            // Find user with valid token
            const userRecord = await db.user.findOne({
                  where: {
                        resetPasswordToken,
                        resetPasswordExpire: {
                              [db.Sequelize.Op.gt]: new Date()
                        }
                  }
            });

            if (!userRecord) {
                  return next(new AppError("Reset password token is invalid or has expired", 400));
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(password, 10);
            userRecord.password = hashedPassword;
            userRecord.resetPasswordToken = null;
            userRecord.resetPasswordExpire = null;
            await userRecord.save();

            // Generate new JWT token
            const jwtToken = generateToken({ id: userRecord.id, email: userRecord.email });

            res.status(200).json({
                  success: true,
                  message: "Password reset successful",
                  token: jwtToken
            });
      } catch (error) {
            return next(new AppError(error.message, 500));
      }
});

module.exports = {
      signup,
      login,
      getUserDetails,
      logout,
      updatePassword,
      updateProfile,
      getAllUsers,
      getSingleUser,
      updateUserRole,
      deleteUser,
      forgotPassword,
      resetPassword
} 