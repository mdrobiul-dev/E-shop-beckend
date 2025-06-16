const express = require('express');
const authRout = require('./auth');
const apiRouter = express.Router()

apiRouter.use("/auth", authRout)

module.exports = apiRouter