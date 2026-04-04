const mongoose = require("mongoose")

const CommentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        require: ture
    },

    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        require: ture
    },

    text: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        trim: true
    },

    likes: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    replies: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: ture
        },
        text: {
            type: mongoose.Schema.Types.ObjectId,
            require: true,
            trim: true
        },
        likes: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    
    createdAt: {
        type: Date,
        default: Date.now
    }


})

module.exports = mongoose.model("Comment",CommentSchema)