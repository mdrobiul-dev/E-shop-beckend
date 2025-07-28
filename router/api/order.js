const express = require("express");
const validUser = require("../../authMiddlewear/validUser");
const { addNewOrder } = require("../../controllers/orderController");

const orderRouter = express.Router();

orderRouter.post("/create", validUser, addNewOrder);

module.exports = orderRouter;