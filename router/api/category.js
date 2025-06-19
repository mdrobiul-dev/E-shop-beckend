const express = require("express");
const {createCatergory} = require("../../controllers/catergoryController");
const validUser = require("../../authMiddlewear/validUser");
const roleCheck = require("../../authMiddlewear/rolemiddlewear");
const upload = require('../../authMiddlewear/multer')
const categoryRoute = express.Router();

categoryRoute.post("/createcategory", validUser, roleCheck(["admin"]),upload.single('image'), createCatergory )

module.exports = categoryRoute;