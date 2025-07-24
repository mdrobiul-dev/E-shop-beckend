const cartSchema = require("../models/cartSchema");

const addTocart = async (req, res) => {
  const { productID, quantity } = req.body;

  if (!productID) {
    return res.status(400).send({ error: "productID is required" });
  }

  const quantityNumber = parseInt(quantity) || 1;

  try {
    const userId = req.user._id;

    let cart = await cartSchema.findOne({ user: userId });

    if (!cart) {
      cart = new cartSchema({
        user: userId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productID
    );

    if (existingItem) {
      existingItem.quantity += quantityNumber;
      await cart.save();
      return res.status(200).send({ message: "Cart item quantity updated", cart });
    } else {
      cart.items.push({
        product: productID,
        quantity: quantityNumber,
      });
      await cart.save();
      return res.status(201).send({ message: "Item added to cart", cart });
    }
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send({ error: "Server error, try again" });
  }
};

module.exports = { addTocart };

