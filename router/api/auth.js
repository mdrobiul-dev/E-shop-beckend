const express = require('express');

const validUser = require('../../authMiddlewear/validUser');
const upload = require('../../authMiddlewear/multer')
const { registration, emailvariefied, resentOtp, login, forgotPassword, resetPassword, profileUpdate } = require('../../controllers/authController');

const authRout = express.Router()

authRout.post("/registration", registration)
authRout.post("/emailvariefication", emailvariefied)
authRout.post("/resentotp", resentOtp)
authRout.post("/login", login)
authRout.post("/forgetpassword", forgotPassword)
authRout.post("/resetpassword/:randomString", resetPassword)
authRout.post("/profileupdate",validUser, upload.single('avatar'), profileUpdate)

module.exports = authRout                                           