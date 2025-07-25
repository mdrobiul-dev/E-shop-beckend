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
      return res
        .status(200)
        .send({ message: "Cart item quantity updated", cart });
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

const updateCart = async (req, res) => {
  const userId = req.user._id;
  const { productID, quantity } = req.body;

  try {
    const quantityNumber = parseInt(quantity);

    if (!productID || isNaN(quantityNumber) || quantityNumber < 1) {
      return res
        .status(400)
        .send({ error: "Valid productID and quantity are required" });
    }

    let cart = await cartSchema.findOne({ user: userId });

    if (!cart) {
      return res.status(400).send({ error: "Cart not found" });
    }

    const existingCartItem = cart.items.find(
      (item) => item.product.toString() === productID
    );

    if (!existingCartItem) {
      return res.status(404).send({ error: "Item not found in cart" });
    }

    existingCartItem.quantity = quantityNumber;
    await cart.save();

    res.status(200).send({ message: "Cart item updated", cart });
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).send({ error: "Server error, try again" });
  }
};

const deleteCartItem = async (req, res) => {
  const userId = req.user._id;
  const { productID } = req.body;

  if (!productID) {
    return res.status(400).send({ error: "productID is required" });
  }

  try {
    const cart = await cartSchema.findOne({ user: userId });

    if (!cart) {
      return res.status(404).send({ error: "Cart not found" });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productID
    );

    if (itemIndex === -1) {
      return res.status(404).send({ error: "Item not found in cart" });
    }

    cart.items.splice(itemIndex, 1);
    await cart.save();

    res.status(200).send({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error("Error deleting cart item:", error);
    res.status(500).send({ error: "Server error, try again" });
  }
};

const getCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await cartSchema
      .findOne({ user: userId })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(404).send({ message: "Your cart is empty" });
    }

    res.status(200).send({ cart });
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).send({ error: "Server error, try again" });
  }
};

module.exports = { addTocart, updateCart, deleteCartItem, getCart };    
