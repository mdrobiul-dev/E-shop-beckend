const express = require("express");
const { addTocart, updateCart, deleteCartItem, getCart } = require("../../controllers/cartController");
const { validate } = require("../../models/cartSchema");
const cartRouter = express.Router()

cartRouter.post("/create",validate, addTocart)
cartRouter.put("/update",validate, updateCart)
cartRouter.delete("/delete",validate, deleteCartItem)
cartRouter.get("/cartlist",validate, getCart )

module.exports = cartRouter;           