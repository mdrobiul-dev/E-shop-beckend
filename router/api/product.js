const express = require("express");
const createProduct = require("../../controllers/productController");
const productRoute = express.Router()

productRoute.post("/creatproduct", createProduct)


module.exports = productRoute