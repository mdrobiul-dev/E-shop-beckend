const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');


const userSchema = new Schema({
      fullName : {
        type : String,
        required : true
      },
      email : {
        type : String,
        required : true,
        unique : true
      },
      phone : {
         type : Number,
         required : true
      },
      password : {
        type : String,
        required : true
      },
      role : {
         type : String,
         default : "user",
         enum : ["user", "stuff", "admin"]
      },
      address : {
        type : String,
        default : null
        
      },
      avatar : {
        type : String,
        default : ""
      },
      isVarified : {
        type : Boolean,
        default : false,
      },
      otp : {
        type : String,
        default : null
      },
      otpExpiredAt : {
        type :Date
      },
      randomString : {
        type : String
      },
      linkExpiredAt : {
        type : Date
      },
      avatarPublicId : {
        type : String
      },  
},
{
  timestamps: true,
}
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next(); 
  } catch (error) {
    next(error);
  }
});

userSchema.methods.isPasswordValid = async function (password) {
   return await bcrypt.compare(password, this.password);
}

module.exports = mongoose.model('user', userSchema);