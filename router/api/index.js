const express = require("express");
const authRout = require("./auth");
const categoryRoute = require("./category");
const productRoute = require("./product");
const cartRouter = require("./cart");
const orderRouter = require("./order");
const apiRouter = express.Router();

apiRouter.use("/auth", authRout);
apiRouter.use("/category", categoryRoute);
apiRouter.use("/product", productRoute );
apiRouter.use("/cart", cartRouter)
apiRouter.use("/order", orderRouter);

module.exports = apiRouter;                             
