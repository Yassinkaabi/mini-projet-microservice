const mongoose = require('mongoose')


const foodSchema = mongoose.Schema({

    title: String,
    description: String,
    menuId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Menu'
    }
},
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Food', foodSchema)