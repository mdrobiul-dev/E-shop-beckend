const categorySchema = require("../models/categorySchema");
const fs = require("fs");
const cloudinary = require("../dbConfig/cloudinary");

const createCatergory = async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).send({ error: "name is required" });

  if (!req.file || !req.file.path)
    return res.status(400).send({ error: "image is required" });

  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "catagories",
  });

  fs.unlinkSync(req.file.path);
  const category = new categorySchema({
    name,
    image: result.url,
  });
  await category.save();
  res.status(200).send({ success: "category is created", category });
};

const getCategory = async (req, res) => {
  const categories = await categorySchema.find();
  res.status(200).send({ success: "list of all catagories", categories });
};

module.exports = { createCatergory, getCategory };         
