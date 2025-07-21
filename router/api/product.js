const express = require("express");
const {createProduct, updateProduct, getProduct, deleteProduct} = require("../../controllers/productController");
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

// product/productlist?page=1&limit=10&search=premium&status=pending&category=mens
productRoute.get("/productlist", getProduct)

productRoute.delete("/deleteproduct/:productID", deleteProduct)


module.exports = productRoute