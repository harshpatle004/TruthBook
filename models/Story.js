const mongoose = require("mongoose")

const storySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    image:
    {
        type: String,
        require: false
    },
    text: {
        type: mongoose.Schema.Types.ObjectId,
        require: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model("Story",storySchema)