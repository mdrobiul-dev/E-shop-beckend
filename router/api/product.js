const express = require("express");
const createProduct = require("../../controllers/productController");
const upload = require("../../authMiddlewear/multer");
const productRoute = express.Router()

productRoute.post("/creatproduct", upload.fields([
  { name: 'mainImg', maxCount: 1 },
  { name: 'images', maxCount: 8 }
]), createProduct)


module.exports = productRoute