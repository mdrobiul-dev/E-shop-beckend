const express = require("express");
const {createProduct, updateProduct, getProduct} = require("../../controllers/productController");
const upload = require("../../authMiddlewear/multer");
const productRoute = express.Router()

productRoute.post("/creatproduct", upload.fields([
  { name: 'mainImg', maxCount: 1 },
  { name: 'images', maxCount: 8 }
]), createProduct)

productRoute.post("/updateproduct/:slug", upload.fields([
  { name: 'mainImg', maxCount: 1 },
  { name: 'images', maxCount: 8 }
]), updateProduct)

productRoute.get("/productlist", getProduct)


module.exports = productRoute