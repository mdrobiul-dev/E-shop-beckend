const jwt = require('jsonwebtoken');
const validUser = (req, res, next) => {
    
    try {
        const token = req.header("authorization")

        if(token) {
            jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
                if (err) {
                   res.status(400).send("authentication failed")
                }
                if(decoded.data){
                    req.user = decoded.data
                    next()
                }
              });
        }else{
            res.status(400).send("authentication failed")
        } 
    } catch (error) {
        res.status(500).send("Server error!")
    }

}

module.exports = validUser