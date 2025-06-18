const jwt = require("jsonwebtoken");
const fs = require("fs");
const bcrypt = require("bcrypt");
const validateEmail = require("../helpers/emailValidator");
const userSchema = require("../models/userSchema");
const sendingEmail = require("../helpers/emailSend");
const { emailTemplates } = require("../helpers/temPlates");

//registration function

const registration = async (req, res) => {
  // try {
  const { fullName, email, password, avatar, phone, role, address } = req.body;

  // Basic validation

  if (!fullName) return res.status(400).send({ error: "fullName is required" });
  if (!phone)
    return res.status(400).send({ error: "phone number is required" });
  if (!email) return res.status(400).send({ error: "email is required" });
  if (!password) return res.status(400).send({ error: "password is required" });

  if (!validateEmail(email))
    return res.status(400).send({ error: "Email is invalid" });

  // const passwordError = validatePassword(password);
  // if (passwordError) return res.status(400).send({ error: passwordError });

  const existingUser = await userSchema.findOne({ email });
  if (existingUser)
    return res.status(400).send({ error: "Email is already in use" });

  // Generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000);
  const otpExpiredAt = new Date(Date.now() + 5 * 60 * 1000);

  // Save user to DB
  const userData = new userSchema({
    fullName,
    email,
    password,
    avatar,
    phone,
    address,
    role,
    otp,
    otpExpiredAt,
  });
  await userData.save();

  sendingEmail(email, "variefy your email", emailTemplates, otp, fullName);

  return res
    .status(200)
    .send({ success: "Registration successful. OTP sent to your email." });
  // } catch (error) {
  //   res.status(500).send("Server error!");
  // }
};

//login function

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).send({ error: "email is required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).send({ error: "email is not valid" });
  }

  if (!password) {
    return res.status(400).send({ error: "password is required" });
  }

  const existingUser = await userSchema.findOne({ email });

  if (!existingUser) return res.status(400).send({ error: "email not found" });

  if (!existingUser.isVarified)
    return res.status(400).send({ error: "email not variefied" });

  const isUserValid = await existingUser.isPasswordValid(password);

  if (!isUserValid) {
    return res.status(400).send({ error: "password is incorrect" });
  }

  const acces_token = jwt.sign(
    {
      data: {
        email: existingUser.email,
        _id: existingUser._id,
        role: existingUser.role
      },
    },
    process.env.SECRET_KEY,
    { expiresIn: "24h" }
  );

  const loggedUser = {
    fullName: existingUser.fullName,
    email: existingUser.email,
    phone: existingUser.phone,
    role: existingUser.role,
    address: existingUser.address,
    _id: existingUser._id,
    avatar: existingUser.avatar,
    isVarified: existingUser.isVarified,
    createdAt: existingUser.createdAt,
    updatedAt: existingUser.updatedAt,
  };

  res
    .status(200)
    .send({ message: "login succesful", user: loggedUser, acces_token });
};

//email variefied function

const emailvariefied = async (req, res) => {
  const { email, otp } = req.body;

  if (!email) return res.status(400).send({ error: "email is required" });

  if (!otp) return res.status(400).send({ error: "otp is required" });

  const variefiedUser = await userSchema.findOne({
    email,
    otp,
    otpExpiredAt: { $gt: Date.now() },
  });

  if (!variefiedUser)
    return res.status(400).send({ error: "Wrong otp / expired !" });

  variefiedUser.otp = null;
  variefiedUser.otpExpiredAt = null;
  variefiedUser.isVarified = true;
  await variefiedUser.save();

  res
    .status(200)
    .send({ success: "Registration succesfull , email variefied succesfull" });
};

//Re-Sent Otp

const resentOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ error: "email is required" });
    }

    const userData = await userSchema.findOne({ email });

    if (!userData) {
      return res.status(400).send({ error: "No user data" });
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    userData.otp = otp;
    userData.otpExpiredAt = new Date(Date.now() + 5 * 60 * 1000);
    await userData.save();

    const fullName = userData.fullName;

    sendingEmail(email, "variefy your email", emailTemplates, otp, fullName);

    return res.status(200).send({ message: "OTP resent successfully" });
  } catch (error) {
    res.status(500).send({ error: "server error" });
  }
};

//forget password

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  const existingUser = await userSchema.findOne({ email });

  if (!existingUser)
    return res.status(400).send({ error: "No account in this email" });

  // initiate password reset logic

  const randomString = generateRandomString(25);

  existingUser.randomString = randomString;
  existingUser.linkExpiredAt = new Date(Date.now() + 5 * 60 * 1000);
  await existingUser.save();

  sendingEmail(
    email,
    "Reset Your password",
    forgetPasswordTemplate,
    randomString,
    email
  );

  res
    .status(200)
    .json({ message: "Password reset instructions sent to email" });
};

//Reset password

const resetPassword = async (req, res) => {
  try {
    const randomString = req.params.randomString;
    const email = req.query.email;
    const { password } = req.body;
    if (!randomString)
      return res.status(400).send({ error: "invalid credential" });
    if (!email) return res.status(400).send({ error: "invalid credential" });

    const existingUser = await userSchema.findOne({ email });

    if (!existingUser)
      return res.status(400).send({ error: "invalid credential" });

    if (
      !existingUser.randomString ||
      existingUser.randomString.trim() !== randomString.trim()
    ) {
      return res.status(400).send({ error: "Invalid token." });
    }

    if (
      !existingUser.linkExpiredAt ||
      new Date(existingUser.linkExpiredAt).getTime() < Date.now()
    ) {
      return res
        .status(400)
        .send({ error: "Reset link has expired. Please request a new one." });
    }

    existingUser.password = password;
    existingUser.randomString = null;
    existingUser.linkExpiredAt = null;
    await existingUser.save();

    res.status(200).send({ message: "password reset succesfull" });
  } catch (error) {
    res.status(500).send({ error: "Server error!" });
  }
};

//update profile

const profileUpdate = async (req, res) => {
  try {
    const { fullName, password, bio } = req.body;
    const updateFields = {};

    if (fullName)
      updateFields.fullName = fullName.trim().split(/\s+/).join(" ");
    if (bio) updateFields.bio = bio.trim().split(/\s+/).join(" ");
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const userId = req.user._id;

    const user = await userSchema.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.file) {
      //  delete old image from Cloudinary
      if (user.avatarPublicId) {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      }
      //  upload new image
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "avatars",
      });

      fs.unlinkSync(req.file.path);

      updateFields.avatar = result.secure_url;
      updateFields.avatarPublicId = result.public_id;
    }

    //  update user in DB
    const updatedUser = await userSchema.findByIdAndUpdate(
      userId,
      updateFields,
      { new: true }
    );

    res.status(200).json({
      message: "Profile updated successfully",
      updatedUser,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).send("Server error!");
  }
};

module.exports = {
  registration,
  login,
  emailvariefied,
  forgotPassword,
  resetPassword,
  profileUpdate,
  resentOtp,
};
