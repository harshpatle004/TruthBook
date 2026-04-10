const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true
    },

   userName: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },


    email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
},

    password: {
        type: String,
        required: true
    },

    profilePic: {
        type: String,
        default: ""
    },

    bio: {
        type: String,
        trim: true
    },

    coverPicture: {
        type: String,
        default: ""
    },


    posts : [{

        type : mongoose.Schema.Types.ObjectId,
        ref : "Post"
    }],

    followers : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],

     following : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],
    
    blockList : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],

    isOnline: {
         type: Boolean, default: false
         },

         visibility: {
             type: String, enum: ["Public", "Private"]
         },



}, {
    timestamps: true
});

module.exports = mongoose.model("User", userSchema);