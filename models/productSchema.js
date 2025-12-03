const mongoose = require("mongoose");
const Schema = mongoose.Schema; 

const productSchema = new Schema({
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    category : {
        type : Schema.Types.ObjectId,
        ref : "category",
        required : true
    },
    stock : {
        type : Number,
        required : true
    },
    status : {
      type : String,
      default : "pending",
      enum : ["active","pending","rejected"]
    },
    mainImg : {
        type : String,
        required : true
    },
    mainImgPublicId : {
      type : String
    },
    slug : {
      type : String
    },
    images : [
        {
            type : String
        }
    ],
    
    variants : [
       {
        name : {
          type : String,
          enum : ["color", "size"],
          required : true,
          lowercase : true
        },
        options : [
           {
            value : {
              type : String,
              required : true
            },
            additionalPrice : {
              type : Number,
              default : 0
            }
           }
        ]
       }
    ]

},
  {
    timestamps : true
  }
)

module.exports = mongoose.model("product", productSchema)                                