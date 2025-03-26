const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', // Associated User Model
            required: true
        },
        tags: [{
            type: String
        }],
        status: {
            type: String,
            enum: ['draft', 'published'],
            default: 'draft'
        }
    },
    {
        timestamps: true // Automatically add createdAt and updatedAt fields
    }
);

// Adding virtual field for comments
blogSchema.virtual('comments', {
    ref: 'Comment',         // Referencing the Comment model
    localField: '_id',      // The field in the Blog model
    foreignField: 'blog'    // The field in the Comment model
});


module.exports = mongoose.model('Blog', blogSchema);