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
            type: String,
            required: false
        }
    ],

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment"
    }],

}, { timestamps: true })   // ← fixed: was "timesstamps"

module.exports = mongoose.model("Post", postSchema)  // ← fixed: was mongoose.models()