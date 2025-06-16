const mongoose = require('mongoose');

const dbConnect = () => {
    mongoose.connect(process.env.MONGO_DB).then(() => {
        console.log("db connected")
    })
}

module.exports = dbConnect
// qAc4SRwqugxnPa0S