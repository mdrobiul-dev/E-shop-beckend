const express = require("express");
const authRout = require("./auth");
const categoryRoute = require("./category");
const apiRouter = express.Router();

apiRouter.use("/auth", authRout);
apiRouter.use("/product", categoryRoute)

module.exports = apiRouter;
