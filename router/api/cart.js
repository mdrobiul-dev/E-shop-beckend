const express = require("express");
const { addTocart } = require("../../controllers/cartController");
const cartRouter = express.Router()

cartRouter.get("/create", addTocart)

module.exports = cartRouter;