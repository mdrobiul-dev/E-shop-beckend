const productSchema = require("../models/productSchema");

const createProduct = async (req, res) => {
  const { title, description, price, category, stock, variants } = req.body;

  if (!title) {
    return res.status(400).send({ error: "Title is required" });
  }
  if (!description) {
    return res.status(400).send({ error: "description is required" });
  }
  if (!price) {
    return res.status(400).send({ error: "price is required" });
  }
  if (!category) {
    return res.status(400).send({ error: "category is required" });
  }
  if (!stock) {
    return res.status(400).send({ error: "stock is required" });
  }
  if (variants.length < 0)
    return res.status(400).send({ error: "Add minimum one varient." });

  const product = new productSchema({
    title,
    description,
    price,
    category,
    stock,
    variants,
  });

  await product.save()
  res.status(200).send({message : "product created", product});
};

module.exports = createProduct;
