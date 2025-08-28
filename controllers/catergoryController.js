const categorySchema = require("../models/categorySchema");
const fs = require("fs");
const cloudinary = require("../dbConfig/cloudinary");

const createCatergory = async (req, res) => {

  const { name } = req.body;

try {
    if (!name) return res.status(400).send({ error: "name is required" });
  
    if (!req.file || !req.file.path)
      return res.status(400).send({ error: "image is required" });
  
  const normalizedName  = name.trim().toLowerCase()
  
    const existingUser = await categorySchema.findOne({name : normalizedName})
     
    if (existingUser) {
       return res.status(400).send({ error: "Category name already exists" });
    }
  
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "catagories",
    });
  
    fs.unlinkSync(req.file.path);
    const category = new categorySchema({
      name : normalizedName,
      image: result.url,
    });
    await category.save();
    res.status(200).send({ success: "category is created", category });
} catch (error) {
   console.error("Category creation error:", error);
  res.status(500).json({ error: "Server error. Please try again." });
}
};

const getCategory = async (req, res) => {
  const categories = await categorySchema.find();
  res.status(200).send({ success: "list of all catagories", categories });
};

module.exports = { createCatergory, getCategory };                 
