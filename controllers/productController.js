const { default: mongoose } = require("mongoose");
const productSchema = require("../models/productSchema");

const createProduct = async (req, res) => {
  const { title, description, price, category, stock, variants } = req.body;
  const numberPrice = Number(price);
  const validStock = Number(stock);

if(req.files){
  console.log(req.files)
}
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

  const product = new productSchema({
    title: title.trim(),
    description: description.trim(),
    price: numberPrice,
    category,
    stock: validStock,
    variants,
  });

  // await product.save();
  res.status(200).send({ message: "Product created", product });
};

module.exports = createProduct;
