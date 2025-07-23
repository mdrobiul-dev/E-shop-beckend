const addTocart = async (req, res) => {
    
    const { productID, quantity} = req.body;
     res.status(200).send("hello world")
}

module.exports = {addTocart}   