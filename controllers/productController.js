const { default: mongoose } = require("mongoose");
const productSchema = require("../models/productSchema");
const fs = require("fs");
const cloudinary = require("../dbConfig/cloudinary");
const generateSlug = require("../helpers/slugGenarator");

const createProduct = async (req, res) => {
  const { title, description, price, category, stock, variants } = req.body;
  const numberPrice = Number(price);
  const validStock = Number(stock);

  try {
    if (!title?.trim()) {
      return res.status(400).send({ error: "Title is required" });
    }

    if (!description?.trim()) {
      return res.status(400).send({ error: "Description is required" });
    }

    if (isNaN(numberPrice)) {
      return res.status(400).send({ error: "Price must be a valid number" });
    }

    if (numberPrice < 1) {
      return res.status(400).send({ error: "Price must be a positive number" });
    }

    if (!category) {
      return res.status(400).send({ error: "Valid category ID is required" });
    }

    if (!req.files || !req.files.mainImg || req.files.mainImg.length === 0) {
      return res.status(400).send({ error: "Main image is required" });
    }

    const slug = generateSlug(title);

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const mainImgFile = req.files.mainImg[0];
    const additionalImages = req.files.images || [];

    if (isNaN(validStock)) {
      return res.status(400).send({ error: "Stock must be a valid number" });
    }

    if (!Number.isInteger(validStock) || validStock < 1) {
      return res
        .status(400)
        .send({ error: "Stock must be a positive integer" });
    }

    if (!Array.isArray(variants) || variants.length < 1) {
      return res.status(400).send({ error: "Add at least one variant" });
    }

    for (const item of variants) {
      if (!item.name || !["color", "size"].includes(item.name.toLowerCase())) {
        return res.status(400).send({
          error: "Variant name must be either 'color' or 'size'",
        });
      }

      if (!Array.isArray(item.options) || item.options.length === 0) {
        return res.status(400).send({
          error: `Variant '${item.name}' must include at least one option`,
        });
      }

      for (const option of item.options) {
        if (!option.value || typeof option.value !== "string") {
          return res
            .status(400)
            .send({ error: "Each option must have a valid 'value'" });
        }

        if (
          option.additionalPrice !== undefined &&
          (typeof option.additionalPrice !== "number" ||
            option.additionalPrice < 0)
        ) {
          return res.status(400).send({
            error: "Option additionalPrice must be a non-negative number",
          });
        }
      }
    }

    if (!allowedTypes.includes(mainImgFile.mimetype)) {
      return res
        .status(400)
        .send({ error: "Main image must be a valid image file" });
    }

    for (const img of additionalImages) {
      if (!allowedTypes.includes(img.mimetype)) {
        return res
          .status(400)
          .send({ error: "All additional images must be valid image files" });
      }
    }

    let images = [];
    if (additionalImages.length > 0) {
      for (const img of additionalImages) {
        result = await cloudinary.uploader.upload(img.path, {
          folder: "product",
        });
        await fs.promises.unlink(img.path);
        images.push(result.url);
      }
    }

    let mainImg;
    let publicId;
    if (mainImgFile) {
      const result = await cloudinary.uploader.upload(mainImgFile.path, {
        folder: "product",
      });
      try {
        await fs.promises.unlink(mainImgFile.path);
      } catch (err) {
        console.warn("Failed to delete image:", err.message);
      }

      publicId = result.public_id;
      mainImg = result.url;
    }

    const product = new productSchema({
      title: title.trim(),
      description: description.trim(),
      price: numberPrice,
      category,
      slug,
      stock: validStock,
      variants,
      mainImg: mainImg,
      mainImgPublicId: publicId,
      images: images,
    });

    await product.save();
    res.status(200).send({ message: "Product created", product });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error, try again later." });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { title, description, price, category, stock, variants } = req.body;
    const { slug } = req.params;

    const existingProduct = await productSchema.findOne({ slug });

    if (!existingProduct) {
      return res.status(404).send({ error: "Product not found" });
    }

    if (title) existingProduct.title = title;
    if (description) existingProduct.description = description;
    if (price) existingProduct.price = Number(price);
    if (category) existingProduct.category = category;
    if (stock) existingProduct.stock = Number(stock);

    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (const item of variants) {
        if (
          !item.name ||
          !["color", "size"].includes(item.name.toLowerCase())
        ) {
          return res.status(400).send({
            error: "Variant name must be either 'color' or 'size'",
          });
        }

        if (!Array.isArray(item.options) || item.options.length === 0) {
          return res.status(400).send({
            error: `Variant '${item.name}' must include at least one option`,
          });
        }

        for (const option of item.options) {
          if (
            !option.value ||
            typeof option.value !== "string" ||
            !option.value.trim()
          ) {
            return res
              .status(400)
              .send({ error: "Each option must have a valid 'value'" });
          }

          if (
            option.additionalPrice !== undefined &&
            (typeof option.additionalPrice !== "number" ||
              option.additionalPrice < 0)
          ) {
            return res.status(400).send({
              error: "Option additionalPrice must be a non-negative number",
            });
          }
        }
      }

      existingProduct.variants = variants;
    }

    if (req?.files?.mainImg && req.files.mainImg.length > 0) {
      const mainImgFile = req.files.mainImg[0];

      // Delete previous photo from cloudinary
      if (existingProduct.mainImgPublicId) {
        try {
          await cloudinary.uploader.destroy(existingProduct.mainImgPublicId);
        } catch (err) {
          console.warn(
            "Failed to delete old image from Cloudinary:",
            err.message
          );
        }
      }

      const result = await cloudinary.uploader.upload(mainImgFile.path, {
        folder: "product",
      });

      try {
        await fs.promises.unlink(mainImgFile.path);
      } catch (err) {
        console.warn("Failed to delete temp image file:", err.message);
      }

      existingProduct.mainImg = result.url;
      existingProduct.mainImgPublicId = result.public_id;
    }

    await existingProduct.save();

    res.status(200).send({ message: "Product updated", existingProduct });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error, try again later." });
  }
};

const getProduct = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;

    const pageNumber = parseInt(page) || 1;
    const limitNumber = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limitNumber;

    const titleRegex = new RegExp(search, "i");

    const totalProducts = await productSchema.countDocuments({
      title: { $regex: titleRegex },
    });

    const products = await productSchema
      .find({ title: { $regex: titleRegex } })
      .skip(skip)
      .limit(limitNumber)
      .sort({ createdAt: -1 });

    const totalPages = Math.ceil(totalProducts / limitNumber);
    const hasPrevPage = pageNumber > 1;
    const hasNextPage = pageNumber < totalPages;

    res.status(200).json({
      products,
      totalProducts,
      limit: limitNumber,
      page: pageNumber,
      totalPages,
      hasPrevPage,
      hasNextPage,
    });
  } catch (error) {
    console.error("Failed to fetch products:", error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
};

module.exports = { createProduct, updateProduct, getProduct };                  
