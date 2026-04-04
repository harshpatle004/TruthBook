const mongoose = require("mongoose")

const postSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    caption: {
        type: String,
        trim: true
    },

    image: [
        {
                type : String,
                require : false
        }
    ],
    likes :[{
        type: mongoose.Schema.Types.ObjectId,
        ref : "User"
    }],

    comments : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "Comment"
    }],


},{timesstamps : true}) 

module.exports= mongoose.models("Post",postSchema)
