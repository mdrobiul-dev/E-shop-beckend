const express = require('express');
const cors = require('cors');
const dbConnect = require('./dbConfig/dbConnect');
const router = require('./router');
require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.status(200).send("hello cghjgcb")
  
})

dbConnect();

app.use(router);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});  

